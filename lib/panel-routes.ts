import { LOCALES } from '@/lib/constants';

const L = LOCALES.join('|');
const SOURCE = new RegExp(`^/(${L})/?$`);
const TARGET = new RegExp(`^/(${L})/[^/]+/group/[^/]+(/events/[^/]+)?/?$`);

/** Discovery's route path as the router sends it in `Next-Url` (no search, route groups stripped): '/lv', '/en'. */
export const isPanelSource = (nextUrl: string): boolean => SOURCE.test(nextUrl);

/** A page a panel can stand in for: a group's home or one event. */
export const isPanelTarget = (pathname: string): boolean => TARGET.test(pathname);
