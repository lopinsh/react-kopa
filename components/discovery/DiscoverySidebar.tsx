'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { getCategoryIcon } from '@/lib/icons';

type Category = {
    id: string;
    slug: string;
    title: string;
    color: string;
};

type Props = {
    categories: Category[];
    activeCat?: string;
    locale: string;
};

export default function DiscoverySidebar({ categories, activeCat }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations('shell.sidebar');

    const [isHovered, setIsHovered] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    // Sidebar is expanded if either hovered (desktop) or manually toggled (mobile/desktop)
    const isExpanded = isHovered || isManualOpen;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isManualOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsManualOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isManualOpen]);

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            return newParams.toString().replace(/%2C/g, ',');
        },
        [searchParams]
    );

    const handleCategoryClick = (slug: string | null) => {
        const isAlreadyActive = slug !== null && slug === activeCat;
        if (isAlreadyActive || slug === null) {
            router.push(`${pathname}?${createQueryString({ category: null, tags: null })}`);
        } else {
            router.push(`${pathname}?${createQueryString({ category: slug, tags: null })}`);
        }
        // Always auto-close when a category is selected (whether desktop manual open or mobile)
        if (isManualOpen) setIsManualOpen(false);
    };

    const isAllActive = !activeCat;

    return (
        <>
        {/* Invisible backdrop for mobile to handle click-outside without triggering underlying elements */}
        {isManualOpen && (
            <div
                className="fixed inset-0 z-20 md:hidden bg-transparent"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsManualOpen(false);
                }}
            />
        )}
        <aside
            ref={sidebarRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={clsx(
                'flex shrink-0 flex-col border-r border-border bg-surface transition-all duration-300 sticky top-0 z-30',
                'h-[calc(100dvh-64px)] md:h-full max-h-screen',
                isExpanded ? 'w-[240px] shadow-premium absolute md:relative' : 'w-16 relative'
            )}
        >
            {/* Mobile Toggle Trigger */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsManualOpen(!isManualOpen);
                }}
                className="flex h-12 w-full items-center justify-center border-b border-border/50 text-foreground-muted hover:text-foreground transition-colors md:hidden"
                title={isExpanded ? t('collapse') : t('everything')}
            >
                <div className={clsx(
                    'flex flex-col gap-1 transition-transform duration-300',
                    isExpanded && 'rotate-180'
                )}>
                    <span className={clsx('h-0.5 w-5 rounded-full bg-current transition-all', isExpanded && 'translate-y-1.5 rotate-45')} />
                    <span className={clsx('h-0.5 w-5 rounded-full bg-current transition-all', isExpanded && 'opacity-0')} />
                    <span className={clsx('h-0.5 w-5 rounded-full bg-current transition-all', isExpanded && '-translate-y-1.5 -rotate-45')} />
                </div>
            </button>

            {/* Category List */}
            <nav className="flex flex-col gap-1 overflow-y-auto py-4 flex-1 scrollbar-none">
                {/* "Everything" / "All" entry */}
                <div className={clsx("flex justify-center transition-all duration-300", isExpanded ? "h-8 opacity-100 mb-2 mt-1" : "h-0 opacity-0 overflow-hidden m-0")}>
                    {!isAllActive && (
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors py-1 px-3 rounded-full hover:bg-surface-elevated"
                        >
                            {t('everything')}
                        </button>
                    )}
                    {isAllActive && (
                        <span className="text-xs font-semibold text-foreground-muted/50 py-1 px-3">
                            {t('everything')}
                        </span>
                    )}
                </div>

                {/* Category Entries */}
                {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug);
                    const isActive = activeCat === cat.slug;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.slug)}
                            title={!isExpanded ? cat.title : undefined}
                            className={clsx(
                                'relative flex items-center rounded-xl transition-all duration-200 soft-press group mx-auto',
                                isExpanded ? 'w-[calc(100%-16px)] px-1.5 h-12' : 'w-12 h-12 px-1.5',
                                !isActive && 'hover:bg-surface-elevated'
                            )}
                            style={
                                isActive && isExpanded
                                    ? { backgroundColor: `${cat.color}18` }
                                    : {}
                            }
                        >
                            {isActive && isExpanded && (
                                <div
                                    className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-lg"
                                    style={{ backgroundColor: cat.color }}
                                />
                            )}

                            <span
                                className={clsx(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                                    !isActive && 'group-hover:bg-surface-elevated'
                                )}
                                style={isActive ? { backgroundColor: cat.color, color: '#fff', boxShadow: `0 4px 12px ${cat.color}40` } : { color: cat.color }}
                            >
                                <Icon className="h-5 w-5" />
                            </span>

                            <span
                                className={clsx(
                                    'truncate text-sm transition-all duration-300 overflow-hidden whitespace-nowrap text-left pl-3',
                                    isExpanded ? 'max-w-[160px] opacity-100 flex-1' : 'max-w-0 opacity-0 pl-0',
                                    isActive ? 'font-bold' : 'font-semibold text-foreground-muted group-hover:text-foreground'
                                )}
                                style={isActive && isExpanded ? { color: cat.color } : undefined}
                            >
                                {cat.title}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </aside>
        </>
    );
}
