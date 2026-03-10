'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { L1Category, L2Category, TaxonomyTree } from '@/lib/services/taxonomy.service';

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

export type TaxonomySelection = {
    kind: 'existing';
    categoryId: string;
    l1Color: string;
    label: string;
};

type Props = {
    taxonomy: TaxonomyTree;
    value: TaxonomySelection | null;
    onChange: (value: TaxonomySelection | null) => void;
};

export default function TaxonomyPicker({ taxonomy, value, onChange }: Props) {
    const t = useTranslations('wizard');
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const flatTags = useMemo<FlatTag[]>(() => {
        const result: FlatTag[] = [];
        for (const l1 of taxonomy) {
            for (const l2 of l1.subcategories) {
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

    const results = useMemo<FlatTag[]>(() => {
        if (!query.trim()) {
            return [];
        }

        const normalized = query.toLowerCase();
        return flatTags.filter(
            (tag) =>
                tag.title.toLowerCase().includes(normalized) ||
                tag.l2Title.toLowerCase().includes(normalized) ||
                tag.l1Title.toLowerCase().includes(normalized)
        );
    }, [flatTags, query]);

    useEffect(() => {
        function onMouseDown(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    function selectTag(tag: FlatTag): void {
        onChange({
            kind: 'existing',
            categoryId: tag.id,
            l1Color: tag.l1Color,
            label: tag.title,
        });
        setQuery(tag.title);
        setIsOpen(false);
    }

    function clearSelection(): void {
        setQuery('');
        onChange(null);
        setIsOpen(true);
        inputRef.current?.focus();
    }

    const isSelected = value !== null;
    const activeAccent = value?.l1Color ?? 'var(--accent)';
    const listboxId = 'taxonomy-picker-listbox';

    return (
        <div ref={containerRef} className="relative w-full">
            <div
                className="flex items-center gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow"
                style={{ borderColor: isOpen ? activeAccent : undefined }}
            >
                <Search className="h-4 w-4 shrink-0 text-foreground-muted" strokeWidth={1.75} />
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                    placeholder={t('pickerPlaceholder')}
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                        }
                    }}
                    aria-label={t('pickerPlaceholder')}
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    role="combobox"
                    aria-autocomplete="list"
                />
                {query ? (
                    <button type="button" onClick={clearSelection} className="text-foreground-muted hover:text-foreground" aria-label={t('cancel')}>
                        <X className="h-4 w-4" />
                    </button>
                ) : null}
                {isSelected ? (
                    <span className="shrink-0 rounded-full p-0.5" style={{ color: activeAccent }}>
                        <Check className="h-4 w-4" />
                    </span>
                ) : null}
            </div>

            {isSelected && !isOpen ? (
                <div
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: `${activeAccent}18`, color: activeAccent }}
                >
                    <span className="flex-1">{value?.label}</span>
                    <button type="button" onClick={clearSelection} className="opacity-60 hover:opacity-100" aria-label={t('cancel')}>
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : null}

            {isOpen ? (
                <div id={listboxId} className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface shadow-premium">
                    {!query.trim() ? (
                        <div className="p-2">
                            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                                {t('browseCategories')}
                            </p>
                            {taxonomy.map((l1) => (
                                <L1Row key={l1.id} l1={l1} onSelectTag={selectTag} />
                            ))}
                        </div>
                    ) : null}

                    {query.trim() ? (
                        results.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto p-2" role="listbox">
                                {results.map((tag) => (
                                    <li key={tag.id} role="option" aria-selected={value?.categoryId === tag.id}>
                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-elevated"
                                            onClick={() => selectTag(tag)}
                                        >
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.l1Color }} />
                                            <span className="flex-1 font-medium text-foreground">{tag.title}</span>
                                            <span className="text-xs text-foreground-muted">{tag.l1Title} - {tag.l2Title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-3 text-sm text-foreground-muted">{t('noMatch')} &quot;{query.trim()}&quot;</div>
                        )
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function L1Row({ l1, onSelectTag }: { l1: L1Category; onSelectTag: (tag: FlatTag) => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-surface-elevated"
                onClick={() => setExpanded((prev) => !prev)}
            >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l1.color }} />
                <span className="flex-1 text-left">{l1.title}</span>
                <ChevronRight className={clsx('h-4 w-4 text-foreground-muted transition-transform', expanded && 'rotate-90')} />
            </button>
            {expanded
                ? l1.subcategories.map((l2) => (
                    <L2Row key={l2.id} l2={l2} l1Color={l1.color} l1Id={l1.id} l1Title={l1.title} onSelectTag={onSelectTag} />
                ))
                : null}
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
                type="button"
                className="mb-1 rounded-md px-2 py-1 text-left text-xs font-semibold text-foreground transition-colors hover:bg-surface-elevated"
                onClick={() =>
                    onSelectTag({
                        id: l2.id,
                        title: l2.title,
                        slug: l2.slug,
                        l1Id,
                        l1Title,
                        l1Color,
                        l2Id: l2.id,
                        l2Title: l2.title,
                    })
                }
            >
                {l2.title}
            </button>
            <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                {l2.tags.map((tag) => (
                    <button
                        key={tag.id}
                        type="button"
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground-muted transition-colors hover:border-transparent hover:text-white"
                        onMouseEnter={(event) => {
                            event.currentTarget.style.backgroundColor = l1Color;
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.backgroundColor = '';
                        }}
                        onClick={() =>
                            onSelectTag({
                                id: tag.id,
                                title: tag.title,
                                slug: tag.slug,
                                l1Id,
                                l1Title,
                                l1Color,
                                l2Id: l2.id,
                                l2Title: l2.title,
                            })
                        }
                    >
                        {tag.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
