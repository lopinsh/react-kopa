'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Settings, Share2, Tags, Lock, Layout, AlertTriangle } from 'lucide-react';

type Props = {
    isOwner: boolean;
};

export default function SettingsTabs({ isOwner }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'profile';

    const tabs = [
        {
            id: 'profile',
            label: c_common('profile'),
            icon: Settings,
            href: `${pathname}?tab=profile`,
            active: currentTab === 'profile'
        },
        {
            id: 'social',
            label: c_common('tabSocial'),
            icon: Share2,
            href: `${pathname}?tab=social`,
            active: currentTab === 'social'
        },
        {
            id: 'sections',
            label: c_common('tabSections'),
            icon: Layout,
            href: `${pathname}?tab=sections`,
            active: currentTab === 'sections'
        },
        ...(isOwner ? [
            {
                id: 'categorization',
                label: c_common('tabCategorization'),
                icon: Tags,
                href: `${pathname}?tab=categorization`,
                active: currentTab === 'categorization'
            },
            {
                id: 'privacy',
                label: c_common('tabPrivacy'),
                icon: Lock,
                href: `${pathname}?tab=privacy`,
                active: currentTab === 'privacy'
            },
            {
                id: 'danger',
                label: c_common('tabDanger'),
                icon: AlertTriangle,
                href: `${pathname}?tab=danger`,
                active: currentTab === 'danger'
            }
        ] : [])
    ];

    return (
        <div className="mb-8 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20 -mx-4 px-4 md:-mx-8 md:px-8 pt-2">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href as any}
                            className={clsx(
                                "relative flex items-center gap-2 px-4 py-4 transition-all border-b-2 whitespace-nowrap font-bold uppercase tracking-wider text-[10px]",
                                tab.active
                                    ? "border-[var(--accent)] text-[var(--accent)]"
                                    : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
                            )}
                            style={tab.active ? {
                                boxShadow: `0 1px 0 0 var(--accent)`,
                                filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--accent), transparent 60%))`
                            } : undefined}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
