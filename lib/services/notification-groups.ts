import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { groupCategoryParts } from './message.service';
import type { NewsGroup } from '@/lib/types/own-area';

// The group a notification is about is named by its link: the group page itself, or a conversation that started from a group.
const GROUP_LINK = /^\/([^/?#]+)\/group\/([^/?#]+)/;
const CONVERSATION_LINK = /^\/messages\?c=([^&#]+)/;

/** What `toNewsGroup` reads from a group. */
export const NEWS_GROUP_SELECT = (locale: string) => ({
    name: true,
    slug: true,
    category: { include: TaxonomyResolver.getInclude(locale) },
    tags: { where: { level: 2 }, take: 1, select: { slug: true, titles: { select: { lang: true, title: true } } } },
}) as const;

type NewsGroupSource = Prisma.GroupGetPayload<{ select: ReturnType<typeof NEWS_GROUP_SELECT> }>;

/** A group as news and notifications name it: link target, category colour and line. */
export function toNewsGroup(g: NewsGroupSource, locale: string): NewsGroup & { l1Slug: string; path: string; color: string; categoryTitle: string } {
    const resolved = TaxonomyResolver.resolve(g.category);
    const parts = groupCategoryParts(resolved, g.tags, locale);
    return {
        name: g.name,
        path: `/${resolved.l1Slug}/group/${g.slug}`,
        l1Slug: resolved.l1Slug,
        color: resolved.accentColor,
        categoryTitle: parts.categoryTitle,
        subCategory: parts.subCategories[0] ?? null,
    };
}

/**
 * Links → the group each one is about (name, page path, category colour and line). At most two queries (groups by slug, conversations by id).
 * A link that names no group, a hidden or deleted group, or a group that moved to another main category gets no entry:
 * callers fall back to the name stored in the notification, as plain text.
 */
export async function resolveNotificationGroups(links: ReadonlyArray<string | null>, locale: string): Promise<Map<string, NewsGroup>> {
    const slugs = new Set<string>();
    const conversationIds = new Set<string>();
    for (const link of links) {
        if (!link) continue;
        const g = GROUP_LINK.exec(link);
        if (g) slugs.add(g[2]);
        const c = CONVERSATION_LINK.exec(link);
        if (c) conversationIds.add(c[1]);
    }
    if (slugs.size === 0 && conversationIds.size === 0) return new Map();

    const select = NEWS_GROUP_SELECT(locale);
    const [groups, conversations] = await Promise.all([
        slugs.size > 0 ? prisma.group.findMany({ where: { slug: { in: [...slugs] }, hiddenAt: null }, select }) : [],
        conversationIds.size > 0
            ? prisma.conversation.findMany({
                where: { id: { in: [...conversationIds] }, originGroupId: { not: null } },
                select: { id: true, originGroup: { select: { ...select, hiddenAt: true } } },
            })
            : [],
    ]);

    const describe = (g: (typeof groups)[number]) => toNewsGroup(g, locale);
    const byPath = new Map(groups.map((g) => { const d = describe(g); return [`${d.l1Slug}/${g.slug}`, d] as const; }));
    const byConversation = new Map(conversations.flatMap((c) => (c.originGroup && !c.originGroup.hiddenAt ? [[c.id, describe(c.originGroup)] as const] : [])));

    const out = new Map<string, NewsGroup>();
    for (const link of links) {
        if (!link || out.has(link)) continue;
        const g = GROUP_LINK.exec(link);
        const c = CONVERSATION_LINK.exec(link);
        const found = g ? byPath.get(`${g[1]}/${g[2]}`) : c ? byConversation.get(c[1]) : undefined;
        if (found) out.set(link, found);
    }
    return out;
}
