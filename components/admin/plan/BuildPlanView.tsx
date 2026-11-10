'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import AdminSidebarLayout, { type SidebarSection, type SidebarTab } from '@/components/admin/frame/AdminSidebarLayout';
import useActiveSection from '@/components/admin/frame/useActiveSection';

type Status = NonNullable<SidebarSection['status']>;
const STATUSES: Status[] = ['approved', 'progress', 'new', 'updated'];

function statusOf(value: string | undefined): Status | undefined {
    return STATUSES.find((s) => s === value);
}

function smooth(win: Window): ScrollBehavior {
    return win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/**
 * The build plan inside the page sidebar (AF-2): the tabs (Plan, drawings) on top, under them the sections of the open tab.
 * A drawing's sections come from `section[data-st]` in its same-origin frame (AF-22, AF-24); the spec's from its headings.
 */
export default function BuildPlanView({ tabs, specSections, drawing, labels, children }: {
    tabs: SidebarTab[];
    specSections: SidebarSection[];
    drawing: { id: string; title: string; html: string } | null;
    labels: { tabs: string; sections: string };
    children: ReactNode;
}) {
    const t = useTranslations('admin.development');
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [pane, setPane] = useState<HTMLDivElement | null>(null);
    const [doc, setDoc] = useState<Document | null>(null);
    const [found, setFound] = useState<SidebarSection[]>([]);

    const read = useCallback((d: Document | null | undefined) => {
        if (!d) return;
        const list = Array.from(d.querySelectorAll<HTMLElement>('section[data-st]')).map((el) => ({
            id: el.id,
            label: el.dataset.label ?? el.id,
            status: statusOf(el.dataset.st),
            version: el.dataset.v,
            date: el.dataset.d,
        }));
        setFound(list);
        setDoc(d);
        const hash = window.location.hash.slice(1);
        if (hash && list.some((s) => s.id === hash)) d.getElementById(hash)?.scrollIntoView({ block: 'start' });
    }, []);
    const onLoad = useCallback(() => read(frameRef.current?.contentDocument), [read]);
    // The srcDoc can finish loading before hydration, so the load event is missed: read a document that is already there.
    const attach = useCallback((el: HTMLIFrameElement | null) => {
        frameRef.current = el;
        const d = el?.contentDocument;
        if (d && d.readyState === 'complete' && d.querySelector('section[data-st]')) read(d);
    }, [read]);

    const ids = (drawing ? found : specSections).map((s) => s.id);
    const current = useActiveSection(ids, drawing ? doc : null, drawing ? null : pane);

    const onJump = (id: string) => {
        const target = drawing ? doc : document;
        const el = drawing ? doc?.getElementById(id) : pane?.querySelector<HTMLElement>(`[id="${id}"]`);
        const win = target?.defaultView;
        if (!el || !win) return;
        el.scrollIntoView({ block: 'start', behavior: smooth(win) });
        window.history.replaceState(null, '', `#${id}`);
    };

    return (
        <AdminSidebarLayout fill tabs={tabs} sections={drawing ? found : specSections} current={current} labels={labels} onJump={onJump}>
            {drawing ? (
                <iframe key={drawing.id} ref={attach} onLoad={onLoad} data-feedback-frame={drawing.id} title={drawing.title} srcDoc={drawing.html} className="min-h-0 w-full flex-1 border-0 bg-background" />
            ) : (
                <div ref={setPane} className="min-h-0 flex-1 overflow-y-auto px-gutter py-6">
                    <article aria-label={t('planTab')} className="min-w-0 max-w-5xl">{children}</article>
                </div>
            )}
        </AdminSidebarLayout>
    );
}
