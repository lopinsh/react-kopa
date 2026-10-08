'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createNotification } from './notification-actions';
import { validateActionData, handleActionError } from '@/lib/action-utils';

import { eventSchema, type EventFormValues } from '@/lib/validations/event';
import { ActionResponse } from '@/types/actions';
import { EventService } from '@/lib/services/event.service';
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
        revalidateEventPaths(locale, result.data!);
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
        revalidateEventPaths(locale, result.data!);
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
        revalidateEventPaths(locale, result.data!);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Update an existing event.
 */
export async function updateEvent(eventId: string, data: EventFormValues, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(eventSchema, data);
        if (!validation.success) return validation;

        const result = await EventService.updateEvent(eventId, validation.data, session.user.id);
        if (!result.success) return result as ActionResponse;

        if (result.data) {
            revalidatePath(`/${locale}/${result.data.l1Slug}/group/${result.data.groupSlug}`, 'page');
            revalidatePath(`/${locale}/${result.data.l1Slug}/group/${result.data.groupSlug}/events`, 'page');
        }
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

