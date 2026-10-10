'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { FeedbackItem } from '@/lib/services/feedback.service';

type Props = {
    notes: FeedbackItem[];
    /** Notes whose element is no longer on the page. */
    missing: string[];
    onOpen: (note: FeedbackItem) => void;
};

/** Every note for this page as a list: the fallback for notes whose element is gone. */
export default function FeedbackNotesPanel({ notes, missing, onOpen }: Props) {
    const t = useTranslations('feedbackMode');

    return (
        <div data-feedback-ignore className="fixed inset-x-3 bottom-44 z-[65] max-h-[50vh] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-2xl md:inset-x-auto md:bottom-28 md:right-4 md:w-80">
            {notes.length === 0 ? (
                <p className="px-2 py-1 text-sm text-foreground-muted">{t('noNotes')}</p>
            ) : (
                <ul className="space-y-1">
                    {notes.map((note, i) => (
                        <li key={note.id}>
                            <button type="button" onClick={() => onOpen(note)} className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-elevated">
                                <span className={clsx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white', missing.includes(note.id) ? 'bg-foreground-muted' : 'bg-primary')}>{i + 1}</span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-foreground">{note.text}</span>
                                    <span className="block text-xs text-foreground-muted">
                                        {t(`kind.${note.kind}`)} · {t(`status.${note.status}`)}
                                        {note.component && ` · ${note.component}`}
                                        {missing.includes(note.id) && ` · ${t('elementGone')}`}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
