import { useTranslations } from 'next-intl';
import { UI } from '@/lib/constants';

type Props = { websiteLink?: string | null; instagramLink?: string | null; discordLink?: string | null };

/** The group's links as quiet text links at the end of Informācija (AR-50): no icons, no heading, nothing when there are none. */
export default function GroupSocialLinks({ websiteLink, instagramLink, discordLink }: Props) {
    const t = useTranslations('common');
    const links = [
        { href: websiteLink, label: t('social_website') },
        { href: instagramLink, label: t('social_instagram') },
        { href: discordLink, label: t('social_discord') },
    ].filter((l): l is { href: string; label: string } => !!l.href);
    if (links.length === 0) return null;

    return (
        <p data-ui={UI.socialLinks} className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            {links.map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-border underline-offset-[3px]">
                    {label}
                </a>
            ))}
        </p>
    );
}
