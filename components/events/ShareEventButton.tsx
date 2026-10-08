'use client';

import { Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';

type Props = {
    title: string;
};

export default function ShareEventButton({ title }: Props) {
    const t = useTranslations('event');
    const { success, error: toastError } = useToast();

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            success(t('shareCopied'));
        } catch (err) {
            // Closing the native share sheet is not an error.
            if (err instanceof DOMException && err.name === 'AbortError') return;
            toastError(t('shareFailed'));
        }
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors group/share"
        >
            <Share2 className="h-3.5 w-3.5 group-hover/share:text-[var(--accent)] transition-colors" />
            {t('shareEvent')}
        </button>
    );
}
