'use client';

import { useRef, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { AdminPanelTab } from '@/lib/constants';

type Props = {
    tabs: readonly AdminPanelTab[];
    value: AdminPanelTab;
    onChange: (tab: AdminPanelTab) => void;
};

/** Plain tabs with an underline; arrows, Home and End move and select (roving tabindex). */
export default function PanelTabs({ tabs, value, onChange }: Props) {
    const t = useTranslations('admin.panel');
    const listRef = useRef<HTMLDivElement>(null);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const i = tabs.indexOf(value);
        const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
        if (next < 0) return;
        e.preventDefault();
        onChange(tabs[next]);
        listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
    };

    return (
        <div ref={listRef} role="tablist" aria-label={t('label')} onKeyDown={onKeyDown} className="flex gap-1 px-3">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`admin-panel-tab-${tab}`}
                    aria-selected={tab === value}
                    aria-controls={`admin-panel-body-${tab}`}
                    tabIndex={tab === value ? 0 : -1}
                    onClick={() => onChange(tab)}
                    className={clsx(
                        'min-h-11 px-3 text-button-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                        tab === value ? 'weight-strong text-foreground shadow-[inset_0_-2px_0_var(--primary)]' : 'text-foreground-muted hover:text-foreground',
                    )}
                >
                    {t(`tabs.${tab}`)}
                </button>
            ))}
        </div>
    );
}
