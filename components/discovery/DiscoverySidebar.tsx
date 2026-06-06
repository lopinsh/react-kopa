'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutGrid, ChevronLeft } from 'lucide-react';
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

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Sidebar is expanded if:
    // 1. Desktop and not collapsed
    // 2. Mobile and isMobileOpen
    const isExpanded = isMobile ? isMobileOpen : !isCollapsed;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsMobileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileOpen]);

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
        if (isMobileOpen) setIsMobileOpen(false);
    };

    const isAllActive = !activeCat;

    return (
        <div
            className={clsx(
                "flex shrink-0 sticky top-0 z-40 h-[calc(100dvh-64px)] md:h-[calc(100vh-var(--header-height))] transition-all duration-300",
                isMobile ? (isExpanded ? 'w-0' : 'w-12') : 'w-auto'
            )}
        >
            {/* Modal backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-[60] md:hidden bg-background/40 backdrop-blur-md transition-all duration-500 animate-in fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            <aside
                ref={sidebarRef}
                className={clsx(
                    'flex flex-col border-r border-border bg-surface transition-all duration-300 h-full',
                    // Mobile: floating
                    isMobile ? 'absolute z-[70]' : 'relative z-30',
                    // Width logic
                    isExpanded ? 'w-[280px]' : 'w-12',
                    // Desktop adjustments
                    'md:relative md:z-30',
                    isExpanded && isMobile && 'shadow-premium'
                )}
            >
            {/* Unified Toggle Button Handle */}
            <button
                onClick={() => {
                    if (isMobile) {
                        setIsMobileOpen(!isMobileOpen);
                    } else {
                        setIsCollapsed(!isCollapsed);
                    }
                }}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-10 w-6 flex items-center justify-center rounded-r-xl border border-l-0 border-border bg-surface text-foreground-muted shadow-sm hover:text-foreground transition-all hover:scale-105 active:scale-95"
                title={isExpanded ? t('collapse') : t('expand')}
            >
                <ChevronLeft className={clsx("h-5 w-5 transition-transform", !isExpanded && "rotate-180")} />
            </button>

            {/* Category List */}
            <nav className="flex flex-col gap-1 overflow-y-auto py-3 flex-1 scrollbar-none">
                {/* "Everything" / "All" entry */}
                <button
                    onClick={() => handleCategoryClick(null)}
                    title={!isExpanded ? t('everything') : undefined}
                    className={clsx(
                        'relative flex items-center rounded-xl transition-all duration-200 soft-press group mx-auto',
                        isExpanded ? 'w-[calc(100%-16px)] px-1.5 h-10 mb-1' : 'w-9 h-9 mb-1',
                        isAllActive && isExpanded && 'bg-primary/5',
                        !isAllActive && 'hover:bg-surface-elevated'
                    )}
                >
                    {isAllActive && isExpanded && <div className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-lg bg-primary/60" />}

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                        <span
                            className={clsx(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all border border-dashed',
                                isAllActive
                                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                    : 'bg-transparent border-border/50 text-foreground-muted group-hover:bg-surface-elevated group-hover:text-foreground group-hover:border-border'
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </span>
                    </span>

                    <span
                        className={clsx(
                            'truncate text-sm transition-all duration-300 overflow-hidden whitespace-nowrap text-left pl-3',
                            isExpanded ? 'max-w-[180px] opacity-100 flex-1' : 'max-w-0 opacity-0 pl-0',
                            isAllActive ? 'font-bold text-primary' : 'font-semibold text-foreground-muted group-hover:text-foreground'
                        )}
                    >
                        {t('everything')}
                    </span>
                </button>

                <div className={clsx("my-1.5 h-px bg-border/40 shrink-0", isExpanded ? "mx-4" : "mx-2")} />

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
                                isExpanded ? 'w-[calc(100%-16px)] px-1.5 h-12' : 'w-9 h-9',
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
                                    isExpanded ? 'max-w-[180px] opacity-100 flex-1' : 'max-w-0 opacity-0 pl-0',
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
        </div>
    );
}
