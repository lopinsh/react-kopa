import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import { addDays, dayInZone, zonedDayStart } from '@/lib/discovery-dates';
import { groupByDay } from '@/lib/event-days';
import { plainExcerpt } from '@/lib/text-excerpt';
import { legacyTitle } from '@/lib/utils/announcement-title';
import { toTextLang } from '@/lib/translations';
import { MY_NEWS_DAYS, MY_NEWS_MAX, MY_NEW_FALLBACK_DAYS, MY_UPCOMING_DAYS, MY_UPCOMING_MAX } from '@/lib/constants';
import { GROUP_CARD_SELECT, toGroupCard } from './group-card';
import { EVENT_ROW_INCLUDE, toEventRow } from './event-row';
import { NEWS_GROUP_SELECT, toNewsGroup, resolveNotificationGroups } from './notification-groups';
import { NotificationService } from './notification.service';
import type { MyGroup, MyGroupsOverview, MyRequest, NewsItem, OwnCounts } from '@/lib/types/own-area';

const DAY_MS = 86_400_000;
/** Notifications that answer a request to join a group. */
const ANSWER_TYPES = ['APPLICATION_ACCEPTED', 'REQUEST_APPROVED', 'APPLICATION_DECLINED'];
/** One SQL statement per list, nested relations joined: without it every nested level (category chain, tags, translations) is a query of its own. */
const JOIN = { relationLoadStrategy: 'join' } as const;
const GOING = { in: ['GOING', 'PENDING', 'WAITLISTED'] as Array<'GOING' | 'PENDING' | 'WAITLISTED'> };

const stillOn = (today: Date): Prisma.EventWhereInput => ({ OR: [{ endDate: { gte: today } }, { endDate: null, startDate: { gte: today } }] });
const notBy = (userId: string): Prisma.EventWhereInput => ({ OR: [{ creatorId: null }, { creatorId: { not: userId } }] });

/** The point "new" counts from: the last visit to Manas grupas, or a week back when there was none (AR-14, Default 1). */
function sinceOf(seenAt: Date | null): Date {
    return seenAt ?? new Date(Date.now() - MY_NEW_FALLBACK_DAYS * DAY_MS);
}

function groupNameOf(message: string): string {
    try {
        const name = (JSON.parse(message) as { args?: { groupName?: unknown } }).args?.groupName;
        return typeof name === 'string' ? name : '';
    } catch {
        return '';
    }
}

/**
 * Manas grupas in two parallel waves of queries (at most 8, none per group): your memberships with their cards, then the waiting
 * requests, the next 30 days of events, recent announcements, answers to your requests and each group's next meeting.
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
    const meetingIds = joined.filter((m) => !m.group.lookingFor).map((m) => m.group.id);
    const today = startOfTodayInRiga(now);
    const until = zonedDayStart(addDays(dayInZone(now, zone), MY_UPCOMING_DAYS), zone);

    const [waiting, events, posts, answers, nextOnes] = await Promise.all([
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
        meetingIds.length > 0
            ? prisma.event.findMany({
                where: { AND: [{ groupId: { in: meetingIds } }, stillOn(today)] },
                orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
                distinct: ['groupId'],
                select: { groupId: true, startDate: true },
            })
            : [],
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
        return { groupId: card.id, name: card.name, path: `/${card.category.l1Slug}/group/${card.slug}`, color: card.category.color, since: m.joinedAt };
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
        nextMeetings: Object.fromEntries(nextOnes.map((n) => [n.groupId, n.startDate])),
        requests,
    };
}

/**
 * The numbers in the menus: unread notifications per tab and what is new in Manas grupas (Default 1: events and announcements
 * others put in your groups, answers to your requests, since the last visit). Five queries, none per group.
 */
export async function getOwnCounts(userId: string): Promise<OwnCounts> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, myGroupsSeenAt: true } });
    const since = sinceOf(user?.myGroupsSeenAt ?? null);
    const mine = { hiddenAt: null, members: { some: { userId, role: { not: 'PENDING' as const } } } };
    const [notifications, newEvents, newPosts, answers] = await Promise.all([
        NotificationService.getUnreadCounts(userId, user?.role ?? null),
        prisma.event.count({ where: { AND: [{ group: mine }, stillOn(startOfTodayInRiga()), notBy(userId), { createdAt: { gt: since } }] } }),
        prisma.post.count({ where: { group: mine, archivedAt: null, authorId: { not: userId }, createdAt: { gt: since } } }),
        prisma.notification.count({ where: { userId, audience: 'USER', type: { in: ANSWER_TYPES }, createdAt: { gt: since } } }),
    ]);
    return { myGroupsNew: newEvents + newPosts + answers, notifications };
}

/** Manas grupas has been opened: its "new" count starts again from now. */
export async function markMyGroupsSeen(userId: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { myGroupsSeenAt: new Date() } });
}
