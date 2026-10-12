'use client';

import { useFormContext } from 'react-hook-form';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import type { GroupFormValues } from '@/lib/validations/group';
import { useTranslations } from 'next-intl';
import type { TaxonomySelection } from '@/lib/types/taxonomy';
import L1Picker from '@/components/groups/create-wizard/L1Picker';
import TagPicker from '@/components/groups/TagPicker';
import LocationStep from '@/components/groups/create-wizard/LocationStep';

type Props = {
    taxonomy: TaxonomyTree;
    taxSelection: TaxonomySelection | null;
    handleTaxChange: (sel: TaxonomySelection | null) => void;
    /** Changing the main category just removed the sub-topics that were chosen. */
    tagsCleared?: boolean;
};

export default function TaxonomyStep({ taxonomy, taxSelection, handleTaxChange, tagsCleared = false }: Props) {
    const t = useTranslations('wizard');
    const { watch, formState: { errors } } = useFormContext<GroupFormValues>();
    const noTagsYet = (watch('tagIds') ?? []).length === 0;

    // Derive the currently selected L1 object to pass to the L2L3 picker
    const selectedL1 = taxSelection?.kind === 'existing'
        ? taxonomy.find(t => t.id === taxSelection.categoryId)
        : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <L1Picker
                taxonomy={taxonomy}
                value={taxSelection}
                onChange={handleTaxChange}
            />

            {errors.categoryId && !taxSelection && (
                <p className="mt-2 text-xs text-red-500 font-medium">
                    {t('CATEGORY_REQUIRED')}
                </p>
            )}

            {/* Only show Additional Tags if an L1 is chosen */}
            {selectedL1 && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-8">
                    {tagsCleared && noTagsYet && (
                        <p role="status" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground-muted">
                            {t('tagsClearedOnCategoryChange')}
                        </p>
                    )}
                    <TagPicker l1={selectedL1} allowL3={false} />
                    <div className="pt-2 border-t border-border/50">
                        <LocationStep />
                    </div>
                </div>
            )}
        </div>
    );
}
