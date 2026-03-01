'use client';

import { useTranslations } from 'next-intl';
import { Search, MapPin, Layers, FilterX } from 'lucide-react';
import { clsx } from 'clsx';
import { CITIES } from '@/lib/constants';
import type { GroupType } from '@prisma/client';

type Filters = {
    city?: string;
    type?: GroupType;
    subcategoryId?: string;
    search?: string;
};

type Props = {
    subcategories: { id: string; slug: string; title: string }[];
    filters: Filters;
    onFilterChange: (newFilters: Filters) => void;
    accentColor: string;
};

export default function DiscoveryFilters({
    subcategories,
    filters,
    onFilterChange,
    accentColor,
}: Props) {
    const t = useTranslations('discovery');

    function update(key: keyof Filters, value: any) {
        onFilterChange({ ...filters, [key]: value || undefined });
    }

    function clear() {
        onFilterChange({});
    }

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div className="space-y-8">
            {/* Search */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground-muted">
                    {t('searchLabel')}
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="w-full rounded-xl border border-border bg-surface px-9 py-2.5 text-sm ring-[var(--accent)] transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2"
                        style={{ ['--accent' as string]: accentColor }}
                    />
                </div>
            </div>

            {/* City */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground-muted">
                    {t('cityLabel')}
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <select
                        value={filters.city || ''}
                        onChange={(e) => update('city', e.target.value)}
                        className="w-full appearance-none rounded-xl border border-border bg-surface px-9 py-2.5 text-sm transition-all focus:border-[var(--accent)] focus:outline-none"
                        style={{ ['--accent' as string]: accentColor }}
                    >
                        <option value="">{t('allCities')}</option>
                        {CITIES.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Categories */}
            {subcategories.length > 0 && (
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-foreground-muted">
                        {t('categoryLabel')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => update('subcategoryId', undefined)}
                            className={clsx(
                                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                                !filters.subcategoryId
                                    ? 'bg-[var(--accent)] text-white shadow-md'
                                    : 'border border-border bg-surface text-foreground-muted hover:border-foreground-muted/40'
                            )}
                            style={!filters.subcategoryId ? ({ ['--accent' as string]: accentColor } as any) : undefined}
                        >
                            {t('allSubcategories')}
                        </button>
                        {subcategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => update('subcategoryId', cat.id)}
                                className={clsx(
                                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                                    filters.subcategoryId === cat.id
                                        ? 'bg-[var(--accent)] text-white shadow-md'
                                        : 'border border-border bg-surface text-foreground-muted hover:border-foreground-muted/40'
                                )}
                                style={filters.subcategoryId === cat.id ? ({ ['--accent' as string]: accentColor } as any) : undefined}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {hasFilters && (
                <button
                    onClick={clear}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10"
                >
                    <FilterX className="h-4 w-4" />
                    {t('clearFilters')}
                </button>
            )}
        </div>
    );
}
