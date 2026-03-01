import {
    Home,
    Compass,
    Users,
    User,
    type LucideIcon,
} from 'lucide-react';

export type NavLink = {
    href: string;
    labelKey: string; // key in messages/nav namespace
    icon: LucideIcon;
};

export const NAV_LINKS: NavLink[] = [
    {
        href: '/',
        labelKey: 'discover',
        icon: Compass,
    },
    {
        href: '/profile/my-groups',
        labelKey: 'myGroups',
        icon: Users,
    },
    {
        href: '/profile',
        labelKey: 'profile',
        icon: User,
    },
];
