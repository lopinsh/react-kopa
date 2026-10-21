'use client';

import { useId, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, MessageCircle, Send } from 'lucide-react';
import { replyToFeedback } from '@/actions/feedback-actions';
import { FEEDBACK_TEXT_MAX } from '@/lib/constants';
import TextCounter from '@/components/ui/TextCounter';
import { isOverLimit } from '@/lib/text-limit';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackItem } from '@/lib/services/feedback.service';
import { useDateFormatter } from '@/lib/date-format';

/** The replies under a note (oldest first) and an input to add another. The original text lives outside, untouched. */
export default function FeedbackThread({ note, onChanged }: { note: FeedbackItem; onChanged: (note: FeedbackItem) => void }) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const format = useDateFormatter();
    const { error: toastError } = useToast();
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const counterId = useId();
    const over = isOverLimit(text, FEEDBACK_TEXT_MAX);

    const handleSend = () => {
        if (isPending || !text.trim() || over) return;
        startTransition(async () => {
            const res = await replyToFeedback(note.id, { text });
            if (res.success && res.data) {
                setText('');
                setOpen(false);
                onChanged(res.data);
            } else if (!res.success) {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <div data-ui="feedback-thread" className="mt-2 space-y-2">
            {note.replies.length > 0 && (
                <ol className="space-y-2">
                    {note.replies.map((r) => (
                        <li key={r.id} className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                            <p className="flex items-center gap-1 text-tag text-primary">
                                {r.byAgent && <Bot className="h-3.5 w-3.5" aria-hidden />}
                                {r.byAgent ? t('threadAgent') : r.authorName ?? t('threadEarlier')}
                                <span className="weight-medium text-foreground-muted">
                                    · {format.dateTime(r.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-body-sm text-foreground">{r.text}</p>
                        </li>
                    ))}
                </ol>
            )}
            {!open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1.5 text-tag text-foreground-muted hover:text-primary"
                >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    {t('reply')}
                </button>
            ) : (
                <div>
                <div className="flex items-end gap-2">
                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape' && !text.trim()) { e.stopPropagation(); setOpen(false); } }}
                        aria-describedby={counterId}
                        rows={2}
                        placeholder={t('threadPlaceholder')}
                        aria-label={t('reply')}
                        className="min-w-0 flex-1 resize-none rounded-xl line bg-surface-elevated px-3 py-2 text-body-sm text-foreground"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isPending || !text.trim() || over}
                        aria-label={t('threadSend')}
                        title={t('threadSend')}
                        className="rounded-pill bg-primary p-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-1 flex items-start gap-2"><TextCounter id={counterId} length={text.length} max={FEEDBACK_TEXT_MAX} /></div>
                </div>
            )}
        </div>
    );
}
