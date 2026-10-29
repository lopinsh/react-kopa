import { ACTIVITY_FILTER_KINDS, ACTIVITY_KINDS, ACTIVITY_PAGE_SIZE, type ActivityFilter } from '@/lib/constants/activity';
import type { ActivityCursor } from '@/lib/validations/activity';
import { READERS, type ActivityEntry } from './activity-sources';

export type { ActivityEntry };
export type ActivityPage = { entries: ActivityEntry[]; nextCursor: string | null };

const kindRank = (e: ActivityEntry) => ACTIVITY_KINDS.indexOf(e.kind);

/** Admin activity feed (R30): read from existing timestamps, nothing is recorded. */
export const ActivityService = {
    async getPage({ filter, cursor, locale }: { filter: ActivityFilter; cursor: ActivityCursor | null; locale: string }): Promise<ActivityPage> {
        const kinds = ACTIVITY_FILTER_KINDS[filter];
        const lists = await Promise.all(kinds.map((kind) => READERS[kind](cursor, locale)));
        const all = lists.flat().sort((a, b) => b.at.getTime() - a.at.getTime() || kindRank(a) - kindRank(b) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
        const entries = all.slice(0, ACTIVITY_PAGE_SIZE);
        const last = entries[entries.length - 1];
        const nextCursor = all.length > ACTIVITY_PAGE_SIZE && last ? `${last.at.toISOString()}~${last.kind}~${last.id}` : null;
        return { entries, nextCursor };
    },
};
