import { prisma } from '@/lib/prisma';
import { FACES_MAX, DISCOVERY_EVENTS_LIMIT, DISCOVERY_EVENTS_MAX_LIMIT, GROUP_EVENTS_LIMIT } from '@/lib/constants';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Prisma, AttendanceStatus, EventJoinMode, Event as EventModel } from '@prisma/client';
import { EventFormValues } from '@/lib/validations/event';
import { ErrorCode } from '@/types/actions';
import { hasAdminRights } from '@/lib/utils/permissions';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { isEventPast, startOfTodayInRiga } from '@/lib/event-dates';
import { slugify } from '@/lib/slug';
import { findGroupByPath } from './group-path';
import { resolveEventText, originalEventTitle, toTextLang, langRecord, hasText, TEXT_LANGS, type TextLang } from '@/lib/translations';
import { isSiteAdmin as isSiteAdminRole } from '@/lib/site-role';
import { getSiteRole } from './site-role.service';
import { plainExcerpt } from '@/lib/text-excerpt';
import { EVENT_ROW_INCLUDE, tagOf, toEventRow, type EventRowData } from './event-row';
import { EVENT_PANEL_INCLUDE, toEventPanel, toFace, type EventPanelData, type Face } from './event-panel';
import { CityService } from './city.service';
import { eventWhere, clampRange, bucketByDay } from './discovery-query';
import { matchingEventIds } from './discovery-text';
import { DEFAULT_TIME_ZONE, isValidTimeZone } from '@/lib/time-zone';
import type { DayCount, EventDiscoveryFilters } from '@/lib/types/discovery';

export interface EventServiceResponse<T = void> {
    success: true;
    data?: T;
}

export interface EventServiceError {
    success: false;
    error: ErrorCode;
}

export type EventServiceResult<T = void> = EventServiceResponse<T> | EventServiceError;

/** What the current viewer may see and do with one event. */
export interface EventViewer {
    canSee: boolean;
    /** Organiser: event creator or group owner/admin. */
    canManage: boolean;
    /** Instructions on Request-to-join events are shown only to approved people and organisers. */
    canSeeInstructions: boolean;
    /** True when instructions exist but are hidden from this viewer. */
    instructionsLocked: boolean;
    myStatus: AttendanceStatus | null;
    goingCount: number;
    waitlistCount: number;
    /** Organisers only: requests waiting for a decision. */
    pendingCount: number;
}

/** Everything the actions need to revalidate paths and send notifications. */
export interface EventActionContext {
    l1Slug: string;
    groupSlug: string;
    groupName: string;
    eventSlug: string;
    eventTitle: string;
    /** Event creator + group owners/admins. */
    organiserIds: string[];
}

type EventWithGroup = Prisma.EventGetPayload<{
    include: { translations: { select: { lang: true; title: true } }; group: { select: { id: true; name: true; slug: true; city: true; hiddenAt: true; category: { include: ReturnType<typeof TaxonomyResolver.getInclude> } } } };
}>;

/** The event panel's answer: the event, the members-only gate for an outsider, or null (missing or hidden). */
export type EventPanelResult =
    | { kind: 'event'; event: EventPanelData }
    | { kind: 'membersOnly'; group: { id: string; name: string; isAcceptingMembers: boolean; canContact: boolean } }
    | null;

export interface DiscoverableEventPage {
    events: EventRowData[];
    /** More events matched than `limit`. */
    hasMore: boolean;
}

/** A group's next event as the Informācija box (and later cards and panels) show it: no attendees, no instructions. */
export interface NextEventView {
    id: string;
    slug: string;
    groupId: string;
    title: string;
    titleLang: TextLang;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    city: string;
    isOnline: boolean;
    /** First words of the description as plain text (at most 140 characters, no HTML), or null. */
    excerpt: string | null;
}

export class EventService {
    /** Role of the user in the group plus site-admin flag. */
    private static async getAccess(groupId: string, userId?: string) {
        if (!userId) return { isMember: false, isGroupAdmin: false, isSiteAdmin: false };
        const [membership, siteRole] = await Promise.all([
            prisma.membership.findUnique({
                where: { userId_groupId: { userId, groupId } },
                select: { role: true }
            }),
            getSiteRole(userId)
        ]);
        return {
            isMember: !!membership && membership.role !== 'PENDING',
            isGroupAdmin: hasAdminRights(membership?.role),
            isSiteAdmin: isSiteAdminRole(siteRole)
        };
    }

    /**
     * Members-only events are visible to approved group members and site admins.
     */
    private static async canSeeMembersOnly(groupId: string, userId?: string): Promise<boolean> {
        const access = await EventService.getAccess(groupId, userId);
        return access.isMember || access.isSiteAdmin;
    }

    /** Pure rule: may this viewer read the instructions? */
    private static instructionsVisible(joinMode: EventJoinMode, canManage: boolean, myStatus: AttendanceStatus | null): boolean {
        return joinMode === 'OPEN' || canManage || myStatus === 'GOING';
    }

    /** Link name from the title; `-2`, `-3` … when the group already has an event with it. */
    private static async uniqueSlug(groupId: string, title: string): Promise<string> {
        const base = slugify(title).slice(0, 60).replace(/-+$/g, '') || 'event';
        const taken = await prisma.event.findMany({
            where: { groupId, slug: { startsWith: base } },
            select: { slug: true }
        });
        const used = new Set(taken.map(e => e.slug));
        if (!used.has(base)) return base;
        for (let n = 2; ; n++) {
            if (!used.has(`${base}-${n}`)) return `${base}-${n}`;
        }
    }

    private static async loadEventForAction(eventId: string): Promise<EventWithGroup | null> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                translations: { select: { lang: true, title: true } },
                group: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        city: true,
                        hiddenAt: true,
                        category: { include: TaxonomyResolver.getInclude('lv') }
                    }
                }
            }
        });
        if (!event || event.group.hiddenAt) return null;
        return event;
    }

    /** `eventTitle` is the title in the event's original language (what notifications quote); `title` overrides it (just edited). */
    private static async buildContext(event: EventWithGroup, title?: string): Promise<EventActionContext> {
        const admins = await prisma.membership.findMany({
            where: { groupId: event.groupId, role: { in: ['OWNER', 'ADMIN'] } },
            select: { userId: true }
        });
        return {
            l1Slug: TaxonomyResolver.resolve(event.group.category).l1Slug,
            groupSlug: event.group.slug,
            groupName: event.group.name,
            eventSlug: event.slug,
            eventTitle: title ?? originalEventTitle(event.translations, event.originalLang),
            organiserIds: Array.from(new Set([...(event.creatorId ? [event.creatorId] : []), ...admins.map(a => a.userId)]))
        };
    }

    /** Loads the event and checks that the actor is an organiser. */
    private static async loadForOrganiser(eventId: string, actorId: string) {
        const event = await EventService.loadEventForAction(eventId);
        if (!event) return { event: null, error: 'EVENT_NOT_FOUND' as const };
        const access = await EventService.getAccess(event.groupId, actorId);
        if (event.creatorId !== actorId && !access.isGroupAdmin) return { event: null, error: 'FORBIDDEN' as const };
        return { event, error: undefined };
    }

    /**
     * Get a single event with full context (group, membership status, etc.)
     * Cached per-request to prevent redundant queries.
     */
    static getEventWithContext = cache(async (
        eventSlug: string,
        groupSlug: string,
        locale: string,
        userId?: string,
        l1Slug?: string
    ) => {
        const lang = locale === 'en' ? 'en' : 'lv';

        const groupRecord = await prisma.group.findFirst({
            where: { ...findGroupByPath(groupSlug, l1Slug), hiddenAt: null },
            select: { id: true }
        });

        if (!groupRecord) return null;

        const event = await prisma.event.findFirst({
            where: {
                slug: eventSlug,
                groupId: groupRecord.id
            } as Prisma.EventWhereInput,
            include: {
                translations: true,
                group: {
                    include: {
                        category: {
                            include: TaxonomyResolver.getInclude(lang)
                        }
                    }
                },
                attendees: {
                    orderBy: { joinedAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        if (!event) return null;

        const access = await EventService.getAccess(groupRecord.id, userId);

        // Members-only events do not exist for everyone else (404).
        if (event.visibility === 'MEMBERS_ONLY' && !(access.isMember || access.isSiteAdmin)) {
            return null;
        }

        const canManage = !!userId && (event.creatorId === userId || access.isGroupAdmin);
        const myStatus = event.attendees.find(a => a.userId === userId)?.status ?? null;
        const canSeeInstructions = EventService.instructionsVisible(event.joinMode, canManage, myStatus);

        // Text is resolved to the viewer's language here; withheld instructions are never read from any
        // language row, and the raw translation rows never leave this method.
        const text = resolveEventText(event.translations, lang, event.originalLang, !canSeeInstructions);
        const editable = canManage ? EventService.toEditableTexts(event.translations, event.originalLang) : null;

        const viewer: EventViewer = {
            canSee: true,
            canManage,
            canSeeInstructions,
            instructionsLocked: !canSeeInstructions && text.hasInstructions,
            myStatus,
            goingCount: event.attendees.filter(a => a.status === 'GOING').length,
            waitlistCount: event.attendees.filter(a => a.status === 'WAITLISTED').length,
            pendingCount: event.attendees.filter(a => a.status === 'PENDING').length
        };

        // Only organisers get the full people lists (pending, waitlist); everyone else gets none.
        const { translations: _translations, ...eventFields } = event;
        void _translations;
        return {
            ...eventFields,
            title: text.title,
            titleLang: text.titleLang,
            description: text.description,
            descriptionLang: text.descriptionLang,
            instructions: text.instructions,
            instructionsLang: text.instructionsLang,
            /** Language to name in the "Latviski / In English" label; null when all shown text is in the viewer's language. */
            fallbackLang: text.fallbackLang,
            /** Organisers only: the text of every language, for the edit form. */
            editable,
            attendees: canManage ? event.attendees : [],
            viewer
        };
    });

    /**
     * For an event the viewer may not open: tells the page whether to show a "members only"
     * notice (the event exists, belongs to a visible group and is members-only) instead of a 404.
     * Returns only what the group page shows publicly, never anything from the event itself.
     */
    static getMembersOnlyGate = cache(async (
        eventSlug: string,
        groupSlug: string,
        userId?: string,
        l1Slug?: string
    ): Promise<{ groupName: string; groupSlug: string; l1Slug: string } | null> => {
        const group = await prisma.group.findFirst({
            where: { ...findGroupByPath(groupSlug, l1Slug), hiddenAt: null },
            select: {
                id: true,
                name: true,
                slug: true,
                category: { include: TaxonomyResolver.getInclude('lv') }
            }
        });
        if (!group) return null;

        const event = await prisma.event.findFirst({
            where: { slug: eventSlug, groupId: group.id, visibility: 'MEMBERS_ONLY' },
            select: { id: true }
        });
        if (!event || (await EventService.canSeeMembersOnly(group.id, userId))) return null;

        return {
            groupName: group.name,
            groupSlug: group.slug,
            l1Slug: TaxonomyResolver.resolve(group.category).l1Slug
        };
    });

    /**
     * The event panel (R6), one call: the event as this viewer may see it, whether they may join and how, and who is going.
     * Faces are read only for signed-in viewers (D12: visitors get the number, no user is even queried); only people going with a
     * public profile, the viewer's own face first. Instructions are never selected. A members-only event for an outsider gives
     * the gate (group facts only); missing or hidden gives null.
     */
    static getEventPanel = cache(async (
        eventSlug: string,
        groupSlug: string,
        l1Slug: string,
        locale: string,
        viewerId?: string
    ): Promise<EventPanelResult> => {
        const lang = toTextLang(locale);
        const group = await prisma.group.findFirst({
            where: { ...findGroupByPath(groupSlug, l1Slug), hiddenAt: null },
            select: { id: true, name: true, isAcceptingMembers: true }
        });
        if (!group) return null;
        const event = await prisma.event.findFirst({
            where: { slug: eventSlug, groupId: group.id },
            include: EVENT_PANEL_INCLUDE(lang)
        });
        if (!event) return null;

        const access = await EventService.getAccess(group.id, viewerId);
        if (event.visibility === 'MEMBERS_ONLY' && !(access.isMember || access.isSiteAdmin)) {
            const pending = viewerId
                ? (await prisma.membership.findUnique({ where: { userId_groupId: { userId: viewerId, groupId: group.id } }, select: { role: true } }))?.role === 'PENDING'
                : false;
            return { kind: 'membersOnly', group: { id: group.id, name: group.name, isAcceptingMembers: group.isAcceptingMembers, canContact: !pending } };
        }

        const mine = viewerId
            ? await prisma.attendance.findUnique({ where: { userId_eventId: { userId: viewerId, eventId: event.id } }, select: { status: true } })
            : null;
        const myStatus = mine?.status ?? null;
        const canManage = !!viewerId && (event.creatorId === viewerId || access.isGroupAdmin);
        const people = viewerId ? await EventService.goingFaces(event.id, viewerId, myStatus === 'GOING') : null;
        return { kind: 'event', event: toEventPanel(event, lang, { myStatus, canManage, people }) };
    });

    /** Up to FACES_MAX people going with a public profile; the viewer's own face first when they go (it is them, whatever their profile says). */
    private static async goingFaces(eventId: string, viewerId: string, viewerGoing: boolean): Promise<Face[]> {
        const select = { id: true, name: true, username: true, image: true, avatarSeed: true } as const;
        const [own, others] = await Promise.all([
            viewerGoing ? prisma.user.findUnique({ where: { id: viewerId }, select }) : null,
            prisma.attendance.findMany({
                where: { eventId, status: 'GOING', userId: { not: viewerId }, user: { isProfilePublic: true } },
                orderBy: { joinedAt: 'asc' },
                take: FACES_MAX,
                select: { user: { select } }
            })
        ]);
        return [...(own ? [own] : []), ...others.map((a) => a.user)].slice(0, FACES_MAX).map(toFace);
    }

    /** Text of every language for the organiser's edit form (a missing language is empty text). */
    private static toEditableTexts(
        translations: { lang: string; title: string; description: string | null; instructions: string | null }[],
        originalLang: string
    ): { originalLang: TextLang; texts: Record<TextLang, { title: string; description: string; instructions: string }> } {
        const text = (lang: TextLang) => {
            const row = translations.find((t) => t.lang === lang);
            return { title: row?.title ?? '', description: row?.description ?? '', instructions: row?.instructions ?? '' };
        };
        return { originalLang: toTextLang(originalLang), texts: langRecord(text) };
    }

    /**
     * The language rows to keep for a save: the original language always, another language only when
     * it has any text (an empty one counts as not translated, so it has no row).
     */
    private static textRows(data: EventFormValues): { lang: TextLang; title: string; description: string | null; instructions: string | null }[] {
        return TEXT_LANGS.flatMap((lang) => {
            const { title, description, instructions } = data.texts[lang];
            const row = {
                lang,
                title: title.trim(),
                description: hasText(description) ? description! : null,
                instructions: hasText(instructions) ? instructions! : null
            };
            const keep = lang === data.originalLang || row.title !== '' || row.description !== null || row.instructions !== null;
            return keep ? [row] : [];
        });
    }

    /**
     * Create a new event within a group.
     */
    static async createEvent(groupId: string, data: EventFormValues, userId: string): Promise<EventServiceResult<{ event: EventModel; eventTitle: string; membersToNotify: { userId: string }[]; groupName: string; groupSlug: string; l1Slug: string }>> {
        const membership = await prisma.membership.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId,
                }
            }
        });

        if (!membership || !hasAdminRights(membership.role)) {
            return { success: false, error: 'FORBIDDEN' };
        }

        // The event's place starts as the group's city; the organiser may pick another approved city (AR-57).
        const group = await prisma.group.findUnique({ where: { id: groupId }, select: { city: true } });
        if (!group) return { success: false, error: 'NOT_FOUND' };
        if (!(await CityService.isUsableForEvent(data.city, [group.city]))) return { success: false, error: 'VALIDATION_FAILED' };

        // The organiser's own language is the event's original language (and the slug comes from its title).
        const originalTitle = data.texts[data.originalLang].title.trim();
        const event = await prisma.event.create({
            data: {
                slug: await EventService.uniqueSlug(groupId, originalTitle),
                originalLang: data.originalLang,
                translations: { create: EventService.textRows(data) },
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                city: data.city,
                isOnline: data.isOnline,
                maxParticipants: data.maxParticipants,
                visibility: data.visibility,
                joinMode: data.joinMode,
                isRecurring: data.isRecurring,
                recurrencePattern: data.recurrencePattern,
                bannerImage: data.bannerImage,
                groupId: groupId,
                creatorId: userId,
            },
            include: {
                group: {
                    select: {
                        name: true,
                        slug: true,
                        category: {
                            include: TaxonomyResolver.getInclude('lv')
                        }
                    }
                }
            }
        });

        // Nobody is told about an event that is already over (e.g. logging last week's rehearsal).
        const membersToNotify = isEventPast(event)
            ? []
            : await prisma.membership.findMany({
                where: {
                    groupId,
                    userId: { not: userId },
                    role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
                },
                select: { userId: true }
            });

        const resolved = TaxonomyResolver.resolve(event.group.category);

        return {
            success: true,
            data: {
                event,
                eventTitle: originalTitle,
                membersToNotify,
                groupName: event.group.name,
                groupSlug: event.group.slug,
                l1Slug: resolved.l1Slug
            }
        };
    }

    /**
     * Update an existing event. Past events cannot be edited.
     *
     * Switching Request to join -> Open lets in everyone who is waiting (pending or waitlisted),
     * in the same transaction as the update. That only happens when the caller passes
     * `confirmOpenWaiting`; otherwise the save is refused with `CONFIRMATION_REQUIRED` and nothing changes.
     * Open -> Request to join needs nothing: people who are going count as approved.
     */
    static async updateEvent(
        eventId: string,
        data: EventFormValues,
        userId: string,
        confirmOpenWaiting = false
    ): Promise<EventServiceResult<EventActionContext & { convertedUserIds: string[] }>> {
        const { event, error } = await EventService.loadForOrganiser(eventId, userId);
        if (!event) return { success: false, error };
        if (isEventPast(event)) return { success: false, error: 'EVENT_PAST' };
        if (!(await CityService.isUsableForEvent(data.city, [event.group.city, event.city]))) return { success: false, error: 'VALIDATION_FAILED' };

        const opening = event.joinMode === 'REQUEST' && data.joinMode === 'OPEN';

        // The link name stays as it was: changing it would break links people already shared.
        const convertedUserIds = await prisma.$transaction(async (tx) => {
            let converted: string[] = [];
            if (opening) {
                const waiting = await tx.attendance.findMany({
                    where: { eventId, status: { in: ['PENDING', 'WAITLISTED'] } },
                    select: { userId: true }
                });
                if (waiting.length > 0) {
                    if (!confirmOpenWaiting) return null;
                    await tx.attendance.updateMany({
                        where: { eventId, status: { in: ['PENDING', 'WAITLISTED'] } },
                        data: { status: 'GOING' }
                    });
                    converted = waiting.map(w => w.userId);
                }
            }
            // Every language in the form is saved; a language left empty loses its row (= not translated).
            const rows = EventService.textRows(data);
            for (const { lang, ...fields } of rows) {
                await tx.eventTranslation.upsert({
                    where: { eventId_lang: { eventId, lang } },
                    update: fields,
                    create: { eventId, lang, ...fields }
                });
            }
            await tx.eventTranslation.deleteMany({ where: { eventId, lang: { notIn: rows.map((r) => r.lang) } } });
            await tx.event.update({
                where: { id: eventId },
                data: {
                    originalLang: data.originalLang,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    location: data.location,
                    city: data.city,
                    isOnline: data.isOnline,
                    maxParticipants: data.maxParticipants,
                    visibility: data.visibility,
                    joinMode: data.joinMode,
                    // "Full" only means something for Request to join events.
                    ...(opening && { isFull: false }),
                    isRecurring: data.isRecurring,
                    recurrencePattern: data.recurrencePattern,
                    bannerImage: data.bannerImage,
                }
            });
            return converted;
        });

        if (convertedUserIds === null) return { success: false, error: 'CONFIRMATION_REQUIRED' };

        // The context carries the title the notification should show (the new one).
        const context = await EventService.buildContext(event, data.texts[data.originalLang].title.trim());
        return { success: true, data: { ...context, convertedUserIds: convertedUserIds.filter(id => id !== userId) } };
    }

    /**
     * Delete an event (organisers only). Returns who has to be told: everyone who was going,
     * waiting for approval or on the waitlist (not people who were declined).
     */
    static async deleteEvent(eventId: string, userId: string): Promise<EventServiceResult<EventActionContext & { attendeeIds: string[] }>> {
        const { event, error } = await EventService.loadForOrganiser(eventId, userId);
        if (!event) return { success: false, error };

        const context = await EventService.buildContext(event);
        const attendees = await prisma.attendance.findMany({
            where: { eventId, status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } },
            select: { userId: true }
        });

        // Reports about the event have no cascade; remove them with it.
        await prisma.$transaction([
            prisma.report.deleteMany({ where: { targetEventId: eventId } }),
            prisma.event.delete({ where: { id: eventId } })
        ]);

        return {
            success: true,
            data: { ...context, attendeeIds: attendees.map(a => a.userId).filter(id => id !== userId) }
        };
    }

    /**
     * Each group's next event the viewer may see: not past (the Gaidāmie rule), public, plus members-only
     * for approved members and site admins (the rule of `canSeeMembersOnly`). Hidden groups only for their owner and site admins
     * (the people who may open them). Groups with none are absent.
     */
    static async getNextVisibleEvents(groupIds: string[], locale: string, viewerId?: string): Promise<Map<string, NextEventView>> {
        const result = new Map<string, NextEventView>();
        if (groupIds.length === 0) return result;
        const lang = toTextLang(locale);
        let privileged: string[] = [];
        // A hidden group's events stay visible to those who may still open the group: its owner and site admins.
        let seesHidden: string[] = [];
        if (viewerId) {
            const [memberships, siteRole] = await Promise.all([
                prisma.membership.findMany({
                    where: { userId: viewerId, groupId: { in: groupIds }, role: { not: 'PENDING' } },
                    select: { groupId: true, role: true }
                }),
                getSiteRole(viewerId)
            ]);
            const admin = isSiteAdminRole(siteRole);
            privileged = admin ? groupIds : memberships.map((m) => m.groupId);
            seesHidden = admin ? groupIds : memberships.filter((m) => m.role === 'OWNER').map((m) => m.groupId);
        }
        const today = startOfTodayInRiga();
        const events = await prisma.event.findMany({
            where: {
                groupId: { in: groupIds },
                AND: [
                    { OR: [{ group: { hiddenAt: null } }, { groupId: { in: seesHidden } }] },
                    { OR: [{ endDate: { gte: today } }, { endDate: null, startDate: { gte: today } }] },
                    { OR: [{ visibility: 'PUBLIC' }, { visibility: 'MEMBERS_ONLY', groupId: { in: privileged } }] }
                ]
            },
            orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
            distinct: ['groupId'],
            select: {
                id: true, slug: true, groupId: true, startDate: true, endDate: true, location: true, city: true, isOnline: true, originalLang: true,
                translations: { select: { lang: true, title: true, description: true, instructions: true } }
            }
        });
        for (const e of events) {
            const text = resolveEventText(e.translations, lang, e.originalLang, true);
            result.set(e.groupId, {
                id: e.id, slug: e.slug, groupId: e.groupId,
                title: text.title, titleLang: text.titleLang,
                startDate: e.startDate, endDate: e.endDate, location: e.location, city: e.city, isOnline: e.isOnline,
                excerpt: plainExcerpt(text.description, 140)
            });
        }
        return result;
    }

    /** One group's next visible event (Informācija, later the group panel); cached per request. */
    static getNextVisibleEvent = cache(async (groupId: string, locale: string, viewerId?: string): Promise<NextEventView | null> => {
        const map = await EventService.getNextVisibleEvents([groupId], locale, viewerId);
        return map.get(groupId) ?? null;
    });

    /**
     * A group's events as rows (the Pasākumi page): the `GROUP_EVENTS_LIMIT` newest by start, split into upcoming (oldest first)
     * and past (newest first) by `isEventPast`. Members and site admins also see members-only events. The viewer's tag comes
     * from one attendance query; titles and descriptions only, never instructions.
     */
    static async getGroupEventRows(groupId: string, locale: string, viewerId: string | undefined, when: 'upcoming' | 'past'): Promise<EventRowData[]> {
        const lang = toTextLang(locale);
        const access = await EventService.getAccess(groupId, viewerId);
        const canSeeAll = access.isMember || access.isSiteAdmin;
        const rows = await prisma.event.findMany({
            where: { groupId, ...(canSeeAll ? {} : { visibility: 'PUBLIC' }) },
            orderBy: { startDate: 'desc' },
            take: GROUP_EVENTS_LIMIT,
            include: EVENT_ROW_INCLUDE(lang)
        });
        const wanted = rows.filter((e) => isEventPast(e) === (when === 'past'));
        if (when === 'upcoming') wanted.reverse();
        const mine = await EventService.myTags(wanted.map((e) => e.id), viewerId);
        return wanted.map((e) => toEventRow(e, lang, mine.get(e.id) ?? null));
    }

    /**
     * A group's next upcoming events as rows for the group panel: PUBLIC ones only, whoever asks (members-only events never leave
     * with a panel; members see them on the group's Pasākumi page). Still running or later today and after, oldest first. The caller
     * has already checked that the viewer may open the group.
     */
    static async getPanelEventRows(groupId: string, locale: string, viewerId: string | undefined, limit: number): Promise<EventRowData[]> {
        const lang = toTextLang(locale);
        const today = startOfTodayInRiga();
        const rows = await prisma.event.findMany({
            where: {
                groupId,
                visibility: 'PUBLIC',
                OR: [{ endDate: { gte: today } }, { endDate: null, startDate: { gte: today } }]
            },
            orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
            take: limit,
            include: EVENT_ROW_INCLUDE(lang)
        });
        const mine = await EventService.myTags(rows.map((e) => e.id), viewerId);
        return rows.map((e) => toEventRow(e, lang, mine.get(e.id) ?? null));
    }

    /** The viewer's attendance status per event (going, asked or waiting only); empty when signed out. */
    private static async myTags(eventIds: string[], viewerId: string | undefined): Promise<Map<string, AttendanceStatus>> {
        if (!viewerId || eventIds.length === 0) return new Map();
        const mine = await prisma.attendance.findMany({
            where: { userId: viewerId, eventId: { in: eventIds }, status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } },
            select: { eventId: true, status: true }
        });
        return new Map(mine.map((a) => [a.eventId, a.status]));
    }

    /** Checks that the event exists, its group is visible and the user may see it. */
    private static async loadForParticipant(eventId: string, userId: string) {
        const event = await EventService.loadEventForAction(eventId);
        if (!event) return { event: null, error: 'EVENT_NOT_FOUND' as const };
        if (event.visibility === 'MEMBERS_ONLY' && !(await EventService.canSeeMembersOnly(event.groupId, userId))) {
            return { event: null, error: 'MEMBERS_ONLY' as const };
        }
        return { event, error: undefined };
    }

    /**
     * Open events: "I'm going" / cancel. The size number never blocks.
     */
    static async setAttendance(
        eventId: string,
        userId: string,
        status: 'GOING' | 'NONE'
    ): Promise<EventServiceResult<EventActionContext>> {
        const loaded = await EventService.loadForParticipant(eventId, userId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;
        if (event.joinMode !== 'OPEN') return { success: false, error: 'EVENT_MODE_MISMATCH' };
        if (status === 'GOING' && isEventPast(event)) return { success: false, error: 'EVENT_PAST' };

        if (status === 'NONE') {
            await prisma.attendance.deleteMany({ where: { eventId, userId } });
        } else {
            await prisma.attendance.upsert({
                where: { userId_eventId: { userId, eventId } },
                update: { status: 'GOING' },
                create: { userId, eventId, status: 'GOING' }
            });
        }
        return { success: true, data: await EventService.buildContext(event) };
    }

    /**
     * Request-to-join events. Becomes WAITLISTED when the event is Full and the person
     * chose the waitlist; `EVENT_FULL` when they tried to join directly (stale page).
     */
    static async requestToJoin(
        eventId: string,
        userId: string,
        allowWaitlist: boolean
    ): Promise<EventServiceResult<EventActionContext & { status: AttendanceStatus; created: boolean }>> {
        const loaded = await EventService.loadForParticipant(eventId, userId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;
        if (event.joinMode !== 'REQUEST') return { success: false, error: 'EVENT_MODE_MISMATCH' };
        if (isEventPast(event)) return { success: false, error: 'EVENT_PAST' };

        const current = await prisma.attendance.findUnique({ where: { userId_eventId: { userId, eventId } } });
        const context = await EventService.buildContext(event);

        // Already in, waiting or declined: nothing changes (a declined request stays declined).
        // A waitlisted person may ask again once the event is no longer Full.
        if (current && (current.status !== 'WAITLISTED' || event.isFull)) {
            return { success: true, data: { ...context, status: current.status, created: false } };
        }

        if (event.isFull && !allowWaitlist) return { success: false, error: 'EVENT_FULL' };

        const status: AttendanceStatus = event.isFull ? 'WAITLISTED' : 'PENDING';
        await prisma.attendance.upsert({
            where: { userId_eventId: { userId, eventId } },
            update: { status, joinedAt: new Date() },
            create: { userId, eventId, status }
        });
        return { success: true, data: { ...context, status, created: true } };
    }

    /**
     * Leave the event / withdraw a request. Tells the caller whether an approved person left a Full event.
     */
    static async cancel(
        eventId: string,
        userId: string
    ): Promise<EventServiceResult<EventActionContext & { wasGoing: boolean; isFull: boolean; waitlistCount: number }>> {
        const loaded = await EventService.loadForParticipant(eventId, userId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;

        const current = await prisma.attendance.findUnique({ where: { userId_eventId: { userId, eventId } } });
        await prisma.attendance.deleteMany({ where: { eventId, userId } });
        const waitlistCount = await prisma.attendance.count({ where: { eventId, status: 'WAITLISTED' } });

        return {
            success: true,
            data: {
                ...(await EventService.buildContext(event)),
                wasGoing: current?.status === 'GOING',
                isFull: event.isFull,
                waitlistCount
            }
        };
    }

    /**
     * Organiser approves or declines a pending (or waitlisted) person.
     */
    static async decide(
        eventId: string,
        targetUserId: string,
        actorId: string,
        decision: 'approve' | 'decline'
    ): Promise<EventServiceResult<EventActionContext>> {
        const loaded = await EventService.loadForOrganiser(eventId, actorId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;

        const current = await prisma.attendance.findUnique({ where: { userId_eventId: { userId: targetUserId, eventId } } });
        if (!current || (current.status !== 'PENDING' && current.status !== 'WAITLISTED')) {
            return { success: false, error: 'NOT_FOUND' };
        }

        await prisma.attendance.update({
            where: { userId_eventId: { userId: targetUserId, eventId } },
            data: { status: decision === 'approve' ? 'GOING' : 'DECLINED' }
        });
        return { success: true, data: await EventService.buildContext(event) };
    }

    /**
     * Organiser lets a waitlisted person in by hand.
     */
    static async letInFromWaitlist(
        eventId: string,
        targetUserId: string,
        actorId: string
    ): Promise<EventServiceResult<EventActionContext>> {
        const loaded = await EventService.loadForOrganiser(eventId, actorId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;

        const current = await prisma.attendance.findUnique({ where: { userId_eventId: { userId: targetUserId, eventId } } });
        if (!current || current.status !== 'WAITLISTED') return { success: false, error: 'NOT_FOUND' };

        await prisma.attendance.update({
            where: { userId_eventId: { userId: targetUserId, eventId } },
            data: { status: 'GOING' }
        });
        return { success: true, data: await EventService.buildContext(event) };
    }

    /**
     * Organiser switches "Full" on or off (Request-to-join events only, never automatic).
     * Switching it off keeps the waitlist and returns who should be told there is room again.
     */
    static async setFull(
        eventId: string,
        actorId: string,
        isFull: boolean
    ): Promise<EventServiceResult<EventActionContext & { waitlistedUserIds: string[] }>> {
        const loaded = await EventService.loadForOrganiser(eventId, actorId);
        if (!loaded.event) return { success: false, error: loaded.error };
        const { event } = loaded;
        if (event.joinMode !== 'REQUEST') return { success: false, error: 'EVENT_MODE_MISMATCH' };

        await prisma.event.update({ where: { id: eventId }, data: { isFull } });

        const waitlisted = isFull || !event.isFull
            ? []
            : await prisma.attendance.findMany({
                where: { eventId, status: 'WAITLISTED' },
                orderBy: { joinedAt: 'asc' },
                select: { userId: true }
            });

        return {
            success: true,
            data: { ...(await EventService.buildContext(event)), waitlistedUserIds: waitlisted.map(w => w.userId) }
        };
    }

    /**
     * Fetch events for global discovery with filters.
     * Public events come from a 60-second shared cache (the key has no user in it).
     * Members-only events of the viewer's own groups are fetched uncached and merged in,
     * so one user's members-only events can never reach another user's results.
     */
    static async getDiscoverableEvents(filters: EventDiscoveryFilters, locale: string, userId?: string): Promise<DiscoverableEventPage> {
        const limit = Math.min(Math.max(Math.floor(filters.limit ?? DISCOVERY_EVENTS_LIMIT), 1), DISCOVERY_EVENTS_MAX_LIMIT);
        const { status = 'upcoming' } = filters;
        const cities = [...(filters.cities ?? [])].sort();
        const tags = [...(filters.tags ?? [])].sort();
        const where = { ...filters, cities, tags, status };
        const lang = toTextLang(locale);
        const withIds = async () => ({ ...where, searchIds: where.search ? await matchingEventIds(where.search) : undefined });
        const include = EVENT_ROW_INCLUDE(lang);
        const orderBy = { startDate: status === 'past' ? 'desc' : 'asc' } as const;

        // The cache holds the narrow row shape (an excerpt, not whole descriptions).
        const loadPublic = unstable_cache(
            async () => (await prisma.event.findMany({
                where: { AND: [eventWhere(await withIds()), { visibility: 'PUBLIC' }] },
                include,
                orderBy,
                take: limit + 1
            })).map((e) => toEventRow(e, lang, null)),
            [`events-discovery-v6-${locale}-${cities.join(',')}-${filters.category}-${tags.join(',')}-${filters.search}-${status}-${filters.from?.toISOString()}-${filters.to?.toISOString()}-${limit}`],
            {
                revalidate: 60,
                // A group's hide, category or tag change (including a tag merge) moves its events too.
                tags: ['events', 'groups', 'categories']
            }
        );

        const [publicRows, memberRows] = await Promise.all([
            loadPublic(),
            userId
                ? withIds().then((w) => prisma.event.findMany({
                    where: {
                        AND: [
                            eventWhere(w),
                            {
                                visibility: 'MEMBERS_ONLY',
                                group: { members: { some: { userId, role: { not: 'PENDING' } } } }
                            }
                        ]
                    },
                    include,
                    orderBy,
                    take: limit + 1
                })).then((rows) => rows.map((e) => toEventRow(e, lang, null)))
                : Promise.resolve([])
        ]);

        const direction = status === 'past' ? -1 : 1;
        // Cached rows come back with dates as strings; revive them before sorting.
        const merged = [...publicRows, ...memberRows]
            .map((e) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : null }))
            .sort((a, b) => direction * (a.startDate.getTime() - b.startDate.getTime()))
            .slice(0, limit + 1);
        const shown = merged.slice(0, limit);
        const mine = await EventService.myTags(shown.map((e) => e.id), userId);
        return {
            events: shown.map((e) => ({ ...e, tag: tagOf(mine.get(e.id)) })),
            hasMore: merged.length > limit
        };
    }

    /**
     * Events per day inside a date range (D9), for the day strip and calendar. Same filters and visibility as the list:
     * public rows cached 5 minutes, the viewer's own members-only events added uncached. Days are cut in `timeZone`;
     * a multi-day event counts on the day it starts (or on the first day of the range if it began earlier).
     */
    static async countEventsPerDay(
        filters: Omit<EventDiscoveryFilters, 'status' | 'limit'> & { from: Date; to: Date },
        timeZone: string,
        userId?: string
    ): Promise<DayCount[]> {
        const range = clampRange(filters.from, filters.to);
        if (!range) return [];
        const zone = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
        const cities = [...(filters.cities ?? [])].sort();
        const tags = [...(filters.tags ?? [])].sort();
        const where = { ...filters, cities, tags, ...range };
        const select = { startDate: true } as const;
        const withIds = async () => ({ ...where, searchIds: where.search ? await matchingEventIds(where.search) : undefined });

        const loadPublic = unstable_cache(
            async () => prisma.event.findMany({ where: { AND: [eventWhere(await withIds()), { visibility: 'PUBLIC' }] }, select }),
            [`events-days-v2-${cities.join(',')}-${filters.category}-${tags.join(',')}-${filters.search}-${range.from.toISOString()}-${range.to.toISOString()}`],
            { revalidate: 300, tags: ['events', 'groups', 'categories'] }
        );
        const [publicRows, memberRows] = await Promise.all([
            loadPublic(),
            userId
                ? withIds().then((w) => prisma.event.findMany({
                    where: {
                        AND: [eventWhere(w), { visibility: 'MEMBERS_ONLY', group: { members: { some: { userId, role: { not: 'PENDING' } } } } }]
                    },
                    select
                }))
                : Promise.resolve([])
        ]);
        return bucketByDay([...publicRows, ...memberRows], range.from, range.to, zone);
    }
}
