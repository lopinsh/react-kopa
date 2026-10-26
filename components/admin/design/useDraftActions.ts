'use client';

import { useRef, useTransition } from 'react';
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

    const busy = useRef(false);

    const run = (action: typeof publishPreviewTheme, doneKey: 'published' | 'discarded') => {
        if (isPending || busy.current) return;
        busy.current = true;
        startTransition(async () => {
            let res: Awaited<ReturnType<typeof action>>;
            try { res = await action(); } finally { busy.current = false; }
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else if (res.error === 'NOT_FOUND') {
                router.refresh(); // the draft is already gone: show the current state, no error
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
