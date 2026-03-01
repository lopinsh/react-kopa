'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Users, UserPlus } from 'lucide-react';

type Props = {
    accentColor: string;
    pendingCount: number;
    showRequests: boolean;
};

export default function MemberTabs({ accentColor, pendingCount, showRequests }: Props) {
    const t = useTranslations('group');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'members';

    const tabs = [
        {
            id: 'members',
            label: t('membersList'),
            icon: Users,
            href: `${pathname}?tab=members`,
            active: currentTab === 'members'
        },
        ...(showRequests ? [{
            id: 'requests',
            label: t('requestsTab'),
            icon: UserPlus,
            href: `${pathname}?tab=requests`,
            active: currentTab === 'requests',
            count: pendingCount
        }] : [])
    ];

    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

    return (
        <div
            style={accentStyle}
            className="mb-8 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20 -mx-4 px-4 md:-mx-8 md:px-8 pt-2"
        >
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
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-surface animate-in zoom-in duration-300">
                                    {tab.count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
