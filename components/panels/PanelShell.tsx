'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Overlay from '@/components/ui/Overlay';
import { PANEL_TITLE_ID, UI } from '@/lib/constants';

const PanelContext = createContext(false);
/** True inside a panel: shared parts (the join step) know they sit over discovery. */
export const usePanel = (): boolean => useContext(PanelContext);

/**
 * The shell of the opened card and the event panel (AR-44, AR-55, AR-67): a panel from the right over the dimmed list from 768 px, a sheet below.
 * Its history entry is its own address, so ×, Esc and a click on the dim area call `router.back()` (as the browser's Back does).
 * It stays mounted from loading to content and from one panel to the next (the next meeting, the organising group).
 */
export default function PanelShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const root = useRef<HTMLDivElement>(null);
    const first = useRef(true);

    // The content changed inside the same shell (loading to content, one panel to the next): focus goes to the new title.
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const el = root.current;
        if (!el) return;
        const focusTitle = () => {
            const title = document.getElementById(PANEL_TITLE_ID);
            if (title && title !== document.activeElement) title.focus({ preventScroll: true });
        };
        focusTitle();
        const observer = new MutationObserver(() => {
            const active = document.activeElement;
            if (!active || active === document.body || !active.isConnected) focusTitle();
        });
        observer.observe(el, { childList: true, subtree: true });
        const stop = window.setTimeout(() => observer.disconnect(), 1500);
        return () => { observer.disconnect(); window.clearTimeout(stop); };
    }, [pathname]);

    return (
        <Overlay layout="panel" backClose={false} onClose={() => router.back()} labelledBy={PANEL_TITLE_ID} dataUi={UI.panel} flush>
            <PanelContext.Provider value={true}>
                <div ref={root} className="contents">{children}</div>
            </PanelContext.Provider>
        </Overlay>
    );
}
