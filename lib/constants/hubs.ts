/** Hub pages (Kopiena, K1). Rule ids K1-xx in docs/development/specs/K1.md. */

/** How many groups a hub list shows in each tier: 1-4 cards, 5-16 compact rows, more: the first 16 and a link to the board (K-106). */
export const HUB_GROUP_TIERS = { full: 4, list: 16 } as const;

/** Rows in the Pārskats previews (groups, events; K-106, K-94). */
export const HUB_PREVIEW_ROWS = 3;

/** Rows in each period of the Pārskats activity feed (K-24a). */
export const HUB_FEED_ROWS = 5;

/** Events shown at first and added by "Rādīt vēl" (K-112). */
export const HUB_EVENTS_STEP = 15;

/** Sub-veidi chips on a hub card (K-75) and on Pārskats (K-94). */
export const HUB_CARD_CHIPS = 3;
export const HUB_OVERVIEW_CHIPS = 6;

/** A group is "new" on a hub for this many days (Jaunās tab). */
export const HUB_NEW_DAYS = 30;

/** The pages of a hub, in menu order. */
export const HUB_PAGE_KEYS = ['overview', 'groups', 'events'] as const;
export type HubPageKey = (typeof HUB_PAGE_KEYS)[number];

/** Words a Veids / sub-veids slug may not take: they are page names under a hub or group routes. */
export const HUB_RESERVED_SLUGS = ['group', 'groups', 'events', 'messages', 'chat'] as const;
