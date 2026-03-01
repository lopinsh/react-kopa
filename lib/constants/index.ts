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
export const GROUP_TYPES = ['PUBLIC', 'PRIVATE', 'SINGLE_EVENT'] as const;

export type GroupType = (typeof GROUP_TYPES)[number];

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
