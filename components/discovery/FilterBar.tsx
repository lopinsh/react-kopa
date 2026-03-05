'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { MapPin, X, Users } from 'lucide-react';
import { clsx } from 'clsx';

type Category = {
    id: string;
    slug: string;
    title: string;
    color: string;
};

type Props = {
    categories: Category[];
    cities: string[];
    locale: string;
    activeCategoryId?: string;
};

export default function FilterBar({ categories, cities, locale, activeCategoryId }: Props) {
    const t = useTranslations('discovery');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(''); // Keeps local state if needed but search param 'q' is now handled elsewhere
    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const currentCity = searchParams.get('city') || 'all';
    const currentCategory = activeCategoryId || searchParams.get('cat') || '';
    const currentType = searchParams.get('type') || 'all';

    // Create a new URL with updated search params
    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '' || value === 'all') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });

            return newParams.toString();
        },
        [searchParams]
    );



    const handleCityChange = (city: string) => {
        router.push(`${pathname}?${createQueryString({ city })}`);
    };

    const handleTypeChange = (type: string) => {
        router.push(`${pathname}?${createQueryString({ type })}`);
    };

    const handleCategoryClick = (catSlug: string) => {
        const nextCat = currentCategory === catSlug ? null : catSlug;
        router.push(`${pathname}?${createQueryString({ cat: nextCat, tag: null })}`);
    };

    const clearFilters = () => {
        setQuery('');
        router.push(pathname);
    };

    return (
        <div className="space-y-6 rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-bold text-foreground">Filters</h3>
                {(query || currentCity !== 'all' || currentCategory) && (
                    <button
                        onClick={clearFilters}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                        {t('clearFilters')}
                    </button>
                )}
            </div>

            {/* Search & City Section */}
            <div className="flex flex-col gap-4">


                <div className="relative min-w-[200px]">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <select
                        value={currentCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="h-12 w-full appearance-none rounded-2xl border border-border bg-surface pl-10 pr-10 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">{t('allCities')}</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative min-w-[200px]">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <select
                        value={currentType}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="h-12 w-full appearance-none rounded-2xl border border-border bg-surface pl-10 pr-10 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Group Types</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                    </select>
                </div>

            </div>

            {/* L1 Category Bar */}
            <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-foreground">Categories</h4>
                <div className="flex flex-col gap-2">
                    {categories.map((cat) => {
                        const isActive = currentCategory === cat.slug;
                        const colorStyle = {
                            '--cat-color': cat.color,
                            borderColor: isActive ? cat.color : undefined,
                            backgroundColor: isActive ? `${cat.color}15` : undefined,
                            color: isActive ? cat.color : undefined,
                        } as React.CSSProperties;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                style={colorStyle}
                                className={clsx(
                                    "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-bold transition-all soft-press",
                                    isActive ? "border-[var(--cat-color)] shadow-sm" : "border-border bg-background text-foreground-muted hover:border-[var(--cat-color)]/50 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                    <span className={isActive ? "" : ""}>{cat.title}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contextual Filters (Mocked) */}
            {currentCategory && (
                <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground">Specific Options</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                            <button
                                key={opt}
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:border-foreground/20 hover:text-foreground transition-all soft-press"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
