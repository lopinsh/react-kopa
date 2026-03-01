'use client';

import { useTranslations } from 'next-intl';
import { Globe, Instagram, MessageSquare } from 'lucide-react';

interface GroupSocialLinksProps {
    discordLink?: string | null;
    websiteLink?: string | null;
    instagramLink?: string | null;
    accentColor?: string;
}

export default function GroupSocialLinks({
    discordLink,
    websiteLink,
    instagramLink,
    accentColor = '#6366f1'
}: GroupSocialLinksProps) {
    const t = useTranslations('group');

    if (!discordLink && !websiteLink && !instagramLink) return null;

    const links = [
        {
            icon: <Globe className="h-4 w-4" />,
            label: t('social_website'),
            href: websiteLink,
            active: !!websiteLink
        },
        {
            icon: <Instagram className="h-4 w-4" />,
            label: t('social_instagram'),
            href: instagramLink,
            active: !!instagramLink
        },
        {
            icon: <MessageSquare className="h-4 w-4" />,
            label: t('social_discord'),
            href: discordLink,
            active: !!discordLink
        }
    ].filter(l => l.active);

    return (
        <div className="pt-4 mt-6 border-t border-white/[0.05]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3 ml-1">
                {t('socialLinksTitle')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {links.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-2.5 transition-all hover:bg-white/[0.05] hover:border-[var(--accent)]/30"
                        style={{ '--accent': accentColor } as any}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-foreground-muted group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-all">
                            {link.icon}
                        </div>
                        <span className="text-xs font-bold text-foreground-muted group-hover:text-foreground transition-colors truncate">
                            {link.label}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
