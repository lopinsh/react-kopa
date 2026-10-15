'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import SearchInput from '@/components/search/SearchInput';
import SearchPanel from '@/components/search/SearchPanel';
import { focusFirstItem } from '@/components/search/search-items';
import { useBackClose } from '@/hooks/useBackClose';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayLayer } from '@/hooks/useOverlayLayer';
import { useSearch } from '@/hooks/useSearch';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import { saveRecent } from '@/lib/recent-searches';
import { SEARCH_MIN_CHARS } from '@/lib/constants';

/**
 * The desktop header's search (AR-12, AR-41): a plain field that opens the search on a click, a tap, keyboard focus, ↓ and the first
 * letter typed. The panel hangs under the header over the dimmed page; Esc, a click outside, the scrim and Back close it and the word
 * stays. Enter is "Rādīt visus rezultātus". Below `md` the phone search takes over (PhoneSearchButton).
 */
export default function HeaderSearchField({ className }: { className?: string }) {
    const t = useTranslations('discovery.search');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const panelId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const skipOpen = useRef(false);
    // Switching back to the window focuses the field again without the person doing it: that must not open the search.
    const windowBlur = useRef(false);
    const [open, setOpen] = useState(false);

    // The word and places of discovery's own list; any other page starts empty, on Visur.
    const page = parseDiscoveryParams(searchParams);
    const onDiscovery = pathname === '/';
    const initialWord = onDiscovery ? page.q : '';
    const initialCities = onDiscovery ? page.cities : [];
    const search = useSearch({ active: open, initialWord, initialCities, kind: onDiscovery ? page.kind : 'groups' });

    // A new address (a result opened, "Rādīt visus rezultātus", a link elsewhere) closes the search and starts from the new page's word.
    const url = `${pathname}?${searchParams}`;
    const [seen, setSeen] = useState(url);
    if (seen !== url) {
        setSeen(url);
        setOpen(false);
        search.reset(initialWord, initialCities);
    }

    const close = useCallback(() => setOpen(false), []);
    const requestClose = useBackClose(open, close);
    const isTop = useOverlayLayer(open);
    const wrapRef = useFocusTrap<HTMLDivElement>(open);
    useClickOutside(wrapRef, requestClose, open);

    // Esc closes and keeps the word, with focus in the field (which must not open it again).
    const closeKeepingFocus = useCallback(() => {
        skipOpen.current = true;
        inputRef.current?.focus();
        skipOpen.current = false;
        requestClose();
    }, [requestClose]);
    useEffect(() => {
        if (!open) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            // A place list closes first: it handles Esc itself and marks the event.
            if (e.key !== 'Escape' || e.defaultPrevented || !isTop()) return;
            // A search field also clears itself on Esc; the word must stay.
            e.preventDefault();
            closeKeepingFocus();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, isTop, closeKeepingFocus]);

    const openIt = () => { if (!skipOpen.current) setOpen(true); };
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault();
        if (open) focusFirstItem(panelId);
        else setOpen(true);
    };
    const onEnter = () => {
        if (search.word.trim().length < SEARCH_MIN_CHARS && !search.theme) return;
        saveRecent(search.word);
        if (search.here) requestClose();
        else router.replace(search.showAllHref, { scroll: false });
    };

    return (
        <div ref={wrapRef} className={className ?? 'flex'}>
            <SearchInput
                value={search.word}
                onChange={(word) => { search.setWord(word); if (word) openIt(); }}
                onEnter={onEnter}
                inputRef={inputRef}
                open={open}
                controls={open ? panelId : undefined}
                onKeyDown={onKeyDown}
                onFocus={() => { if (windowBlur.current) windowBlur.current = false; else openIt(); }}
                onBlur={(e) => { windowBlur.current = document.activeElement === e.currentTarget; }}
                onMouseDown={openIt}
                className="w-full"
            />
            {open && (
                <>
                    <div aria-hidden="true" onClick={closeKeepingFocus} className="fixed inset-x-0 bottom-0 top-header bg-scrim motion-safe:animate-fade" />
                    <div
                        id={panelId}
                        role="dialog"
                        aria-label={t('label')}
                        className="fixed inset-x-0 top-header mx-auto mt-2.5 flex max-h-[calc(100dvh-var(--spacing-header)-1.5rem)] w-[min(42rem,calc(100vw-2rem))] flex-col rounded-2xl border border-border bg-surface px-3.5 pb-3 shadow-premium"
                    >
                        <SearchPanel search={search} mode="desktop" inputRef={inputRef} requestClose={requestClose} />
                    </div>
                </>
            )}
        </div>
    );
}
