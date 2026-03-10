import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';

type GroupTaxonomySource = {
    categoryId: string;
    tags?: Array<{ id: string }>;
};

export function deriveInitialTaxonomy(group: GroupTaxonomySource, taxonomy: TaxonomyTree): {
    initialTaxSelection: TaxonomySelection | null;
    initialTagIds: string[];
} {
    const catId = group.categoryId;
    const tagIds = (group.tags ?? []).map((tag) => tag.id);

    for (const l1 of taxonomy) {
        if (l1.id === catId) {
            return {
                initialTaxSelection: {
                    kind: 'existing',
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title,
                },
                initialTagIds: tagIds,
            };
        }

        const l2 = l1.subcategories.find((subcategory) => subcategory.id === catId);
        if (l2) {
            if (!tagIds.includes(l2.id)) {
                tagIds.push(l2.id);
            }
            return {
                initialTaxSelection: {
                    kind: 'existing',
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title,
                },
                initialTagIds: tagIds,
            };
        }

        const l3 = l1.subcategories.flatMap((subcategory) => subcategory.tags).find((tag) => tag.id === catId);
        if (l3) {
            if (!tagIds.includes(l3.id)) {
                tagIds.push(l3.id);
            }
            return {
                initialTaxSelection: {
                    kind: 'existing',
                    categoryId: l1.id,
                    l1Color: l1.color,
                    label: l1.title,
                },
                initialTagIds: tagIds,
            };
        }
    }

    return {
        initialTaxSelection: null,
        initialTagIds: tagIds,
    };
}
