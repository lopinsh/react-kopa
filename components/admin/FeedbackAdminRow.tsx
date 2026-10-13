'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { updateFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_STATUSES, type FeedbackStatusValue } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import FeedbackDeleteButton from '@/components/feedback/FeedbackDeleteButton';
import FeedbackThread from '@/components/feedback/FeedbackThread';
import type { FeedbackItem } from '@/lib/services/feedback.service';
import { useDateFormatter } from '@/lib/date-format';

/** One note on the admin feedback page: what was said and where, plus status and reply. */
export default function FeedbackAdminRow({ note: initial }: { note: FeedbackItem }) {
    const t = useTranslations('feedbackMode');
    const tAdmin = useTranslations('admin.feedback');
    const tErrors = useTranslations('errors');
    const format = useDateFormatter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [note, setNote] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [deleted, setDeleted] = useState(false);

    // The status saves as soon as it is picked, so there is no Save button to take room.
    const handleStatus = (status: FeedbackStatusValue) => {
        if (isPending || status === note.status) return;
        startTransition(async () => {
            const res = await updateFeedback(note.id, { status });
            if (res.success && res.data) {
                setNote(res.data);
                toastSuccess(tAdmin('saved'));
            } else if (!res.success) toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    // The action also revalidates the page; hiding at once avoids a flash of the stale row.
    if (deleted) return null;

    return (
        <li className="rounded-2xl border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{t(`kind.${note.kind}`)}</span>
                {note.component && <span title={tAdmin('component')} className="rounded-full bg-surface-elevated px-2.5 py-1 font-mono font-semibold text-foreground-muted">{note.component}</span>}
                <Link href={note.path} locale={note.locale === 'en' ? 'en' : 'lv'} className="break-all font-mono font-semibold text-foreground-muted hover:text-primary hover:underline">
                    {note.path}
                </Link>
                <div className="ml-auto flex items-center gap-1.5">
                    <select
                        value={note.status}
                        disabled={isPending}
                        onChange={(e) => handleStatus(e.target.value as FeedbackStatusValue)}
                        aria-label={tAdmin('status')}
                        className="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-50"
                    >
                        {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                    </select>
                    <FeedbackDeleteButton
                        id={note.id}
                        iconOnly
                        onDeleted={() => { setDeleted(true); router.refresh(); }}
                        className="rounded-lg border border-danger/40 p-1.5 text-danger hover:bg-danger/10 disabled:opacity-50"
                    />
                </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{note.text}</p>
            {note.elementText && <p className="mt-2 truncate text-xs text-foreground-muted">{tAdmin('element')}: {note.elementText}</p>}
            <p className="mt-0.5 text-xs text-foreground-muted">
                {note.authorName ? `${note.authorName} · ` : ''}
                {format.dateTime(note.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                {` · ${note.locale.toUpperCase()} · ${note.viewportW}×${note.viewportH} · ${note.theme}`}
            </p>

            <FeedbackThread note={note} onChanged={setNote} />
        </li>
    );
}
