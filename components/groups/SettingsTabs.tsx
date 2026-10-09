'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { clsx } from 'clsx';
import { Settings, Layout, type LucideIcon } from 'lucide-react';

export type SettingsTab = 'group' | 'sections';

type Props = {
    active: SettingsTab;
};

/** Two tabs: the group's own fields, and its page sections. */
export default function SettingsTabs({ active }: Props) {
    const t = useTranslations('groupSettings');
    const pathname = usePathname();

    const tabs: Array<{ id: SettingsTab; label: string; icon: LucideIcon }> = [
        { id: 'group', label: t('tabGroup'), icon: Settings },
        { id: 'sections', label: t('tabSections'), icon: Layout },
    ];

    return (
        <div className="mb-6 border-b border-border/60">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none" aria-label={t('tabsLabel')}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <Link
                        key={id}
                        href={`${pathname}?tab=${id}`}
                        aria-current={active === id ? 'page' : undefined}
                        className={clsx(
                            'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors',
                            active === id
                                ? 'border-[var(--accent)] text-[var(--accent)]'
                                : 'border-transparent text-foreground-muted hover:border-border hover:text-foreground'
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
