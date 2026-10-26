/**
 * Centralized constant lists for the Ejam Kopā platform.
 * Used across components, schemas, and services to ensure consistency.
 */

export * from './admin-panel';

/** Accent when no category is chosen: quiet text colour. The site colour is for buttons only (AR-06). */
export const NEUTRAL_ACCENT = 'var(--foreground-muted)';

/**
 * Most sub-categories (tags) one group can have, pending ones included. A limit "for now" while
 * the category structure settles; groups saved with more keep working (they can only shrink).
 */
export const MAX_GROUP_TAGS = 2;
/** A pending sub-category is offered to everyone once this many different people have chosen it. */
export const MIN_PENDING_TAG_SUPPORTERS = 2;

/** Caps on lists that grow with use. They sit far above today's volumes; when one is reached the oldest rows drop out of view (no "load more" yet). */
/** Messages one chat loads (the newest; shown oldest first). */
export const CHAT_HISTORY_LIMIT = 200;
/** Chats listed in the inbox (most recently active first); the unread badge looks at the same chats. */
export const INBOX_LIMIT = 100;
/** Events one group page lists (the newest by start date). */
export const GROUP_EVENTS_LIMIT = 200;
/** Events the discovery list loads per source (public, members-only). */
export const DISCOVERY_EVENTS_LIMIT = 100;
/** Most events one discovery list call may ask for. */
export const DISCOVERY_EVENTS_MAX_LIMIT = 200;
/** Longest date span (days) the event list and the per-day counts accept: a month view plus its spill weeks. */
export const DISCOVERY_DAY_RANGE_MAX = 62;
/** Months ahead (after this one) the discovery calendar offers. */
export const DISCOVERY_CALENDAR_MONTHS_AHEAD = 12;
/** Longest card description (first words of the public home section), characters; room for the 7 hover lines of a card (R21-G). */
export const GROUP_TAGLINE_MAX = 320;
/** Longest event excerpt on a row, characters. */
export const EVENT_EXCERPT_MAX = 140;
/** Longest text in a group or event panel, characters. */
export const PANEL_TEXT_MAX = 400;
/** Most faces the "who is going" line shows. */
export const FACES_MAX = 3;
/** id of a panel's title element (only one panel exists at a time): focus goes there when the content changes. */
export const PANEL_TITLE_ID = 'panel-title';
/** id of the panel's dialog element, for the grow/shrink from the clicked card (lib/panel-origin.ts). */
export const PANEL_DIALOG_ID = 'panel-dialog';
/** The one view-transition name: set on the clicked card or on the overlay at click time, never at rest. */
export const PANEL_VT_NAME = 'panel-origin';
/** The overlay grows out of the card (ms, mirrored in app/globals.css). */
export const PANEL_GROW_MS = 260;
/** The overlay shrinks back into the card (ms, mirrored in app/globals.css). */
export const PANEL_SHRINK_MS = 220;
/** Longest wait for the panel to mount or unmount inside a view transition (ms): then the transition ends without a target. */
export const PANEL_VT_WAIT_MS = 300;
/** Announcements one group loads (newest first). */
export const ANNOUNCEMENTS_LIMIT = 100;

/** Manas grupas (AR-61): how far ahead "Tuvākie pasākumi" looks (days) and how many events it lists. */
export const MY_UPCOMING_DAYS = 30;
export const MY_UPCOMING_MAX = 20;
/** Manas grupas "Jaunumi": how far back announcements go (days) and how many are listed. */
export const MY_NEWS_DAYS = 30;
export const MY_NEWS_MAX = 10;
/** The "new" count counts from the last visit to Manas grupas, or this many days back when there was none (AR-14). */
export const MY_NEW_FALLBACK_DAYS = 7;
/** Rows in the messages and bell dropdowns. */
export const DROPDOWN_ROWS = 5;
/** Paziņojumi page: rows per page and most pages "Rādīt vēl" reaches. */
export const NOTIFICATIONS_PAGE = 30;
export const NOTIFICATIONS_MAX_PAGES = 10;
/** Group names shown on a personal Ziņas row ("groups you share"), then "+N". */
export const SHARED_GROUPS_SHOWN = 2;

/** Most sections (About, Practical info, …) one group can have. */
export const MAX_SECTIONS = 6;

/**
 * Group visibility and lifecycle types.
 */
export const GROUP_TYPES = ['PUBLIC', 'PRIVATE'] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

/**
 * Reasons a person can pick when reporting, in the order shown. The English words are what is stored in `Report.reason`
 * (keep them stable); the label shown comes from `report.reason<Value>` in the messages. 'Inappropriate' is shown as
 * "Harmful content".
 */
export const REPORT_REASONS = ['Spam', 'Inappropriate', 'Violence', 'Other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** A reason a new report may carry (only the ones offered). */
export function isReportReason(value: string): value is ReportReason {
    return (REPORT_REASONS as readonly string[]).includes(value);
}

/** Values that can stand in `Report.reason`: the ones offered, plus 'Harassment' from older reports (shown as "Harmful content" too). */
export function isStoredReportReason(value: string): value is ReportReason | 'Harassment' {
    return isReportReason(value) || value === 'Harassment';
}

export const EVENT_VISIBILITY = ['PUBLIC', 'MEMBERS_ONLY'] as const;
export type EventVisibility = (typeof EVENT_VISIBILITY)[number];
export const EVENT_JOIN_MODES = ['OPEN', 'REQUEST'] as const;
export type EventJoinModeValue = (typeof EVENT_JOIN_MODES)[number];

/** Group cards one discovery page shows, and how many "Rādīt vēl" adds. */
export const DISCOVERY_GROUPS_PAGE = 24;
/** Most group cards one discovery URL may ask for (`?limit=`). */
export const DISCOVERY_GROUPS_MAX = 480;
/** Search (R7): fewest letters of a word that searches, the wait after the last key, rows per kind, themes on an empty field, recent words kept, their storage key, the longest word. */
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_DEBOUNCE_MS = 200;
export const SEARCH_ROWS_MAX = 5;
export const SEARCH_IDLE_THEMES = 8;
export const SEARCH_RECENT_MAX = 5;
export const SEARCH_RECENT_KEY = 'ek:recent-searches';
export const SEARCH_WORD_MAX = 100;
/** Longest category or tag name (`categoryNameSchema`). */
export const CATEGORY_NAME_MAX = 60;
/** Cookie holding whether the category drawer is folded ('1'), read on the server. */
export const DISCOVERY_RAIL_COOKIE = 'ek_disc_rail';

/**
 * Titles of the sections a new group starts with. They are stored as ordinary per-language title rows
 * (both languages at creation), so a visitor sees the default in their own language until the owner renames it.
 */
export const DEFAULT_SECTION_TITLES = {
    about: { lv: 'Par mums', en: 'About us' },
    practical: { lv: 'Praktiskā informācija', en: 'Practical info' },
} as const;

/** Sample text of the "Practical info" section a new group starts with, in the creator's language. */
export const PRACTICAL_INFO_SAMPLE: Record<'lv' | 'en', string> = {
    lv: '<p>Kur un cikos tiekamies? Ko ņemt līdzi? Uzraksti šeit, kas biedriem jāzina. Šo tekstu vari pārrakstīt vai izdzēst visu sadaļu.</p>',
    en: '<p>Where and when do we meet? What should people bring? Write here what members need to know. You can rewrite this text or delete the whole section.</p>',
};

/** True when a section title is one of the built-in defaults (in either language), i.e. not renamed by the owner. */
export function isDefaultSectionTitle(title: string): boolean {
    const trimmed = title.trim();
    return Object.values(DEFAULT_SECTION_TITLES).some((d) => d.lv === trimmed || d.en === trimmed);
}

/**
 * Feedback mode (site admins leaving notes on pages). Mirrors the FeedbackKind / FeedbackStatus enums in the schema.
 */
export const FEEDBACK_KINDS = ['BUG', 'IDEA', 'IMPROVEMENT', 'QUESTION'] as const;
export type FeedbackKindValue = (typeof FEEDBACK_KINDS)[number];

export const FEEDBACK_STATUSES = ['OPEN', 'DOING', 'DONE', 'WONT_DO'] as const;
export type FeedbackStatusValue = (typeof FEEDBACK_STATUSES)[number];
/** Admin feedback tabs and the statuses each one holds. */
export const FEEDBACK_TABS = ['open', 'completed'] as const;
export type FeedbackTab = (typeof FEEDBACK_TABS)[number];
export const FEEDBACK_TAB_STATUSES: Record<FeedbackTab, readonly FeedbackStatusValue[]> = {
    open: ['OPEN', 'DOING'],
    completed: ['DONE', 'WONT_DO'],
};

export const FEEDBACK_TEXT_MAX = 2000;

/**
 * Stable names of the shared UI components, set as `data-ui` on each component's root element.
 * Feedback mode outlines every named element and stores the name with a note, so a note leads an agent
 * straight to the component. The UI-elements page in the Handbook shows each one with its file path.
 */
export const UI = {
    groupCard: 'group-card',
    groupRow: 'group-row',
    createCard: 'create-card',
    filterLine: 'filter-line',
    filterButton: 'filter-button',
    searchWordChip: 'filter-search-word',
    veidsLine: 'veids-line',
    viewSwitch: 'view-switch',
    clearAll: 'clear-all',
    filterList: 'filter-list',
    categoryDrawer: 'category-drawer',
    eventRow: 'event-row',
    dayStrip: 'day-strip',
    dateChoices: 'date-choices',
    datePhone: 'filter-date-phone',
    datePicker: 'date-picker',
    textLink: 'text-link',
    groupBanner: 'group-banner',
    groupStickyBar: 'group-sticky-bar',
    groupMenu: 'group-menu',
    socialLinks: 'social-links',
    nextMeeting: 'next-meeting',
    joinButton: 'join-button',
    contactDialog: 'contact-dialog',
    pendingState: 'pending-state',
    groupMoreMenu: 'group-more-menu',
    groupMoreButton: 'group-more-button',
    switch: 'switch',
    memberCard: 'member-card',
    requestCard: 'request-card',
    announcementItem: 'announcement-item',
    conversationList: 'conversation-list',
    chatListItem: 'chat-list-item',
    chatBubble: 'chat-bubble',
    modal: 'modal',
    confirmDialog: 'confirm-dialog',
    emptyState: 'empty-state',
    toast: 'toast',
    sheet: 'sheet',
    confirmPopover: 'confirm-popover',
    skeleton: 'skeleton',
    fieldCounter: 'field-counter',
    errorState: 'error-state',
    drawer: 'drawer',
    tabs: 'tabs',
    formField: 'form-field',
    filterChip: 'filter-chip',
    badge: 'badge',
    buttonPrimary: 'button-primary',
    buttonSecondary: 'button-secondary',
    buttonQuiet: 'button-quiet',
    buttonDanger: 'button-danger',
    iconButton: 'icon-button',
    logo: 'logo',
    categoryLine: 'category-line',
    categoryDisc: 'category-disc',
    roleTag: 'role-tag',
    banner: 'banner',
    notice: 'notice',
    header: 'header',
    mobileNav: 'mobile-nav',
    footer: 'footer',
    dropdownMenu: 'dropdown-menu',
    menuItem: 'menu-item',
    notificationItem: 'notification-item',
    searchBar: 'search-bar',
    languageSwitch: 'language-switch',
    languageList: 'language-list',
    languageEditor: 'language-editor',
    languageEditorMenu: 'language-editor-menu',
    profileMenu: 'profile-menu',
    shieldMenu: 'shield-menu',
    personHeader: 'person-header',
    ownMenu: 'own-menu',
    myGroupsSections: 'my-groups-sections',
    sectionMenu: 'section-menu',
    newsItem: 'news-item',
    requestRow: 'request-row',
    headerDropdown: 'header-dropdown',
    bellList: 'bell-list',
    conversationRow: 'conversation-row',
    notificationFeed: 'notification-feed',
    ownBarPhone: 'own-bar-phone',
    panel: 'panel',
    eventPanel: 'event-panel',
    eventPage: 'event-page',
    eventOrganiser: 'event-organiser',
    facesLine: 'faces',
    joinStep: 'join-step',
    goingButton: 'going-button',
    searchOverlay: 'search',
    searchPanel: 'search-panel',
    searchChips: 'search-chips',
    themeChip: 'choice-chip',
    recentSearches: 'recent-searches',
    searchResults: 'search-results',
    alsoMatches: 'search-matches',
} as const;
export type UiName = (typeof UI)[keyof typeof UI];

export * from './theme';

/** The site's languages: the single list routing, owner-written text, message overrides and the proxy share. */
export const LOCALES = ['lv', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'lv';

/** Each language in its own words, the same in every locale (AR-15). */
export const LOCALE_NAMES: Record<Locale, string> = { lv: 'Latviešu', en: 'English' };
export * from './adminNav';
export * from './type-roles';

/** Unsplash API rules: the `utm_source` of every link to Unsplash, and the crop of a stored banner (16:9). */
export const UNSPLASH_UTM = 'ejam_kopa';
export const BANNER_IMG_PARAMS = 'w=1600&h=900&fit=crop&crop=entropy&auto=format&q=75';
export const BANNER_THUMB_PARAMS = 'w=400&h=225&fit=crop&crop=entropy&auto=format&q=60';

/** Unsplash demo key = 50 requests/hour for the whole site; these keep every process well under it (R26). */
export const UNSPLASH_LIMITS = {
    cacheMs: 24 * 60 * 60 * 1000,
    cacheEntries: 200,
    windowMs: 60 * 60 * 1000,
    /** Outgoing requests per rolling hour per process; the last `trackReserve` are kept for download pings. */
    processBudget: 12,
    trackReserve: 2,
    /** Refuse new searches while Unsplash's own remaining count (seen on any response) is at or below this. */
    remainingFloor: 8,
    userSearches: 6,
    userWindowMs: 10 * 60 * 1000,
    maxPage: 3,
    perPage: 8,
} as const;
