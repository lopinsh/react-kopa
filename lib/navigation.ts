import { Compass, Users, User, MessageSquare, Settings, type LucideIcon } from 'lucide-react';

/** The four tabs of the phone bottom bar (the fifth cell is the + button). */
export const BOTTOM_TABS = ['discover', 'groups', 'messages', 'me'] as const;
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
    if (under(pathname, '/profile/my-groups')) return 'groups';
    if (under(pathname, '/messages')) return 'messages';
    if (pathname === '/profile' || pathname === '/profile/edit' || under(pathname, '/settings')) return 'me';
    if (groupBasePath(pathname)) return 'keep';
    return null;
}

export type BottomLink = { tab: BottomTab; href: string; labelKey: 'discover' | 'groups' | 'messages' | 'me'; icon: LucideIcon };

export const BOTTOM_LINKS: BottomLink[] = [
    { tab: 'discover', href: '/', labelKey: 'discover', icon: Compass },
    { tab: 'groups', href: '/profile/my-groups', labelKey: 'groups', icon: Users },
    { tab: 'messages', href: '/messages', labelKey: 'messages', icon: MessageSquare },
    { tab: 'me', href: '/profile', labelKey: 'me', icon: User },
];

export type MePage = {
    href: string;
    labelKey: 'myProfile' | 'myGroups' | 'messages' | 'settings';
    icon: LucideIcon;
    match: (pathname: string) => boolean;
    badge?: 'messages';
};

/** The pages of the own area, in menu order (AR-60; Paziņojumi joins in R8, Iestatījumi stays last, OD-03). */
export const ME_PAGES: MePage[] = [
    { href: '/profile', labelKey: 'myProfile', icon: User, match: (p) => p === '/profile' || p === '/profile/edit' },
    { href: '/profile/my-groups', labelKey: 'myGroups', icon: Users, match: (p) => under(p, '/profile/my-groups') },
    { href: '/messages', labelKey: 'messages', icon: MessageSquare, match: (p) => under(p, '/messages'), badge: 'messages' },
    { href: '/settings', labelKey: 'settings', icon: Settings, match: (p) => under(p, '/settings') },
];

/** Pages that end with the slim footer: discovery and reading pages (AR-16). */
export const FOOTER_PATHS = ['/', '/about', '/privacy'] as const;
