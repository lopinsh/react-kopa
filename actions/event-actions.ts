'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
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

        const { event, eventTitle, membersToNotify, groupName, groupSlug, l1Slug } = result;

        if (membersToNotify.length > 0) {
            await Promise.all(membersToNotify.map(m =>
                NotificationService.notify({
                    userId: m.userId,
                    type: 'NEW_EVENT',
                    translationKey: 'newEvent',
                    args: { eventTitle, groupName },
                    link: `/${l1Slug}/group/${groupSlug}/events/${event.slug}`
                })
            ));
        }

        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}/events`, 'page');
        // Discovery lists upcoming events from a cache tagged 'events'.
        updateTag('events');
        return { success: true, data: { event } };
    } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') return { success: false, error: 'EVENT_SLUG_TAKEN' };
        return handleActionError(error, 'CREATE_EVENT_FAILED');
    }
}

type EventPaths = { l1Slug: string; groupSlug: string; eventSlug: string };

function revalidateEventPaths(locale: string, ctx: EventPaths) {
    const base = `/${locale}/${ctx.l1Slug}/group/${ctx.groupSlug}`;
    revalidatePath(base, 'layout'); // the Pasākumi badge sits in the group frame
    revalidatePath(`${base}/events`, 'page');
    revalidatePath(`${base}/events/${ctx.eventSlug}`, 'page');
}

type EventNotificationType = 'EVENT_REQUEST' | 'EVENT_APPROVED' | 'EVENT_DECLINED' | 'EVENT_LET_IN' | 'EVENT_SPOT_FREED' | 'EVENT_ROOM_AGAIN' | 'EVENT_NOW_OPEN' | 'EVENT_REMOVED';

/** One compact notification about an event; `authorName` is the person it is about. */
function notifyEvent(
    userId: string,
    type: EventNotificationType,
    ctx: EventActionContext,
    extra: { authorName?: string; waitlistCount?: number } = {}
) {
    return NotificationService.notify({
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
        revalidateEventPaths(locale, result);
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
        const ctx = result;
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
        const ctx = result;
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
        await notifyEvent(targetUserId, decision === 'approve' ? 'EVENT_APPROVED' : 'EVENT_DECLINED', result);
        revalidateEventPaths(locale, result);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Organiser takes a going person off the event; that person is told.
 */
export async function removeAttendee(eventId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.removeAttendee(eventId, targetUserId, session.user.id);
        await notifyEvent(targetUserId, 'EVENT_REMOVED', result);
        revalidateEventPaths(locale, result);
        updateTag('events');
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
        await notifyEvent(targetUserId, 'EVENT_LET_IN', result);
        revalidateEventPaths(locale, result);
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
        await Promise.all(result.waitlistedUserIds.map(id => notifyEvent(id, 'EVENT_ROOM_AGAIN', result)));
        revalidateEventPaths(locale, result);
        updateTag('events');
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

        const ctx = result;
        // Everyone who was waiting got in when the event opened up: tell them once.
        await Promise.all(ctx.convertedUserIds.map(id => notifyEvent(id, 'EVENT_NOW_OPEN', ctx)));
        revalidateEventPaths(locale, ctx);
        updateTag('events');
        return { success: true, data: { eventSlug: ctx.eventSlug } };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/**
 * Delete an event. Everyone who was going, waiting or on the waitlist is told.
 */
/** On success it never returns: it redirects to the group's Pasākumi in the same response (the deleted page is never re-rendered). */
export async function deleteEvent(eventId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    let listPath: string;
    try {
        const result = await EventService.deleteEvent(eventId, session.user.id);
        const ctx = result;
        await Promise.all(ctx.attendeeIds.map(id => NotificationService.notify({
            userId: id,
            type: 'EVENT_CANCELLED',
            translationKey: 'EVENT_CANCELLED',
            args: { groupName: ctx.groupName, eventTitle: ctx.eventTitle },
            link: `/${ctx.l1Slug}/group/${ctx.groupSlug}/events`
        })));
        revalidateEventPaths(locale, ctx);
        updateTag('events');
        listPath = `/${locale}/${ctx.l1Slug}/group/${ctx.groupSlug}/events`;
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
    // Outside the try: redirect() throws by design.
    redirect(listPath);
}

