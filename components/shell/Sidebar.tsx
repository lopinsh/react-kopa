'use client';

import React, { useState } from 'react';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import GroupSidebarContent from './GroupSidebarContent';

type SidebarProps = {
    locale: string;
};

export default function Sidebar({ locale }: SidebarProps) {
    const t = useTranslations('shell.sidebar');
  const c_common = useTranslations('common');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Check if we are inside a group page
    // Path structure: /[locale]/[l1Slug]/group/[groupSlug]/...
    const segments = pathname.split('/').filter(Boolean);
    const groupKeyIndex = segments.indexOf('group');
    const isGroupPage = groupKeyIndex !== -1 && segments.length > groupKeyIndex + 1;
    const groupSlug = isGroupPage ? segments[groupKeyIndex + 1] : null;
    const l1Slug = isGroupPage ? segments[groupKeyIndex - 1] : null;

    if (!isGroupPage) {
        return null;
    }

    return (
        <aside
            className={clsx(
                'hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out shrink-0 relative',
                isCollapsed ? 'w-16' : 'w-[260px]'
            )}
            aria-label="Sidebar"
        >
            {/* Desktop Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex absolute -right-3 top-6 z-50 h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-sm hover:text-foreground transition-all hover:scale-110 active:scale-95"
                title={isCollapsed ? t('expand') : t('collapse')}
            >
                <ChevronLeft className={clsx("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </button>

            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-4 min-h-0">
                <GroupSidebarContent l1Slug={l1Slug!} groupSlug={groupSlug!} collapsed={isCollapsed} />
            </div>
        </aside>
    );
}


