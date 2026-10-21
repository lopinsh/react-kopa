'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

export type SettingsTab = 'group' | 'sections' | 'owner';

type Props = {
    active: SettingsTab;
    /** The Owner tab exists for the group owner only. */
    showOwner: boolean;
};

/** Tabs: the group's own fields, its page sections, and (owner only) the owner's decisions. Same pattern as `PartTabs`, ending at the focus width. */
export default function SettingsTabs({ active, showOwner }: Props) {
    const t = useTranslations('groupSettings');
    const pathname = usePathname();

    const tabs: Array<{ id: SettingsTab; label: string }> = [
        { id: 'group', label: t('tabGroup') },
        { id: 'sections', label: t('tabSections') },
        ...(showOwner ? [{ id: 'owner' as const, label: t('tabOwner') }] : []),
    ];

    return (
        <div data-ui={UI.tabs} className="sticky top-0 z-10 mb-6 max-w-focus border-b border-border bg-background">
            <nav className="flex gap-4 overflow-x-auto [scrollbar-width:none]" aria-label={t('tabsLabel')}>
                {tabs.map(({ id, label }) => (
                    <Link
                        key={id}
                        href={`${pathname}?tab=${id}`}
                        aria-current={active === id ? 'page' : undefined}
                        className={clsx(
                            '-mb-px whitespace-nowrap border-b-2 pb-2 pt-1 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            active === id ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'
                        )}
                    >
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
