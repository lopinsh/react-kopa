/**
 * Centralized constant lists for the Ejam Kopā platform.
 * Used across components, schemas, and services to ensure consistency.
 */

/**
 * Cities/Locations currently supported by the platform.
 * Mirrors the set used in database seeding.
 */
export const CITIES = [
    'Riga',
    'Jurmala',
    'Liepaja',
    'Daugavpils',
    'Ventspils',
    'Jelgava',
    'Jekabpils',
    'Sigulda',
    'Cesis',
    'Valmiera',
] as const;

export type City = (typeof CITIES)[number];

/**
 * Group visibility and lifecycle types.
 */
export const GROUP_TYPES = ['PUBLIC', 'PRIVATE'] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

/**
 * Reasons a person can pick when reporting. The English words are what is stored in `Report.reason`
 * (keep them stable); the label shown comes from `report.reason<Value>` in the messages.
 */
export const REPORT_REASONS = ['Spam', 'Harassment', 'Inappropriate', 'Other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export function isReportReason(value: string): value is ReportReason {
    return (REPORT_REASONS as readonly string[]).includes(value);
}

export const EVENT_VISIBILITY = ['PUBLIC', 'MEMBERS_ONLY'] as const;
export type EventVisibility = (typeof EVENT_VISIBILITY)[number];
export const EVENT_JOIN_MODES = ['OPEN', 'REQUEST'] as const;
export type EventJoinModeValue = (typeof EVENT_JOIN_MODES)[number];

/**
 * Common Category Metadata (Static identifiers)
 */
export const CATEGORY_SLUGS = [
    'sports',
    'tech',
    'art',
    'movement',
    'gathering',
    'performance',
    'civic',
    'practical'
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/**
 * Discovery Page Constants
 */
export const DISCOVERY_TABS = ['groups', 'events'] as const;
export type DiscoveryTab = (typeof DISCOVERY_TABS)[number];

export const DISCOVERY_VIEWS = ['grid', 'list'] as const;
export type DiscoveryView = (typeof DISCOVERY_VIEWS)[number];

/** Events are local to Latvia; show their dates and times in Riga time regardless of server zone. */
export const EVENT_TIME_ZONE = 'Europe/Riga';

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

export const FEEDBACK_TEXT_MAX = 2000;

/**
 * Stable names of the shared UI components, set as `data-ui` on each component's root element.
 * Feedback mode outlines every named element and stores the name with a note, so a note leads an agent
 * straight to the component. The UI-elements page in the Handbook shows each one with its file path.
 */
export const UI = {
    groupCard: 'group-card',
    groupListRow: 'group-list-row',
    eventCard: 'event-card',
    eventListRow: 'event-list-row',
    eventRow: 'event-row',
    groupHeader: 'group-header',
    slimBar: 'slim-bar',
    joinButton: 'join-button',
    memberCard: 'member-card',
    requestCard: 'request-card',
    announcementCard: 'announcement-card',
    conversationList: 'conversation-list',
    chatListItem: 'chat-list-item',
    chatBubble: 'chat-bubble',
    modal: 'modal',
    confirmDialog: 'confirm-dialog',
    emptyState: 'empty-state',
    toast: 'toast',
    tabs: 'tabs',
    formField: 'form-field',
    filterChip: 'filter-chip',
    badge: 'badge',
    buttonPrimary: 'button-primary',
    buttonSecondary: 'button-secondary',
    buttonDanger: 'button-danger',
    banner: 'banner',
    notice: 'notice',
    header: 'header',
    sidebar: 'sidebar',
    mobileNav: 'mobile-nav',
    footer: 'footer',
} as const;
export type UiName = (typeof UI)[keyof typeof UI];
export const UI_NAMES = Object.values(UI) as [UiName, ...UiName[]];
