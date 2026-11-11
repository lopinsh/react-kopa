'use client';

import { useCallback, useEffect, useId, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { HUB_NOTE_REPLY_MAX } from '@/lib/constants';
import { hubNoteReplySchema } from '@/lib/validations/hub-note';
import { getHubNoteReplies, replyToHubNote } from '@/actions/hub-note-actions';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { HubNoteReplyRow, HubNoteRow } from '@/lib/services/hub-note.service';
import NoteReply from './NoteReply';

const AuthGateModal = dynamic(() => import('@/components/modals/AuthGateModal'), { ssr: false });

/**
 * The replies of an open Ziņa (K2-21): read when the row first opens (a page of notes does not read every reply), oldest first, then the reply
 * field. Signed out (`note.author` is null) the field is replaced by one sign-in button that returns to the note (K-41).
 */
export default function NoteReplies({ note, opened }: { note: HubNoteRow; opened: boolean }) {
    const t = useTranslations('hub.notes');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { error: toastError } = useToast();
    const id = useId();
    const [replies, setReplies] = useState<HubNoteReplyRow[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [text, setText] = useState('');
    const [gate, setGate] = useState(false);
    const [isPending, startTransition] = useTransition();
    const signedIn = note.author !== null;

    const show = useCallback((result: Awaited<ReturnType<typeof getHubNoteReplies>>) => {
        setFailed(!result.success);
        if (result.success && result.data) setReplies(result.data);
    }, []);
    const load = useCallback(async () => show(await getHubNoteReplies(note.id)), [note.id, show]);
    useEffect(() => {
        if (!opened || replies !== null || failed) return;
        let live = true;
        void getHubNoteReplies(note.id).then((result) => { if (live) show(result); });
        return () => { live = false; };
    }, [opened, replies, failed, note.id, show]);

    if (note.expired) return null;

    const send = () => {
        const parsed = hubNoteReplySchema.safeParse({ content: text });
        if (isPending || !parsed.success) return;
        startTransition(async () => {
            const result = await replyToHubNote(note.id, parsed.data);
            if (!result.success) {
                toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                return;
            }
            setText('');
            await load();
        });
    };

    return (
        <div className="mt-3 grid gap-3">
            {failed && <p className="text-meta text-danger">{t('repliesLoadFailed')}</p>}
            {replies && replies.length > 0 && (
                <ul aria-label={t('replies', { n: replies.length })} className="grid gap-3">
                    {replies.map((r) => <NoteReply key={r.id} reply={r} onChanged={load} />)}
                </ul>
            )}
            {signedIn ? (
                <div className="grid gap-2">
                    <Textarea id={`${id}-reply`} rows={2} value={text} maxLength={HUB_NOTE_REPLY_MAX} placeholder={t('replyPlaceholder')} aria-label={t('replyPlaceholder')} onChange={(e) => setText(e.target.value)} />
                    <Button size="sm" className="justify-self-start" disabled={isPending || text.trim().length === 0} onClick={send}>{t('reply')}</Button>
                </div>
            ) : (
                <Button size="sm" variant="quiet" className="justify-self-start" onClick={() => setGate(true)}>{t('signInToReply')}</Button>
            )}
            {gate && <AuthGateModal isOpen onClose={() => setGate(false)} returnTo={`/${locale}${note.topic.href}?z=${note.id}`} />}
        </div>
    );
}
