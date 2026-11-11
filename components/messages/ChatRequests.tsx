'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { acceptChatRequest, declineChatRequest } from '@/actions/chat-request-actions';
import { useToast } from '@/hooks/use-toast';
import type { ChatRequestInbox } from '@/lib/services/chat-request.service';
import ChatRequestRow from './ChatRequestRow';

/**
 * "Pieprasījumi" at the top of the Ziņas list (K2-25), only when there are rows, so an inbox without requests looks as before.
 * Accept opens the new chat; decline removes the row here only (the sender's view never changes, K-120). The `r` query marks and scrolls to one.
 */
export default function ChatRequests({ requests, focusId }: { requests: ChatRequestInbox; focusId?: string | null }) {
    const t = useTranslations('messages.requests');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { error: toastError } = useToast();
    const [incoming, setIncoming] = useState(requests.incoming);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (focusId) document.getElementById(`r-${focusId}`)?.scrollIntoView({ block: 'center' });
    }, [focusId]);

    const answer = (id: string, accept: boolean) => {
        if (isPending) return;
        startTransition(async () => {
            const result = accept ? await acceptChatRequest(id) : await declineChatRequest(id);
            if (!result.success) {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                if (result.error === 'NOT_FOUND') setIncoming((rows) => rows.filter((r) => r.id !== id));
                return;
            }
            setIncoming((rows) => rows.filter((r) => r.id !== id));
            if (accept && result.data && 'conversationId' in result.data) router.push(`/messages?c=${result.data.conversationId}`);
        });
    };

    if (incoming.length === 0 && requests.outgoing.length === 0) return null;
    return (
        <section aria-label={t('title')} className="border-b border-border">
            <h2 className="px-4 pt-3 text-meta text-foreground-muted">{t('title')}</h2>
            <ul>
                {incoming.map((r) => <ChatRequestRow key={r.id} request={r} busy={isPending} highlighted={r.id === focusId} onAccept={() => answer(r.id, true)} onDecline={() => answer(r.id, false)} />)}
                {requests.outgoing.map((r) => <ChatRequestRow key={r.id} request={r} />)}
            </ul>
        </section>
    );
}
