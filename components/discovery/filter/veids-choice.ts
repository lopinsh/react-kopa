import type { DiscoveryState } from '@/lib/types/discovery';

type Veids = DiscoveryState['veidi'][number];

/**
 * What a Veids / sub-veids choice does to the `tags` list (K-73 B). Tags match with OR, so a sub-veids must
 * replace its Veids (a parent beside it would undo the narrowing); the Veids still shows as the group's head.
 */
export function subsChosen(tags: string[], v: Veids): string[] {
    return v.subs.filter((s) => tags.includes(s.slug)).map((s) => s.slug);
}

/** A Veids counts as chosen when it, or one of its sub-veidi, is in `tags`. */
export function isVeidsChosen(tags: string[], v: Veids): boolean {
    return tags.includes(v.slug) || subsChosen(tags, v).length > 0;
}

/** The Veids box or chip: chosen (with or without sub-veidi) clears the whole group, otherwise adds it. */
export function toggleVeids(tags: string[], v: Veids): string[] {
    if (!isVeidsChosen(tags, v)) return [...tags, v.slug];
    const drop = new Set([v.slug, ...v.subs.map((s) => s.slug)]);
    return tags.filter((slug) => !drop.has(slug));
}

/** A sub-veids: choosing it takes its Veids out of the list; clearing the last one of the group gives the Veids back. */
export function toggleSub(tags: string[], v: Veids, sub: string): string[] {
    if (tags.includes(sub)) {
        const left = tags.filter((slug) => slug !== sub);
        return subsChosen(left, v).length > 0 ? left : [...left, v.slug];
    }
    return [...tags.filter((slug) => slug !== v.slug), sub];
}

/** A name click: only this one. */
export const onlyVeids = (v: Veids): string[] => [v.slug];
export const onlySub = (sub: string): string[] => [sub];
