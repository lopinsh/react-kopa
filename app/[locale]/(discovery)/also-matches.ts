import { matchTopics, toTopicSources } from '@/lib/search-topics';
import { SEARCH_MIN_CHARS } from '@/lib/constants';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import type { DiscoveryCounts, DiscoveryState } from '@/lib/types/discovery';

/** Whether the page needs the counts "Atbilst arī:" is made of: a word of SEARCH_MIN_CHARS letters and no Tēma chosen. */
export const wantsAlsoMatches = (q: string, category: string | null) => q.length >= SEARCH_MIN_CHARS && !category;

/** The themes and Veidi the word also matches, with the count of choosing each in place of the word (`plain`: the same list's counts without the word). */
export function buildAlsoMatches(q: string, plain: DiscoveryCounts | null, tree: TaxonomyTree, categories: Array<{ slug: string; color: string }>): DiscoveryState['alsoMatches'] {
    if (!plain) return [];
    const found = matchTopics(q, toTopicSources(tree, categories))
        .map((m) => ({ ...m, count: (m.kind === 'theme' ? plain.byCategory[m.slug] : plain.bySubCategory[m.slug]) ?? 0 }))
        .filter((m) => m.count > 0);
    const busiest = (a: { count: number; title: string }, b: { count: number; title: string }) => b.count - a.count || a.title.localeCompare(b.title);
    return [...found.filter((m) => m.kind === 'theme').sort(busiest), ...found.filter((m) => m.kind === 'veids').sort(busiest)];
}
