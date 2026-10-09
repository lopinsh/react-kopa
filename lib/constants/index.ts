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
 * Titles of the sections a new group starts with, per locale. Default titles are stored as the
 * English key and shown in the viewer's language until 2.13 stores default titles per language.
 */
export const DEFAULT_SECTION_TITLES: Record<string, { lv: string; en: string }> = {
    'About us': { lv: 'Par mums', en: 'About us' },
    'Practical info': { lv: 'Praktiskā informācija', en: 'Practical info' },
};

/** Sample text of the "Practical info" section a new group starts with, in the creator's language. */
export const PRACTICAL_INFO_SAMPLE: Record<'lv' | 'en', string> = {
    lv: '<p>Kur un cikos tiekamies? Ko ņemt līdzi? Uzraksti šeit, kas biedriem jāzina. Šo tekstu vari pārrakstīt vai izdzēst visu sadaļu.</p>',
    en: '<p>Where and when do we meet? What should people bring? Write here what members need to know. You can rewrite this text or delete the whole section.</p>',
};

function findDefaultSectionTitle(title: string): { lv: string; en: string } | undefined {
    const trimmed = title.trim();
    return Object.values(DEFAULT_SECTION_TITLES).find((d) => d.lv === trimmed || d.en === trimmed);
}

/** Shows a default section title (stored in either language) in the viewer's language; owner titles unchanged. */
export function localizeSectionTitle(title: string, locale: string): string {
    const defaults = findDefaultSectionTitle(title);
    if (!defaults) return title;
    return locale === 'lv' ? defaults.lv : defaults.en;
}

/** Stores an unchanged default title (as shown in either language) as its English key, so it stays a default. */
export function canonicalSectionTitle(title: string): string {
    return findDefaultSectionTitle(title)?.en ?? title;
}
