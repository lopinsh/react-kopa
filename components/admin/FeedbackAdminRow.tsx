'use client';

import { useState, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { updateFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_STATUSES, type FeedbackStatusValue } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import FeedbackDeleteButton from '@/components/feedback/FeedbackDeleteButton';
import FeedbackThread from '@/components/feedback/FeedbackThread';
import type { FeedbackItem } from '@/lib/services/feedback.service';

/** One note on the admin feedback page: what was said and where, plus status and reply. */
export default function FeedbackAdminRow({ note: initial }: { note: FeedbackItem }) {
    const t = useTranslations('feedbackMode');
    const tAdmin = useTranslations('admin.feedback');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [note, setNote] = useState(initial);
    const [status, setStatus] = useState<FeedbackStatusValue>(initial.status);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [deleted, setDeleted] = useState(false);

    const dirty = status !== note.status;

    const handleSave = () => {
        if (isPending || !dirty) return;
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
        <li className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{t(`kind.${note.kind}`)}</span>
                {note.component && <span title={tAdmin('component')} className="rounded-full bg-surface-elevated px-2.5 py-1 font-mono font-semibold text-foreground-muted">{note.component}</span>}
                <Link href={note.path} locale={note.locale === 'en' ? 'en' : 'lv'} className="break-all font-mono font-semibold text-foreground-muted hover:text-primary hover:underline">
                    {note.path}
                </Link>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-foreground">{note.text}</p>
            {note.elementText && <p className="mt-2 truncate text-xs text-foreground-muted">{tAdmin('element')}: {note.elementText}</p>}
            <p className="mt-1 text-xs text-foreground-muted">
                {note.authorName ? `${note.authorName} · ` : ''}
                {format.dateTime(note.createdAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Riga' })}
                {` · ${note.locale.toUpperCase()} · ${note.viewportW}×${note.viewportH} · ${note.theme}`}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_auto] sm:items-start">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FeedbackStatusValue)}
                    aria-label={tAdmin('status')}
                    className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                >
                    {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </select>
                <div className="flex gap-2 sm:flex-col">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending || !dirty}
                        className="flex-1 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {tAdmin('save')}
                    </button>
                    <FeedbackDeleteButton
                        id={note.id}
                        onDeleted={() => { setDeleted(true); router.refresh(); }}
                        className="flex items-center justify-center gap-1 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                    />
                </div>
            </div>
            <FeedbackThread note={note} onChanged={setNote} />
        </li>
    );
}
