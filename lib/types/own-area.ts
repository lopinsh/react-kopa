import type { GroupCardData } from '@/lib/services/group-card';
import type { CardActivity } from '@/lib/services/card-activity';
import type { EventRowData } from '@/lib/services/event-row';
import type { DayKey } from '@/lib/discovery-dates';

/** Shapes of your own area (R8): Manas grupas, the own counts, the notification lists. */
export type MyRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface MyGroup {
    card: GroupCardData;
    role: MyRole;
    /** Waiting join requests; 0 unless the viewer is on the team. */
    requestCount: number;
}

export interface MyRequest {
    groupId: string;
    name: string;
    /** `/<l1>/group/<slug>` */
    path: string;
    color: string;
    since: Date;
}

/** The group a news item or a notification is about; every field but the name is null when it cannot be resolved any more. */
export interface NewsGroup {
    name: string;
    path: string | null;
    l1Slug: string | null;
    color: string | null;
    categoryTitle: string | null;
    subCategory: string | null;
}

export type NewsItem =
    | { kind: 'post'; id: string; at: Date; isNew: boolean; group: NewsGroup; title: string; excerpt: string }
    | { kind: 'answer'; id: string; at: Date; isNew: true; group: NewsGroup; accepted: boolean };

export interface MyGroupsOverview {
    today: DayKey;
    upcoming: Array<{ day: DayKey; rows: EventRowData[] }>;
    news: NewsItem[];
    groups: MyGroup[];
    activity: Record<string, CardActivity>;
    requests: MyRequest[];
}

export interface OwnCounts {
    myGroupsNew: number;
    notifications: { user: number; admin: number };
}

export interface NotificationView {
    id: string;
    /** Ids this row stands for (unread ones of the same type and target are folded into one row). */
    ids: string[];
    moreCount: number;
    type: string;
    message: string;
    link: string | null;
    read: boolean;
    audience: 'USER' | 'ADMIN';
    createdAt: Date;
    group: NewsGroup | null;
}
