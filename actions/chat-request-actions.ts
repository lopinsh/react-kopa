'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { ChatRequestService } from '@/lib/services/chat-request.service';
import { NotificationService } from '@/lib/services/notification.service';
import { chatRequestSchema, hubNoteIdSchema } from '@/lib/validations/hub-note';
import { handleActionError } from '@/lib/action-utils';
import type { ActionResponse } from '@/types/actions';

/** "Rakstīt privāti": a request to a Ziņa's author; they accept or decline in the Ziņas inbox (K-83, K-120). */
export async function sendChatRequest(input: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = chatRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const sent = await ChatRequestService.send(session.user.id, parsed.data.noteId, parsed.data.content);
        await NotificationService.notify({
            userId: sent.recipientId,
            type: 'CHAT_REQUEST',
            translationKey: 'CHAT_REQUEST',
            args: { authorName: session.user.name ?? '', excerpt: parsed.data.content },
            link: `/messages?r=${sent.id}`,
        });
        revalidatePath('/[locale]/[l1Slug]/[...hub]', 'layout');
        revalidatePath('/[locale]/messages', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** Accepts a request addressed to the signed-in person; the data holds the new direct chat. */
export async function acceptChatRequest(id: unknown): Promise<ActionResponse<{ conversationId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsedId = hubNoteIdSchema.safeParse(id);
    if (!parsedId.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const done = await ChatRequestService.accept(session.user.id, parsedId.data);
        await NotificationService.notify({
            userId: done.senderId,
            type: 'CHAT_REQUEST_ACCEPTED',
            translationKey: 'CHAT_REQUEST_ACCEPTED',
            args: { authorName: session.user.name ?? '' },
            link: `/messages?c=${done.conversationId}`,
        });
        revalidatePath('/[locale]/messages', 'page');
        return { success: true, data: { conversationId: done.conversationId } };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** Declines silently: no notification, and the sender keeps seeing "waiting for approval". */
export async function declineChatRequest(id: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsedId = hubNoteIdSchema.safeParse(id);
    if (!parsedId.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        await ChatRequestService.decline(session.user.id, parsedId.data);
        revalidatePath('/[locale]/messages', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}
