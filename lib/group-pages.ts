export const GROUP_PAGE_KEYS = ['info', 'announcements', 'events', 'members', 'settings'] as const;
export type GroupPageKey = (typeof GROUP_PAGE_KEYS)[number];

/** `href` has no locale: `/${l1}/group/${slug}/events`. */
export interface GroupPageLink {
    key: GroupPageKey;
    href: string;
    badge?: number;
}

const SEGMENT: Record<GroupPageKey, string> = { info: '', announcements: '/announcements', events: '/events', members: '/members', settings: '/settings' };

/**
 * The pages a viewer sees in a group's frame, in the fixed order (C9). Pages they may not open are
 * left out, not greyed (AR-49).
 */
export function groupPages(o: { base: string; isMember: boolean; isPrivate?: boolean; isTeam: boolean; pendingCount: number; pendingEventCount?: number }): GroupPageLink[] {
    const visible: Record<GroupPageKey, boolean> = {
        info: true,
        events: true,
        announcements: o.isMember || !o.isPrivate,
        members: o.isMember,
        settings: o.isTeam
    };
    return GROUP_PAGE_KEYS.filter((key) => visible[key]).map((key) => {
        const link: GroupPageLink = { key, href: o.base + SEGMENT[key] };
        if (key === 'members' && o.isTeam && o.pendingCount > 0) link.badge = o.pendingCount;
        if (key === 'events' && o.isTeam && (o.pendingEventCount ?? 0) > 0) link.badge = o.pendingEventCount;
        return link;
    });
}

/** The page a URL segment under the group layout belongs to (`useSelectedLayoutSegment()`): null is Informācija, `create-event` belongs to Pasākumi. */
export function pageForSegment(segment: string | null): GroupPageKey | null {
    if (segment === null) return 'info';
    if (segment === 'create-event') return 'events';
    return (GROUP_PAGE_KEYS as readonly string[]).includes(segment) && segment !== 'info' ? (segment as GroupPageKey) : null;
}
