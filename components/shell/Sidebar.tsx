'use client';

import React, { useState } from 'react';
import { usePathname, Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    ChevronLeft, ChevronRight, Search, MapPin, Users, Globe, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthGate } from '@/lib/useAuthGate';
import GroupSidebarContent from './GroupSidebarContent';
import { CITIES } from '@/lib/constants';
import { getCategoryIcon } from '@/lib/icons';

type CategoryType = {
    id: string;
    slug: string;
    title: string;
    color: string;
};

type SidebarProps = {
    locale: string;
    categories?: CategoryType[];
};

export default function Sidebar({ locale, categories = [] }: SidebarProps) {
    const t = useTranslations('shell.sidebar');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const currentTab = searchParams.get('tab') || 'groups';
    const city = searchParams.get('city') || 'all';

    // Check if we are inside a group page
    // Path structure: /[locale]/[l1Slug]/group/[groupSlug]/...
    const segments = pathname.split('/').filter(Boolean);
    const groupKeyIndex = segments.indexOf('group');
    const isGroupPage = groupKeyIndex !== -1 && segments.length > groupKeyIndex + 1;
    const groupSlug = isGroupPage ? segments[groupKeyIndex + 1] : null;
    const l1Slug = isGroupPage ? segments[groupKeyIndex - 1] : null;

    const createQueryString = React.useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            return newParams.toString();
        },
        [searchParams]
    );

    const handleCategoryClick = (slug: string | null) => {
        router.push(`/?${createQueryString({ category: slug })}`);
    };

    const handleCityChange = (val: string) => {
        router.push(`/?${createQueryString({ city: val === 'all' ? null : val })}`);
    };

    return (
        <aside
            className={clsx(
                'hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out shrink-0',
                isCollapsed ? 'w-[56px]' : 'w-[260px]'
            )}
            aria-label="Sidebar"
        >
            {isGroupPage ? (
                /* ── Group Navigation Mode: scrollable ──────────────────────── */
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-4 min-h-0">
                    <GroupSidebarContent l1Slug={l1Slug!} groupSlug={groupSlug!} collapsed={isCollapsed} />
                </div>
            ) : (
                /* ── Discovery Mode: filters fixed, categories scroll ────────── */
                <div className="flex flex-1 flex-col min-h-0">
                    {/* Filters — shrink-0 so they never scroll away */}
                    {!isCollapsed && (
                        <div className="shrink-0 flex flex-col gap-3 px-3 pt-4">
                            <div className="flex items-center justify-between px-1 py-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                                    {t('filters')}
                                </span>
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
                                    title={t('collapse')}
                                >
                                    <ChevronLeft className={clsx("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
                                </button>
                            </div>

                            <div className="flex bg-surface-elevated/50 p-1 rounded-lg border border-border">
                                <button
                                    onClick={() => router.push(`/?${createQueryString({ tab: 'groups' })}`)}
                                    className={clsx(
                                        'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all',
                                        currentTab === 'groups' ? 'bg-background text-primary shadow-premium transition-transform' : 'text-foreground-muted hover:text-foreground'
                                    )}
                                >
                                    <Users className={clsx("h-3.5 w-3.5", currentTab === 'groups' ? "text-primary" : "text-foreground-muted")} />
                                    {t('groups')}
                                </button>
                                <button
                                    onClick={() => router.push(`/?${createQueryString({ tab: 'events' })}`)}
                                    className={clsx(
                                        'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all',
                                        currentTab === 'events' ? 'bg-background text-primary shadow-premium transition-transform' : 'text-foreground-muted hover:text-foreground'
                                    )}
                                >
                                    <Calendar className={clsx("h-3.5 w-3.5", currentTab === 'events' ? "text-primary" : "text-foreground-muted")} />
                                    {t('events')}
                                </button>
                            </div>

                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted group-focus-within:text-primary transition-colors" />
                                <select
                                    value={city}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    className="h-9 w-full appearance-none rounded-lg border border-border bg-background pl-8 pr-7 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer"
                                >
                                    <option value="all">{t('anyCity')}</option>
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none -rotate-90" />
                            </div>
                        </div>
                    )}

                    {isCollapsed && (
                        <div className="shrink-0 flex flex-col items-center pt-4">
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
                                title={t('collapse')}
                            >
                                <ChevronLeft className={clsx("w-4 h-4 transition-transform rotate-180")} />
                            </button>
                        </div>
                    )}

                    {/* Categories — independently scrollable */}
                    {categories.length > 0 && (
                        <div className={clsx('flex flex-1 flex-col min-h-0', !isCollapsed ? 'mt-4' : 'mt-2')}>
                            {!isCollapsed && (
                                <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-3 mb-1">
                                    {t('categories')}
                                </p>
                            )}
                            {/* Scroll region — only this part scrolls */}
                            <div className="flex flex-col overflow-y-auto px-2 pb-2 min-h-0">
                                {/* Everything */}
                                <button
                                    onClick={() => handleCategoryClick(null)}
                                    className={clsx(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left w-full',
                                        !currentCategory
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-foreground-muted hover:bg-surface-elevated hover:text-foreground'
                                    )}
                                    title={isCollapsed ? t('everything') : undefined}
                                >
                                    <Globe className={clsx('h-4 w-4 shrink-0', !currentCategory ? 'text-primary' : 'text-foreground-muted')} />
                                    {!isCollapsed && <span className="truncate">{t('everything')}</span>}
                                </button>

                                {categories.map((cat) => {
                                    const CatIcon = getCategoryIcon(cat.slug);
                                    const isActive = currentCategory === cat.slug;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.slug)}
                                            className={clsx(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left w-full',
                                                isActive ? 'font-semibold' : 'text-foreground hover:bg-surface-elevated'
                                            )}
                                            style={{
                                                backgroundColor: isActive ? `${cat.color}18` : undefined,
                                                color: isActive ? cat.color : undefined,
                                            }}
                                            title={isCollapsed ? cat.title : undefined}
                                        >
                                            <span
                                                className="flex h-4 w-4 shrink-0 items-center justify-center"
                                                style={{ color: cat.color }}
                                            >
                                                <CatIcon className="h-4 w-4" />
                                            </span>
                                            {!isCollapsed && <span className="truncate">{cat.title}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

