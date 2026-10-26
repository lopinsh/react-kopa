import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import { UNSPLASH_HOME_URL, unsplashProfileUrl } from '@/lib/banner';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

const anchor = (href: string) => {
    const Link = (chunks: ReactNode) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className={TEXT_LINK_CLASS}>{chunks}</a>
    );
    return Link;
};

/** "Photo by X on Unsplash" with UTM links (Unsplash API rules). Nothing when the picture has no credit. */
export default function BannerCredit({ credit, className = '' }: { credit: Credit | undefined; className?: string }) {
    const t = useTranslations('banner');
    if (!credit) return null;
    return (
        <p className={`text-meta text-foreground-muted ${className}`}>
            {t.rich('credit', { name: credit.name, who: anchor(unsplashProfileUrl(credit.username)), unsplash: anchor(UNSPLASH_HOME_URL) })}
        </p>
    );
}
