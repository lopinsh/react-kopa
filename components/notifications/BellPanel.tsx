'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { DropdownFooter, DropdownHead } from '@/components/shell/DropdownParts';
import { UI } from '@/lib/constants';

export type Audience = 'USER' | 'ADMIN';

type Props = {
    headingId: string;
    /** A site admin gets the two tabs. */
    isAdmin: boolean;
    tab: Audience;
    onTab: (tab: Audience) => void;
    /** Unread per tab: the numbers on the tabs and whether "Atzīmēt visus kā izlasītus" shows. */
    counts: { user: number; admin: number };
    onMarkAll: () => void;
    markAllDisabled?: boolean;
    /** The rows (or their loading and failed states). */
    children: ReactNode;
};

/** The bell's panel without its data (AR-65): head with "Atzīmēt visus kā izlasītus", the admin tabs, the rows, "Visi paziņojumi". */
export default function BellPanel({ headingId, isAdmin, tab, onTab, counts, onMarkAll, markAllDisabled = false, children }: Props) {
    const t = useTranslations('notifications');
    const unread = tab === 'ADMIN' ? counts.admin : counts.user;

    const tabId = (audience: Audience) => `${headingId}-tab-${audience}`;
    const panelId = `${headingId}-panel`;

    // Arrow keys move between the two tabs and take the focus along (the unselected tab is out of the Tab order).
    const onTabKey = (e: KeyboardEvent) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const next: Audience = e.key === 'Home' ? 'USER' : e.key === 'End' ? 'ADMIN' : tab === 'USER' ? 'ADMIN' : 'USER';
        onTab(next);
        document.getElementById(tabId(next))?.focus();
    };

    return (
        <div data-ui={UI.bellList}>
            <DropdownHead
                id={headingId}
                title={t('title')}
                action={unread > 0 && (
                    <button type="button" disabled={markAllDisabled} onClick={onMarkAll} className="text-tag text-primary hover:underline disabled:opacity-50">{t('markAllRead')}</button>
                )}
            />
            {isAdmin && (
                <div role="tablist" aria-label={t('title')} onKeyDown={onTabKey} className="flex gap-4 border-b border-border px-4">
                    {(['USER', 'ADMIN'] as const).map((audience) => {
                        const count = audience === 'ADMIN' ? counts.admin : counts.user;
                        const selected = tab === audience;
                        return (
                            <button
                                key={audience}
                                id={tabId(audience)}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                aria-controls={panelId}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => onTab(audience)}
                                className={clsx('-mb-px border-b-2 pb-2 pt-3 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', selected ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground')}
                            >
                                {t(audience === 'ADMIN' ? 'tabAdmin' : 'tabPersonal')}
                                {count > 0 && <span className="ml-1 tabular-nums">{count}</span>}
                            </button>
                        );
                    })}
                </div>
            )}
            <div id={panelId} role={isAdmin ? 'tabpanel' : undefined} aria-labelledby={isAdmin ? tabId(tab) : undefined} className="max-h-[min(70vh,28rem)] overflow-y-auto">{children}</div>
            <DropdownFooter href={tab === 'ADMIN' ? { pathname: '/notifications', query: { tab: 'admin' } } : '/notifications'} label={t('all')} />
        </div>
    );
}
