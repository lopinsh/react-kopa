'use client';

import { useTransition } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { adminUpdateGroupTags } from '@/actions/taxonomy-actions';
import TagPicker from '@/components/groups/TagPicker';
import { groupFormSchema, type GroupFormValues } from '@/lib/validations/group';
import { useToast } from '@/hooks/use-toast';

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
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const methods = useForm<GroupFormValues>({
        resolver: zodResolver(groupFormSchema),
        defaultValues: {
            categoryId: selectedL1.id,
            tagIds: initialTagIds,
            name: groupName,
            description: '',
            city: 'Riga',
            type: 'PUBLIC',
            isAcceptingMembers: true,
            discordLink: '',
            websiteLink: '',
            instagramLink: '',
            bannerImage: '',
            accentColor: selectedL1.color,
        },
    });

    const onSubmit = methods.handleSubmit((data) => {
        startTransition(async () => {
            const result = await adminUpdateGroupTags(groupId, data.tagIds, locale);
            if (!result.success) {
                error(te(result.error as never));
                return;
            }

            success(t('override.saved'));
            router.push(`/${l1Slug}/group/${groupSlug}`);
        });
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <p className="text-xs font-semibold uppercase text-foreground-muted">{t('override.title')}</p>
                    <h1 className="mt-1 text-2xl font-bold text-foreground">{groupName}</h1>
                    <p className="mt-2 text-sm text-foreground-muted">{selectedL1.title}</p>

                    <TagPicker l1={selectedL1} accentColor={selectedL1.color} allowL3={false} />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {isPending ? c('loading') : c('save')}
                </button>
            </form>
        </FormProvider>
    );
}


