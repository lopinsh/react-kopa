'use client';

import { useState, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Bot, Send } from 'lucide-react';
import { replyToFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_TEXT_MAX } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackItem } from '@/lib/services/feedback.service';

/** The replies under a note (oldest first) and an input to add another. The original text lives outside, untouched. */
export default function FeedbackThread({ note, onChanged }: { note: FeedbackItem; onChanged: (note: FeedbackItem) => void }) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const format = useFormatter();
    const { error: toastError } = useToast();
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();

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

    return (
        <div data-ui="feedback-thread" className="mt-3 space-y-2">
            {note.replies.length > 0 && (
                <ol className="space-y-2">
                    {note.replies.map((r) => (
                        <li key={r.id} className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                            <p className="flex items-center gap-1 text-xs font-bold text-primary">
                                {r.byAgent && <Bot className="h-3.5 w-3.5" aria-hidden />}
                                {r.byAgent ? t('threadAgent') : r.authorName ?? t('threadAdmin')}
                                <span className="font-medium text-foreground-muted">
                                    · {format.dateTime(r.createdAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Riga' })}
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
