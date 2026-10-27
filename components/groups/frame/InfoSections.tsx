'use client';

import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import PartTabs from '@/components/ui/PartTabs';
import { UI } from '@/lib/constants';
import { useScrollSpy } from '@/hooks/useScrollSpy';

type Part = { key: string; label: string; lang?: string; content: ReactNode; /** Right-aligned in the section head (the team's add-pictures button); the first section's heading is sr-only, so it gets a row of its own. */ action?: ReactNode };

const anchor = (key: string) => `part-${key}`;

/**
 * Informācija on one page (AR-50, D): every part this viewer may read is stacked, each under its heading; the tabs are jump links that
 * scroll and write `#part-{id}` with replaceState (no navigation inside the group's address, R6) and follow the scrolling (scroll-spy).
 * `initial` is an old `?part=` link: scrolled to once and rewritten to the hash.
 */
export default function InfoSections({ label, parts, initial, afterFirst }: { label: string; parts: Part[]; initial: string; /** Shown after the first section (below 1024: the next meeting). */ afterFirst?: ReactNode }) {
    const wrap = useRef<HTMLDivElement>(null);
    const tabs = useRef<HTMLElement | null>(null);
    const { active, activate } = useScrollSpy(parts.map((p) => p.key), wrap, tabs, parts[0]?.key ?? '');
    const many = parts.length > 1;

    const jump = (key: string, smooth: boolean) => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        wrap.current?.querySelector(`[id="${anchor(key)}"]`)?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
        activate(key);
    };
    const select = (key: string) => {
        jump(key, true);
        window.history.replaceState(window.history.state, '', `${window.location.pathname}#${anchor(key)}`);
    };

    useEffect(() => {
        const row = wrap.current?.parentElement?.querySelector<HTMLElement>(`[data-ui="${UI.tabs}"]`) ?? null;
        tabs.current = row;
        // Headings stop just under the sticky tabs: their height plus where they stick.
        const measure = () => row && wrap.current?.style.setProperty('--part-top', `${row.offsetHeight + (parseFloat(getComputedStyle(row).top) || 0) + 8}px`);
        measure();
        window.addEventListener('resize', measure);
        const hash = window.location.hash.replace('#', '');
        const target = hash.startsWith('part-') ? hash.slice(5) : initial;
        if (target && parts.some((p) => p.key === target)) {
            jump(target, false);
            if (!hash && initial) window.history.replaceState(window.history.state, '', `${window.location.pathname}#${anchor(initial)}`);
        }
        return () => window.removeEventListener('resize', measure);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
    }, []);

    return (
        <>
            {many && <PartTabs label={label} items={parts.map(({ key, label: text, lang }) => ({ key, label: text, lang, href: `#${anchor(key)}` }))} active={active} onSelect={select} />}
            <div ref={wrap} className="flex flex-col gap-section">
                {parts.map((p, i) => (
                    <Fragment key={p.key}>
                    <section id={anchor(p.key)} aria-labelledby={`${anchor(p.key)}-h`} className="scroll-mt-[var(--part-top,0px)]">
                        {i === 0 && many ? (
                            <>
                                <h2 id={`${anchor(p.key)}-h`} lang={p.lang} className="text-section sr-only">{p.label}</h2>
                                <div className="mb-2 flex max-w-reading justify-end empty:hidden">{p.action}</div>
                            </>
                        ) : (
                            <div className="mb-2 flex max-w-reading items-start justify-between gap-3">
                                <h2 id={`${anchor(p.key)}-h`} lang={p.lang} className="min-w-0 text-section">{p.label}</h2>
                                <div className="empty:hidden">{p.action}</div>
                            </div>
                        )}
                        {p.content}
                    </section>
                    {i === 0 && afterFirst}
                    </Fragment>
                ))}
            </div>
        </>
    );
}
