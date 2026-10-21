'use client';

import { useTransition } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { loadFullPage } from '@/lib/full-page';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { adminUpdateGroupTags } from '@/actions/taxonomy-actions';
import TagPicker from '@/components/groups/tag-picker/TagPicker';
import { buildGroupFormSchema, type GroupFormValues } from '@/lib/validations/group';
import { useToast } from '@/hooks/use-toast';
import { MAX_GROUP_TAGS } from '@/lib/constants';
import { categoryColor } from '@/lib/theme/category';
import Button from '@/components/ui/Button';

type Props = {
    locale: string;
    groupId: string;
    groupSlug: string;
    l1Slug: string;
    groupName: string;
    selectedL1: L1Category;
    initialTagIds: string[];
};

export default function AdminGroupCategorizationForm({
    locale,
    groupId,
    groupSlug,
    l1Slug,
    groupName,
    selectedL1,
    initialTagIds,
}: Props) {
    const t = useTranslations('admin.taxonomy');
    const c = useTranslations('common');
    const te = useTranslations('errors');
    const { success, error } = useToast();
    const [isPending, startTransition] = useTransition();

    const methods = useForm<GroupFormValues>({
        // The schema turns an empty "Ko meklējam?" into null, so its input and output types differ.
        resolver: zodResolver(buildGroupFormSchema(initialTagIds.length)) as unknown as Resolver<GroupFormValues>,
        defaultValues: {
            categoryId: selectedL1.id,
            tagIds: initialTagIds,
            name: groupName,
            description: '',
            lookingFor: null,
            city: 'Riga',
            type: 'PUBLIC',
            isAcceptingMembers: true,
            discordLink: '',
            websiteLink: '',
            instagramLink: '',
            bannerImage: '',
        },
    });

    const onSubmit = methods.handleSubmit((data) => {
        startTransition(async () => {
            const result = await adminUpdateGroupTags(groupId, data.tagIds, locale);
            if (!result.success) {
                error(te(result.error as 'ACTION_FAILED', { max: MAX_GROUP_TAGS }));
                return;
            }

            success(t('override.saved'));
            loadFullPage(`/${locale}/${l1Slug}/group/${groupSlug}`);
        });
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="rounded-2xl line bg-surface p-6 shadow-card">
                    <p className="text-tag text-foreground-muted">{t('override.title')}</p>
                    <h1 className="mt-1 text-title text-foreground">{groupName}</h1>
                    <p className="mt-2 text-body-sm text-foreground-muted">{selectedL1.title}</p>

                    <div style={{ '--accent': categoryColor(selectedL1.slug, selectedL1.color) } as React.CSSProperties}>
                        <TagPicker l1={selectedL1} allowL3={false} maxTags={initialTagIds.length} />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? c('loading') : c('save')}
                </Button>
            </form>
        </FormProvider>
    );
}


