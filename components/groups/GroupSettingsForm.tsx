'use client';

import { useTransition, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupFormSchema, type GroupFormValues } from '@/lib/validations/group';
import { updateGroup, deleteGroup } from '@/actions/group-actions';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Save, AlertCircle } from 'lucide-react';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';
import GroupSectionEditor from '@/components/groups/GroupSectionEditor';
import { useToast } from '@/hooks/use-toast';
import { useGroupContext } from '@/components/providers/GroupProvider';

// New Sub-components
import ProfileSection from './settings/ProfileSection';
import SocialSection from './settings/SocialSection';
import CategorizationSection from './settings/CategorizationSection';
import PrivacySection from './settings/PrivacySection';
import DangerZoneSection from './settings/DangerZoneSection';

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
        category: { id: string; title: string; slug: string; level: number; parentTitle: string | null; l1Slug: string; color: string | null };
        slug: string;
        l1Slug: string;
        accentColor?: string | null;
    };
    taxonomy: TaxonomyTree;
    locale: string;
    activeTab: string;
    canEditCategorization: boolean;
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
    canEditCategorization,
    initialTaxonomy
}: Props) {
    const { userRole } = useGroupContext();
    const gt = useTranslations('group');
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
            categoryId: initialTaxSelection?.kind === 'existing' ? initialTaxSelection.categoryId : undefined,
            tagIds: initialTagIds,
            isAcceptingMembers: group.isAcceptingMembers,
            discordLink: group.discordLink || '',
            websiteLink: group.websiteLink || '',
            instagramLink: group.instagramLink || '',
            bannerImage: group.bannerImage || '',
            accentColor: group.accentColor || '',
        },
    });

    const { handleSubmit, setValue, control } = methods;

    // Sync preview color with form value
    const watchedAccentColor = useWatch({ control, name: 'accentColor' });
    const accentColor = useMemo(() => {
        if (watchedAccentColor && /^#[0-9A-Fa-f]{6}$/.test(watchedAccentColor)) {
            return watchedAccentColor;
        }
        if (taxSelection?.kind === 'existing') {
            return taxSelection.l1Color;
        }
        return '#6366f1';
    }, [taxSelection, watchedAccentColor]);
    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

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
                success(gt('updateSuccess'));

                // If slug or L1 changed, we need to update the URL but stay in settings
                if (result.data?.slug && (result.data.slug !== group.slug || result.data.l1Slug !== group.l1Slug)) {
                    router.replace(`/${result.data.l1Slug}/group/${result.data.slug}/settings?tab=${activeTab}`);
                }

                router.refresh();
            } else {
                setServerError(result.error);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm(gt('deleteConfirm'))) {
            startTransition(async () => {
                const result = await deleteGroup(group.id, locale);
                if (result.success) {
                    router.push('/discover');
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

    return (
        <div className="space-y-12" style={accentStyle}>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    {activeTab === 'profile' && <ProfileSection />}

                    {activeTab === 'social' && <SocialSection />}

                    {activeTab === 'sections' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
                                    <Save className="h-6 w-6 text-[var(--accent)]" />
                                    {gt('tabSections')}
                                </h3>
                                <p className="text-sm text-foreground-muted">
                                    {gt('tabSectionsDescription')}
                                </p>
                            </div>
                            <GroupSectionEditor
                                groupId={group.id}
                                initialSections={group.sections || []}
                                locale={locale}
                            />
                        </div>
                    )}

                    {activeTab === 'categorization' && canEditCategorization && (
                        <CategorizationSection
                            taxonomy={taxonomy}
                            taxSelection={taxSelection}
                            onTaxChange={handleTaxChange}
                            accentColor={accentColor}
                            selectedL1={selectedL1}
                        />
                    )}

                    {activeTab === 'privacy' && userRole === 'OWNER' && <PrivacySection />}

                    {activeTab === 'danger' && userRole === 'OWNER' && (
                        <DangerZoneSection onDelete={handleDelete} isPending={isPending} />
                    )}

                    {/* Bottom Action Bar */}
                    {activeTab !== 'danger' && activeTab !== 'sections' && (
                        <div className="pt-8 mt-12 border-t border-border flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex h-14 items-center gap-3 rounded-2xl bg-[var(--accent)] px-10 font-black text-white shadow-premium transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isPending ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                {gt('saveChanges')}
                            </button>

                            {serverError && (
                                <div className="flex items-center gap-2 text-red-500 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 animate-in fade-in slide-in-from-left-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <p className="text-sm font-bold">{serverError}</p>
                                </div>
                            ) || (
                                    <p className="text-xs text-foreground-muted ml-2 font-medium">
                                        {gt('saveChangesDesc')}
                                    </p>
                                )}
                        </div>
                    )}
                </form>
            </FormProvider>
        </div>
    );
}

