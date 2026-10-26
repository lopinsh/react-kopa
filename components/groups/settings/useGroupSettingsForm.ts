'use client';

import { useMemo, useState, useTransition } from 'react';
import { useForm, useWatch, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { isOverLimit } from '@/lib/text-limit';
import { buildGroupFormSchema, GROUP_NAME_MAX, GROUP_LOOKING_FOR_MAX, type GroupFormValues } from '@/lib/validations/group';
import type { BannerCredit } from '@/lib/validations/banner';
import { updateGroup } from '@/actions/group-actions';
import type { TaxonomyTree } from '@/lib/services/taxonomy.service';
import type { TaxonomySelection } from '@/lib/types/taxonomy';
import { useToast } from '@/hooks/use-toast';
import { MAX_GROUP_TAGS } from '@/lib/constants';
import type { SettingsTab } from '../SettingsTabs';

export type GroupSettingsGroup = {
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
    bannerCredit: BannerCredit;
    tags: Array<{ id: string; title: string; slug: string; level: number }>;
    slug: string;
    l1Slug: string;
};

export type GroupSettingsFormProps = {
    group: GroupSettingsGroup;
    taxonomy: TaxonomyTree;
    locale: string;
    activeTab: SettingsTab;
    /** Owner (and site admins): name, category, topics and access. Moderators get the rest. */
    canEditOwnerFields: boolean;
    /** The picker's Unsplash search is on (the key is set). */
    searchEnabled: boolean;
    /** Site admins: the raw image address under "Papildu". */
    canEditUrl: boolean;
    initialTaxonomy: {
        initialTaxSelection: TaxonomySelection | null;
        initialTagIds: string[];
    };
};

export type GroupSettingsFormState = {
    methods: UseFormReturn<GroupFormValues>;
    onSubmit: (data: GroupFormValues) => void;
    isPending: boolean;
    serverError: string | null;
    saveBlocked: boolean;
    taxSelection: TaxonomySelection | null;
    selectedL1: TaxonomyTree[number] | null;
    tagsCleared: boolean;
    handleTaxChange: (sel: TaxonomySelection | null) => void;
};

export function useGroupSettingsForm({ group, taxonomy, locale, activeTab, canEditOwnerFields, initialTaxonomy }: GroupSettingsFormProps): GroupSettingsFormState {
    const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success } = useToast();
    const [isPending, startTransition] = useTransition();
    const { initialTaxSelection, initialTagIds } = initialTaxonomy;

    const [taxSelection, setTaxSelection] = useState<TaxonomySelection | null>(initialTaxSelection);
    const [serverError, setServerError] = useState<string | null>(null);
    // Set when changing the main category removed sub-topics (the category section tells the owner).
    const [tagsCleared, setTagsCleared] = useState(false);

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
            bannerCredit: group.bannerCredit,
        },
    });

    const { setValue } = methods;
    const nameOver = isOverLimit(useWatch({ control: methods.control, name: 'name' }), GROUP_NAME_MAX);
    const lookingForOver = isOverLimit(useWatch({ control: methods.control, name: 'lookingFor' }), GROUP_LOOKING_FOR_MAX);

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

    const selectedL1 = useMemo(() => {
        if (taxSelection?.kind === 'existing') {
            return taxonomy.find(l1 => l1.id === taxSelection.categoryId) ?? null;
        }
        return null;
    }, [taxonomy, taxSelection]);

    return {
        methods, onSubmit, isPending, serverError,
        saveBlocked: nameOver || lookingForOver,
        taxSelection, selectedL1, tagsCleared, handleTaxChange,
    };
}
