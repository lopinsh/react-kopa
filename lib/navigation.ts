import { Bell, Compass, Newspaper, Users, User, MessageSquare, Settings, type LucideIcon } from 'lucide-react';

/** The four tabs of the phone bottom bar (the fifth cell is the + button). */
export const BOTTOM_TABS = ['discover', 'news', 'messages', 'me'] as const;
export type BottomTab = (typeof BOTTOM_TABS)[number];
export const isBottomTab = (v: unknown): v is BottomTab =>
    typeof v === 'string' && (BOTTOM_TABS as readonly string[]).includes(v);

/** Cookie holding the tab a group page marks on a hard load (the tab you came from). */
export const NAV_TAB_COOKIE = 'ek_nav_tab';
/** sessionStorage key: Record<groupBasePath, BottomTab>. */
export const NAV_FROM_STORAGE = 'ek_nav_from';

/** '/sports/group/slug' for any page of a group (pathname without locale), else null. */
export function groupBasePath(pathname: string): string | null {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[1] !== 'group' || segments.length < 3) return null;
    return `/${segments.slice(0, 3).join('/')}`;
}

const under = (p: string, base: string) => p === base || p.startsWith(`${base}/`);

/** The tab a path marks: its own tab, 'keep' on group pages (the tab you came from), or null (none marked). */
export function tabForPath(pathname: string): BottomTab | 'keep' | null {
    if (pathname === '/') return 'discover';
    if (under(pathname, '/notifications')) return 'news';
    if (under(pathname, '/messages')) return 'messages';
    if (under(pathname, '/profile/my-groups') || pathname === '/profile' || pathname === '/profile/edit' || under(pathname, '/settings')) return 'me';
    if (groupBasePath(pathname)) return 'keep';
    return null;
}

export type BottomLink = { tab: BottomTab; href: string; labelKey: 'discover' | 'news' | 'messages' | 'me'; icon: LucideIcon };

export const BOTTOM_LINKS: BottomLink[] = [
    { tab: 'discover', href: '/', labelKey: 'discover', icon: Compass },
    { tab: 'news', href: '/notifications', labelKey: 'news', icon: Newspaper },
    { tab: 'messages', href: '/messages', labelKey: 'messages', icon: MessageSquare },
    { tab: 'me', href: '/profile/my-groups', labelKey: 'me', icon: User },
];

/** The desktop header's one link, Manas grupas: it marks the 'me' tab (the own page), the same logic as the phone bar. */
export const HEADER_LINK = { tab: 'me', href: '/profile/my-groups', icon: Users } as const satisfies { tab: BottomTab; href: string; icon: LucideIcon };

export type MePage = {
    href: string;
    labelKey: 'myGroups' | 'messages' | 'notifications' | 'settings';
    icon: LucideIcon;
    match: (pathname: string) => boolean;
    /** Which count the menu shows at the end of the entry (`useOwnCounts`, `useUnreadMessages`). */
    badge?: 'messages' | 'myGroups' | 'notifications';
};

/** The pages of the own area, in menu order (AR-60, R17: Mans profils is the profile card, not a page here; Paziņojumi sits between Ziņas and Iestatījumi, which stays last, OD-03). */
export const ME_PAGES: MePage[] = [
    { href: '/profile/my-groups', labelKey: 'myGroups', icon: Users, match: (p) => under(p, '/profile/my-groups'), badge: 'myGroups' },
    { href: '/messages', labelKey: 'messages', icon: MessageSquare, match: (p) => under(p, '/messages'), badge: 'messages' },
    { href: '/notifications', labelKey: 'notifications', icon: Bell, match: (p) => under(p, '/notifications'), badge: 'notifications' },
    { href: '/settings', labelKey: 'settings', icon: Settings, match: (p) => under(p, '/settings') },
];

/** Pages that end with the slim footer: discovery and reading pages (AR-16). */
export const FOOTER_PATHS = ['/', '/about', '/privacy'] as const;
