'use client';

import { useFormContext } from 'react-hook-form';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import type { GroupFormValues } from '@/lib/validations/group';
import type { TaxonomySelection } from '@/components/ui/TaxonomyPicker';
import L1Picker from '@/components/groups/create-wizard/L1Picker';
import TagPicker from '@/components/groups/TagPicker';

type Props = {
    taxonomy: TaxonomyTree;
    taxSelection: TaxonomySelection | null;
    handleTaxChange: (sel: TaxonomySelection | null) => void;
    accentColor: string;
};

export default function TaxonomyStep({ taxonomy, taxSelection, handleTaxChange, accentColor }: Props) {
    const { formState: { errors } } = useFormContext<GroupFormValues>();

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
                accentColor={accentColor}
            />

            {errors.categoryId && !taxSelection && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.categoryId.message}</p>
            )}

            {/* Only show Additional Tags if an L1 is chosen */}
            {selectedL1 && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <TagPicker l1={selectedL1} accentColor={accentColor} allowL3={false} />
                </div>
            )}
        </div>
    );
}
