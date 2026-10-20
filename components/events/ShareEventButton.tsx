'use client';

import { Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useShareLink } from '@/hooks/useShareLink';

/** "Dalīties": a quiet text button with a 44 px touch target. */
export default function ShareEventButton({ title }: { title: string }) {
    const t = useTranslations('event');
    const share = useShareLink();

    return (
        <button
            type="button"
            onClick={() => share({ title, url: window.location.href })}
            className="inline-flex h-11 items-center gap-1.5 rounded-pill text-button-sm text-foreground-muted transition-colors hover:text-foreground md:h-10"
        >
            <Share2 aria-hidden="true" className="size-4" />
            {t('share')}
        </button>
    );
}
