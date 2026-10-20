'use client';

import { FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import BasicsSection from './BasicsSection';
import SocialSection from './SocialSection';
import CategorizationSection from './CategorizationSection';
import SaveRow from './SaveRow';
import { useGroupSettingsForm, type GroupSettingsFormProps } from './useGroupSettingsForm';

/** Group tab: name, city, images, category and topics, links. */
export default function GroupTab(props: GroupSettingsFormProps) {
    const gs = useTranslations('groupSettings');
    const { methods, onSubmit, isPending, serverError, saveBlocked, taxSelection, selectedL1, tagsCleared, handleTaxChange } = useGroupSettingsForm(props);
    const { canEditOwnerFields, taxonomy, initialTaxonomy } = props;

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                {!canEditOwnerFields && (
                    <p className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3.5 text-sm text-foreground-muted shadow-card frame">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        {gs('ownerOnlyNote')}
                    </p>
                )}

                <BasicsSection canEditName={canEditOwnerFields} />

                {canEditOwnerFields && (
                    <div id="category" className="scroll-mt-24">
                        <CategorizationSection
                            taxonomy={taxonomy}
                            taxSelection={taxSelection}
                            onTaxChange={handleTaxChange}
                            selectedL1={selectedL1}
                            maxTags={initialTaxonomy.initialTagIds.length}
                            tagsCleared={tagsCleared}
                        />
                    </div>
                )}

                <div id="links" className="scroll-mt-24">
                    <SocialSection />
                </div>

                <SaveRow isPending={isPending} disabled={saveBlocked} serverError={serverError} />
            </form>
        </FormProvider>
    );
}
