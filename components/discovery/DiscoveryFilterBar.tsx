'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useRef, useEffect, useMemo, useTransition } from 'react';
import {
    ChevronDown, Search, X, MapPin, Users, Calendar, LayoutGrid, List,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getCategoryIcon } from '@/lib/icons';
import { CITIES } from '@/lib/constants';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import type { ScopedResult } from '@/lib/types/discovery';
import { searchContextual } from '@/actions/discovery-actions';
import { Link } from '@/i18n/routing';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    taxonomy: TaxonomyTree;
    activeCat?: string;
    activeTags?: string[];
    initialQuery?: string;
    locale: string;
    currentView: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
};

// ─── Helper: tag-aware query string builder ───────────────────────────────────

function useQueryString() {
    const searchParams = useSearchParams();

    const build = useCallback(
        (params: Record<string, string | null>) => {
            const next = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') next.delete(key);
                else next.set(key, value);
            });
            return next.toString().replace(/%2C/g, ',');
        },
        [searchParams]
    );

    const addTag = useCallback(
        (slug: string) => {
            const raw = searchParams.get('tags') ?? '';
            const current = raw ? raw.split(',').filter(Boolean) : [];
            if (current.includes(slug)) return build({});
            return build({ tags: [...current, slug].join(',') });
        },
        [searchParams, build]
    );

    const removeTag = useCallback(
        (slug: string) => {
            const raw = searchParams.get('tags') ?? '';
            const next = raw.split(',').filter((s) => s && s !== slug);
            return build({ tags: next.length ? next.join(',') : null });
        },
        [searchParams, build]
    );

    return { build, addTag, removeTag };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DiscoveryFilterBar({
    taxonomy,
    activeCat,
    activeTags = [],
    initialQuery,
    locale,
    currentView,
    onViewChange,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { build, addTag, removeTag } = useQueryString();
    const tDiscover = useTranslations('discovery');
    const tSidebar = useTranslations('shell.sidebar');
    const [, startTransition] = useTransition();

    const currentTab = searchParams.get('tab') || 'groups';
    const city = searchParams.get('city') || 'all';

    // ── Search state ────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState(initialQuery || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownResults, setDropdownResults] = useState<ScopedResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── L3 dropdown state ───────────────────────────────────────────────────
    const [openL3Dropdown, setOpenL3Dropdown] = useState<string | null>(null);
    const l3DropdownRef = useRef<HTMLDivElement>(null);

    // ── Derived ─────────────────────────────────────────────────────────────
    const activeL1 = useMemo(
        () => taxonomy.find((c) => c.slug === activeCat),
        [taxonomy, activeCat]
    );
    const accentColor = activeL1?.color || '#6366f1';

    // Tags that are selected AND belong to active L1 (for left-section chips)
    const activeL1TagSlugs = useMemo(() => {
        if (!activeL1) return new Set<string>();
        const allL2Slugs = activeL1.subcategories.map((l2) => l2.slug);
        const allL3Slugs = activeL1.subcategories.flatMap((l2) => l2.tags.map((t) => t.slug));
        return new Set([...allL2Slugs, ...allL3Slugs]);
    }, [activeL1]);

    const selectedTagObjects = useMemo(() => {
        if (!activeL1) return [];
        return activeTags
            .filter((slug) => activeL1TagSlugs.has(slug))
            .map((slug) => {
                for (const l2 of activeL1.subcategories) {
                    if (l2.slug === slug) return { id: l2.id, slug: l2.slug, title: l2.title };
                    const l3 = l2.tags.find((t) => t.slug === slug);
                    if (l3) return { id: l3.id, slug: l3.slug, title: l3.title };
                }
                return null;
            })
            .filter((t): t is { id: string; slug: string; title: string } => t !== null);
    }, [activeTags, activeL1, activeL1TagSlugs]);

    // ── Search dropdown: live search ─────────────────────────────────────────
    useEffect(() => {
        if (searchQuery.length < 2) {
            setIsDropdownOpen(false);
            setDropdownResults([]);
            return;
        }

        setIsDropdownOpen(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchContextual(searchQuery, locale, activeCat);
                setDropdownResults(results);
            } catch {
                setDropdownResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, locale, activeCat]);

    // ── Close dropdowns on outside click ────────────────────────────────────
    useEffect(() => {
        function onMousedown(e: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (l3DropdownRef.current && !l3DropdownRef.current.contains(e.target as Node)) {
                setOpenL3Dropdown(null);
            }
        }
        document.addEventListener('mousedown', onMousedown);
        return () => document.removeEventListener('mousedown', onMousedown);
    }, []);

    // ── Escape key closes both dropdowns ────────────────────────────────────
    useEffect(() => {
        function onKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setIsDropdownOpen(false);
                setOpenL3Dropdown(null);
            }
        }
        document.addEventListener('keydown', onKeydown);
        return () => document.removeEventListener('keydown', onKeydown);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const push = (qs: string) =>
        startTransition(() => router.push(`${pathname}?${qs}`));

    const handleClearCategory = () => push(build({ category: null, tags: null }));

    const handleAddTag = (slug: string) => push(addTag(slug));
    const handleRemoveTag = (slug: string) => push(removeTag(slug));
    const handleClearTags = () => push(build({ tags: null }));

    const handleCityChange = (val: string) =>
        push(build({ city: val === 'all' ? null : val }));

    const handleTabChange = (tab: 'groups' | 'events') =>
        push(build({ tab }));

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDropdownOpen(false);
        push(build({ q: searchQuery || null }));
    };

    const handleTopicSelect = (result: ScopedResult) => {
        setIsDropdownOpen(false);
        const raw = searchParams.get('tags') ?? '';
        const currentTags = raw ? raw.split(',').filter(Boolean) : [];
        if (currentTags.includes(result.slug)) {
            push(build({ category: result.l1Slug || activeCat || null }));
        } else {
            push(build({ category: result.l1Slug || activeCat || null, tags: [...currentTags, result.slug].join(',') }));
        }
    };

    // ── Dropdown results split ────────────────────────────────────────────────
    const tagResults = dropdownResults.filter((r) => r.type === 'category');
    const entityResults = dropdownResults.filter((r) => r.type === 'group' || r.type === 'event');

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-3">

            {/* ── Row 1: Search + City + Tab toggle + View toggle ─────────────── */}
            <div className="flex items-center gap-2">

                {/* Search input — always visible, flex-1 */}
                <div ref={searchContainerRef} className="relative flex-1 min-w-0">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setIsDropdownOpen(true)}
                            placeholder={tDiscover('searchInputPlaceholder')}
                            className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 placeholder:text-foreground-muted transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setIsDropdownOpen(false);
                                    push(build({ q: null }));
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
                                aria-label={tDiscover('clearTag')}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Live search dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border bg-surface shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                            {isSearching && (
                                <div className="px-4 py-3 text-sm text-foreground-muted">
                                    {/* skeleton shimmer */}
                                    <div className="flex flex-col gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-4 w-full animate-pulse rounded bg-surface-elevated" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isSearching && dropdownResults.length === 0 && (
                                <div className="px-4 py-3 text-sm text-foreground-muted">
                                    {/* no results — keep dropdown subtle */}
                                </div>
                            )}

                            {!isSearching && (
                                <>
                                    {/* Topics section */}
                                    {tagResults.length > 0 && (
                                        <div>
                                            <div className="px-4 pt-3 pb-1">
                                                <span className="text-[10px] font-bold tracking-wider text-foreground-muted uppercase">
                                                    {tDiscover('topicsSection')}
                                                </span>
                                            </div>
                                            {tagResults.map((result) => (
                                                <button
                                                    key={result.id}
                                                    type="button"
                                                    onClick={() => handleTopicSelect(result)}
                                                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-elevated transition-colors"
                                                >
                                                    <span
                                                        className="h-2 w-2 shrink-0 rounded-full"
                                                        style={{ backgroundColor: result.color }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                                        {result.subtitle && (
                                                            <p className="text-xs text-foreground-muted truncate">{result.subtitle}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Groups & Events section */}
                                    {entityResults.length > 0 && (
                                        <div>
                                            {tagResults.length > 0 && <div className="h-px bg-border mx-4" />}
                                            <div className="px-4 pt-3 pb-1">
                                                <span className="text-[10px] font-bold tracking-wider text-foreground-muted uppercase">
                                                    {tDiscover('groupsEventsSection')}
                                                </span>
                                            </div>
                                            {entityResults.map((result) => {
                                                const href = result.type === 'group'
                                                    ? `/${result.l1Slug}/group/${result.slug}`
                                                    : `/${result.l1Slug}/group/${result.groupSlug}/events/${result.slug}`;
                                                return (
                                                    <Link
                                                        key={result.id}
                                                        href={href}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex w-full items-center gap-3 px-4 py-2 hover:bg-surface-elevated transition-colors"
                                                    >
                                                        {result.image ? (
                                                            <img
                                                                src={result.image}
                                                                alt=""
                                                                className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <span
                                                                className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                                style={{ backgroundColor: result.color }}
                                                            >
                                                                {result.title.charAt(0)}
                                                            </span>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                                            {result.subtitle && (
                                                                <p className="text-xs text-foreground-muted truncate">{result.subtitle}</p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {tagResults.length === 0 && entityResults.length === 0 && searchQuery.length >= 2 && !isSearching && null}
                                </>
                            )}
                            <div className="h-2" />
                        </div>
                    )}
                </div>

                {/* City dropdown — shrink-0 */}
                <div className="relative group h-9 flex items-center shrink-0">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <select
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="h-full appearance-none rounded-lg border border-border bg-surface pl-7 pr-6 text-xs font-semibold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer hover:bg-surface-elevated"
                    >
                        <option value="all">{tSidebar('anyCity')}</option>
                        {CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted pointer-events-none" />
                </div>

                {/* Groups / Events toggle — shrink-0 */}
                <div className="flex h-9 bg-surface-elevated/50 p-0.5 rounded-lg border border-border shrink-0">
                    <button
                        onClick={() => handleTabChange('groups')}
                        className={clsx(
                            'flex items-center justify-center gap-1.5 px-3 text-xs font-bold rounded-md transition-all',
                            currentTab === 'groups' ? 'bg-background text-primary shadow-premium' : 'text-foreground-muted hover:text-foreground'
                        )}
                    >
                        <Users className={clsx('h-3.5 w-3.5', currentTab === 'groups' ? 'text-primary' : 'text-foreground-muted')} />
                        <span className="hidden lg:inline">{tSidebar('groups')}</span>
                    </button>
                    <button
                        onClick={() => handleTabChange('events')}
                        className={clsx(
                            'flex items-center justify-center gap-1.5 px-3 text-xs font-bold rounded-md transition-all',
                            currentTab === 'events' ? 'bg-background text-primary shadow-premium' : 'text-foreground-muted hover:text-foreground'
                        )}
                    >
                        <Calendar className={clsx('h-3.5 w-3.5', currentTab === 'events' ? 'text-primary' : 'text-foreground-muted')} />
                        <span className="hidden lg:inline">{tSidebar('events')}</span>
                    </button>
                </div>

                {/* View toggle — shrink-0 */}
                <div className="flex h-9 items-center gap-1 rounded-lg border border-border bg-surface p-1 shrink-0">
                    <button
                        onClick={() => onViewChange('grid')}
                        className={clsx(
                            'flex items-center justify-center rounded-md p-1.5 transition-colors',
                            currentView === 'grid' ? 'text-primary bg-surface-elevated shadow-sm' : 'text-foreground-muted hover:text-foreground'
                        )}
                        aria-label={tDiscover('gridView')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('list')}
                        className={clsx(
                            'flex items-center justify-center rounded-md p-1.5 transition-colors',
                            currentView === 'list' ? 'text-primary bg-surface-elevated shadow-sm' : 'text-foreground-muted hover:text-foreground'
                        )}
                        aria-label={tDiscover('listView')}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Row 2: Active filters + Browse chips (only when L1 active) ──── */}
            {activeL1 && activeL1.subcategories.length > 0 && (
                <div className="flex items-center gap-2 min-w-0 animate-in slide-in-from-top-2 fade-in duration-200">

                    {/* Left section: L1 chip + selected L2 chips */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* L1 chip */}
                        <div
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                            style={{ backgroundColor: activeL1.color, color: '#fff' }}
                        >
                            {(() => { const Icon = getCategoryIcon(activeL1.slug); return <Icon className="h-4 w-4" />; })()}
                            <span className="hidden sm:inline">{activeL1.title}</span>
                            <button
                                type="button"
                                onClick={handleClearCategory}
                                className="ml-0.5 flex items-center justify-center rounded-full p-0.5 opacity-80 hover:opacity-100 transition-opacity"
                                aria-label={tDiscover('clearCategory')}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Selected L2 chips */}
                        {selectedTagObjects.map((tag) => (
                            <div
                                key={tag.slug}
                                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold animate-in slide-in-from-left-2 fade-in duration-150 shrink-0"
                                style={{
                                    backgroundColor: `${accentColor}1A`,
                                    color: accentColor,
                                    borderColor: accentColor,
                                }}
                            >
                                <span>{tag.title}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag.slug)}
                                    className="flex items-center justify-center rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity"
                                    aria-label={tDiscover('clearTag')}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {/* Divider — only if some tags are selected */}
                        {selectedTagObjects.length > 0 && (
                            <div className="border-r border-border h-6 mx-1 shrink-0" />
                        )}
                    </div>

                    {/* Right section: Browse chips (horizontal scroll) */}
                    <div
                        ref={l3DropdownRef}
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-linear-fade pb-1 flex-1 min-w-0"
                    >
                        {/* L2 browse chips */}
                        {activeL1.subcategories
                            .filter(l2 => !activeTags.includes(l2.slug))
                            .map((l2) => {
                                const isSelected = activeTags.includes(l2.slug);
                                const hasChildren = l2.tags && l2.tags.length > 0;
                                const isOpen = openL3Dropdown === l2.id;

                                return (
                                    <div key={l2.id} className="relative shrink-0">
                                        <button
                                            onClick={() => {
                                                if (hasChildren) {
                                                    setOpenL3Dropdown(isOpen ? null : l2.id);
                                                } else {
                                                    handleAddTag(l2.slug);
                                                }
                                            }}
                                            style={isSelected ? {
                                                backgroundColor: `${accentColor}1A`,
                                                color: accentColor,
                                                borderColor: accentColor,
                                            } : undefined}
                                            className={clsx(
                                                'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all soft-press',
                                                isSelected
                                                    ? ''
                                                    : 'border-border text-foreground hover:border-foreground'
                                            )}
                                        >
                                            <span>{l2.title}</span>
                                            {hasChildren && (
                                                <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
                                            )}
                                        </button>

                                        {/* L3 dropdown */}
                                        {hasChildren && isOpen && (
                                            <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                                                <button
                                                    onClick={() => { handleAddTag(l2.slug); setOpenL3Dropdown(null); }}
                                                    className={clsx(
                                                        'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated flex items-center justify-between',
                                                        activeTags.includes(l2.slug) ? 'font-bold' : 'font-medium text-foreground'
                                                    )}
                                                    style={activeTags.includes(l2.slug) ? { color: accentColor } : undefined}
                                                >
                                                    {tDiscover('anyCategory', { category: l2.title })}
                                                </button>
                                                <div className="my-1 h-px w-full bg-border" />
                                                <div className="flex max-h-60 flex-col overflow-y-auto">
                                                    {l2.tags.map((l3) => {
                                                        const l3Active = activeTags.includes(l3.slug);
                                                        return (
                                                            <button
                                                                key={l3.id}
                                                                onClick={() => { handleAddTag(l3.slug); setOpenL3Dropdown(null); }}
                                                                className={clsx(
                                                                    'rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated',
                                                                    l3Active ? 'font-bold' : 'text-foreground'
                                                                )}
                                                                style={l3Active ? { color: accentColor } : undefined}
                                                            >
                                                                {l3.title}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}
