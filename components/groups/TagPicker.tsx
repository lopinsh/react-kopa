'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { L1Category } from '@/actions/taxonomy-actions';
import { useFormContext } from 'react-hook-form';
import type { GroupFormValues } from '@/lib/validations/group';

type FlatTag = {
    id: string;
    title: string;
    slug: string;
    l2Id: string;
    l2Title: string;
    level: number;
};

type Props = {
    l1: L1Category;
    accentColor: string;
    allowL3?: boolean;
};

export default function TagPicker({ l1, accentColor, allowL3 = false }: Props) {
    const t = useTranslations('wizard');
    const { watch, setValue, formState: { errors } } = useFormContext<GroupFormValues>();
    const tagIds = watch('tagIds') || [];
    const wildcardLabel = watch('wildcardLabel');

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [wildcardMode, setWildcardMode] = useState(false);
    const [inlineWildcardParentId, setInlineWildcardParentId] = useState<string | null>(null);
    const [inlineWildcardText, setInlineWildcardText] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten tags for search
    const flatTags = useMemo<FlatTag[]>(() => {
        const result: FlatTag[] = [];
        for (const l2 of l1.subcategories) {
            // Add L2
            result.push({
                id: l2.id,
                title: l2.title,
                slug: l2.slug,
                l2Id: l2.id,
                l2Title: l2.title,
                level: 2
            });

            // Add L3 if allowed
            if (allowL3 && l2.tags) {
                for (const tag of l2.tags) {
                    result.push({
                        id: tag.id,
                        title: tag.title,
                        slug: tag.slug,
                        l2Id: l2.id,
                        l2Title: l2.title,
                        level: 3
                    });
                }
            }
        }
        return result;
    }, [l1, allowL3]);

    // Search results
    const results = useMemo<FlatTag[]>(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return flatTags.filter((t) =>
            t.title.toLowerCase().includes(q) ||
            (allowL3 && t.l2Title.toLowerCase().includes(q))
        );
    }, [query, flatTags, allowL3]);

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

    function toggleTag(tagId: string) {
        let newTags = [...tagIds];
        if (newTags.includes(tagId)) {
            newTags = newTags.filter(id => id !== tagId);
        } else {
            newTags.push(tagId);
        }
        setValue('tagIds', newTags, { shouldValidate: true });
        inputRef.current?.focus();
    }

    function removeTag(tagId: string) {
        setValue('tagIds', tagIds.filter(id => id !== tagId), { shouldValidate: true });
    }

    function confirmWildcard(parent: { id: string; title: string }, label: string = query.trim()) {
        setValue('wildcardLabel', label, { shouldValidate: true });
        setValue('wildcardParentId', parent.id, { shouldValidate: true });
        setQuery('');
        setIsOpen(false);
        setWildcardMode(false);
        setInlineWildcardParentId(null);
        setInlineWildcardText('');
    }

    function removeWildcard() {
        setValue('wildcardLabel', undefined, { shouldValidate: true });
        setValue('wildcardParentId', undefined, { shouldValidate: true });
    }

    // Get selected tag objects to display them as pills
    const selectedTags = useMemo(() => {
        return tagIds.map(id => flatTags.find(t => t.id === id)).filter(Boolean) as FlatTag[];
    }, [tagIds, flatTags]);

    return (
        <div ref={containerRef} className="relative w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    {allowL3 ? t('tagsAndSubtopics') : t('subtopics')} <span className="text-xs text-red-500 font-bold">*</span>
                </label>
            </div>

            {/* Input & Selected Pills */}
            <div
                className="flex flex-col gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow"
                style={{ borderColor: isOpen ? accentColor : errors.tagIds ? 'rgb(248 113 113)' : 'var(--border)' }}
            >
                {/* Selected Pills */}
                {(selectedTags.length > 0 || wildcardLabel) && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map(tag => (
                            <span
                                key={tag.id}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-white shadow-card"
                                style={{ backgroundColor: accentColor }}
                            >
                                {tag.title}
                                <button
                                    type="button"
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
                        {wildcardLabel && (
                            <span
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold shadow-card border-2 border-dashed"
                                style={{ borderColor: accentColor, color: accentColor }}
                            >
                                {wildcardLabel} (Pending)
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeWildcard();
                                    }}
                                    className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 shrink-0 text-foreground-muted" strokeWidth={1.75} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                        placeholder={t('searchTopicsPlaceholder', { category: l1.title })}
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
                        aria-expanded={isOpen}
                        role="combobox"
                        aria-autocomplete="list"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setQuery(''); inputRef.current?.focus(); }}
                            className="text-foreground-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {errors.tagIds && (
                <p className="text-xs text-red-500 font-medium">{errors.tagIds.message}</p>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface shadow-premium max-h-[300px] overflow-y-auto">

                    {wildcardMode ? (
                        <div className="p-3">
                            <p className="mb-2 text-sm text-foreground-muted">
                                {t('confirmCreateSubtopic', { name: query, category: l1.title })}
                            </p>
                            <button
                                type="button"
                                onClick={() => confirmWildcard({ id: l1.id, title: l1.title })}
                                className="w-full flex items-center justify-between rounded-lg p-2 text-left text-sm transition-colors text-white font-bold"
                                style={{ backgroundColor: accentColor }}
                            >
                                <span>{t('createSubtopic')}</span>
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Browsing/Search results */}
                            <div className="p-2 space-y-1">
                                {!query.trim() ? (
                                    <>
                                        {l1.subcategories.map((l2) => (
                                            <div key={l2.id} className="space-y-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleTag(l2.id);
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/50 group"
                                                >
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {l2.title}
                                                    </span>
                                                    <div className={clsx(
                                                        "flex h-5 w-5 items-center justify-center rounded border",
                                                        tagIds.includes(l2.id) ? "border-transparent text-white" : "border-foreground-muted text-transparent group-hover:border-foreground"
                                                    )}
                                                        style={{ backgroundColor: tagIds.includes(l2.id) ? accentColor : 'transparent' }}>
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                    </div>
                                                </button>

                                                {/* L3 tags if allowed */}
                                                {allowL3 && l2.tags && l2.tags.length > 0 && (
                                                    <div className="ml-4 border-l border-border/50 pl-2 space-y-1">
                                                        {l2.tags.map(tag => (
                                                            <button
                                                                key={tag.id}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleTag(tag.id);
                                                                }}
                                                                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition-colors hover:bg-secondary/30 group"
                                                            >
                                                                <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground">
                                                                    {tag.title}
                                                                </span>
                                                                <div className={clsx(
                                                                    "flex h-4 w-4 items-center justify-center rounded border",
                                                                    tagIds.includes(tag.id) ? "border-transparent text-white" : "border-foreground-muted/50 text-transparent group-hover:border-foreground"
                                                                )}
                                                                    style={{ backgroundColor: tagIds.includes(tag.id) ? accentColor : 'transparent' }}>
                                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Inline Add Custom */}
                                        {!wildcardLabel && (
                                            <div className="mt-1 pt-1 border-t border-border/50">
                                                {inlineWildcardParentId === l1.id ? (
                                                    <div className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 border border-border mt-1">
                                                        <input
                                                            autoFocus
                                                            className="w-full bg-transparent text-sm focus:outline-none font-semibold text-foreground"
                                                            placeholder={t('nameOfSubtopicPlaceholder')}
                                                            value={inlineWildcardText}
                                                            onChange={e => setInlineWildcardText(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && inlineWildcardText.trim()) {
                                                                    e.preventDefault();
                                                                    confirmWildcard({ id: l1.id, title: l1.title }, inlineWildcardText.trim());
                                                                } else if (e.key === 'Escape') {
                                                                    setInlineWildcardParentId(null);
                                                                }
                                                            }}
                                                        />
                                                        <button type="button" title="Cancel" onClick={(e) => { e.preventDefault(); setInlineWildcardParentId(null); }} className="hover:text-foreground text-foreground-muted"><X className="h-4 w-4" /></button>
                                                        <button type="button" title="Save" onClick={(e) => { e.preventDefault(); if (inlineWildcardText.trim()) confirmWildcard({ id: l1.id, title: l1.title }, inlineWildcardText.trim()); }} className="text-white rounded flex items-center justify-center p-0.5" style={{ backgroundColor: accentColor }}><Check className="h-4 w-4" /></button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); setInlineWildcardParentId(l1.id); setInlineWildcardText(''); }}
                                                        className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left transition-colors group"
                                                    >
                                                        <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-foreground-muted group-hover:bg-foreground group-hover:text-background transition-colors">
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-foreground-muted group-hover:text-foreground">
                                                            {t('addSubtopic')}
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {hasResults ? (
                                            results.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleTag(t.id);
                                                    }}
                                                    className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {t.title}
                                                        </span>
                                                        <span className="text-xs text-foreground-muted">
                                                            {t.level === 3 ? `${l1.title} › ${t.l2Title}` : l1.title}
                                                        </span>
                                                    </div>
                                                    <div className={clsx(
                                                        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                                                        tagIds.includes(t.id) ? "border-transparent text-white" : "border-foreground-muted text-transparent group-hover:border-foreground"
                                                    )}
                                                        style={{ backgroundColor: tagIds.includes(t.id) ? accentColor : 'transparent' }}>
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            !wildcardLabel && (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-foreground-muted">{t('noTopicsFound', { category: l1.title })}</p>
                                                </div>
                                            )
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Propose Wildcard Button */}
                            {query.trim() && showWildcardPrompt && !wildcardLabel && (
                                <div className="border-t border-border p-2">
                                    <button
                                        type="button"
                                        onClick={() => setWildcardMode(true)}
                                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold" style={{ color: accentColor }}>
                                                {t('createSubtopic')} "{query}"
                                            </span>
                                            <span className="text-xs text-foreground-muted">
                                                {t('proposeAsNewSubtopic')}
                                            </span>
                                        </div>
                                        <Plus className="h-4 w-4" style={{ color: accentColor }} />
                                    </button>
                                </div>
                            )}

                            {/* Done Button (to close) */}
                            <div className="border-t border-border p-2 bg-surface sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsOpen(false);
                                    }}
                                    className="w-full rounded-lg py-2 text-sm font-bold text-white shadow-premium transition-all hover:brightness-110 active:scale-[0.98]"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {t('done')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
