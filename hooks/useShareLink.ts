'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';

/** Shares a link: the native share sheet where there is one, else copies it and says so. Closing the sheet is not an error. */
export function useShareLink() {
    const t = useTranslations('common');
    const { success, error } = useToast();

    return useCallback(async ({ title, url }: { title: string; url: string }) => {
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            success(t('linkCopied'));
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            error(t('shareFailed'));
        }
    }, [t, success, error]);
}
