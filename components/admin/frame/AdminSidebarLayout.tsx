'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useAdminParts } from './AdminPagesNav';
import { useOptionalAdminFrame } from './AdminFrameProvider';
import AdminSidebarFold from './AdminSidebarFold';
import useActiveSection from './useActiveSection';

export type SidebarTab = { id: string; href: string; label: string; current: boolean; flagged?: boolean };
export type SidebarSection = { id: string; label: string; status?: 'approved' | 'progress' | 'open'; version?: string; date?: string };
export type SidebarLabels = { tabs: string; sections: string };

const ROW = 'flex min-h-11 w-full items-center gap-2 rounded-item px-3 py-2 text-left text-body-sm hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function Chip({ status }: { status: NonNullable<SidebarSection['status']> }) {
    const t = useTranslations('admin.development.status');
    return (
        <span className={clsx('inline-flex h-5 items-center gap-1 rounded-pill px-2 text-tag', status === 'open' ? 'line text-foreground' : 'bg-tint', status === 'progress' ? 'text-foreground-muted' : 'text-foreground')}>
            {status === 'approved' && <Check aria-hidden className="size-3" />}
            {t(status)}
        </span>
    );
}

function Meta({ section }: { section: SidebarSection }) {
    const format = useFormatter();
    if (!section.status && !section.version && !section.date) return null;
    return (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-foreground-muted">
            {section.status && <Chip status={section.status} />}
            {section.version}
            {section.date && format.dateTime(new Date(section.date), { day: 'numeric', month: 'short' })}
        </span>
    );
}

/** The tabs (top) and sections (under a hairline); shared by the sidebar and the fold panel (AF-12, AF-14). */
export function SidebarList({ tabs, sections, current, labels, onJump, onPick }: { tabs: SidebarTab[]; sections: SidebarSection[]; current: string | null; labels: SidebarLabels; onJump?: (id: string) => void; onPick?: () => void }) {
    const flaggedText = useTranslations('admin.design')('contrast.partHasIssues');
    const listRef = useRef<HTMLElement>(null);
    useEffect(() => {
        listRef.current?.querySelector('[aria-current="location"]')?.scrollIntoView({ block: 'nearest' });
    }, [current]);
    return (
        <>
            {tabs.length > 0 && (
                <nav aria-label={labels.tabs} className="flex flex-col gap-0.5">
                    {tabs.map((tab) => (
                        <Link key={tab.id} href={tab.href} scroll={false} replace aria-current={tab.current ? 'page' : undefined} onClick={onPick} className={clsx(ROW, tab.current ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted')}>
                            {tab.label}
                            {tab.flagged && (
                                <>
                                    <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-warning" />
                                    <span className="sr-only">{flaggedText}</span>
                                </>
                            )}
                        </Link>
                    ))}
                </nav>
            )}
            {sections.length > 0 && (
                <nav ref={listRef} aria-label={labels.sections} className={clsx('flex flex-col gap-0.5', tabs.length > 0 && 'mt-3 border-t border-border pt-3')}>
                    {sections.map((s) => {
                        const on = s.id === current;
                        const cls = clsx(ROW, 'flex-col items-start gap-1', on ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted');
                        const body = (
                            <>
                                <span className="line-clamp-2">{s.label}</span>
                                <Meta section={s} />
                            </>
                        );
                        return onJump ? (
                            <button key={s.id} type="button" aria-current={on ? 'location' : undefined} className={cls} onClick={() => { onJump(s.id); onPick?.(); }}>{body}</button>
                        ) : (
                            <a key={s.id} href={`#${s.id}`} aria-current={on ? 'location' : undefined} className={cls} onClick={onPick}>{body}</a>
                        );
                    })}
                </nav>
            )}
        </>
    );
}

/**
 * A page with sections (AF-10): a sticky sidebar at the window's left edge (tabs on top, sections under), the content filling to the right edge.
 * Below `lg` it folds into a "Sections" button (AF-14). `tabs` default to the open page's parts (Design, Handbook); `current` to the section being read.
 */
export default function AdminSidebarLayout({ tabs, sections, current, labels, onJump, fill = false, children }: { tabs?: SidebarTab[]; sections: SidebarSection[]; current?: string | null; labels: SidebarLabels; onJump?: (id: string) => void; fill?: boolean; children: ReactNode }) {
    const frame = useOptionalAdminFrame();
    const parts = useAdminParts(frame?.location.item ?? null);
    const items: SidebarTab[] = tabs ?? parts.map((p) => ({ ...p, current: p.id === frame?.location.part }));
    const active = useActiveSection(current === undefined ? sections.map((s) => s.id) : []);
    const here = current === undefined ? active : current;
    return (
        <div className={clsx('lg:flex', fill && 'flex min-h-0 flex-1 flex-col lg:flex-row')} data-ui={UI.tabs}>
            <aside
                aria-label={labels.sections}
                className={clsx('hidden w-aside shrink-0 overflow-y-auto border-r border-border bg-background p-3 lg:block', fill ? 'lg:self-stretch' : 'lg:sticky lg:top-[var(--admin-bars,0px)] lg:max-h-[calc(100dvh-var(--spacing-header)-var(--admin-bars,0px))] lg:self-start')}
            >
                <SidebarList tabs={items} sections={sections} current={here} labels={labels} onJump={onJump} />
            </aside>
            <div className={clsx('min-w-0 flex-1', fill ? 'flex min-h-0 flex-col' : 'px-gutter py-6')}>
                <div className={fill ? 'px-gutter' : undefined}>
                    <AdminSidebarFold tabs={items} sections={sections} current={here} labels={labels} onJump={onJump} />
                </div>
                {children}
            </div>
        </div>
    );
}
