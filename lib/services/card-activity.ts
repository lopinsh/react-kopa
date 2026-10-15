import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { legacyTitle } from '@/lib/utils/announcement-title';
import { EventService } from './event.service';

/** What a group card's bottom line tells about the group (C2): its next meeting, else its newest public announcement. */
export type CardActivity =
    /** `until` is the end of an event that is running now, else null. */
    | { kind: 'event'; at: Date; until: Date | null }
    | { kind: 'announcement'; at: Date; title: string };

/**
 * The one place that decides which announcements a card may show to anyone. Until announcements carry their own visibility
 * (R9b, `add_announcement_visibility`), the public ones are the not archived ones of a public group; R9b adds its filter here.
 */
function publicAnnouncements(): Prisma.PostWhereInput {
    return { archivedAt: null, group: { type: 'PUBLIC', hiddenAt: null } };
}

/**
 * Group id → latest activity for the groups that have any: the next visible meeting, else the newest public announcement. A group
 * with neither is left out (its card shows the tagline, or nothing). Two batched queries, none per group.
 */
export async function cardActivities(groups: Array<{ id: string }>, locale: string, viewerId?: string): Promise<Record<string, CardActivity>> {
    const ids = groups.map((g) => g.id);
    if (ids.length === 0) return {};
    const next = await EventService.getNextVisibleEvents(ids, locale, viewerId);
    const result: Record<string, CardActivity> = Object.fromEntries([...next].map(([id, e]) => [id, { kind: 'event' as const, at: e.startDate, until: e.running ? e.endDate : null }]));
    const without = ids.filter((id) => !result[id]);
    if (without.length === 0) return result;
    const posts = await prisma.post.findMany({
        where: { AND: [{ groupId: { in: without } }, publicAnnouncements()] },
        orderBy: { createdAt: 'desc' },
        distinct: ['groupId'],
        select: { groupId: true, title: true, content: true, createdAt: true },
    });
    for (const p of posts) result[p.groupId] = { kind: 'announcement', at: p.createdAt, title: p.title ?? legacyTitle(p.content).title };
    return result;
}
