'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useRouter } from '@/i18n/routing';
import { setAdminPanel } from '@/actions/admin-panel-actions';
import { useToast } from '@/hooks/use-toast';
import { type AdminPanelTab } from '@/lib/constants';
import type { ThemeInput } from '@/lib/validations/theme';
import PanelTopBar from './PanelTopBar';
import PanelTabs from './PanelTabs';
import PanelDraftNote from './PanelDraftNote';
import PanelTabBody from './PanelTabBody';
import { usePanelPlace } from './usePanelPlace';
import { useIsPhone, usePanelSheet } from './usePanelSheet';
import { usePanelEscape } from './usePanelEscape';
import { writeLastTab } from './panel-storage';

/*
 * Layers (z): bottom nav 40, Overlay (slide-overs, dialogs) 50, header and menus 50, element picker 54, pins 55,
 * THIS PANEL 58, search overlay and DiscardGuard 60, feedback dialog / note card / translation editor 70, toasts 100.
 * It sits above slide-overs (an admin annotates inside them) and below the dialogs it opens.
 */

const TABS: readonly AdminPanelTab[] = ['feedback', 'translate', 'design'];

type Props = { tab: AdminPanelTab; draftActive: boolean; designTheme: ThemeInput | null };

/** The admin tool panel: floats and docks from 768 px, a bottom sheet on phones. A tool, not a pop-up: no scrim, no focus trap. */
export default function AdminPanel({ tab: serverTab, draftActive, designTheme }: Props) {
    const t = useTranslations('admin.panel');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { error: toastError } = useToast();
    const rootRef = useRef<HTMLElement>(null);
    const phone = useIsPhone();
    const { place, dragging, edgeHint, setDocked, barProps } = usePanelPlace();
    const sheet = usePanelSheet();
    const [tab, setTab] = useState(serverTab);
    const [paused, setPaused] = useState(false);
    const [selection, setSelection] = useState<string | null>(null);
    const [prevServerTab, setPrevServerTab] = useState(serverTab);
    if (prevServerTab !== serverTab) {
        setPrevServerTab(serverTab);
        setTab(serverTab);
    }

    const showError = useCallback((code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED')), [tErrors, toastError]);

    // Submission guard: a second tab click or close while the cookie is being set is ignored.
    const pending = useRef(false);
    const choose = useCallback(async (next: AdminPanelTab | null) => {
        if (pending.current) return;
        pending.current = true;
        try {
            const res = await setAdminPanel(next);
            if (res.success) router.refresh();
            else showError(res.error);
        } finally {
            pending.current = false;
        }
    }, [router, showError]);

    const selectTab = (next: AdminPanelTab) => {
        if (next === tab || pending.current) return;
        setTab(next);
        setSelection(null);
        writeLastTab(next);
        void choose(next);
    };

    // Dizains pick on a phone: the sheet drops to half and the text scrolls to 20 % from the top of the page.
    const onPicked = (el: Element) => {
        if (!phone) return;
        if (sheet.size === 'full') sheet.commit('half');
        const main = document.getElementById('main-content');
        if (!main) return;
        const top = main.scrollTop + el.getBoundingClientRect().top - main.getBoundingClientRect().top - main.clientHeight * 0.2;
        main.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };

    const handleEscape = usePanelEscape({ rootRef, hasSelection: selection !== null, clearSelection: () => setSelection(null), close: () => void choose(null) });

    // Focus: the selected tab on open, back to the shield on close.
    useEffect(() => {
        writeLastTab(serverTab);
        rootRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
        return () => {
            (document.querySelector<HTMLElement>('[data-admin-shield]') ?? document.getElementById('content'))?.focus();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount; later tab changes keep focus where it is
    }, []);

    // The page makes room: at >= 1280 a docked drawer pushes it aside, a phone sheet adds bottom room (globals.css).
    const docked = place.docked && !phone;
    useEffect(() => {
        const html = document.documentElement;
        if (docked) html.dataset.adminDock = '';
        return () => { delete html.dataset.adminDock; };
    }, [docked]);
    useEffect(() => {
        if (!phone) return;
        const html = document.documentElement;
        html.dataset.adminSheet = '';
        html.style.setProperty('--admin-sheet-h', `${sheet.height}px`);
        return () => {
            delete html.dataset.adminSheet;
            html.style.removeProperty('--admin-sheet-h');
        };
    }, [phone, sheet.height]);

    const style = (phone
        ? { '--panel-h': `${sheet.height}px` }
        : { '--panel-x': `${place.x}px`, '--panel-y': `${place.y}px` }) as unknown as CSSProperties;

    return (
        <>
            {edgeHint && !phone && <div aria-hidden data-admin-panel className="pointer-events-none fixed inset-y-0 right-0 z-[57] w-10 bg-primary/20" />}
            <section
                ref={rootRef}
                role="region"
                aria-label={t('label')}
                data-admin-panel
                data-feedback-ignore
                data-translate-ignore
                data-dragging={dragging || sheet.dragging ? '' : undefined}
                onKeyDown={handleEscape}
                style={style}
                className={clsx(
                    'fixed z-[58] flex flex-col bg-surface shadow-premium',
                    phone && 'inset-x-0 bottom-[calc(4rem+var(--cookie-banner-h,0px))] h-[var(--panel-h)] max-h-[calc(100dvh-4rem-var(--cookie-banner-h,0px))] rounded-t-2xl frame motion-safe:transition-[height] motion-safe:duration-slow motion-safe:ease-standard data-[dragging]:transition-none', // ui-allow: sheet stays on screen above the cookie banner
                    !phone && docked && 'inset-y-0 right-0 w-88 max-w-[calc(100vw-1rem)] shadow-[inset_1px_0_0_var(--border)]', // ui-allow: panel cap
                    !phone && !docked && 'left-[var(--panel-x)] top-[var(--panel-y)] max-h-[calc(100dvh-6rem)] w-88 max-w-[calc(100vw-1rem)] rounded-2xl frame', // ui-allow: panel cap
                )}
            >
                <PanelTopBar
                    phone={phone}
                    docked={docked}
                    showPause={tab !== 'translate'}
                    paused={paused}
                    onPause={() => setPaused((p) => !p)}
                    onDockToggle={() => setDocked(!place.docked)}
                    onClose={() => void choose(null)}
                    dragProps={barProps}
                    handleProps={sheet.handleProps}
                />
                <PanelTabs tabs={TABS} value={tab} onChange={selectTab} />
                <p className="px-4 pt-2 text-meta text-foreground-muted">{t(`hint.${tab}`)}</p>
                <div role="tabpanel" id={`admin-panel-body-${tab}`} aria-labelledby={`admin-panel-tab-${tab}`} className="flex min-h-0 flex-1 flex-col">
                    <PanelTabBody tab={tab} paused={paused} selection={selection} onSelect={setSelection} onPicked={onPicked} designTheme={designTheme} draftActive={draftActive} />
                </div>
                {draftActive && tab !== 'design' && <PanelDraftNote />}
            </section>
        </>
    );
}
