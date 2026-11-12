'use client';

import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useShareLink } from '@/hooks/useShareLink';
import { iconButtonClass } from '@/components/ui/Button';

/** Dalīties on the head tile (K-153): shares the group's own address from any of its pages; the word shows from `md`. */
export default function GroupShare() {
    const t = useTranslations('group.frame');
    const g = useGroupContext();
    const share = useShareLink();
    return (
        <button type="button" onClick={() => share({ title: g.name, url: `${window.location.origin}${window.location.pathname.split(`/group/${g.slug}`)[0]}/group/${g.slug}` })} aria-label={t('share')} className={iconButtonClass('onToneGhost', 'md', 'md:w-auto md:gap-1.5 md:px-3 md:text-button-sm')}>
            <Share2 aria-hidden className="size-4" />
            <span className="max-md:sr-only">{t('share')}</span>
        </button>
    );
}
