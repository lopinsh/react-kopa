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
                    args: { title: event.title, groupName },
                    link: `/${l1Slug}/group/${groupSlug}/events/${event.slug}`
                })
            ));
        }

        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}/events`, 'page');
        return { success: true, data: { event } };
    } catch (error) {
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

/**
 * Toggle attendance for an event.
 */
export async function toggleAttendance(eventId: string, status: 'GOING' | 'INTERESTED' | 'NONE', locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await EventService.toggleAttendance(eventId, session.user.id, status);
        if (!result.success) return result as ActionResponse;

        if (result.data) {
            revalidatePath(`/${locale}/${result.data.l1Slug}/group/${result.data.groupSlug}`, 'page');
            revalidatePath(`/${locale}/${result.data.l1Slug}/group/${result.data.groupSlug}/events`, 'page');
        }
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'TOGGLE_FAILED');
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

