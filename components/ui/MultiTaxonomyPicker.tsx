'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { TaxonomyTree, L1Category, L2Category } from '@/actions/taxonomy-actions';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatTag = {
    id: string;
    title: string;
    slug: string;
    l1Id: string;
    l1Title: string;
    l1Color: string;
    l2Id: string;
    l2Title: string;
    level: number;
};

type Props = {
    taxonomy: TaxonomyTree;
    value: string[]; // Array of selected category IDs
    onChange: (value: string[]) => void;
    accentColor?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MultiTaxonomyPicker({ taxonomy, value, onChange, accentColor }: Props) {
    const t = useTranslations('wizard');
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten tags for search (including L2s)
    const flatTags = useMemo<FlatTag[]>(() => {
        const result: FlatTag[] = [];
        for (const l1 of taxonomy) {
            for (const l2 of l1.subcategories) {
                // Add L2 itself
                result.push({
                    id: l2.id,
                    title: l2.title,
                    slug: l2.slug,
                    l1Id: l1.id,
                    l1Title: l1.title,
                    l1Color: l1.color,
                    l2Id: l2.id,
                    l2Title: l2.title,
                    level: 2
                });
                // Add L3s
                for (const tag of l2.tags) {
                    result.push({
                        id: tag.id,
                        title: tag.title,
                        slug: tag.slug,
                        l1Id: l1.id,
                        l1Title: l1.title,
                        l1Color: l1.color,
                        l2Id: l2.id,
                        l2Title: l2.title,
                        level: 3
                    });
                }
            }
        }
        return result;
    }, [taxonomy]);

    // Search results match against L2/L3 tags
    const results = useMemo<FlatTag[]>(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return flatTags.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.l2Title.toLowerCase().includes(q) ||
                t.l1Title.toLowerCase().includes(q)
        );
    }, [query, flatTags]);

    const hasResults = results.length > 0;

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function toggleTag(tagId: string) {
        if (value.includes(tagId)) {
            onChange(value.filter(id => id !== tagId));
        } else {
            onChange([...value, tagId]);
        }
        // Keep open to select more
        inputRef.current?.focus();
    }

    function removeTag(tagId: string) {
        onChange(value.filter(id => id !== tagId));
    }

    const accent = accentColor ?? '#6366f1';

    // Get selected tag objects to display them as pills
    const selectedTags = useMemo(() => {
        return value.map(id => flatTags.find(t => t.id === id)).filter(Boolean) as FlatTag[];
    }, [value, flatTags]);

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input & Selected Pills */}
            <div
                className="flex flex-col gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow"
                style={{ borderColor: isOpen ? accent : undefined }}
            >
                {/* Selected Pills */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map(tag => (
                            <span
                                key={tag.id}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-white shadow-card"
                                style={{ backgroundColor: tag.l1Color }}
                            >
                                {tag.title}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeTag(tag.id);
                                    }}
                                    className="ml-0.5 rounded-full hover:bg-black/20 p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 shrink-0 text-foreground-muted" strokeWidth={1.75} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                        placeholder="Search for additional topics..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                        onFocus={() => setIsOpen(true)}
                        aria-expanded={isOpen}
                        role="combobox"
                        aria-autocomplete="list"
                    />
                    {query && (
                        <button
                            onClick={(e) => { e.preventDefault(); setQuery(''); inputRef.current?.focus(); }}
                            className="text-foreground-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface shadow-premium">
                    {/* No query yet → browse by L1 */}
                    {!query.trim() && (
                        <div className="p-2">
                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                                Browse Categories
                            </p>
                            {taxonomy.map((l1) => (
                                <L1Row key={l1.id} l1={l1} selectedIds={value} onToggleTag={toggleTag} />
                            ))}
                        </div>
                    )}

                    {/* Search results */}
                    {query.trim() && hasResults && (
                        <ul className="max-h-64 overflow-y-auto p-2" role="listbox">
                            {results.map((tag) => {
                                const isSelected = value.includes(tag.id);
                                return (
                                    <li key={tag.id} role="option" aria-selected={isSelected}>
                                        <button
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-elevated"
                                            onClick={(e) => { e.preventDefault(); toggleTag(tag.id); }}
                                        >
                                            <div
                                                className={clsx(
                                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                                                    isSelected ? "bg-[var(--accent)] border-[var(--accent)]" : "border-foreground-muted bg-transparent"
                                                )}
                                                style={{ ['--accent' as string]: tag.l1Color }}
                                            >
                                                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                            </div>
                                            <span className="flex-1 font-medium text-foreground">{tag.title}</span>
                                            <span className="text-xs text-foreground-muted">
                                                {tag.l1Title} {tag.level === 3 ? `› ${tag.l2Title}` : ''}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {query.trim() && !hasResults && (
                        <div className="p-3">
                            <p className="mb-2 text-sm text-foreground-muted">
                                No topics found matching <span className="font-semibold text-foreground">"{query}"</span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Browsing Rows ─────────────────────────────────────────────

function L1Row({ l1, selectedIds, onToggleTag }: {
    l1: L1Category;
    selectedIds: string[];
    onToggleTag: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-surface-elevated"
                onClick={(e) => { e.preventDefault(); setExpanded((v) => !v); }}
            >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l1.color }} />
                <span className="flex-1 text-left">{l1.title}</span>
                <ChevronRight className={clsx('h-4 w-4 text-foreground-muted transition-transform', expanded && 'rotate-90')} />
            </button>
            {expanded &&
                l1.subcategories.map((l2) => (
                    <L2Row key={l2.id} l2={l2} l1Color={l1.color} selectedIds={selectedIds} onToggleTag={onToggleTag} />
                ))}
        </div>
    );
}

function L2Row({ l2, l1Color, selectedIds, onToggleTag }: {
    l2: L2Category;
    l1Color: string;
    selectedIds: string[];
    onToggleTag: (id: string) => void;
}) {
    return (
        <div className="pl-4">
            <div className="flex items-center gap-2 px-2 py-1">
                <button
                    onClick={(e) => { e.preventDefault(); onToggleTag(l2.id); }}
                    className="flex text-left items-center gap-2 w-full group"
                >
                    <div
                        className={clsx(
                            "flex h-3 w-3 shrink-0 items-center justify-center rounded border transition-colors",
                            selectedIds.includes(l2.id) ? "bg-[var(--accent)] border-[var(--accent)]" : "border-foreground-muted bg-transparent group-hover:border-foreground"
                        )}
                        style={{ ['--accent' as string]: l1Color }}
                    >
                        {selectedIds.includes(l2.id) && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-bold text-foreground">{l2.title}</span>
                </button>
            </div>
            {l2.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2 pl-7 mt-1">
                    {l2.tags.map((tag) => {
                        const isSelected = selectedIds.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                className={clsx(
                                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                                    isSelected ? "text-white border-transparent" : "border-border text-foreground-muted hover:border-transparent hover:text-white"
                                )}
                                style={isSelected ? { backgroundColor: l1Color } : { ['--tag-hover-bg' as string]: l1Color }}
                                onMouseEnter={!isSelected ? (e) => (e.currentTarget.style.backgroundColor = l1Color) : undefined}
                                onMouseLeave={!isSelected ? (e) => (e.currentTarget.style.backgroundColor = '') : undefined}
                                onClick={(e) => { e.preventDefault(); onToggleTag(tag.id); }}
                            >
                                {tag.title}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
