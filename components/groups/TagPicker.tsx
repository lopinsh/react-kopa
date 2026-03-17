'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import type { L1Category, L2SearchResult } from '@/lib/services/taxonomy.service';
import { searchL2Tags, submitPendingTag } from '@/actions/taxonomy-actions';
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

type PendingTag = {
    id: string;
    title: string;
};

type Props = {
    l1: L1Category;
    accentColor: string;
    allowL3?: boolean;
};

export default function TagPicker({ l1, accentColor, allowL3 = false }: Props) {
    const t = useTranslations('wizard');
    const c = useTranslations('common');
    const locale = useLocale();
    const {
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<GroupFormValues>();
    const tagIds = watch('tagIds') || [];

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [wildcardMode, setWildcardMode] = useState(false);
    const [inlineWildcardParentId, setInlineWildcardParentId] = useState<string | null>(null);
    const [inlineWildcardText, setInlineWildcardText] = useState('');
    const [pendingById, setPendingById] = useState<Record<string, PendingTag>>({});
    const [searchResults, setSearchResults] = useState<L2SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmittingPending, setIsSubmittingPending] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const flatTags = useMemo<FlatTag[]>(() => {
        const result: FlatTag[] = [];
        for (const l2 of l1.subcategories) {
            result.push({
                id: l2.id,
                title: l2.title,
                slug: l2.slug,
                l2Id: l2.id,
                l2Title: l2.title,
                level: 2,
            });

            if (allowL3 && l2.tags) {
                for (const tag of l2.tags) {
                    result.push({
                        id: tag.id,
                        title: tag.title,
                        slug: tag.slug,
                        l2Id: l2.id,
                        l2Title: l2.title,
                        level: 3,
                    });
                }
            }
        }
        return result;
    }, [l1, allowL3]);

    const localResults = useMemo<FlatTag[]>(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return flatTags.filter((tag) =>
            tag.title.toLowerCase().includes(q) || (allowL3 && tag.l2Title.toLowerCase().includes(q))
        );
    }, [query, flatTags, allowL3]);

    const mergedResults = useMemo<FlatTag[]>(() => {
        const byId = new Map<string, FlatTag>();
        for (const local of localResults) {
            byId.set(local.id, local);
        }
        for (const remote of searchResults) {
            const existing = byId.get(remote.id);
            if (existing) {
                byId.set(remote.id, { ...existing });
            } else {
                byId.set(remote.id, {
                    id: remote.id,
                    title: remote.title,
                    slug: remote.slug,
                    l2Id: remote.id,
                    l2Title: remote.title,
                    level: 2,
                });
            }
        }

        return Array.from(byId.values());
    }, [localResults, searchResults]);

    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            return;
        }

        let cancelled = false;
        // setIsSearching is now done in handlers to avoid sync effect update

        const timer = setTimeout(async () => {
            const result = await searchL2Tags(query, l1.id, locale);
            if (!cancelled) {
                setSearchResults(result.success ? result.data ?? [] : []);
                setIsSearching(false);
            }
        }, 500);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, l1.id, locale]);

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
        const hasTag = tagIds.includes(tagId);
        const next = hasTag ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId];
        setValue('tagIds', next, { shouldValidate: true });
        inputRef.current?.focus();
    }

    function removeTag(tagId: string) {
        setValue(
            'tagIds',
            tagIds.filter((id) => id !== tagId),
            { shouldValidate: true }
        );
    }

    async function createPending(parentId: string, label: string) {
        const trimmed = label.trim();
        if (trimmed.length < 2 || isSubmittingPending) {
            return;
        }

        setIsSubmittingPending(true);
        const result = await submitPendingTag(trimmed, parentId);
        setIsSubmittingPending(false);

        if (!result.success || !result.data) {
            return;
        }

        const pendingTag: PendingTag = {
            id: result.data.id,
            title: trimmed,
        };

        setPendingById((prev) => ({ ...prev, [pendingTag.id]: pendingTag }));
        if (!tagIds.includes(pendingTag.id)) {
            setValue('tagIds', [...tagIds, pendingTag.id], { shouldValidate: true });
        }

        setQuery('');
        setInlineWildcardParentId(null);
        setInlineWildcardText('');
        setWildcardMode(false);
        setIsOpen(false);
    }

    const selectedTags = tagIds
        .map((id) => flatTags.find((tag) => tag.id === id))
        .filter((tag): tag is FlatTag => tag !== undefined);

    const selectedKnownIds = new Set(selectedTags.map((tag) => tag.id));
    const selectedPending = tagIds
        .filter((id) => !selectedKnownIds.has(id))
        .map((id) => pendingById[id] ?? { id, title: t('pendingReview') });

    const hasResults = mergedResults.length > 0;
    const showWildcardPrompt = query.trim().length >= 2;

    return (
        <div ref={containerRef} className="relative w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    {allowL3 ? t('tagsAndSubtopics') : t('subtopics')} <span className="text-xs text-red-500 font-bold">*</span>
                </label>
            </div>

            <div
                className="flex flex-col gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow"
                style={{ borderColor: isOpen ? accentColor : errors.tagIds ? 'rgb(248 113 113)' : 'var(--border)' }}
            >
                {(selectedTags.length > 0 || selectedPending.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map((tag) => (
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
                        {selectedPending.map((pending) => (
                            <span
                                key={pending.id}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold shadow-card border-2 border-dashed"
                                style={{ borderColor: accentColor, color: accentColor }}
                            >
                                {pending.title} ({t('pendingReview')})
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeTag(pending.id);
                                    }}
                                    className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
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
                        placeholder={t('searchTopicsPlaceholder', { category: l1.title })}
                        value={query}
                        onChange={(e) => {
                            const val = e.target.value;
                            setQuery(val);
                            setIsOpen(true);
                            setWildcardMode(false);
                            if (val.trim().length < 2) {
                                setSearchResults([]);
                                setIsSearching(false);
                            } else {
                                setIsSearching(true);
                            }
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
                        aria-controls="tag-picker-results"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setQuery('');
                                setSearchResults([]);
                                setIsSearching(false);
                                inputRef.current?.focus();
                            }}
                            className="text-foreground-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {errors.tagIds && <p className="text-xs text-red-500 font-medium">{t(errors.tagIds.message as any)}</p>}

            {isOpen && (
                <div 
                    id="tag-picker-results"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-border bg-surface shadow-premium max-h-[300px] overflow-y-auto"
                >
                    {wildcardMode ? (
                        <div className="p-3">
                            <p className="mb-2 text-sm text-foreground-muted">{t('confirmCreateSubtopic', { name: query, category: l1.title })}</p>
                            <button
                                type="button"
                                onClick={() => createPending(l1.id, query)}
                                disabled={isSubmittingPending}
                                className="w-full flex items-center justify-between rounded-lg p-2 text-left text-sm transition-colors text-white font-bold disabled:opacity-60"
                                style={{ backgroundColor: accentColor }}
                            >
                                <span>{t('createSubtopic')}</span>
                                <Check className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <>
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
                                                    <span className="text-sm font-semibold text-foreground">{l2.title}</span>
                                                    <div
                                                        className={clsx(
                                                            'flex h-5 w-5 items-center justify-center rounded border',
                                                            tagIds.includes(l2.id)
                                                                ? 'border-transparent text-white'
                                                                : 'border-foreground-muted text-transparent group-hover:border-foreground'
                                                        )}
                                                        style={{ backgroundColor: tagIds.includes(l2.id) ? accentColor : 'transparent' }}
                                                    >
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                    </div>
                                                </button>

                                                {allowL3 && l2.tags && l2.tags.length > 0 && (
                                                    <div className="ml-4 border-l border-border/50 pl-2 space-y-1">
                                                        {l2.tags.map((tag) => (
                                                            <button
                                                                key={tag.id}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleTag(tag.id);
                                                                }}
                                                                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition-colors hover:bg-secondary/30 group"
                                                            >
                                                                <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground">{tag.title}</span>
                                                                <div
                                                                    className={clsx(
                                                                        'flex h-4 w-4 items-center justify-center rounded border',
                                                                        tagIds.includes(tag.id)
                                                                            ? 'border-transparent text-white'
                                                                            : 'border-foreground-muted/50 text-transparent group-hover:border-foreground'
                                                                    )}
                                                                    style={{ backgroundColor: tagIds.includes(tag.id) ? accentColor : 'transparent' }}
                                                                >
                                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="mt-1 pt-1 border-t border-border/50">
                                            {inlineWildcardParentId === l1.id ? (
                                                <div className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 border border-border mt-1">
                                                    <input
                                                        autoFocus
                                                        className="w-full bg-transparent text-sm focus:outline-none font-semibold text-foreground"
                                                        placeholder={t('nameOfSubtopicPlaceholder')}
                                                        value={inlineWildcardText}
                                                        onChange={(e) => setInlineWildcardText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && inlineWildcardText.trim()) {
                                                                e.preventDefault();
                                                                createPending(l1.id, inlineWildcardText.trim());
                                                            } else if (e.key === 'Escape') {
                                                                setInlineWildcardParentId(null);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        title={t('cancel')}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setInlineWildcardParentId(null);
                                                        }}
                                                        className="hover:text-foreground text-foreground-muted"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={c('save')}
                                                        disabled={!inlineWildcardText.trim() || isSubmittingPending}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (inlineWildcardText.trim()) {
                                                                createPending(l1.id, inlineWildcardText.trim());
                                                            }
                                                        }}
                                                        className="text-white rounded flex items-center justify-center p-0.5 disabled:opacity-60"
                                                        style={{ backgroundColor: accentColor }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setInlineWildcardParentId(l1.id);
                                                        setInlineWildcardText('');
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left transition-colors group"
                                                >
                                                    <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-foreground-muted group-hover:bg-foreground group-hover:text-background transition-colors">
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground-muted group-hover:text-foreground">{t('addSubtopic')}</span>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {isSearching && (
                                            <div className="p-4 text-center">
                                                <p className="text-xs text-foreground-muted">{c('loading')}</p>
                                            </div>
                                        )}

                                        {hasResults ? (
                                            mergedResults.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleTag(tag.id);
                                                    }}
                                                    className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground">{tag.title}</span>
                                                        <span className="text-xs text-foreground-muted">
                                                            {tag.level === 3 ? `${l1.title} - ${tag.l2Title}` : l1.title}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={clsx(
                                                            'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                                                            tagIds.includes(tag.id)
                                                                ? 'border-transparent text-white'
                                                                : 'border-foreground-muted text-transparent group-hover:border-foreground'
                                                        )}
                                                        style={{ backgroundColor: tagIds.includes(tag.id) ? accentColor : 'transparent' }}
                                                    >
                                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center">
                                                <p className="text-sm text-foreground-muted">{t('noTopicsFound', { category: l1.title })}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {query.trim() && showWildcardPrompt && (
                                <div className="border-t border-border p-2">
                                    <button
                                        type="button"
                                        onClick={() => setWildcardMode(true)}
                                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold" style={{ color: accentColor }}>
                                                {t('createSubtopic')} &quot;{query}&quot;
                                            </span>
                                            <span className="text-xs text-foreground-muted">{t('proposeAsNewSubtopic')}</span>
                                        </div>
                                        <Plus className="h-4 w-4" style={{ color: accentColor }} />
                                    </button>
                                </div>
                            )}

                            <div className="border-t border-border p-2 bg-surface sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (query.trim().length >= 2 && !wildcardMode) {
                                            createPending(l1.id, query);
                                        } else {
                                            setIsOpen(false);
                                        }
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

