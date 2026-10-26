'use client';

import { useFormContext } from 'react-hook-form';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import type { GroupFormValues } from '@/lib/validations/group';
import { useTranslations } from 'next-intl';
import type { TaxonomySelection } from '@/lib/types/taxonomy';
import L1Picker from '@/components/groups/create-wizard/L1Picker';
import TagPicker from '@/components/groups/tag-picker/TagPicker';
import BannerPicker from '@/components/forms/banner/BannerPicker';

type Props = {
    taxonomy: TaxonomyTree;
    taxSelection: TaxonomySelection | null;
    handleTaxChange: (sel: TaxonomySelection | null) => void;
    /** Changing the main category just removed the sub-topics that were chosen. */
    tagsCleared?: boolean;
    searchEnabled: boolean;
    canEditUrl: boolean;
};

export default function TaxonomyStep({ taxonomy, taxSelection, handleTaxChange, tagsCleared = false, searchEnabled, canEditUrl }: Props) {
    const t = useTranslations('wizard');
    const { watch, setValue, formState: { errors } } = useFormContext<GroupFormValues>();
    const noTagsYet = (watch('tagIds') ?? []).length === 0;

    // Derive the currently selected L1 object to pass to the L2L3 picker
    const selectedL1 = taxSelection?.kind === 'existing'
        ? taxonomy.find(t => t.id === taxSelection.categoryId)
        : null;

    return (
        <div className="space-y-8 motion-safe:animate-fade">
            <L1Picker
                taxonomy={taxonomy}
                value={taxSelection}
                onChange={handleTaxChange}
            />

            {errors.categoryId && !taxSelection && (
                <p className="mt-2 text-meta text-danger">
                    {t('CATEGORY_REQUIRED')}
                </p>
            )}

            {/* Only show Additional Tags if an L1 is chosen */}
            {selectedL1 && (
                <div className="motion-safe:animate-pop space-y-8">
                    {tagsCleared && noTagsYet && (
                        <p role="status" className="rounded-xl line bg-surface px-3 py-2 text-body-sm text-foreground-muted">
                            {t('tagsClearedOnCategoryChange')}
                        </p>
                    )}
                    <TagPicker l1={selectedL1} allowL3={false} />
                </div>
            )}

            {/* The picture comes after the main category: its curated photos depend on it. A proposed category has none. */}
            {taxSelection && (
                <BannerPicker
                    id="group-banner"
                    kind="group"
                    value={{ url: watch('bannerImage') || null, credit: watch('bannerCredit') ?? null }}
                    onChange={(v) => {
                        setValue('bannerImage', v.url ?? '', { shouldDirty: true, shouldValidate: true });
                        setValue('bannerCredit', v.credit, { shouldDirty: true });
                    }}
                    l1Slug={selectedL1?.slug ?? null}
                    searchEnabled={searchEnabled}
                    canEditUrl={canEditUrl}
                    error={errors.bannerImage?.message ? t(errors.bannerImage.message as 'INVALID_URL') : undefined}
                />
            )}
        </div>
    );
}
