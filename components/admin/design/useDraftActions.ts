'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { discardPreviewTheme, publishPreviewTheme } from '@/actions/theme-actions';
import { useToast } from '@/hooks/use-toast';

/** Publish or discard the saved design draft, with toast and refresh. Shared by the preview bar and the admin panel. */
export function useDraftActions() {
    const t = useTranslations('admin.design.bar');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const run = (action: typeof publishPreviewTheme, doneKey: 'published' | 'discarded') => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return {
        isPending,
        publish: () => run(publishPreviewTheme, 'published'),
        discard: () => run(discardPreviewTheme, 'discarded'),
    };
}
