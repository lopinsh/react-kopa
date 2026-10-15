import { SEARCH_MIN_CHARS } from '@/lib/constants';
import { foldText } from '@/lib/text-fold';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';

export interface TopicSource {
    slug: string;
    title: string;
    color: string;
    subs: Array<{ slug: string; title: string; deeper: string[] }>;
}

export interface TopicMatch {
    kind: 'theme' | 'veids';
    slug: string;
    l1Slug: string;
    title: string;
    color: string;
}

/** The themes search and "Atbilst arī" look in: the taxonomy's ACTIVE themes that discovery lists (non-wildcard), with their ACTIVE Veidi and level-3 titles. */
export function toTopicSources(tree: TaxonomyTree, categories: Array<{ slug: string; color: string }>): TopicSource[] {
    const colors = new Map(categories.map((c) => [c.slug, c.color]));
    return tree
        .filter((l1) => colors.has(l1.slug))
        .map((l1) => ({
            slug: l1.slug,
            title: l1.title,
            color: colors.get(l1.slug) ?? l1.color,
            subs: l1.subcategories
                .filter((s) => s.status === 'ACTIVE')
                .map((s) => ({ slug: s.slug, title: s.title, deeper: s.tags.filter((t) => t.status === 'ACTIVE').map((t) => t.title) }))
        }));
}

/**
 * Themes whose title or any Veids/level-3 title contains the word, then Veidi whose title or level-3 title contains it.
 * Marks are ignored ("speles" finds "Spēles"); a word under SEARCH_MIN_CHARS matches nothing. Order inside each kind is the caller's (by count).
 */
export function matchTopics(word: string, topics: TopicSource[]): TopicMatch[] {
    const needle = foldText(word.trim());
    if (needle.length < SEARCH_MIN_CHARS) return [];
    const has = (text: string) => foldText(text).includes(needle);
    const themes: TopicMatch[] = [];
    const veidi: TopicMatch[] = [];
    for (const t of topics) {
        if (has(t.title) || t.subs.some((s) => has(s.title) || s.deeper.some(has))) {
            themes.push({ kind: 'theme', slug: t.slug, l1Slug: t.slug, title: t.title, color: t.color });
        }
        for (const s of t.subs) {
            if (has(s.title) || s.deeper.some(has)) veidi.push({ kind: 'veids', slug: s.slug, l1Slug: t.slug, title: s.title, color: t.color });
        }
    }
    return [...themes, ...veidi];
}
