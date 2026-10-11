'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, MessageCircle, Send } from 'lucide-react';
import { replyToFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_TEXT_MAX } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackItem } from '@/lib/services/feedback.service';
import { useDateFormatter } from '@/lib/date-format';

/** The replies under a note (oldest first) and an input to add another. The original text lives outside, untouched. */
export default function FeedbackThread({ note, onChanged, collapsible = false }: { note: FeedbackItem; onChanged: (note: FeedbackItem) => void; collapsible?: boolean }) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const format = useDateFormatter();
    const { error: toastError } = useToast();
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(!collapsible);

    const handleSend = () => {
        if (isPending || !text.trim()) return;
        startTransition(async () => {
            const res = await replyToFeedback(note.id, { text });
            if (res.success && res.data) {
                setText('');
                onChanged(res.data);
            } else if (!res.success) {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    if (!open) {
        return (
            <button
                type="button"
                data-ui="feedback-thread"
                onClick={() => setOpen(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-primary"
            >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                {note.replies.length > 0 ? t('threadShow', { count: note.replies.length }) : t('reply')}
            </button>
        );
    }

    return (
        <div data-ui="feedback-thread" className="mt-2 space-y-2">
            {note.replies.length > 0 && (
                <ol className="space-y-2">
                    {note.replies.map((r) => (
                        <li key={r.id} className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                            <p className="flex items-center gap-1 text-xs font-bold text-primary">
                                {r.byAgent && <Bot className="h-3.5 w-3.5" aria-hidden />}
                                {r.byAgent ? t('threadAgent') : r.authorName ?? t('threadEarlier')}
                                <span className="font-medium text-foreground-muted">
                                    · {format.dateTime(r.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{r.text}</p>
                        </li>
                    ))}
                </ol>
            )}
            <div className="flex items-end gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={FEEDBACK_TEXT_MAX}
                    rows={2}
                    placeholder={t('threadPlaceholder')}
                    aria-label={t('reply')}
                    className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isPending || !text.trim()}
                    aria-label={t('threadSend')}
                    title={t('threadSend')}
                    className="rounded-xl bg-primary p-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
