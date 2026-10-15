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

    const onTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        onTab(tab === 'USER' ? 'ADMIN' : 'USER');
    };

    return (
        <div data-ui={UI.bellList}>
            <DropdownHead
                id={headingId}
                title={t('title')}
                action={unread > 0 && (
                    <button type="button" disabled={markAllDisabled} onClick={onMarkAll} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">{t('markAllRead')}</button>
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
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => onTab(audience)}
                                className={clsx('-mb-px border-b-2 pb-2 pt-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', selected ? 'border-primary font-semibold text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground')}
                            >
                                {t(audience === 'ADMIN' ? 'tabAdmin' : 'tabPersonal')}
                                {count > 0 && <span className="ml-1 tabular-nums">{count}</span>}
                            </button>
                        );
                    })}
                </div>
            )}
            <div role={isAdmin ? 'tabpanel' : undefined} className="max-h-[min(70vh,28rem)] overflow-y-auto">{children}</div>
            <DropdownFooter href={tab === 'ADMIN' ? { pathname: '/notifications', query: { tab: 'admin' } } : '/notifications'} label={t('all')} />
        </div>
    );
}
