'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from '@/i18n/routing';
import { getPageFeedback } from '@/actions/feedback-actions';
import { buildSelector, componentOf, locate, visibleText } from '@/lib/feedback/capture';
import type { FeedbackItem } from '@/lib/services/feedback.service';
import FeedbackDialog, { type FeedbackTarget } from './FeedbackDialog';
import FeedbackNoteCard from './FeedbackNoteCard';
import FeedbackPins from './FeedbackPins';
import FeedbackNamedElements from './FeedbackNamedElements';
import { useElementPicker } from './useElementPicker';

export interface FeedbackListContext {
    notes: FeedbackItem[];
    /** Ids of notes whose element is no longer on the page. */
    missing: string[];
    onOpen: (note: FeedbackItem) => void;
}

type Props = {
    /** Pause: the page works normally, no picking. */
    paused: boolean;
    /** Pick any element, also ones without a name. */
    anywhere: boolean;
    /** The panel's notes list, rendered by the Atsauksmes tab from this mode's notes. */
    children: (list: FeedbackListContext) => ReactNode;
};

/**
 * Everything the Atsauksmes tab adds to a page: pins, named elements, the picker, the note dialog and card. Mounted
 * (inside the admin panel) only when the server has verified a site admin with that tab open.
 */
export default function FeedbackMode({ paused, anywhere, children }: Props) {
    const pathname = usePathname();
    const [notes, setNotes] = useState<FeedbackItem[]>([]);
    const [missing, setMissing] = useState<string[]>([]);
    const [draft, setDraft] = useState<FeedbackTarget | null>(null);
    const [draftPath, setDraftPath] = useState('');
    const [openNote, setOpenNote] = useState<FeedbackItem | null>(null);

    useEffect(() => {
        let cancelled = false;
        getPageFeedback(pathname).then((res) => {
            if (!cancelled) setNotes(res.success ? res.data ?? [] : []);
        });
        return () => { cancelled = true; };
    }, [pathname]);

    const busy = !!draft || !!openNote;

    const handlePick = useCallback((el: Element) => {
        // The schema caps the path at 500 characters; a very long query would otherwise fail to save.
        setDraftPath(`${pathname}${window.location.search}`.slice(0, 500));
        setDraft({ selector: buildSelector(el), elementText: visibleText(el), component: componentOf(el), locator: locate(el) });
    }, [pathname]);

    const hover = useElementPicker(anywhere && !paused && !busy, handlePick);

    const handleSaved = (note: FeedbackItem) => {
        setNotes((prev) => [...prev, note]);
        setDraft(null);
    };

    const handleDeleted = (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setOpenNote(null);
    };

    const handleChanged = (note: FeedbackItem) => {
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
        setOpenNote(note);
    };

    const handleOpen = (note: FeedbackItem) => setOpenNote(note);

    return (
        <>
            <div data-feedback-ignore>
                {hover && !busy && (
                    <div
                        aria-hidden
                        // Follows the hovered element's bounding box.
                        style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }}
                        className="pointer-events-none fixed z-[54] rounded-md outline outline-2 -outline-offset-2 outline-primary bg-primary/10"
                    />
                )}

                <FeedbackNamedElements enabled={!anywhere && !paused && !busy} onPick={handlePick} />

                <FeedbackPins notes={notes} onOpen={handleOpen} onMissing={setMissing} />

                {draft && <FeedbackDialog target={draft} path={draftPath} onSaved={handleSaved} onClose={() => setDraft(null)} />}
                {openNote && <FeedbackNoteCard note={openNote} onClose={() => setOpenNote(null)} onDeleted={handleDeleted} onChanged={handleChanged} />}
            </div>
            {children({ notes, missing, onOpen: handleOpen })}
        </>
    );
}
