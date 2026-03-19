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
                isCollapsed ? 'w-[56px]' : 'w-[260px]'
            )}
            aria-label="Sidebar"
        >
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-4 min-h-0">
                {!isCollapsed && (
                    <div className="flex items-center justify-end px-2 mb-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-foreground-muted hover:bg-surface-elevated/80 hover:text-foreground transition-all shadow-sm"
                            title={t('collapse')}
                        >
                            <ChevronLeft className="h-5 w-5 transition-transform" />
                        </button>
                    </div>
                )}
                {isCollapsed && (
                    <div className="shrink-0 flex flex-col items-center mb-4">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-foreground-muted hover:bg-surface-elevated/80 hover:text-foreground transition-all shadow-sm"
                            title={t('collapse')}
                        >
                            <ChevronLeft className="h-5 w-5 transition-transform rotate-180" />
                        </button>
                    </div>
                )}
                <GroupSidebarContent l1Slug={l1Slug!} groupSlug={groupSlug!} collapsed={isCollapsed} />
            </div>
        </aside>
    );
}


