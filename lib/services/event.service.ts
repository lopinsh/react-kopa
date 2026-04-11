import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Prisma, AttendanceStatus, Event as EventModel } from '@prisma/client';
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

export class EventService {
    /**
     * Get a single event with full context (group, membership status, etc.)
     * Cached per-request to prevent redundant queries.
     */
    static getEventWithContext = cache(async (
        eventSlug: string,
        groupSlug: string,
        locale: string,
        _userId?: string
    ) => {
        const lang = locale === 'en' ? 'en' : 'lv';
        void _userId;

        const groupRecord = await prisma.group.findFirst({
            where: { slug: groupSlug },
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
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        attendees: true
                    }
                }
            }
        });

        return event;
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
     * Get all events for a group with attendee status for current user.
     */
    static async getGroupEvents(groupId: string, userId?: string) {
        try {
            const events = await prisma.event.findMany({
                where: { groupId },
                orderBy: { startDate: 'asc' },
                include: {
                    _count: {
                        select: { attendees: true }
                    },
                    attendees: {
                        include: {
                            user: {
                                select: { id: true, name: true, image: true }
                            }
                        },
                        take: 5 // Fetch first 5 for the avatar list
                    }
                }
            });

            return events.map(e => ({
                ...e,
                isAttending: userId ? e.attendees.some(a => a.userId === userId) : false,
                attendeeCount: e._count.attendees,
                attendeeList: e.attendees.map(a => a.user)
            }));
        } catch (error) {
            console.error('[EventService.getGroupEvents] Error:', error);
            return [];
        }
    }

    /**
     * Toggle attendance for an event.
     */
    static async toggleAttendance(
        eventId: string,
        userId: string,
        status: 'GOING' | 'INTERESTED' | 'NONE'
    ): Promise<EventServiceResult<{ l1Slug: string; groupSlug: string }>> {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: { select: { attendees: true } },
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

        if (status === 'NONE') {
            await prisma.attendance.deleteMany({
                where: { eventId, userId }
            });
        } else {
            // Check capacity for GOING
            if (status === 'GOING' && event.maxParticipants && event._count.attendees >= event.maxParticipants) {
                const current = await prisma.attendance.findUnique({
                    where: { userId_eventId: { userId, eventId } }
                });
                if (!current || current.status !== 'GOING') {
                    return { success: false, error: 'EVENT_FULL' };
                }
            }

            await prisma.attendance.upsert({
                where: { userId_eventId: { userId, eventId } },
                update: { status: status as AttendanceStatus },
                create: { userId, eventId, status: status as AttendanceStatus }
            });
        }

        const resolved = TaxonomyResolver.resolve(event.group.category);

        return { success: true, data: { l1Slug: resolved.l1Slug, groupSlug: event.group.slug } };
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

        return await unstable_cache(
            async (fCity, fCategory, fSearch, fStatus) => {
                return await prisma.event.findMany({
                    where: {
                        visibility: 'PUBLIC',
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
                                attendees: true
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
    }
}
