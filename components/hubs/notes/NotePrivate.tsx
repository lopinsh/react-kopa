'use client';

import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { MESSAGE_MAX_LENGTH } from '@/lib/validations/message';
import { chatRequestSchema } from '@/lib/validations/hub-note';
import { sendChatRequest } from '@/actions/chat-request-actions';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { HubNoteRow } from '@/lib/services/hub-note.service';

/**
 * "Rakstīt privāti" on someone else's Ziņa (K-83, K2-23): `none` opens a small form, `pending` is a quiet disabled button (a declined request reads the same, K-120),
 * `open` goes to the chat that already exists, `hidden` shows nothing.
 */
export default function NotePrivate({ note }: { note: HubNoteRow }) {
    const t = useTranslations('hub.notes');
    const tErrors = useTranslations('errors');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const { error: toastError } = useToast();
    const id = useId();
    const [state, setState] = useState(note.request);
    const [form, setForm] = useState(false);
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const fail = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    if (!note.author || state === 'hidden') return null;
    if (state === 'pending') return <Button size="sm" variant="quiet" disabled>{t('pending')}</Button>;
    const author = note.author;
    if (state === 'open') {
        return (
            <Button size="sm" variant="quiet" disabled={isPending} onClick={() => startTransition(async () => {
                const result = await getOrCreateDirectChat(author.id);
                if (result.success && result.data) router.push(`/messages?c=${result.data.conversationId}`);
                else if (!result.success) fail(result.error);
            })}>{t('openChat')}</Button>
        );
    }
    if (!form) return <Button size="sm" variant="quiet" onClick={() => setForm(true)}>{t('message')}</Button>;

    const send = () => {
        const parsed = chatRequestSchema.safeParse({ noteId: note.id, content: text });
        if (isPending || !parsed.success) return;
        startTransition(async () => {
            const result = await sendChatRequest(parsed.data);
            if (result.success || (!result.success && result.error === 'CHAT_REQUEST_EXISTS')) setState('pending');
            if (!result.success) fail(result.error);
        });
    };
    return (
        <div className="grid w-full gap-2">
            <label htmlFor={`${id}-msg`} className="text-meta text-foreground-muted">{t('messageHint', { name: author.name ?? '' })}</label>
            <Textarea id={`${id}-msg`} rows={3} value={text} maxLength={MESSAGE_MAX_LENGTH} placeholder={t('messagePlaceholder')} onChange={(e) => setText(e.target.value)} />
            <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={isPending || text.trim().length === 0} onClick={send}>{t('send')}</Button>
                <Button size="sm" variant="quiet" disabled={isPending} onClick={() => setForm(false)}>{tCommon('cancel')}</Button>
            </div>
        </div>
    );
}
