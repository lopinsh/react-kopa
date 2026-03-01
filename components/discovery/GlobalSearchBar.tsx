'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, Check, Users, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getCategoryIcon } from '@/lib/icons';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import { searchContextual } from '@/actions/discovery-actions';
import type { ScopedResult } from '@/lib/types/discovery';
import { useTranslations } from 'next-intl';

type FlatCategory = {
    id: string;
    slug: string;
    title: string;
    level: 1 | 2 | 3;
    l1Slug: string;
    l1Title: string;
    l1Color: string;
    l2Slug?: string;
    l2Title?: string;
};

type Props = {
    taxonomy: TaxonomyTree;
    activeCat?: string; // L1 slug
    activeTag?: string; // L2 or L3 slug
    initialQuery?: string;
};

export default function GlobalSearchBar({ taxonomy, activeCat, activeTag, initialQuery }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tDiscover = useTranslations('discovery');
    const tGroup = useTranslations('group');

    const [query, setQuery] = useState(initialQuery || '');
    const [isOpen, setIsOpen] = useState(false);
    const [scopedResults, setScopedResults] = useState<ScopedResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten taxonomy for active tag lookup
    const searchableItems = useMemo<FlatCategory[]>(() => {
        const items: FlatCategory[] = [];
        for (const l1 of taxonomy) {
            for (const l2 of l1.subcategories) {
                items.push({
                    id: l2.id,
                    slug: l2.slug,
                    title: l2.title,
                    level: 2,
                    l1Slug: l1.slug,
                    l1Title: l1.title,
                    l1Color: l1.color
                });

                for (const l3 of l2.tags) {
                    items.push({
                        id: l3.id,
                        slug: l3.slug,
                        title: l3.title,
                        level: 3,
                        l1Slug: l1.slug,
                        l1Title: l1.title,
                        l1Color: l1.color,
                        l2Slug: l2.slug,
                        l2Title: l2.title
                    });
                }
            }
        }
        return items;
    }, [taxonomy]);

    const activeL1 = useMemo(() =>
        taxonomy.find(c => c.slug === activeCat),
        [taxonomy, activeCat]);

    const activeTagItem = useMemo(() =>
        searchableItems.find(i => i.slug === activeTag && i.level !== 1),
        [searchableItems, activeTag]);

    // Handle Contextual Search with Debounce
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setScopedResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const locale = pathname.split('/')[1] || 'en';
                const results = await searchContextual(query, locale, activeCat, activeTag);
                setScopedResults(results);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, activeCat, activeTag, pathname]);

    // Popular/Suggested L2 Categories
    const suggestions = useMemo<FlatCategory[]>(() => {
        if (activeL1) {
            return activeL1.subcategories.map(l2 => ({
                id: l2.id,
                slug: l2.slug,
                title: l2.title,
                level: 2 as const,
                l1Slug: activeL1.slug,
                l1Title: activeL1.title,
                l1Color: activeL1.color
            }));
        }
        const allL2s: FlatCategory[] = [];
        taxonomy.forEach(l1 => {
            l1.subcategories.slice(0, 2).forEach(l2 => {
                allL2s.push({
                    id: l2.id,
                    slug: l2.slug,
                    title: l2.title,
                    level: 2,
                    l1Slug: l1.slug,
                    l1Title: l1.title,
                    l1Color: l1.color
                });
            });
        });
        return allL2s.slice(0, 8);
    }, [activeL1, taxonomy]);

    const updateParams = useCallback((params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        router.push(`${pathname}?${newParams.toString()}`);
    }, [router, pathname, searchParams]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        // Global search escape hatch
        updateParams({ q: query || null, cat: null, tag: null });
        setIsOpen(false);
    };

    const selectItem = (item: ScopedResult) => {
        if (item.type === 'category') {
            updateParams({ cat: item.l1Slug, tag: item.slug, q: null });
        } else if (item.type === 'event') {
            if (item.l1Slug && item.groupSlug) {
                router.push(`/${pathname.split('/')[1]}/${item.l1Slug}/group/${item.groupSlug}/events/${item.slug}`);
            } else {
                // Let the resolver handle it
                router.push(`/${pathname.split('/')[1]}/groups/${item.groupSlug}/events/${item.slug}`);
            }
        } else {
            if (item.l1Slug) {
                router.push(`/${pathname.split('/')[1]}/${item.l1Slug}/group/${item.slug}`);
            } else {
                // Let the resolver handle it
                router.push(`/${pathname.split('/')[1]}/groups/${item.slug}`);
            }
        }
        setQuery('');
        setIsOpen(false);
    };

    const clearCat = () => updateParams({ cat: null, tag: null });
    const clearTag = () => updateParams({ tag: null });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const accentColor = activeL1?.color || '#6366f1';
    const Icon = activeL1 ? getCategoryIcon(activeL1.slug) : Search;

    return (
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto flex items-center justify-center">
            <div className="relative w-full">
                <form
                    onSubmit={handleSearch}
                    className={clsx(
                        "flex items-center gap-2 rounded-[2rem] border-2 bg-surface px-6 py-3 transition-all duration-300 shadow-sm",
                        isOpen ? "border-[var(--accent)] ring-8 ring-[var(--accent)]/5" : "border-border hover:border-border-hover hover:shadow-md"
                    )}
                    style={{ '--accent': accentColor } as React.CSSProperties}
                >
                    {activeL1 && (
                        <div
                            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-sm animate-in slide-in-from-left-2"
                            style={{ backgroundColor: activeL1.color }}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="whitespace-nowrap hidden sm:inline">{activeL1.title}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearCat(); }}
                                className="ml-0.5 hover:bg-black/15 rounded-full p-0.5 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    {activeTagItem && (
                        <div
                            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold animate-in slide-in-from-left-2"
                            style={{
                                borderColor: accentColor,
                                color: accentColor,
                                backgroundColor: `${accentColor}15`
                            }}
                        >
                            <span>{activeTagItem.title}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearTag(); }}
                                className="hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    <Search className="h-5 w-5 shrink-0 text-foreground-muted ml-1" />

                    <input
                        type="text"
                        className="flex-1 bg-transparent py-1 text-base font-medium text-foreground placeholder:text-foreground-muted focus:outline-none text-left"
                        placeholder={searchParams.get('tab') === 'events' ? 'Search events...' : tDiscover('searchPlaceholder')}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); setScopedResults([]); }}
                            className="p-1 rounded-full hover:bg-surface-elevated transition-colors text-foreground-muted"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {isOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-[2.5rem] border border-border bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-4">
                        <div className="p-3">
                            {query.trim() ? (
                                scopedResults.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted opacity-40">
                                            {activeL1 ? `RESULTS IN ${activeL1.title.toUpperCase()}` : 'RESULTS'}
                                        </div>
                                        {scopedResults.map((item) => {
                                            const ResultIcon = item.type === 'category' ? getCategoryIcon(item.l1Slug) : (item.type === 'event' ? Calendar : Users);
                                            return (
                                                <button
                                                    key={`${item.type}-${item.id}`}
                                                    onClick={() => selectItem(item)}
                                                    className="flex items-center gap-4 rounded-[1.5rem] px-5 py-3.5 text-left transition-all hover:bg-surface-elevated group"
                                                >
                                                    <div
                                                        className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm shrink-0 overflow-hidden"
                                                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                                    >
                                                        {item.image ? (
                                                            <img src={item.image || undefined} alt={item.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ResultIcon className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-black text-foreground truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider truncate">
                                                            {item.type === 'category'
                                                                ? (item.level === 3 ? `${item.l1Slug} • ${item.l2Slug}` : item.l1Slug)
                                                                : (item.type === 'event' ? `${item.subtitle}` : `${item.subtitle} • ${tGroup('members')}`)}
                                                        </span>
                                                    </div>
                                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                                        <ChevronDown className="h-4 w-4 -rotate-90 text-foreground-muted" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-5 py-4 text-sm text-foreground-muted font-medium italic">
                                        {isLoading ? 'Searching...' : `No results found in ${activeL1?.title || 'this category'}`}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <div className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted opacity-40">
                                        {activeL1 ? `${activeL1.title.toUpperCase()} SUB-CATEGORIES` : tDiscover('browseCategories').toUpperCase()}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {suggestions.map((item) => {
                                            const SuggestIcon = getCategoryIcon(item.l1Slug);
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => selectItem({
                                                        type: 'category',
                                                        id: item.id,
                                                        slug: item.slug,
                                                        title: item.title,
                                                        l1Slug: item.l1Slug,
                                                        color: item.l1Color
                                                    })}
                                                    className="flex items-center gap-3 rounded-2xl px-5 py-3 text-left transition-all hover:bg-surface-elevated group"
                                                >
                                                    <div
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: `${item.l1Color}15`, color: item.l1Color }}
                                                    >
                                                        <SuggestIcon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">
                                                        {item.title}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {query.trim() && (
                                <div className="mt-2 border-t border-border pt-2">
                                    <button
                                        onClick={() => handleSearch()}
                                        className="flex w-full items-center gap-4 rounded-[1.5rem] px-5 py-4 text-left transition-all hover:bg-surface-elevated group"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg group-hover:scale-110 transition-transform">
                                            <Search className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-foreground">
                                                Search globally for "{query}"
                                            </span>
                                            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                                                Search in all categories
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
