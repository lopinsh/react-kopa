import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { pickTitle } from '@/lib/utils/localized-title';
import { toTextLang } from '@/lib/translations';
import { topicHref } from '@/lib/discovery-params';
import { hubHref } from '@/lib/hub-path';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { GROUP_CARD_SELECT, toGroupCard, type GroupCardData } from './group-card';
import { cardActivities, type CardActivity } from './card-activity';
import { cardFaces } from './card-faces';
import { UserService } from './user.service';
import { hubEventPreview, hubEvents } from './hub-events';
import { hubActivity } from './hub-activity';
import { hubCityCounts, hubGroupWhere, hubMemberCount, newSince } from './hub-query';
import type { Face } from './event-panel';
import type { MembershipRole } from '@prisma/client';

const TITLES = { select: { lang: true, title: true } } as const;

export interface HubPathPart {
    title: string;
    /** Without locale; absent on the current hub. */
    href?: string;
}

export interface HubSubTopic {
    slug: string;
    title: string;
    href: string;
    groupCount: number;
}

/** A hub (a Veids or sub-veids) with what its frame shows (K1-01). The name ("Kopiena Šahs") is made from `title` in the frame, where the translations are. */
export interface HubContext {
    id: string;
    level: 2 | 3;
    slug: string;
    title: string;
    l1Id: string;
    l1Slug: string;
    /** Without locale: `/games/boardgames`. */
    href: string;
    path: HubPathPart[];
    theme: { accentColor: string };
    stats: { memberCount: number; groupCount: number };
    /** The L3 children of an L2 hub, most groups first; empty on an L3 hub. */
    subTopics: HubSubTopic[];
}

export interface HubGroups {
    groups: GroupCardData[];
    total: number;
    activity: Record<string, CardActivity>;
    faces: Record<string, Face[]>;
    myRoles: Record<string, MembershipRole>;
}

/**
 * A hub is derived, never stored: its groups are the public, unhidden groups tagged with that Veids or one of its sub-veidi (K-71).
 * The groups, counts and (K1-2, K1-3) events and feed all come from `hubGroupWhere`.
 */
export const HubService = {
    /** The hub at `/l1/l2[/l3]`, or null when a part is missing, inactive or not under the one before it. */
    getHubContext: cache(async (l1Slug: string, l2Slug: string, l3Slug: string | undefined, locale: string): Promise<HubContext | null> => {
        const lang = toTextLang(locale);
        const l1Where = { slug: l1Slug, level: 1, status: 'ACTIVE' as const };
        const l2Where = { slug: l2Slug, level: 2, status: 'ACTIVE' as const, parent: l1Where };
        const cat = await prisma.category.findFirst({
            where: l3Slug ? { slug: l3Slug, level: 3, status: 'ACTIVE', parent: l2Where } : l2Where,
            select: {
                id: true, slug: true, level: true, color: true, titles: TITLES,
                parent: { select: { id: true, slug: true, color: true, titles: TITLES, parent: { select: { id: true, slug: true, color: true, titles: TITLES } } } },
                children: { where: { status: 'ACTIVE' }, select: { slug: true, titles: TITLES } },
            },
        });
        if (!cat || (cat.level !== 2 && cat.level !== 3)) return null;

        const l1 = cat.level === 2 ? cat.parent : cat.parent?.parent;
        const l2 = cat.level === 2 ? cat : cat.parent;
        if (!l1 || !l2) return null;
        const title = (c: { slug: string; titles: Array<{ lang: string; title: string }> }) => pickTitle(c.titles, lang, c.slug);
        const where = hubGroupWhere({ l1Id: l1.id, slug: cat.slug }, [], lang);

        const [groupCount, memberCount, subTopics] = await Promise.all([
            prisma.group.count({ where }),
            hubMemberCount(where),
            Promise.all(cat.level === 2 ? cat.children.map(async (c) => ({
                slug: c.slug,
                title: title(c),
                href: hubHref(l1.slug, l2.slug, c.slug),
                groupCount: await prisma.group.count({ where: hubGroupWhere({ l1Id: l1.id, slug: c.slug }, [], lang) }),
            })) : []),
        ]);

        const path: HubPathPart[] = [{ title: title(l1), href: topicHref(l1.slug) }];
        if (cat.level === 3) path.push({ title: title(l2), href: hubHref(l1.slug, l2.slug) });
        path.push({ title: title(cat) });

        return {
            id: cat.id,
            level: cat.level,
            slug: cat.slug,
            title: title(cat),
            l1Id: l1.id,
            l1Slug: l1.slug,
            href: hubHref(l1.slug, l2.slug, cat.level === 3 ? cat.slug : undefined),
            path,
            theme: { accentColor: TaxonomyResolver.resolve(cat).accentColor },
            stats: { memberCount, groupCount },
            subTopics: subTopics.sort((a, b) => b.groupCount - a.groupCount || a.title.localeCompare(b.title, locale)),
        };
    }),

    /** Groups per city across the hub, for the Kur list. */
    async getCityCounts(hub: HubContext, locale: string) {
        return hubCityCounts(hubGroupWhere({ l1Id: hub.l1Id, slug: hub.slug }, [], toTextLang(locale)));
    },

    /** The hub's events (K1-14): see `hubEvents`. */
    getEvents: hubEvents,

    /** The next few events and their total, for Pārskats (K1-21). */
    getEventPreview: hubEventPreview,

    /** The activity feed by period (K1-19). */
    getActivity: hubActivity,

    /** The hub's groups, newest first, with what the cards show (activity line, faces, the viewer's roles). `tab` 'new' = created in the last 30 days. */
    async getGroups(hub: HubContext, o: { cities: string[]; tab: 'all' | 'new'; take: number }, locale: string, viewerId?: string): Promise<HubGroups> {
        const lang = toTextLang(locale);
        const where = { ...hubGroupWhere({ l1Id: hub.l1Id, slug: hub.slug }, o.cities, lang), ...(o.tab === 'new' ? newSince() : {}) };
        const [total, rows] = await Promise.all([
            prisma.group.count({ where }),
            prisma.group.findMany({ where, take: o.take, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: GROUP_CARD_SELECT(lang) }),
        ]);
        const groups = rows.map((g) => toGroupCard(g, lang));
        const [activity, faces, myRoles] = await Promise.all([
            cardActivities(groups, locale, viewerId),
            cardFaces(groups.map((g) => g.id), viewerId),
            viewerId ? UserService.getMyGroupRoles(viewerId) : Promise.resolve<Record<string, MembershipRole>>({}),
        ]);
        return { groups, total, activity, faces, myRoles };
    },
};
