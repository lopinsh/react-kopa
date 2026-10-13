'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { LOCALES } from '@/lib/constants';
import { NAV_FROM_STORAGE, NAV_TAB_COOKIE, groupBasePath, isBottomTab, tabForPath, type BottomTab } from '@/lib/navigation';

const MAX_REMEMBERED = 50;
const stripLocale = (path: string) => path.replace(new RegExp(`^/(${LOCALES.join('|')})(?=/|$)`), '') || '/';

function readMap(): Record<string, BottomTab> {
    try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(NAV_FROM_STORAGE) ?? '{}');
        if (typeof parsed !== 'object' || parsed === null) return {};
        return Object.fromEntries(Object.entries(parsed).filter((e): e is [string, BottomTab] => isBottomTab(e[1])));
    } catch {
        return {};
    }
}

function rememberGroup(base: string, tab: BottomTab) {
    try {
        const map = readMap();
        delete map[base];
        map[base] = tab;
        const keys = Object.keys(map);
        for (const old of keys.slice(0, Math.max(0, keys.length - MAX_REMEMBERED))) delete map[old];
        sessionStorage.setItem(NAV_FROM_STORAGE, JSON.stringify(map));
    } catch {
        // Storage can be blocked; the cookie still carries the tab.
    }
}

function navigationType(): string | undefined {
    const entry = performance.getEntriesByType('navigation')[0];
    return entry instanceof PerformanceNavigationTiming ? entry.type : undefined;
}

/**
 * The tab the bottom bar marks (AR-19, AR-20): a page with its own tab marks it, a group page marks the tab you came from,
 * other pages mark none. `initialTab` is the cookie value the server rendered, so the first client render matches the HTML.
 * Back and forward restore the tab remembered for that group; no history state is written.
 */
export function useBottomTab(initialTab: BottomTab): BottomTab | null {
    const pathname = usePathname();
    const [keep, setKeep] = useState<BottomTab>(initialTab);
    const keepRef = useRef<BottomTab>(initialTab);
    const stepTo = useRef<string | null>(null);
    const first = useRef(true);

    useEffect(() => {
        const onPop = () => {
            stepTo.current = stripLocale(window.location.pathname);
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    useEffect(() => {
        const own = tabForPath(pathname);
        const type = first.current ? navigationType() : undefined;
        const isStep = stepTo.current === pathname || type === 'reload' || type === 'back_forward';
        const apply = (tab: BottomTab) => {
            keepRef.current = tab;
            setKeep(tab);
        };
        if (own && own !== 'keep') {
            apply(own);
        } else if (own === 'keep') {
            const base = groupBasePath(pathname);
            const saved = base ? readMap()[base] : undefined;
            if (isStep && saved) apply(saved);
            if (base) rememberGroup(base, keepRef.current);
        }
        document.cookie = `${NAV_TAB_COOKIE}=${keepRef.current}; path=/; SameSite=Lax`;
        stepTo.current = null;
        first.current = false;
    }, [pathname]);

    const own = tabForPath(pathname);
    return own === 'keep' ? keep : own;
}
