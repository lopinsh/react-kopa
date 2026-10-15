import { prisma } from '@/lib/prisma';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import { addDays, dayInZone, zonedDayStart } from '@/lib/discovery-dates';
import { groupByDay } from '@/lib/event-days';
import { plainExcerpt } from '@/lib/text-excerpt';
import { legacyTitle } from '@/lib/utils/announcement-title';
import { toTextLang } from '@/lib/translations';
import { MY_NEWS_DAYS, MY_NEWS_MAX, MY_UPCOMING_DAYS, MY_UPCOMING_MAX } from '@/lib/constants';
import { cardActivities } from './card-activity';
import { GROUP_CARD_SELECT, toGroupCard } from './group-card';
import { EVENT_ROW_INCLUDE, toEventRow } from './event-row';
import { NEWS_GROUP_SELECT, toNewsGroup, resolveNotificationGroups } from './notification-groups';
import { ANSWER_TYPES, sinceOf, stillOn } from './own-counts';
import type { MyGroup, MyGroupsOverview, MyRequest, NewsItem } from '@/lib/types/own-area';

const DAY_MS = 86_400_000;

const GOING = { in: ['GOING', 'PENDING', 'WAITLISTED'] as Array<'GOING' | 'PENDING' | 'WAITLISTED'> };
/** One SQL statement per list, nested relations joined (the default with the `relationJoins` preview; said here so these lists keep it). */
const JOIN = { relationLoadStrategy: 'join' } as const;

function groupNameOf(message: string): string {
    try {
        const name = (JSON.parse(message) as { args?: { groupName?: unknown } }).args?.groupName;
        return typeof name === 'string' ? name : '';
    } catch {
        return '';
    }
}

/**
 * Manas grupas in parallel waves of queries (none per group): your memberships with their cards, then the waiting
 * requests, the next 30 days of events, recent announcements, answers to your requests and each card's latest activity.
 * Read-only: "seen" is written by `markMyGroupsSeen` once the page has shown in the browser, so an answer is listed until the visit after it.
 */
export async function getMyGroupsOverview(userId: string, locale: string, zone: string = DEFAULT_TIME_ZONE): Promise<MyGroupsOverview> {
    const lang = toTextLang(locale);
    const now = new Date();
    const [user, memberships] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { myGroupsSeenAt: true } }),
        prisma.membership.findMany({
            ...JOIN,
            where: { userId, group: { hiddenAt: null } },
            select: { role: true, joinedAt: true, group: { select: GROUP_CARD_SELECT(lang) } },
            orderBy: { joinedAt: 'desc' },
        }),
    ]);
    const since = sinceOf(user?.myGroupsSeenAt ?? null);

    const joined = memberships.filter((m) => m.role !== 'PENDING');
    const memberIds = joined.map((m) => m.group.id);
    const teamIds = joined.filter((m) => m.role !== 'MEMBER').map((m) => m.group.id);
    const today = startOfTodayInRiga(now);
    const until = zonedDayStart(addDays(dayInZone(now, zone), MY_UPCOMING_DAYS), zone);

    const [waiting, events, posts, answers, activity] = await Promise.all([
        teamIds.length > 0 ? prisma.membership.groupBy({ by: ['groupId'], where: { groupId: { in: teamIds }, role: 'PENDING' }, _count: true }) : [],
        prisma.event.findMany({
            ...JOIN,
            where: {
                AND: [
                    { group: { hiddenAt: null } },
                    stillOn(today),
                    { startDate: { lt: until } },
                    { OR: [{ groupId: { in: memberIds } }, { visibility: 'PUBLIC', group: { type: 'PUBLIC' }, attendees: { some: { userId, status: GOING } } }] },
                ],
            },
            include: { ...EVENT_ROW_INCLUDE(lang), attendees: { where: { userId, status: GOING }, select: { status: true } } },
            orderBy: { startDate: 'asc' },
            take: MY_UPCOMING_MAX,
        }),
        memberIds.length > 0
            ? prisma.post.findMany({
                ...JOIN,
                where: { groupId: { in: memberIds }, archivedAt: null, createdAt: { gte: new Date(now.getTime() - MY_NEWS_DAYS * DAY_MS) } },
                orderBy: { createdAt: 'desc' },
                take: MY_NEWS_MAX,
                select: { id: true, title: true, content: true, createdAt: true, authorId: true, group: { select: NEWS_GROUP_SELECT(lang) } },
            })
            : [],
        prisma.notification.findMany({
            where: { userId, audience: 'USER', type: { in: ANSWER_TYPES }, createdAt: { gt: since } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { id: true, type: true, link: true, message: true, createdAt: true },
        }),
        cardActivities(joined.map((m) => m.group), locale, userId),
    ]);

    const answerGroups = await resolveNotificationGroups(answers.map((a) => a.link), locale);
    const waitingOf = new Map(waiting.map((w) => [w.groupId, w._count]));
    const groups: MyGroup[] = joined.map((m) => ({
        card: toGroupCard(m.group, lang),
        role: m.role as MyGroup['role'],
        requestCount: waitingOf.get(m.group.id) ?? 0,
    }));
    const requests: MyRequest[] = memberships.filter((m) => m.role === 'PENDING').map((m) => {
        const card = toGroupCard(m.group, lang);
        return { card, groupId: card.id, name: card.name, path: `/${card.category.l1Slug}/group/${card.slug}`, color: card.category.color, since: m.joinedAt };
    });

    const postItems: NewsItem[] = posts.map((p) => {
        // An announcement without a title: its first line stands in; when that line was cut, the text itself is the headline.
        const legacy = p.title ? null : legacyTitle(p.content);
        const wholeText = !!legacy && legacy.body === p.content.trim();
        return {
            kind: 'post', id: p.id, at: p.createdAt, isNew: p.createdAt > since && p.authorId !== userId,
            group: toNewsGroup(p.group, locale),
            title: wholeText ? (plainExcerpt(p.content, 160) ?? '') : (p.title ?? legacy?.title ?? ''),
            excerpt: wholeText ? '' : (plainExcerpt(legacy ? legacy.body : p.content, 160) ?? ''),
        };
    });
    const answerItems: NewsItem[] = answers.map((a) => ({
        kind: 'answer', id: a.id, at: a.createdAt, isNew: true, accepted: a.type !== 'APPLICATION_DECLINED',
        group: (a.link && answerGroups.get(a.link)) || { name: groupNameOf(a.message), path: null, l1Slug: null, color: null, categoryTitle: null, subCategory: null },
    }));

    return {
        today: dayInZone(now, zone),
        upcoming: groupByDay(events.map((e) => toEventRow(e, lang, e.attendees[0]?.status ?? null)), now, zone),
        news: [...postItems, ...answerItems].sort((a, b) => b.at.getTime() - a.at.getTime()),
        groups,
        activity,
        requests,
    };
}
