'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminFrame } from './AdminFrameProvider';
import AdminSections from './AdminSections';
import AdminPagesNav, { useAdminParts } from './AdminPagesNav';
import AdminDrawer from './AdminDrawer';

function PhoneBar() {
    const t = useTranslations('admin.nav');
    const { location } = useAdminFrame();
    const parts = useAdminParts(location.item);
    const partLabel = location.part ? parts.find((p) => p.id === location.part)?.label ?? null : null;
    const title = location.item ? t(location.item.id) : location.section ? t(`sections.${location.section.id}`) : t('drawerTitle');
    return <AdminDrawer title={title} part={partLabel} />;
}

/**
 * Admin frame (AF-01): two sticky rows under the header, the sections and the open section's pages (from `lg`; phones use the drawer).
 * The rows' height is measured into `--admin-bars` (AF-05) for whatever has to clear them. Pages with their own sections (`frame` on the
 * nav item) render their sidebar layout edge to edge (AF-10); `fill` pages also fill the height under the rows (AF-20).
 */
export default function AdminFrame({ children }: { children: React.ReactNode }) {
    const { location } = useAdminFrame();
    const rootRef = useRef<HTMLDivElement>(null);
    const barsRef = useRef<HTMLDivElement>(null);
    const mode = location.item?.frame;
    useEffect(() => {
        const root = rootRef.current;
        const bars = barsRef.current;
        if (!root || !bars) return;
        // `main` is content-sized inside the shell's scroller, so `h-full` can't resolve (spec risk 1): `fill` pages get the scroller's height minus its padding and the footer, measured.
        const scroller = document.getElementById('main-content');
        const footer = scroller?.querySelector(':scope > footer') ?? null;
        const write = () => {
            root.style.setProperty('--admin-bars', `${bars.offsetHeight}px`);
            if (mode === 'fill' && scroller) {
                const pad = parseFloat(getComputedStyle(scroller).paddingBottom) || 0;
                root.style.setProperty('--admin-fill', `${Math.max(0, scroller.clientHeight - pad - (footer?.getBoundingClientRect().height ?? 0))}px`);
            }
        };
        write();
        const observer = new ResizeObserver(write);
        observer.observe(bars);
        if (mode === 'fill' && scroller) observer.observe(scroller);
        if (footer) observer.observe(footer);
        return () => observer.disconnect();
    }, [mode]);
    return (
        <div ref={rootRef} className={mode === 'fill' ? 'flex h-[var(--admin-fill,100%)] flex-col' : undefined}>
            <div ref={barsRef} className="sticky top-0 z-30 bg-background">
                <AdminSections />
                <AdminPagesNav variant="row" />
            </div>
            <div className="container mx-auto px-4"><PhoneBar /></div>
            {mode === 'fill' ? (
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            ) : mode === 'sidebar' ? (
                children
            ) : (
                <div className="container mx-auto px-4 py-6">{children}</div>
            )}
        </div>
    );
}
