import { prisma } from '@/lib/prisma';
import type { CategoryImage } from '@/lib/banner';
import { HubService, type HubPathPart } from './hub.service';

/** The hub a group belongs to most closely (K-151, K-152, K-154): what the head path, the head photo and the side-column hub box show. */
export interface GroupHub {
    /** "Kopiena un vide › Apkārtnes sakopšana": each part links up, the last to the hub itself. */
    path: HubPathPart[];
    title: string;
    /** Without locale. */
    href: string;
    chatHref: string;
    image: CategoryImage | null;
    memberCount: number;
    groupCount: number;
}

/**
 * The most specific OPEN hub of a group: a sub-veids x city, a sub-veids, a Veids x city, a Veids (K-152). The group's main category and its tags give
 * the candidates; a city hub counts only when it is OPEN (`local`). Null when no category of the group has a hub.
 */
export async function closestHub(group: { categoryId: string; tagIds: string[]; cityHref: string | null }, locale: string): Promise<GroupHub | null> {
    const cats = await prisma.category.findMany({
        where: { id: { in: [group.categoryId, ...group.tagIds] }, level: { in: [2, 3] }, status: 'ACTIVE' },
        select: { slug: true, level: true, parent: { select: { slug: true, level: true, parent: { select: { slug: true } } } } },
    });
    const seen = new Set<string>();
    const candidates: Array<{ l1: string; l2: string; l3?: string }> = [];
    for (const level of [3, 2]) {
        for (const c of cats.filter((x) => x.level === level)) {
            const l1 = level === 3 ? c.parent?.parent?.slug : c.parent?.slug;
            const l2 = level === 3 ? c.parent?.slug : c.slug;
            if (!l1 || !l2) continue;
            const key = `${l1}/${l2}/${level === 3 ? c.slug : ''}`;
            if (seen.has(key)) continue;
            seen.add(key);
            candidates.push({ l1, l2, l3: level === 3 ? c.slug : undefined });
        }
    }
    const segment = group.cityHref?.replace(/^\//, '') ?? null;
    for (const level of [3, 2]) {
        for (const c of candidates.filter((x) => (x.l3 ? 3 : 2) === level)) {
            const plain = c.l3 ?? '';
            const attempts = segment ? [{ middle: `${plain ? `${plain}/` : ''}${segment}`, city: true }, { middle: plain, city: false }] : [{ middle: plain, city: false }];
            for (const a of attempts) {
                const hub = await HubService.getHubContext(c.l1, c.l2, a.middle, locale);
                if (!hub || (a.city && !hub.local)) continue;
                const path = hub.path.map((p, i, all) => (i === all.length - 1 ? { ...p, href: hub.href } : p));
                return { path, title: hub.title, href: hub.href, chatHref: `${hub.href}/chat`, image: hub.image, memberCount: hub.stats.memberCount, groupCount: hub.stats.groupCount };
            }
        }
    }
    return null;
}
