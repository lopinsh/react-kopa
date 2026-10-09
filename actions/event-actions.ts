'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createNotification } from './notification-actions';
import { validateActionData, handleActionError } from '@/lib/action-utils';

import { eventSchema, type EventFormValues } from '@/lib/validations/event';
import { ActionResponse } from '@/types/actions';
import { EventService, type EventActionContext } from '@/lib/services/event.service';
import type { Event as EventModel } from '@prisma/client';

/**
 * Create a new event within a group.
 */
export async function createEvent(groupId: string, data: EventFormValues, locale: string): Promise<ActionResponse<{ event: EventModel }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(eventSchema, data);
        if (!validation.success) return validation;

        const result = await EventService.createEvent(groupId, validation.data, session.user.id);
        if (!result.success) return result as ActionResponse<{ event: EventModel }>;

        const { event, membersToNotify, groupName, groupSlug, l1Slug } = result.data!;

        if (membersToNotify.length > 0) {
            await Promise.all(membersToNotify.map(m =>
                createNotification({
                    userId: m.userId,
                    type: 'NEW_EVENT',
                    translationKey: 'newEvent',
                    args: { eventTitle: event.title, groupName },
                    link: `/${l1Slug}/group/${groupSlug}/events/${event.slug}`
                })
            ));
        }

        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}/events`, 'page');
        return { success: true, data: { event } };
    } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') return { success: false, error: 'EVENT_SLUG_TAKEN' };
        return handleActionError(error, 'CREATE_EVENT_FAILED');
    }
}

/**
 * Get all events for a group with attendee status for current user.
 */
export async function getGroupEvents(groupId: string) {
    const session = await auth();
    const userId = session?.user?.id;

    return await EventService.getGroupEvents(groupId, userId);
}

type EventPaths = { l1Slug: string; groupSlug: string; eventSlug: string };

function revalidateEventPaths(locale: string, ctx: EventPaths) {
    const base = `/${locale}/${ctx.l1Slug}/group/${ctx.groupSlug}`;
    revalidatePath(base, 'page');
    revalidatePath(`${base}/events`, 'page');
    revalidatePath(`${base}/events/${ctx.eventSlug}`, 'page');
}

type EventNotificationType = 'EVENT_REQUEST' | 'EVENT_APPROVED' | 'EVENT_DECLINED' | 'EVENT_LET_IN' | 'EVENT_SPOT_FREED' | 'EVENT_ROOM_AGAIN' | 'EVENT_NOW_OPEN';

/** One compact notification about an event; `authorName` is the person it is about. */
function notifyEvent(
    userId: string,
    type: EventNotificationType,
    ctx: EventActionContext,
    extra: { authorName?: string; waitlistCount?: number } = {}
) {
    return createNotification({
        userId,
        type,
        translationKey: type,
        args: {
            groupName: ctx.groupName,
            eventTitle: ctx.eventTitle,
            ...(extra.authorName !== undefined && { authorName: extra.authorName }),
            ...(extra.waitlistCount !== undefined && { waitlistCount: extra.waitlistCount })
        },
        link: `/${ctx.l1Slug}/group/${ctx.groupSlug}/events/${ctx.eventSlug}`
    });
}

/**
 * Open events: "I'm going" or cancel.
 */
export async function setAttendance(eventId: string, status: 'GOING' | 'NONE', locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.setAttendance(eventId, session.user.id, status);
        if (!result.success) return result;
        revalidateEventPaths(locale, result.data!);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'TOGGLE_FAILED');
    }
}

/**
 * Request-to-join events: ask to join, or join the waitlist when the organiser marked the event Full.
 */
export async function requestToJoin(eventId: string, allowWaitlist: boolean, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.requestToJoin(eventId, session.user.id, allowWaitlist);
        if (!result.success) return result;
        const ctx = result.data!;
        if (ctx.created && ctx.status === 'PENDING') {
            const authorName = session.user.name || session.user.username || '';
            await Promise.all(ctx.organiserIds
                .filter(id => id !== session.user.id)
                .map(id => notifyEvent(id, 'EVENT_REQUEST', ctx, { authorName })));
        }
        revalidateEventPaths(locale, ctx);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'TOGGLE_FAILED');
    }
}

/**
 * Leave the event or withdraw a request.
 */
export async function cancelAttendance(eventId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.cancel(eventId, session.user.id);
        if (!result.success) return result;
        const ctx = result.data!;
        // An approved person left a Full event: the organisers decide whether to let someone in.
        if (ctx.wasGoing && ctx.isFull) {
            const authorName = session.user.name || session.user.username || '';
            await Promise.all(ctx.organiserIds
                .filter(id => id !== session.user.id)
                .map(id => notifyEvent(id, 'EVENT_SPOT_FREED', ctx, { authorName, waitlistCount: ctx.waitlistCount })));
        }
        revalidateEventPaths(locale, ctx);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'CANCEL_FAILED');
    }
}

/**
 * Organiser approves or declines a request.
 */
export async function decideAttendance(eventId: string, targetUserId: string, decision: 'approve' | 'decline', locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.decide(eventId, targetUserId, session.user.id, decision);
        if (!result.success) return result;
        await notifyEvent(targetUserId, decision === 'approve' ? 'EVENT_APPROVED' : 'EVENT_DECLINED', result.data!);
        revalidateEventPaths(locale, result.data!);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Organiser lets a waitlisted person in.
 */
export async function letInFromWaitlist(eventId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.letInFromWaitlist(eventId, targetUserId, session.user.id);
        if (!result.success) return result;
        await notifyEvent(targetUserId, 'EVENT_LET_IN', result.data!);
        revalidateEventPaths(locale, result.data!);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Organiser marks the event Full (or not).
 */
export async function setEventFull(eventId: string, isFull: boolean, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.setFull(eventId, session.user.id, isFull);
        if (!result.success) return result;
        await Promise.all(result.data!.waitlistedUserIds.map(id => notifyEvent(id, 'EVENT_ROOM_AGAIN', result.data!)));
        revalidateEventPaths(locale, result.data!);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Update an existing event. `confirmOpenWaiting` is the organiser's explicit OK to let in everyone
 * who is waiting when the event changes from Request to join to Open.
 */
export async function updateEvent(
    eventId: string,
    data: EventFormValues,
    locale: string,
    confirmOpenWaiting = false
): Promise<ActionResponse<{ eventSlug: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(eventSchema, data);
        if (!validation.success) return validation;

        const result = await EventService.updateEvent(eventId, validation.data, session.user.id, confirmOpenWaiting === true);
        if (!result.success) return result;

        const ctx = result.data!;
        // Everyone who was waiting got in when the event opened up: tell them once.
        await Promise.all(ctx.convertedUserIds.map(id => notifyEvent(id, 'EVENT_NOW_OPEN', ctx)));
        revalidateEventPaths(locale, ctx);
        return { success: true, data: { eventSlug: ctx.eventSlug } };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/**
 * Delete an event. Everyone who was going, waiting or on the waitlist is told.
 */
export async function deleteEvent(eventId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.deleteEvent(eventId, session.user.id);
        if (!result.success) return result;
        const ctx = result.data!;
        await Promise.all(ctx.attendeeIds.map(id => createNotification({
            userId: id,
            type: 'EVENT_CANCELLED',
            translationKey: 'EVENT_CANCELLED',
            args: { groupName: ctx.groupName, eventTitle: ctx.eventTitle },
            link: `/${ctx.l1Slug}/group/${ctx.groupSlug}/events`
        })));
        revalidateEventPaths(locale, ctx);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}

