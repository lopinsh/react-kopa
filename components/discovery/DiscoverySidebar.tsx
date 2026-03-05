'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
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

    const [collapsed, setCollapsed] = useState(true);

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
    };

    const isAllActive = !activeCat;

    return (
        <aside
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
            className={clsx(
                'flex shrink-0 flex-col border-r border-border bg-surface transition-all duration-300 sticky top-0 h-full',
                collapsed ? 'w-16' : 'w-[200px]'
            )}
        >


            {/* Category List */}
            <nav className="flex flex-col gap-0.5 overflow-y-auto py-3 flex-1 px-1.5 overflow-x-hidden">
                {/* "Everything" / "All" entry */}
                <button
                    onClick={() => handleCategoryClick(null)}
                    title={collapsed ? t('everything') : undefined}
                    className={clsx(
                        'relative flex items-center gap-3 rounded-lg w-full transition-all duration-150 soft-press group overflow-hidden',
                        'px-[14px] h-[48px]',
                        isAllActive && !collapsed && 'bg-primary/10',
                        !isAllActive && !collapsed && 'hover:bg-surface-elevated'
                    )}
                >
                    {isAllActive && !collapsed && <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-primary" />}

                    <span
                        className={clsx(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all',
                            isAllActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground-muted group-hover:bg-surface-elevated group-hover:text-foreground'
                        )}
                    >
                        <Globe className="h-5 w-5" />
                    </span>

                    <span
                        className={clsx(
                            'truncate text-sm transition-opacity duration-300',
                            collapsed ? 'opacity-0' : 'opacity-100',
                            isAllActive ? 'font-semibold text-primary' : 'font-medium text-foreground-muted group-hover:text-foreground'
                        )}
                    >
                        {t('everything')}
                    </span>
                </button>

                {/* Category Entries */}
                {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug);
                    const isActive = activeCat === cat.slug;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.slug)}
                            title={collapsed ? cat.title : undefined}
                            className={clsx(
                                'relative flex items-center gap-3 rounded-lg w-full transition-all duration-150 soft-press group overflow-hidden',
                                'px-[14px] h-[48px]',
                                !isActive && !collapsed && 'hover:bg-surface-elevated'
                            )}
                            style={
                                isActive && !collapsed
                                    ? { backgroundColor: `${cat.color}18` }
                                    : {}
                            }
                        >
                            {isActive && !collapsed && (
                                <div
                                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                                    style={{ backgroundColor: cat.color }}
                                />
                            )}

                            <span
                                className={clsx(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all',
                                    !isActive && 'group-hover:bg-surface-elevated'
                                )}
                                style={isActive ? { backgroundColor: cat.color } : {}}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: isActive ? '#fff' : cat.color }}
                                />
                            </span>

                            <span
                                className={clsx(
                                    'truncate text-sm transition-opacity duration-300',
                                    collapsed ? 'opacity-0' : 'opacity-100',
                                    isActive ? 'font-semibold' : 'font-medium text-foreground-muted group-hover:text-foreground'
                                )}
                                style={isActive && !collapsed ? { color: cat.color } : undefined}
                            >
                                {cat.title}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
