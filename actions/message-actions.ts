'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { MessageService } from '@/lib/services/message.service';
import { type ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';

export async function getConversations(): Promise<ActionResponse<any>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const conversations = await MessageService.getConversations(session.user.id);
        return { success: true, data: conversations };
    } catch (error: any) {
        return handleActionError(error);
    }
}

export async function getOrCreateConversation(targetUserId: string): Promise<ActionResponse<any>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const conversation = await MessageService.getOrCreateConversation(session.user.id, targetUserId);
        return { success: true, data: conversation };
    } catch (error: any) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

export async function getMessages(conversationId: string): Promise<ActionResponse<any>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const messages = await MessageService.getMessages(conversationId, session.user.id);
        return { success: true, data: messages };
    } catch (error: any) {
        return handleActionError(error);
    }
}

export async function sendMessage(conversationId: string, content: string): Promise<ActionResponse<any>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!content.trim() || content.length > 2000) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        const message = await MessageService.sendMessage(conversationId, session.user.id, content);
        return { success: true, data: message };
    } catch (error: any) {
        return handleActionError(error);
    }
}

export async function blockConversation(conversationId: string, isBlocked: boolean): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await MessageService.blockConversation(conversationId, session.user.id, isBlocked);
        revalidatePath(`/[locale]/messages`, 'page');
        return { success: true };
    } catch (error: any) {
        return handleActionError(error);
    }
}
