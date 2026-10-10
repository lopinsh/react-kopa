'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { List, MessageSquareText, Pause, Play } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';
import { getPageFeedback, setFeedbackMode } from '@/actions/feedback-actions';
import { buildSelector, visibleText } from '@/lib/feedback/capture';
import type { FeedbackItem } from '@/lib/services/feedback.service';
import FeedbackDialog, { type FeedbackTarget } from './FeedbackDialog';
import FeedbackNoteCard from './FeedbackNoteCard';
import FeedbackNotesPanel from './FeedbackNotesPanel';
import FeedbackPins from './FeedbackPins';
import FeedbackModeToggle from './FeedbackModeToggle';
import { useElementPicker } from './useElementPicker';

/**
 * Everything feedback mode adds to a page. Mounted by the locale layout only when the server has
 * verified a site admin with the mode switched on, so other visitors never load any of this.
 */
export default function FeedbackMode() {
    const t = useTranslations('feedbackMode');
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();
    const [notes, setNotes] = useState<FeedbackItem[]>([]);
    const [missing, setMissing] = useState<string[]>([]);
    const [draft, setDraft] = useState<FeedbackTarget | null>(null);
    const [draftPath, setDraftPath] = useState('');
    const [openNote, setOpenNote] = useState<FeedbackItem | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getPageFeedback(pathname).then((res) => {
            if (!cancelled) setNotes(res.success ? res.data ?? [] : []);
        });
        return () => { cancelled = true; };
    }, [pathname]);

    const busy = !!draft || !!openNote;

    const handlePick = useCallback((el: Element) => {
        setPanelOpen(false);
        // The schema caps the path at 500 characters; a very long query would otherwise fail to save.
        setDraftPath(`${pathname}${window.location.search}`.slice(0, 500));
        setDraft({ selector: buildSelector(el), elementText: visibleText(el) });
    }, [pathname]);

    const hover = useElementPicker(!paused && !busy, handlePick);

    // Escape closes what is open first; with nothing open it leaves the mode. While paused the page is
    // used normally, so Escape belongs to the page (closing its menus and pop-ups), not to feedback mode.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || busy) return;
            if (panelOpen) { setPanelOpen(false); return; }
            if (paused) return;
            startTransition(async () => {
                const res = await setFeedbackMode(false);
                if (res.success) router.refresh();
            });
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [busy, panelOpen, paused, router]);

    const handleSaved = (note: FeedbackItem) => {
        setNotes((prev) => [...prev, note]);
        setDraft(null);
    };

    const handleOpen = (note: FeedbackItem) => {
        setPanelOpen(false);
        setOpenNote(note);
    };

    return (
        <div data-feedback-ignore>
            {hover && !busy && (
                <div
                    aria-hidden
                    // Follows the hovered element's bounding box.
                    style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }}
                    className="pointer-events-none fixed z-[54] rounded-sm outline outline-2 -outline-offset-2 outline-primary bg-primary/10"
                />
            )}

            <FeedbackPins notes={notes} onOpen={handleOpen} onMissing={setMissing} />

            <div className="fixed bottom-32 left-3 z-[60] flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-xs font-semibold text-foreground shadow-premium md:bottom-16 md:left-auto md:right-4">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <span className="mr-1">{paused ? t('barPaused') : t('barLabel')}</span>
                <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('resume') : t('pause')} title={paused ? t('resume') : t('pause')} className="rounded-full p-1.5 text-foreground-muted hover:bg-surface-elevated">
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-label={t('notesList', { count: notes.length })} title={t('notesList', { count: notes.length })} className="flex items-center gap-1 rounded-full p-1.5 text-foreground-muted hover:bg-surface-elevated">
                    <List className="h-4 w-4" />
                    <span>{notes.length}</span>
                </button>
                <FeedbackModeToggle compact className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-surface-elevated" />
            </div>

            {panelOpen && <FeedbackNotesPanel notes={notes} missing={missing} onOpen={handleOpen} />}
            {draft && <FeedbackDialog target={draft} path={draftPath} onSaved={handleSaved} onClose={() => setDraft(null)} />}
            {openNote && <FeedbackNoteCard note={openNote} onClose={() => setOpenNote(null)} />}
        </div>
    );
}
