'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Plus, ChevronRight, Check } from 'lucide-react';
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
};

export type TaxonomySelection =
    | { kind: 'existing'; categoryId: string; l1Color: string; label: string }
    | { kind: 'wildcard'; wildcardLabel: string; wildcardParentId: string; l1Color: string };

type Props = {
    taxonomy: TaxonomyTree;
    value: TaxonomySelection | null;
    onChange: (value: TaxonomySelection | null) => void;
    accentColor?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaxonomyPicker({ taxonomy, value, onChange, accentColor }: Props) {
    const t = useTranslations('wizard');
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [wildcardMode, setWildcardMode] = useState(false);
    const [wildcardParent, setWildcardParent] = useState<{ id: string; title: string; color: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten all L3 tags for search
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
                });

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
                    });
                }
            }
        }
        return result;
    }, [taxonomy]);

    // Search results — match against L3 tags (and L2/L1 titles)
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
    const showWildcardPrompt = query.trim().length >= 2;

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setWildcardMode(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function selectTag(tag: FlatTag) {
        onChange({
            kind: 'existing',
            categoryId: tag.id,
            l1Color: tag.l1Color,
            label: tag.title,
        });
        setQuery(tag.title);
        setIsOpen(false);
        setWildcardMode(false);
    }

    function confirmWildcard(parent: { id: string; title: string; color: string }) {
        onChange({
            kind: 'wildcard',
            wildcardLabel: query.trim(),
            wildcardParentId: parent.id,
            l1Color: parent.color,
        });
        setWildcardParent(parent);
        setIsOpen(false);
        setWildcardMode(false);
    }

    function clear() {
        setQuery('');
        setWildcardParent(null);
        onChange(null);
        inputRef.current?.focus();
        setIsOpen(true);
    }

    // Determine all L1+L2 parents for wildcard picker
    const parentOptions = useMemo(() => {
        const opts: { id: string; title: string; color: string; level: number }[] = [];
        for (const l1 of taxonomy) {
            opts.push({ id: l1.id, title: l1.title, color: l1.color, level: 1 });
            for (const l2 of l1.subcategories) {
                opts.push({ id: l2.id, title: l2.title, color: l1.color, level: 2 });
            }
        }
        return opts;
    }, [taxonomy]);

    const accent = accentColor ?? '#6366f1';
    const isSelected = !!value;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input */}
            <div
                className="flex items-center gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow"
                style={{ borderColor: isOpen ? accent : undefined }}
            >
                <Search className="h-4 w-4 shrink-0 text-foreground-muted" strokeWidth={1.75} />
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                    placeholder={t('pickerPlaceholder')}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setWildcardMode(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    aria-label={t('pickerPlaceholder')}
                    aria-expanded={isOpen}
                    role="combobox"
                    aria-autocomplete="list"
                />
                {query && (
                    <button onClick={clear} className="text-foreground-muted hover:text-foreground" aria-label="Clear">
                        <X className="h-4 w-4" />
                    </button>
                )}
                {isSelected && (
                    <span
                        className="shrink-0 rounded-full p-0.5"
                        style={{ color: accent }}
                    >
                        <Check className="h-4 w-4" />
                    </span>
                )}
            </div>

            {/* Selected badge */}
            {isSelected && !isOpen && (
                <div
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                    <span className="flex-1">
                        {value?.kind === 'existing' ? value.label : `"${value?.wildcardLabel}" (${t('pendingReview')})`}
                    </span>
                    <button onClick={clear} className="opacity-60 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface shadow-premium">

                    {/* No query yet → browse by L1 */}
                    {!query.trim() && (
                        <div className="p-2">
                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                                {t('browseCategories')}
                            </p>
                            {taxonomy.map((l1) => (
                                <L1Row key={l1.id} l1={l1} onSelectTag={selectTag} />
                            ))}
                        </div>
                    )}

                    {/* Search results */}
                    {query.trim() && hasResults && (
                        <ul className="max-h-64 overflow-y-auto p-2" role="listbox">
                            {results.map((tag) => (
                                <li key={tag.id} role="option" aria-selected={value?.kind === 'existing' && value.categoryId === tag.id}>
                                    <button
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-elevated"
                                        onClick={() => selectTag(tag)}
                                    >
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: tag.l1Color }}
                                        />
                                        <span className="flex-1 font-medium text-foreground">{tag.title}</span>
                                        <span className="text-xs text-foreground-muted">{tag.l1Title} › {tag.l2Title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Wildcard prompt */}
                    {showWildcardPrompt && !wildcardMode && (
                        <div className="p-3">
                            <p className="mb-2 text-sm text-foreground-muted">
                                {t('noMatch')} <span className="font-semibold text-foreground">"{query}"</span>
                            </p>
                            <button
                                className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                                onClick={() => setWildcardMode(true)}
                            >
                                <Plus className="h-4 w-4" />
                                {t('createInterest', { label: query })}
                            </button>
                        </div>
                    )}

                    {/* Wildcard parent picker */}
                    {wildcardMode && (
                        <div className="p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                                {t('chooseParent')}
                            </p>
                            <div className="max-h-56 overflow-y-auto space-y-0.5">
                                {parentOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        className={clsx(
                                            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated',
                                            opt.level === 2 && 'pl-7'
                                        )}
                                        onClick={() => confirmWildcard(opt)}
                                    >
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: opt.color }}
                                        />
                                        <span className={clsx(opt.level === 1 ? 'font-semibold' : 'font-normal')}>
                                            {opt.title}
                                        </span>
                                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-foreground-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── L1 Row with expandable L2/L3 ─────────────────────────────────────────────

function L1Row({
    l1,
    onSelectTag,
}: {
    l1: L1Category;
    onSelectTag: (tag: FlatTag) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-surface-elevated"
                onClick={() => setExpanded((v) => !v)}
            >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l1.color }} />
                <span className="flex-1 text-left">{l1.title}</span>
                <ChevronRight
                    className={clsx('h-4 w-4 text-foreground-muted transition-transform', expanded && 'rotate-90')}
                />
            </button>
            {expanded &&
                l1.subcategories.map((l2) => (
                    <L2Row key={l2.id} l2={l2} l1Color={l1.color} l1Id={l1.id} l1Title={l1.title} onSelectTag={onSelectTag} />
                ))}
        </div>
    );
}

function L2Row({
    l2,
    l1Color,
    l1Id,
    l1Title,
    onSelectTag,
}: {
    l2: L2Category;
    l1Color: string;
    l1Id: string;
    l1Title: string;
    onSelectTag: (tag: FlatTag) => void;
}) {
    return (
        <div className="pl-4">
            <button
                className="mb-1 rounded-md px-2 py-1 text-left text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors"
                onClick={() =>
                    onSelectTag({ id: l2.id, title: l2.title, slug: l2.slug, l1Id, l1Title, l1Color, l2Id: l2.id, l2Title: l2.title })
                }
            >
                {l2.title}
            </button>
            <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                {l2.tags.map((tag) => (
                    <button
                        key={tag.id}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground-muted transition-colors hover:border-transparent hover:text-white"
                        style={{ ['--tag-hover-bg' as string]: l1Color }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = l1Color;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                        }}
                        onClick={() =>
                            onSelectTag({ id: tag.id, title: tag.title, slug: tag.slug, l1Id, l1Title, l1Color, l2Id: l2.id, l2Title: l2.title })
                        }
                    >
                        {tag.title}
                    </button>
                ))}
                {l2.tags.length === 0 && (
                    <span className="text-xs text-foreground-muted italic">No tags yet</span>
                )}
            </div>
        </div>
    );
}
