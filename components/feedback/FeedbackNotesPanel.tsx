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

/** Every note for this page as a list (the admin panel's Atsauksmes tab): the way to a note whose element is gone. */
export default function FeedbackNotesPanel({ notes, missing, onOpen }: Props) {
    const t = useTranslations('feedbackMode');

    return (
        <>
            {notes.length === 0 ? (
                <p className="px-2 py-1 text-body-sm text-foreground-muted">{t('noNotes')}</p>
            ) : (
                <ul className="space-y-1">
                    {notes.map((note, i) => (
                        <li key={note.id}>
                            <button type="button" onClick={() => onOpen(note)} className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface-elevated">
                                <span className={clsx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-tag text-primary-foreground', missing.includes(note.id) ? 'bg-foreground-muted' : 'bg-primary')}>{i + 1}</span>
                                <span className="min-w-0">
                                    <span className="block truncate text-body-sm text-foreground">{note.text}</span>
                                    <span className="block text-meta text-foreground-muted">
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
        </>
    );
}
