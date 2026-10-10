'use client';

import { useEffect } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { FeedbackItem } from '@/lib/services/feedback.service';

type Props = {
    note: FeedbackItem;
    onClose: () => void;
};

/** One saved note with its status and the agent's reply. Opened from a pin or from the notes list. */
export default function FeedbackNoteCard({ note, onClose }: Props) {
    const t = useTranslations('feedbackMode');
    const format = useFormatter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            onClose();
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [onClose]);

    return (
        <div
            data-feedback-ignore
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div role="dialog" aria-modal="true" aria-label={t('noteTitle')} className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-2xl">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{t(`kind.${note.kind}`)}</span>
                        <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-foreground-muted">{t(`status.${note.status}`)}</span>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-elevated">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-foreground">{note.text}</p>
                {note.component && (
                    <p className="mt-3 font-mono text-xs font-semibold text-foreground-muted">{t('componentLabel')}: {note.component}</p>
                )}
                {note.elementText && (
                    <p className="mt-3 truncate rounded-xl bg-surface-elevated px-3 py-2 text-xs text-foreground-muted">{note.elementText}</p>
                )}
                {note.reply && (
                    <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                        <p className="text-xs font-bold text-primary">{t('reply')}</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{note.reply}</p>
                    </div>
                )}
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-foreground-muted">
                    <span>{format.dateTime(note.createdAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Riga' })}</span>
                    <Link href="/admin/feedback" className="font-semibold text-primary hover:underline">{t('openList')}</Link>
                </div>
            </div>
        </div>
    );
}
