import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';

export function deriveInitialTaxonomy(group: any, taxonomy: TaxonomyTree) {
    const catId = group.categoryId;
    const groupTags = group.tags || [];

    // Check for wildcards first
    const mainCat = group.category;
    const wildcard = mainCat.isWildcard ? {
        id: mainCat.id,
        title: mainCat.titles?.[0]?.title || mainCat.slug,
        parentId: mainCat.parentId,
        isWildcard: true
    } : groupTags.find((t: any) => t.isWildcard);

    const tagIds = groupTags.filter((t: any) => !t.isWildcard).map((t: any) => t.id);
    const searchId = wildcard?.parentId || catId;

    for (const l1 of taxonomy) {
        // Case 1: Already an L1
        if (l1.id === searchId) {
            return {
                initialTaxSelection: {
                    kind: 'existing' as const,
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title
                },
                initialTagIds: tagIds,
                initialWildcard: wildcard ? { label: wildcard.title, parentId: wildcard.parentId } : null
            };
        }
        // Case 2: It's an L2
        const l2 = l1.subcategories.find(l2 => l2.id === searchId);
        if (l2) {
            if (!tagIds.includes(l2.id)) tagIds.push(l2.id);
            return {
                initialTaxSelection: {
                    kind: 'existing' as const,
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title
                },
                initialTagIds: tagIds,
                initialWildcard: wildcard ? { label: wildcard.title, parentId: wildcard.parentId } : null
            };
        }
        // Case 3: It's an L3
        const l3 = l1.subcategories.flatMap(s => s.tags).find(t => t.id === searchId);
        if (l3) {
            if (!tagIds.includes(l3.id)) tagIds.push(l3.id);
            return {
                initialTaxSelection: {
                    kind: 'existing' as const,
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title
                },
                initialTagIds: tagIds,
                initialWildcard: wildcard ? { label: wildcard.title, parentId: wildcard.parentId } : null
            };
        }
    }

    return {
        initialTaxSelection: null,
        initialTagIds: tagIds,
        initialWildcard: wildcard ? { label: wildcard.title, parentId: wildcard.parentId } : null
    };
}
