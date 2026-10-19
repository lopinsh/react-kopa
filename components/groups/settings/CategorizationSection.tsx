'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { type GroupFormValues } from '@/lib/validations/group';
import L1Picker from '@/components/groups/create-wizard/L1Picker';
import TagPicker from '@/components/groups/tag-picker/TagPicker';
import type { L1Category, TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/lib/types/taxonomy';
import SettingsSection from './SettingsSection';
import { categoryColor } from '@/lib/theme/category';

type Props = {
    taxonomy: TaxonomyTree;
    taxSelection: TaxonomySelection | null;
    onTaxChange: (sel: TaxonomySelection | null) => void;
    selectedL1: L1Category | null;
    /** Tags the group had when the form opened (a legacy group may keep more than the usual limit). */
    maxTags?: number;
    /** Changing the main category just removed the sub-topics that were chosen. */
    tagsCleared?: boolean;
};

export default function CategorizationSection({ taxonomy, taxSelection, onTaxChange, selectedL1, maxTags, tagsCleared = false }: Props) {
    const gt = useTranslations('group');
  const c_common = useTranslations('common');
    const t = useTranslations('wizard');
    const { watch, formState: { errors } } = useFormContext<GroupFormValues>();
    const noTagsYet = (watch('tagIds') ?? []).length === 0;

    return (
        <SettingsSection
            title={c_common('tabCategorization')}
            description={gt('tabCategorizationDescription')}
        >
            <div className="space-y-8">
                <div>
                    <L1Picker
                        taxonomy={taxonomy}
                        value={taxSelection}
                        onChange={onTaxChange}
                    />
                    {errors.categoryId && (
                        <p className="mt-2 text-xs text-danger">{errors.categoryId.message}</p>
                    )}
                </div>

                {selectedL1 && (
                    <div className="pt-8 border-t border-border">
                        {tagsCleared && noTagsYet && (
                            <p role="status" className="mb-4 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground-muted">
                                {t('tagsClearedOnCategoryChange')}
                            </p>
                        )}
                        {/* The picker colours itself from the category's accent. */}
                        <div style={{ '--accent': categoryColor(selectedL1.slug, selectedL1.color) } as React.CSSProperties}>
                            <TagPicker l1={selectedL1} allowL3={false} maxTags={maxTags} />
                        </div>
                    </div>
                )}
            </div>
        </SettingsSection>
    );
}

