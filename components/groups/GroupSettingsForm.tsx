'use client';

import { useTransition, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupFormSchema, type GroupFormValues } from '@/lib/validations/group';
import { updateGroup, deleteGroup } from '@/actions/group-actions';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Save, AlertCircle, Info } from 'lucide-react';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';
import GroupSectionEditor from '@/components/groups/GroupSectionEditor';
import { useToast } from '@/hooks/use-toast';

import BasicsSection from './settings/BasicsSection';
import SocialSection from './settings/SocialSection';
import CategorizationSection from './settings/CategorizationSection';
import PrivacySection from './settings/PrivacySection';
import DangerZoneSection from './settings/DangerZoneSection';
import TransferOwnershipSection from './settings/TransferOwnershipSection';
import type { SettingsTab } from './SettingsTabs';

type Props = {
    group: {
        id: string;
        name: string;
        city: string;
        type: GroupFormValues['type'];
        categoryId: string;
        isAcceptingMembers: boolean;
        discordLink: string | null;
        websiteLink: string | null;
        instagramLink: string | null;
        bannerImage: string | null;
        sections: Array<{ id: string; title: string; content: string; order: number; visibility: 'PUBLIC' | 'MEMBERS_ONLY' }>;
        tags: Array<{ id: string; title: string; slug: string; level: number }>;
        slug: string;
        l1Slug: string;
    };
    taxonomy: TaxonomyTree;
    locale: string;
    activeTab: SettingsTab;
    /** Owner (and site admins): name, category, topics and access. Moderators get the rest. */
    canEditOwnerFields: boolean;
    /** Only the owner hands the group over or deletes it. */
    isOwner: boolean;
    /** Members and moderators the owner could hand the group to. */
    transferCandidates: Array<{ userId: string; name: string; role: 'ADMIN' | 'MEMBER' }>;
    initialTaxonomy: {
        initialTaxSelection: TaxonomySelection | null;
        initialTagIds: string[];
    };
};

export default function GroupSettingsForm({
    group,
    taxonomy,
    locale,
    activeTab,
    canEditOwnerFields,
    isOwner,
    transferCandidates,
    initialTaxonomy
}: Props) {
    const gt = useTranslations('group');
    const gs = useTranslations('groupSettings');
    const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { initialTaxSelection, initialTagIds } = initialTaxonomy;

    const [taxSelection, setTaxSelection] = useState<TaxonomySelection | null>(initialTaxSelection);
    const [serverError, setServerError] = useState<string | null>(null);

    const methods = useForm<GroupFormValues>({
        resolver: zodResolver(groupFormSchema),
        defaultValues: {
            name: group.name,
            city: group.city as GroupFormValues['city'],
            type: group.type,
            // Moderators never see the category picker: their form carries the stored values, which the service compares.
            categoryId: canEditOwnerFields
                ? (initialTaxSelection?.kind === 'existing' ? initialTaxSelection.categoryId : undefined)
                : group.categoryId,
            tagIds: canEditOwnerFields ? initialTagIds : group.tags.map(tag => tag.id),
            isAcceptingMembers: group.isAcceptingMembers,
            discordLink: group.discordLink || '',
            websiteLink: group.websiteLink || '',
            instagramLink: group.instagramLink || '',
            bannerImage: group.bannerImage || '',
        },
    });

    const { handleSubmit, setValue } = methods;

    // Colour of the category picker itself; the page colour always comes from the category (set in the layout).
    const pickerColor = taxSelection?.kind === 'existing' ? taxSelection.l1Color : '#6366f1';

    function handleTaxChange(sel: TaxonomySelection | null) {
        setTaxSelection(sel);
        if (sel?.kind === 'existing') {
            setValue('categoryId', sel.categoryId, { shouldValidate: true });
        } else {
            setValue('categoryId', '');
        }
        setValue('tagIds', []);
    }

    const { success } = useToast();

    const onSubmit = (data: GroupFormValues) => {
        setServerError(null);
        startTransition(async () => {
            const result = await updateGroup(group.id, data, locale);
            if (result.success) {
                success(c_common('updateSuccess'));

                // The category (and so the first URL segment) can change; keep the person in settings.
                if (result.data?.slug && (result.data.slug !== group.slug || result.data.l1Slug !== group.l1Slug)) {
                    router.replace(`/${result.data.l1Slug}/group/${result.data.slug}/settings?tab=${activeTab}`);
                }

                router.refresh();
            } else {
                setServerError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm(gt('deleteConfirm'))) {
            startTransition(async () => {
                const result = await deleteGroup(group.id, locale);
                if (result.success) {
                    router.push('/');
                }
            });
        }
    };

    const selectedL1 = useMemo(() => {
        if (taxSelection?.kind === 'existing') {
            return taxonomy.find(l1 => l1.id === taxSelection.categoryId) ?? null;
        }
        return null;
    }, [taxonomy, taxSelection]);

    if (activeTab === 'sections') {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                    <h3 className="mb-1 flex items-center gap-2 text-xl font-black text-foreground">
                        <Save className="h-6 w-6 text-[var(--accent)]" />
                        {gs('tabSections')}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                        {c_common('tabSectionsDescription')}
                    </p>
                </div>
                <GroupSectionEditor
                    groupId={group.id}
                    initialSections={group.sections || []}
                    locale={locale}
                />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    {!canEditOwnerFields && (
                        <p className="flex items-start gap-3 rounded-2xl border border-border bg-surface-elevated/30 p-4 text-sm text-foreground-muted">
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
                                accentColor={pickerColor}
                                selectedL1={selectedL1}
                            />
                        </div>
                    )}

                    {canEditOwnerFields && (
                        <div id="access" className="scroll-mt-24">
                            <PrivacySection />
                        </div>
                    )}

                    <div id="links" className="scroll-mt-24">
                        <SocialSection />
                    </div>

                    <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-border pt-8">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex h-14 items-center gap-3 rounded-2xl bg-[var(--accent)] px-10 font-black text-[var(--accent-foreground)] shadow-premium transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {c_common('saveChanges')}
                        </button>

                        {serverError ? (
                            <div role="alert" className="flex items-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-bold">{serverError}</p>
                            </div>
                        ) : (
                            <p className="ml-2 text-xs font-medium text-foreground-muted">
                                {gt('saveChangesDesc')}
                            </p>
                        )}
                    </div>
                </form>
            </FormProvider>

            {isOwner && (
                <>
                    <TransferOwnershipSection groupId={group.id} locale={locale} candidates={transferCandidates} />
                    <div id="danger-zone" className="scroll-mt-24">
                        <DangerZoneSection onDelete={handleDelete} isPending={isPending} />
                    </div>
                </>
            )}
        </div>
    );
}
