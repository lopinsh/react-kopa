'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { MessageService, type InboxRow, type MessageView } from '@/lib/services/message.service';
import { type ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { messageTextSchema } from '@/lib/validations/message';

export async function getInbox(locale: string): Promise<ActionResponse<InboxRow[]>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const rows = await MessageService.listInbox(session.user.id, locale);
        return { success: true, data: rows };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getOrCreateDirectChat(targetUserId: string): Promise<ActionResponse<{ conversationId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const chat = await MessageService.getOrCreateDirectChat(session.user.id, targetUserId);
        return { success: true, data: { conversationId: chat.id } };
    } catch (error) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

export async function getMessages(conversationId: string): Promise<ActionResponse<MessageView[]>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const messages = await MessageService.getMessages(conversationId, session.user.id);
        return { success: true, data: messages };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function sendMessage(conversationId: string, content: string): Promise<ActionResponse<MessageView>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!messageTextSchema.safeParse(content).success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        const message = await MessageService.sendMessage(conversationId, session.user.id, content);
        return { success: true, data: message };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function markConversationRead(conversationId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await MessageService.markRead(conversationId, session.user.id);
        return { success: true };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function getUnreadCount(): Promise<ActionResponse<number>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        return { success: true, data: await MessageService.unreadCount(session.user.id) };
    } catch (error) {
        return handleActionError(error);
    }
}

export async function blockConversation(conversationId: string, isBlocked: boolean): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await MessageService.blockConversation(conversationId, session.user.id, isBlocked);
        revalidatePath(`/[locale]/messages`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error);
    }
}
