'use client';

import { Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useShareLink } from '@/hooks/useShareLink';

type Props = {
    title: string;
};

export default function ShareEventButton({ title }: Props) {
    const t = useTranslations('event');
    const share = useShareLink();

    return (
        <button
            type="button"
            onClick={() => share({ title, url: window.location.href })}
            className="flex w-full items-center justify-center gap-2 text-[11px] font-semibold text-foreground-muted hover:text-foreground transition-colors group/share"
        >
            <Share2 className="h-3.5 w-3.5 group-hover/share:text-primary transition-colors" />
            {t('shareEvent')}
        </button>
    );
}
