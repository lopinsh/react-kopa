'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { HUB_NOTE_REPLY_MAX } from '@/lib/constants';
import { relativeTo } from '@/lib/utils/relative-time';
import { hubNoteReplySchema } from '@/lib/validations/hub-note';
import { deleteHubNoteReply, editHubNoteReply } from '@/actions/hub-note-actions';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { Textarea } from '@/components/ui/Input';
import type { HubNoteReplyRow } from '@/lib/services/hub-note.service';

const ReportModal = dynamic(() => import('@/components/modals/ReportModal'), { ssr: false });

/**
 * One reply in the open Ziņa (K2-21, drawing l.320): name · text, its age; the author edits and deletes it, a site admin deletes, others report.
 * Signed out `reply.author` is null and only the text shows (K-41). The Ziņa's author gets no buttons on others' replies (K-119).
 */
export default function NoteReply({ reply, onChanged }: { reply: HubNoteReplyRow; onChanged: () => void }) {
    const t = useTranslations('hub.notes');
    const tCommon = useTranslations('common');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const { error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(reply.content);
    const [confirm, setConfirm] = useState(false);
    const [reporting, setReporting] = useState(false);

    const run = (act: () => ReturnType<typeof deleteHubNoteReply>, after?: () => void) => {
        if (isPending) return;
        startTransition(async () => {
            const result = await act();
            after?.();
            if (result.success) onChanged();
            else toastError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };
    const save = () => {
        const parsed = hubNoteReplySchema.safeParse({ content: text });
        if (parsed.success) run(() => editHubNoteReply(reply.id, parsed.data), () => setEditing(false));
    };

    return (
        <li className="grid gap-1 border-0 border-l-2 border-solid border-border pl-3">
            {editing ? (
                <div className="grid gap-2">
                    <Textarea rows={3} value={text} maxLength={HUB_NOTE_REPLY_MAX} aria-label={t('replyPlaceholder')} onChange={(e) => setText(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={isPending || text.trim().length === 0} onClick={save}>{t('form.save')}</Button>
                        <Button size="sm" variant="quiet" disabled={isPending} onClick={() => { setEditing(false); setText(reply.content); }}>{tCommon('cancel')}</Button>
                    </div>
                </div>
            ) : (
                <p className="whitespace-pre-line break-words text-body-sm text-foreground">
                    {reply.author?.name && <span className="text-foreground-muted">{reply.author.name} · </span>}
                    {reply.content}
                </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-foreground-muted">
                <span>{relativeTo(format, new Date(reply.createdAt), now)}</span>
                {!editing && reply.mine && <button type="button" disabled={isPending} onClick={() => setEditing(true)} className="underline underline-offset-2 hover:text-foreground">{t('edit')}</button>}
                {!editing && reply.canDelete && (
                    <ConfirmPopover
                        isOpen={confirm}
                        onOpenChange={setConfirm}
                        message={t('replyDeleteConfirm')}
                        confirmLabel={t('delete')}
                        destructive
                        isPending={isPending}
                        onConfirm={() => run(() => deleteHubNoteReply(reply.id), () => setConfirm(false))}
                        renderTrigger={(trigger) => <button {...trigger} type="button" className="underline underline-offset-2 hover:text-foreground">{t('delete')}</button>}
                    />
                )}
                {reply.canReport && <button type="button" onClick={() => setReporting(true)} className="underline underline-offset-2 hover:text-foreground">{t('report')}</button>}
            </div>
            {reporting && <ReportModal onClose={() => setReporting(false)} target={{ noteReplyId: reply.id }} />}
        </li>
    );
}
