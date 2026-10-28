import { LOCALES } from '@/lib/constants';

const L = LOCALES.join('|');
/** Pages a panel must never open over: the group wizard and admin (their links and redirects want the full page). */
const NEVER_UNDER = new RegExp(`^/(${L})/(create|admin)(/|$)`);

/** A group's or an event's address without the locale (`/travel/group/x`, `…/events/y`): a soft click on it opens a panel over the page. */
export function isPanelAddress(path: string): boolean {
    return /^\/[^/]+\/group\/[^/]+(\/events\/[^/]+)?\/?$/.test(path);
}

/** Notifications that are work for the team on the event page (approve, let in): their link is a full page load, never the panel. */
export const FULL_PAGE_NOTIFICATIONS: readonly string[] = ['EVENT_REQUEST', 'EVENT_SPOT_FREED'];

/** A panel's address: the group's home, or one of its events. */
export interface PanelTarget {
    locale: string;
    l1Slug: string;
    groupSlug: string;
    eventSlug?: string;
}

/**
 * An intercepted soft navigation (app/[locale]/@panel) where the full page is what the person asked for: Next intercepts a group's or
 * an event's address from every page under /[locale], because interception is matched on the page you are on (`Next-Url`) and any
 * path below the intercepting route. `from` is that `next-url` request header (the route path, no search).
 * - a group's home from inside the same group (its tabs, its event pages and their panels, a save in its settings);
 * - an event from its own address (an open event panel's "Visa informācija") or its own forms (create, edit: the save redirect);
 * - anything from the group wizard or admin.
 */
export function wantsFullPage(from: string | null, t: PanelTarget): boolean {
    if (!from) return false;
    const path = from.replace(/\/$/, '');
    if (NEVER_UNDER.test(path)) return true;
    const group = `/${t.locale}/${t.l1Slug}/group/${t.groupSlug}`;
    if (!t.eventSlug) return path === group || path.startsWith(`${group}/`);
    const event = `${group}/events/${t.eventSlug}`;
    return path === event || path.startsWith(`${event}/`) || path === `${group}/create-event`;
}
