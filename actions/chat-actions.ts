'use server';

import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { handleActionError } from '@/lib/action-utils';
import { ChatAccessService, type ChatBrowserSession } from '@/lib/services/chat-access.service';
import { ChatCardService, type ChatCard } from '@/lib/services/chat-card.service';
import { ChatPeopleService, type ChatLineName, type OnlineList } from '@/lib/services/chat-people.service';
import { ChatRequestService } from '@/lib/services/chat-request.service';
import type { PublicLine } from '@/lib/services/matrix.service';
import { NotificationService } from '@/lib/services/notification.service';
import { chatNamesSchema, chatSessionSchema, directChatRequestSchema, hubKeySchema, openRoomSchema, personCardSchema, roomOnlineSchema } from '@/lib/validations/chat';
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

/** Names, Mod and community group for the senders of lines the browser received (K5-11); signed in only (the signed-out page gets names with the lines), and only people in the room asked about. */
export async function chatNames(input: unknown): Promise<ActionResponse<Record<string, ChatLineName>>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = chatNamesSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatPeopleService.roomNames(parsed.data.hubKey, parsed.data.ids, await getLocale()) };
    } catch (error: unknown) {
        return handleActionError(error, 'CHAT_UNAVAILABLE');
    }
}

/** The room's online list (K5-18). Public: a signed-out visitor gets plain names, no ids, pictures or links (K-149). */
export async function roomOnline(input: unknown): Promise<ActionResponse<OnlineList>> {
    const session = await auth();
    const parsed = roomOnlineSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatPeopleService.online(parsed.data.hubKey, await getLocale(), !!session?.user?.id) };
    } catch (error: unknown) {
        return handleActionError(error, 'CHAT_UNAVAILABLE');
    }
}

/** The name card of one person (K5-19); signed in only (K-142). */
export async function personCard(input: unknown): Promise<ActionResponse<ChatCard>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = personCardSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await ChatCardService.card(session.user.id, parsed.data.userId) };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** "Rakstīt ziņu" on a name card (K5-20): a chat request into the person's Ziņas inbox, like a Ziņa's private reply (K-82). */
export async function sendDirectChatRequest(input: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = directChatRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const sent = await ChatRequestService.sendDirect(session.user.id, parsed.data.userId, parsed.data.content);
        await NotificationService.notify({
            userId: sent.recipientId,
            type: 'CHAT_REQUEST',
            translationKey: 'CHAT_REQUEST',
            args: { authorName: session.user.name ?? '', excerpt: parsed.data.content },
            link: `/messages?r=${sent.id}`,
        });
        revalidatePath('/[locale]/messages', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}
