import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Prisma, AttendanceStatus, EventJoinMode, Event as EventModel } from '@prisma/client';
import { EventFormValues } from '@/lib/validations/event';
import { ErrorCode } from '@/types/actions';
import { hasAdminRights } from '@/lib/utils/permissions';
import { TaxonomyResolver } from './taxonomy-resolver.service';

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
    include: { group: { select: { id: true; name: true; slug: true; hiddenAt: true; category: { include: ReturnType<typeof TaxonomyResolver.getInclude> } } } };
}>;

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

    private static async loadEventForAction(eventId: string): Promise<EventWithGroup | null> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
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

    private static async buildContext(event: EventWithGroup): Promise<EventActionContext> {
        const admins = await prisma.membership.findMany({
            where: { groupId: event.groupId, role: { in: ['OWNER', 'ADMIN'] } },
            select: { userId: true }
        });
        return {
            l1Slug: TaxonomyResolver.resolve(event.group.category).l1Slug,
            groupSlug: event.group.slug,
            groupName: event.group.name,
            eventSlug: event.slug,
            eventTitle: event.title,
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

        const viewer: EventViewer = {
            canSee: true,
            canManage,
            canSeeInstructions,
            instructionsLocked: !canSeeInstructions && !!event.instructions,
            myStatus,
            goingCount: event.attendees.filter(a => a.status === 'GOING').length,
            waitlistCount: event.attendees.filter(a => a.status === 'WAITLISTED').length,
            pendingCount: event.attendees.filter(a => a.status === 'PENDING').length
        };

        // Only organisers get the full people lists (pending, waitlist); everyone else gets none.
        return {
            ...event,
            instructions: canSeeInstructions ? event.instructions : null,
            attendees: canManage ? event.attendees : [],
            viewer
        };
    });

    /**
     * Create a new event within a group.
     */
    static async createEvent(groupId: string, data: EventFormValues, userId: string): Promise<EventServiceResult<{ event: EventModel; membersToNotify: { userId: string }[]; groupName: string; groupSlug: string; l1Slug: string }>> {
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

        const event = await prisma.event.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                maxParticipants: data.maxParticipants,
                visibility: data.visibility,
                joinMode: data.joinMode,
                isRecurring: data.isRecurring,
                recurrencePattern: data.recurrencePattern,
                bannerImage: data.bannerImage,
                instructions: data.instructions,
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

        const membersToNotify = await prisma.membership.findMany({
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
                membersToNotify,
                groupName: event.group.name,
                groupSlug: event.group.slug,
                l1Slug: resolved.l1Slug
            }
        };
    }

    /**
     * Update an existing event.
     */
    static async updateEvent(eventId: string, data: EventFormValues, userId: string): Promise<EventServiceResult<{ l1Slug: string; groupSlug: string }>> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                group: {
                    select: {
                        slug: true,
                        category: {
                            include: TaxonomyResolver.getInclude('lv')
                        }
                    }
                }
            }
        });

        if (!event) return { success: false, error: 'EVENT_NOT_FOUND' };

        const membership = await prisma.membership.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: event.groupId,
                }
            }
        });

        const isOwner = event.creatorId === userId;
        const isAdmin = membership && hasAdminRights(membership.role);

        if (!isOwner && !isAdmin) {
            return { success: false, error: 'FORBIDDEN' };
        }

        await prisma.event.update({
            where: { id: eventId },
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                maxParticipants: data.maxParticipants,
                visibility: data.visibility,
                joinMode: data.joinMode,
                isRecurring: data.isRecurring,
                recurrencePattern: data.recurrencePattern,
                bannerImage: data.bannerImage,
                instructions: data.instructions,
            }
        });

        const resolved = TaxonomyResolver.resolve(event.group.category);

        return { success: true, data: { l1Slug: resolved.l1Slug, groupSlug: event.group.slug } };
    }

    /**
     * Get all events for a group with the current viewer's status.
     * Instructions are stripped here for viewers who may not read them.
     */
    static async getGroupEvents(groupId: string, userId?: string) {
        try {
            const access = await EventService.getAccess(groupId, userId);
            const canSeeAll = access.isMember || access.isSiteAdmin;
            const events = await prisma.event.findMany({
                where: { groupId, ...(canSeeAll ? {} : { visibility: 'PUBLIC' }) },
                orderBy: { startDate: 'asc' },
                include: {
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
                const viewer: EventViewer = {
                    canSee: true,
                    canManage,
                    canSeeInstructions: EventService.instructionsVisible(e.joinMode, canManage, status),
                    instructionsLocked: !EventService.instructionsVisible(e.joinMode, canManage, status) && !!e.instructions,
                    myStatus: status,
                    goingCount: e._count.attendees,
                    waitlistCount: canManage ? waiting(e.id, 'WAITLISTED') : 0,
                    pendingCount: canManage ? waiting(e.id, 'PENDING') : 0
                };
                return {
                    ...e,
                    instructions: viewer.canSeeInstructions ? e.instructions : null,
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
     * Cached for 60 seconds to handle rapid filter switching.
     */
    static async getDiscoverableEvents(filters: {
        category?: string;
        city?: string;
        search?: string;
        status?: 'upcoming' | 'past';
    }, locale: string) {
        const now = new Date();
        const { category, city, search, status } = filters;

        const rows = await unstable_cache(
            async (fCity, fCategory, fSearch, fStatus) => {
                return await prisma.event.findMany({
                    where: {
                        visibility: 'PUBLIC',
                        AND: [{ group: { hiddenAt: null } }],
                        startDate: fStatus === 'past' ? { lt: now } : { gte: now },
                        ...(fCity && {
                            group: {
                                city: fCity
                            }
                        }),
                        ...(fCategory && {
                            group: {
                                OR: [
                                    { category: { slug: fCategory } },
                                    { category: { parent: { slug: fCategory } } },
                                    { category: { parent: { parent: { slug: fCategory } } } }
                                ]
                            }
                        }),
                        ...(fSearch && {
                            OR: [
                                { title: { contains: fSearch, mode: 'insensitive' } },
                                { description: { contains: fSearch, mode: 'insensitive' } },
                                {
                                    group: {
                                        OR: [
                                            { name: { contains: fSearch, mode: 'insensitive' } },
                                            { description: { contains: fSearch, mode: 'insensitive' } }
                                        ]
                                    }
                                }
                            ]
                        })
                    },
                    include: {
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
                            } as Prisma.GroupSelect
                        },
                        _count: {
                            select: {
                                attendees: { where: { status: 'GOING' } }
                            }
                        }
                    },
                    orderBy: {
                        startDate: fStatus === 'past' ? 'desc' : 'asc'
                    }
                });
            },
            [`events-discovery-${locale}-${city}-${category}-${search}-${status}`],
            {
                revalidate: 60,
                tags: ['events']
            }
        )(city, category, search, status);

        // Discovery cards never need instructions; they may be restricted on Request-to-join events.
        return rows.map(e => ({ ...e, instructions: null }));
    }
}
