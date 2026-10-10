'use client';

import { useState, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { updateFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_STATUSES, FEEDBACK_TEXT_MAX, type FeedbackStatusValue } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackItem } from '@/lib/services/feedback.service';

/** One note on the admin feedback page: what was said and where, plus status and reply. */
export default function FeedbackAdminRow({ note }: { note: FeedbackItem }) {
    const t = useTranslations('feedbackMode');
    const tAdmin = useTranslations('admin.feedback');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [status, setStatus] = useState<FeedbackStatusValue>(note.status);
    const [reply, setReply] = useState(note.reply ?? '');
    const [isPending, startTransition] = useTransition();

    const dirty = status !== note.status || reply !== (note.reply ?? '');

    const handleSave = () => {
        if (isPending || !dirty) return;
        startTransition(async () => {
            const res = await updateFeedback(note.id, { status, reply });
            if (res.success) toastSuccess(tAdmin('saved'));
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <li className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{t(`kind.${note.kind}`)}</span>
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

            <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-start">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FeedbackStatusValue)}
                    aria-label={tAdmin('status')}
                    className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                >
                    {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </select>
                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    maxLength={FEEDBACK_TEXT_MAX}
                    rows={2}
                    placeholder={tAdmin('replyPlaceholder')}
                    aria-label={t('reply')}
                    className="resize-none rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                />
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || !dirty}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {tAdmin('save')}
                </button>
            </div>
        </li>
    );
}
