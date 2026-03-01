'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Tags } from 'lucide-react';
import { type GroupFormValues } from '@/lib/validations/group';
import L1Picker from '@/components/groups/create-wizard/L1Picker';
import TagPicker from '@/components/groups/TagPicker';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';
import SettingsSection from './SettingsSection';

type Props = {
    taxonomy: TaxonomyTree;
    taxSelection: TaxonomySelection | null;
    onTaxChange: (sel: TaxonomySelection | null) => void;
    accentColor: string;
    selectedL1: any;
};

export default function CategorizationSection({ taxonomy, taxSelection, onTaxChange, accentColor, selectedL1 }: Props) {
    const gt = useTranslations('group');
    const { formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={gt('tabCategorization')}
            description={gt('tabCategorizationDescription')}
            icon={Tags}
        >
            <div className="p-8 rounded-3xl border border-border bg-surface-elevated/5 dark:bg-surface-elevated/20 space-y-8">
                <div>
                    <L1Picker
                        taxonomy={taxonomy}
                        value={taxSelection}
                        onChange={onTaxChange}
                        accentColor={accentColor}
                    />
                    {errors.categoryId && (
                        <p className="mt-2 text-xs text-red-500">{errors.categoryId.message}</p>
                    )}
                </div>

                {selectedL1 && (
                    <div className="pt-8 border-t border-border animate-in fade-in slide-in-from-top-4 duration-500">
                        <TagPicker
                            l1={selectedL1}
                            accentColor={selectedL1.color || '#6366f1'}
                            allowL3={false}
                        />
                    </div>
                )}
            </div>
        </SettingsSection>
    );
}
