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
