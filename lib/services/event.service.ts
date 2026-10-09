import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Prisma, AttendanceStatus, EventJoinMode, Event as EventModel } from '@prisma/client';
import { EventFormValues } from '@/lib/validations/event';
import { ErrorCode } from '@/types/actions';
import { hasAdminRights } from '@/lib/utils/permissions';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { isEventPast, startOfTodayInRiga } from '@/lib/event-dates';
import { slugify } from '@/lib/slug';
import { resolveEventText, originalEventTitle, toTextLang, hasText, TEXT_LANGS, type TextLang } from '@/lib/translations';

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
    include: { translations: { select: { lang: true; title: true } }; group: { select: { id: true; name: true; slug: true; hiddenAt: true; category: { include: ReturnType<typeof TaxonomyResolver.getInclude> } } } };
}>;

/** One discovery result: just what the cards need (no instructions, no attendee lists). */
export interface DiscoverableEvent {
    id: string;
    title: string;
    /** Language the title is written in; differs from the viewer's when only another language exists. */
    titleLang: TextLang;
    slug: string;
    startDate: Date;
    location: string | null;
    bannerImage: string | null;
    joinMode: EventJoinMode;
    isFull: boolean;
    isMembersOnly: boolean;
    /** GOING attendees — "approved" for Request-to-join events. */
    goingCount: number;
    group: {
        name: string;
        slug: string;
        city: string | null;
        bannerImage: string | null;
        accentColor: string | null;
        category: {
            slug: string;
            level: number;
            parent: { slug: string; parent: { slug: string } | null } | null;
        };
    };
}

export class EventService {
    /** Role of the user in the group plus site-admin flag. */
    private static async getAccess(groupId: string, userId?: string) {
        if (!userId) return { isMember: false, isGroupAdmin: false, isSiteAdmin: false };
        const [membership, user] = await Promise.all([
            prisma.membership.findUnique({
                where: { userId_groupId: { userId, groupId } },
                select: { role: true }
            }),
            prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
        ]);
        return {
            isMember: !!membership && membership.role !== 'PENDING',
            isGroupAdmin: hasAdminRights(membership?.role),
            isSiteAdmin: user?.role === 'ADMIN'
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
            organiserIds: Array.from(new Set([event.creatorId, ...admins.map(a => a.userId)]))
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
        userId?: string
    ) => {
        const lang = locale === 'en' ? 'en' : 'lv';

        const groupRecord = await prisma.group.findFirst({
            where: { slug: groupSlug, hiddenAt: null },
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

        // Members-only events do not exist for everyone else (404).
        if (event.visibility === 'MEMBERS_ONLY' && !(await EventService.canSeeMembersOnly(groupRecord.id, userId))) {
            return null;
        }

        const access = await EventService.getAccess(groupRecord.id, userId);
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
        userId?: string
    ): Promise<{ groupName: string; groupSlug: string; l1Slug: string } | null> => {
        const group = await prisma.group.findFirst({
            where: { slug: groupSlug, hiddenAt: null },
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

    /** Text of every language for the organiser's edit form (a missing language is empty text). */
    private static toEditableTexts(
        translations: { lang: string; title: string; description: string | null; instructions: string | null }[],
        originalLang: string
    ): { originalLang: TextLang; texts: Record<TextLang, { title: string; description: string; instructions: string }> } {
        const text = (lang: TextLang) => {
            const row = translations.find((t) => t.lang === lang);
            return { title: row?.title ?? '', description: row?.description ?? '', instructions: row?.instructions ?? '' };
        };
        return { originalLang: toTextLang(originalLang), texts: { lv: text('lv'), en: text('en') } };
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
     * Get all events for a group with the current viewer's status.
     * Instructions are stripped here for viewers who may not read them.
     */
    static async getGroupEvents(groupId: string, locale: string, userId?: string) {
        const lang = toTextLang(locale);
        try {
            const access = await EventService.getAccess(groupId, userId);
            const canSeeAll = access.isMember || access.isSiteAdmin;
            const events = await prisma.event.findMany({
                where: { groupId, ...(canSeeAll ? {} : { visibility: 'PUBLIC' }) },
                orderBy: { startDate: 'asc' },
                include: {
                    translations: true,
                    _count: {
                        select: { attendees: { where: { status: 'GOING' } } }
                    },
                    attendees: {
                        where: { status: 'GOING' },
                        orderBy: { joinedAt: 'asc' },
                        include: {
                            user: {
                                select: { id: true, name: true, image: true }
                            }
                        },
                        take: 5 // Fetch first 5 for the avatar list
                    }
                }
            });

            const [mine, waitlistCounts] = await Promise.all([
                userId
                    ? prisma.attendance.findMany({
                        where: { userId, eventId: { in: events.map(e => e.id) } },
                        select: { eventId: true, status: true }
                    })
                    : Promise.resolve([]),
                prisma.attendance.groupBy({
                    by: ['eventId', 'status'],
                    where: { eventId: { in: events.map(e => e.id) }, status: { in: ['WAITLISTED', 'PENDING'] } },
                    _count: { _all: true }
                })
            ]);
            const myStatus = new Map(mine.map(a => [a.eventId, a.status]));
            const waiting = (eventId: string, status: AttendanceStatus) =>
                waitlistCounts.find(w => w.eventId === eventId && w.status === status)?._count._all ?? 0;

            return events.map(e => {
                const status = myStatus.get(e.id) ?? null;
                const canManage = !!userId && (e.creatorId === userId || access.isGroupAdmin);
                const canSeeInstructions = EventService.instructionsVisible(e.joinMode, canManage, status);
                // Resolved to the viewer's language; restricted instructions are never read, in any language.
                const text = resolveEventText(e.translations, lang, e.originalLang, !canSeeInstructions);
                const viewer: EventViewer = {
                    canSee: true,
                    canManage,
                    canSeeInstructions,
                    instructionsLocked: !canSeeInstructions && text.hasInstructions,
                    myStatus: status,
                    goingCount: e._count.attendees,
                    waitlistCount: canManage ? waiting(e.id, 'WAITLISTED') : 0,
                    pendingCount: canManage ? waiting(e.id, 'PENDING') : 0
                };
                const { translations: _translations, ...eventFields } = e;
                void _translations;
                return {
                    ...eventFields,
                    title: text.title,
                    titleLang: text.titleLang,
                    description: text.description,
                    instructions: text.instructions,
                    fallbackLang: text.fallbackLang,
                    isAttending: status === 'GOING',
                    attendeeCount: e._count.attendees,
                    attendeeList: e.attendees.map(a => a.user),
                    viewer
                };
            });
        } catch (error) {
            console.error('[EventService.getGroupEvents] Error:', error);
            return [];
        }
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
    static async getDiscoverableEvents(filters: {
        category?: string;
        city?: string;
        search?: string;
        status?: 'upcoming' | 'past';
    }, locale: string, userId?: string): Promise<DiscoverableEvent[]> {
        const todayStart = startOfTodayInRiga();
        const { category, city, search, status } = filters;

        const buildWhere = (fCity?: string, fCategory?: string, fSearch?: string, fStatus?: string): Prisma.EventWhereInput => {
            const groupFilters: Prisma.GroupWhereInput[] = [{ hiddenAt: null }];
            if (fCity) groupFilters.push({ city: fCity });
            if (fCategory) {
                groupFilters.push({
                    OR: [
                        { category: { slug: fCategory } },
                        { category: { parent: { slug: fCategory } } },
                        { category: { parent: { parent: { slug: fCategory } } } }
                    ]
                });
            }
            return {
                // Past = the event's last day is before today (Latvian time); see isEventPast.
                ...(fStatus === 'past'
                    ? { OR: [{ endDate: { lt: todayStart } }, { endDate: null, startDate: { lt: todayStart } }] }
                    : { OR: [{ endDate: { gte: todayStart } }, { endDate: null, startDate: { gte: todayStart } }] }),
                AND: [
                    { group: { AND: groupFilters } },
                    // Matches the text in any language (instructions are restricted and never searched).
                    ...(fSearch ? [{
                        OR: [
                            {
                                translations: {
                                    some: {
                                        OR: [
                                            { title: { contains: fSearch, mode: 'insensitive' as const } },
                                            { description: { contains: fSearch, mode: 'insensitive' as const } }
                                        ]
                                    }
                                }
                            },
                            {
                                group: {
                                    OR: [
                                        { name: { contains: fSearch, mode: 'insensitive' as const } },
                                        { description: { contains: fSearch, mode: 'insensitive' as const } }
                                    ]
                                }
                            }
                        ]
                    }] : [])
                ]
            };
        };

        const include = {
            // Titles only: descriptions and instructions never go into discovery payloads.
            translations: { select: { lang: true, title: true } },
            group: {
                select: {
                    name: true,
                    slug: true,
                    city: true,
                    bannerImage: true,
                    accentColor: true,
                    category: {
                        select: {
                            slug: true,
                            level: true,
                            parent: {
                                select: {
                                    slug: true,
                                    parent: { select: { slug: true } }
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    attendees: { where: { status: 'GOING' as const } }
                }
            }
        } satisfies Prisma.EventInclude;

        const orderBy = { startDate: status === 'past' ? 'desc' : 'asc' } as const;

        const loadPublic = unstable_cache(
            async (fCity?: string, fCategory?: string, fSearch?: string, fStatus?: string) => {
                return await prisma.event.findMany({
                    where: { AND: [buildWhere(fCity, fCategory, fSearch, fStatus), { visibility: 'PUBLIC' }] },
                    include,
                    orderBy
                });
            },
            [`events-discovery-v2-${locale}-${city}-${category}-${search}-${status}`],
            {
                revalidate: 60,
                tags: ['events']
            }
        );

        const [publicRows, memberRows] = await Promise.all([
            loadPublic(city, category, search, status),
            userId
                ? prisma.event.findMany({
                    where: {
                        AND: [
                            buildWhere(city, category, search, status),
                            {
                                visibility: 'MEMBERS_ONLY',
                                group: { members: { some: { userId, role: { not: 'PENDING' } } } }
                            }
                        ]
                    },
                    include,
                    orderBy
                })
                : Promise.resolve([])
        ]);

        const direction = status === 'past' ? -1 : 1;
        const lang = toTextLang(locale);
        // Cached rows come back with dates as strings in some Next versions; normalise before sorting.
        return [...publicRows, ...memberRows]
            .map(e => {
                const text = resolveEventText(e.translations.map(t => ({ ...t, description: null, instructions: null })), lang, e.originalLang, true);
                return { e, text };
            })
            .map(({ e, text }) => ({
                id: e.id,
                title: text.title,
                titleLang: text.titleLang,
                slug: e.slug,
                startDate: new Date(e.startDate),
                location: e.location,
                bannerImage: e.bannerImage,
                joinMode: e.joinMode,
                isFull: e.isFull,
                isMembersOnly: e.visibility === 'MEMBERS_ONLY',
                goingCount: e._count.attendees,
                group: e.group
            }))
            .sort((a, b) => direction * (a.startDate.getTime() - b.startDate.getTime()));
    }
}
