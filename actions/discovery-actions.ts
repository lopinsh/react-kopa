'use server';

import { DiscoveryService } from '@/lib/services/discovery.service';
import type {
    DiscoveryFilters,
    ScopedResult,
    ContextualTaxonomy
} from '@/lib/types/discovery';

/**
 * Fetches groups based on discovery filters.
 * Thin wrapper around DiscoveryService.getGroups.
 */
export async function getGroups(filters: any, locale: string) {
    return DiscoveryService.getGroups(filters, locale);
}

/**
 * Fetches root categories for the discovery page.
 */
export async function getDiscoveryCategories(locale: string) {
    return DiscoveryService.getDiscoveryCategories(locale);
}

/**
 * Attempts to "snap" a search query to an existing category.
 */
export async function snapInterest(query: string, locale: string) {
    return DiscoveryService.snapInterest(query, locale);
}

/**
 * Fetches the taxonomy hierarchy for a specific category context.
 */
export async function getContextualTaxonomy(categoryId: string | null, locale: string) {
    return DiscoveryService.getContextualTaxonomy(categoryId, locale);
}

/**
 * Performs a contextual search for categories and groups.
 */
export async function searchContextual(
    query: string,
    locale: string,
    activeCat?: string,
    activeTag?: string
) {
    return DiscoveryService.searchContextual(query, locale, activeCat, activeTag);
}
