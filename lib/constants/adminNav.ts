import { DESIGN_PARTS } from './theme';
import { Activity, AlertTriangle, BookOpen, EyeOff, Languages, ListChecks, MapPin, MessageSquareText, Network, Palette, UserCog, type LucideIcon } from 'lucide-react';

/** Admin > the five sections and their pages, in menu order (AR-68). One list: the sections bar, the pages list and the phone drawer all read it. */
export type AdminBadge = 'tags' | 'cities' | 'reports' | 'suggestions';
export type AdminSectionId = 'moderation' | 'structure' | 'site' | 'team' | 'development';

export type AdminNavItem = {
    id: string;
    href: string;
    match: 'exact' | 'prefix';
    icon: LucideIcon;
    badge?: AdminBadge;
    /** Hidden from admins who are not the owner. None today: every page checks its own access. */
    ownerOnly?: true;
    /** Design parts, opened as `?part=`; the Handbook's chapters are dynamic and come from the layout. */
    parts?: readonly string[];
};

export type AdminNavSection = { id: AdminSectionId; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavSection[] = [
    {
        id: 'moderation',
        items: [
            { id: 'overview', href: '/admin', match: 'exact', icon: EyeOff },
            { id: 'reports', href: '/admin/reports', match: 'prefix', icon: AlertTriangle, badge: 'reports' },
            { id: 'activity', href: '/admin/activity', match: 'prefix', icon: Activity },
        ],
    },
    {
        id: 'structure',
        items: [
            { id: 'categories', href: '/admin/categories', match: 'prefix', icon: Network, badge: 'tags' },
            { id: 'locations', href: '/admin/locations', match: 'prefix', icon: MapPin, badge: 'cities' },
        ],
    },
    {
        id: 'site',
        items: [
            { id: 'design', href: '/admin/design', match: 'prefix', icon: Palette, parts: DESIGN_PARTS },
            { id: 'translations', href: '/admin/translations', match: 'prefix', icon: Languages, badge: 'suggestions' },
        ],
    },
    { id: 'team', items: [{ id: 'team', href: '/admin/team', match: 'prefix', icon: UserCog }] },
    {
        id: 'development',
        items: [
            { id: 'feedback', href: '/admin/feedback', match: 'prefix', icon: MessageSquareText },
            { id: 'handbook', href: '/admin/handbook', match: 'prefix', icon: BookOpen },
            { id: 'buildPlan', href: '/admin/development/build-plan', match: 'prefix', icon: ListChecks },
        ],
    },
];
