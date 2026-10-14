'use client';

import { useTransition, useMemo, useState } from 'react';
import { useForm, useWatch, FormProvider, type Resolver } from 'react-hook-form';
import { isOverLimit } from '@/lib/text-limit';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildGroupFormSchema, GROUP_NAME_MAX, GROUP_LOOKING_FOR_MAX, type GroupFormValues } from '@/lib/validations/group';
import { updateGroup, deleteGroup } from '@/actions/group-actions';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Save, AlertCircle, Info } from 'lucide-react';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/lib/types/taxonomy';
import GroupSectionEditor from '@/components/groups/GroupSectionEditor';
import type { EditableSection } from '@/lib/services/group.service';
import { useToast } from '@/hooks/use-toast';

import BasicsSection from './settings/BasicsSection';
import SocialSection from './settings/SocialSection';
import CategorizationSection from './settings/CategorizationSection';
import PrivacySection from './settings/PrivacySection';
import AcceptingMembersSection from './settings/AcceptingMembersSection';
import DangerZoneSection from './settings/DangerZoneSection';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { isOwner as checkIsOwner } from '@/lib/utils/permissions';
import TransferOwnershipSection from './settings/TransferOwnershipSection';
import type { SettingsTab } from './SettingsTabs';
import { MAX_GROUP_TAGS } from '@/lib/constants';

type Props = {
    group: {
        id: string;
        name: string;
        lookingFor: string | null;
        city: string;
        type: GroupFormValues['type'];
        categoryId: string;
        isAcceptingMembers: boolean;
        discordLink: string | null;
        websiteLink: string | null;
        instagramLink: string | null;
        bannerImage: string | null;
        sections: EditableSection[];
        tags: Array<{ id: string; title: string; slug: string; level: number }>;
        slug: string;
        l1Slug: string;
    };
    taxonomy: TaxonomyTree;
    locale: string;
    activeTab: SettingsTab;
    /** Owner (and site admins): name, category, topics and access. Moderators get the rest. */
    canEditOwnerFields: boolean;
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
    transferCandidates,
    initialTaxonomy
}: Props) {
    const gt = useTranslations('group');
    // Only the owner hands the group over or deletes it.
    const isOwner = checkIsOwner(useGroupContext().user.role);
    const gs = useTranslations('groupSettings');
    const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { initialTaxSelection, initialTagIds } = initialTaxonomy;

    const [taxSelection, setTaxSelection] = useState<TaxonomySelection | null>(initialTaxSelection);
    const [serverError, setServerError] = useState<string | null>(null);
    // Set when changing the main category removed sub-topics (the category section tells the owner).
    const [tagsCleared, setTagsCleared] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const methods = useForm<GroupFormValues>({
        // The schema turns an empty "Ko meklējam?" into null, so its input and output types differ.
        resolver: zodResolver(buildGroupFormSchema(initialTagIds.length)) as unknown as Resolver<GroupFormValues>,
        defaultValues: {
            name: group.name,
            lookingFor: group.lookingFor,
            city: group.city,
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
    const nameOver = isOverLimit(useWatch({ control: methods.control, name: 'name' }), GROUP_NAME_MAX);
    const lookingForOver = isOverLimit(useWatch({ control: methods.control, name: 'lookingFor' }), GROUP_LOOKING_FOR_MAX);

    // Colour of the category picker itself; the page colour always comes from the category (set in the layout).

    function handleTaxChange(sel: TaxonomySelection | null) {
        const previousCategoryId = methods.getValues('categoryId');
        setTaxSelection(sel);
        if (sel?.kind === 'existing') {
            setValue('categoryId', sel.categoryId, { shouldValidate: true });
        } else {
            setValue('categoryId', '');
        }
        // Sub-topics belong to one main category: a different one starts with none chosen.
        const changed = (sel?.kind === 'existing' ? sel.categoryId : '') !== previousCategoryId;
        setTagsCleared(changed && methods.getValues('tagIds').length > 0);
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
                setServerError(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED', { max: MAX_GROUP_TAGS }) : tErrors('ACTION_FAILED'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleDelete = () => {
        if (isPending) return;
        startTransition(async () => {
            const result = await deleteGroup(group.id, locale);
            if (result.success) {
                router.push('/');
            } else {
                setDeleteConfirmOpen(false);
            }
        });
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
                    <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold text-foreground">
                        <Save className="h-6 w-6 text-primary" />
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

    const saveBar = (
        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-border pt-8">
            <button
                type="submit"
                disabled={isPending || nameOver || lookingForOver}
                className="flex h-14 items-center gap-3 rounded-full bg-primary px-10 font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
                {isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                    <Save className="h-5 w-5" />
                )}
                {c_common('saveChanges')}
            </button>

            {serverError ? (
                <div role="alert" className="flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-danger">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-bold">{serverError}</p>
                </div>
            ) : (
                <p className="ml-2 text-xs font-medium text-foreground-muted">
                    {gt('saveChangesDesc')}
                </p>
            )}
        </div>
    );

    // Owner tab: who can find and join the group, handing it over, deleting it. The page only offers this tab to the owner.
    if (activeTab === 'owner') {
        return (
            <div className="space-y-12">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                        <AcceptingMembersSection />
                        <div id="access" className="scroll-mt-24">
                            <PrivacySection />
                        </div>
                        {saveBar}
                    </form>
                </FormProvider>

                {isOwner && (
                    <>
                        <TransferOwnershipSection groupId={group.id} locale={locale} candidates={transferCandidates} />
                        <div id="danger-zone" className="scroll-mt-24">
                            <DangerZoneSection onDelete={() => setDeleteConfirmOpen(true)} isPending={isPending} />
                            <ConfirmDialog
                                isOpen={deleteConfirmOpen}
                                title={c_common('deleteGroupTitle')}
                                message={gt('deleteConfirm')}
                                confirmLabel={c_common('deleteGroupTitle')}
                                destructive
                                isPending={isPending}
                                onConfirm={handleDelete}
                                onCancel={() => setDeleteConfirmOpen(false)}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Group tab: name, city, images, category and topics, links.
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
                                selectedL1={selectedL1}
                                maxTags={initialTagIds.length}
                                tagsCleared={tagsCleared}
                            />
                        </div>
                    )}

                    <div id="links" className="scroll-mt-24">
                        <SocialSection />
                    </div>

                    {saveBar}
                </form>
            </FormProvider>
        </div>
    );
}
