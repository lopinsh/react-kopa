'use server';

import { auth } from '@/lib/auth';
import { handleActionError } from '@/lib/action-utils';
import { ChatAccessService, type ChatBrowserSession } from '@/lib/services/chat-access.service';
import type { PublicLine } from '@/lib/services/matrix.service';
import { chatSessionSchema, hubKeySchema, openRoomSchema } from '@/lib/validations/chat';
import type { ActionResponse } from '@/types/actions';

/** A Matrix login for the signed-in person's browser (K5-05). The tokens go to the browser's memory only. */
export async function chatSession(input: unknown): Promise<ActionResponse<ChatBrowserSession>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = chatSessionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatAccessService.session(session.user.id, parsed.data.deviceId) };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** Opening a room joins the person to it (K5-06). */
export async function openRoom(input: unknown): Promise<ActionResponse<{ roomId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = openRoomSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatAccessService.open(session.user.id, parsed.data.hubKey) };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** The last lines for anyone, signed in or not (K5-07, K-146: the signed-out page asks again every 30 s). */
export async function readChat(input: unknown): Promise<ActionResponse<PublicLine[]>> {
    const parsed = hubKeySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatAccessService.read(parsed.data) };
    } catch (error: unknown) {
        return handleActionError(error, 'CHAT_UNAVAILABLE');
    }
}
