'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Globe, MessageSquare, Instagram as InstagramIcon, Share2 } from 'lucide-react';
import { type GroupFormValues } from '@/lib/validations/group';
import SettingsSection from './SettingsSection';

export default function SocialSection() {
    const gt = useTranslations('group');
    const { register } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={gt('tabSocial')}
            description={gt('tabSocialDescription')}
            icon={Share2}
        >
            <div className="grid gap-8 md:grid-cols-1 max-w-2xl">
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {gt('social_website')}
                    </label>
                    <div className="relative group">
                        <input
                            {...register('websiteLink')}
                            placeholder="https://..."
                            className="w-full rounded-2xl border border-border bg-surface-elevated/20 pl-12 pr-4 py-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-[var(--accent)] transition-colors">
                            <Globe className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        {gt('social_discord')}
                    </label>
                    <div className="relative group">
                        <input
                            {...register('discordLink')}
                            placeholder="https://discord.gg/..."
                            className="w-full rounded-2xl border border-border bg-surface-elevated/20 pl-12 pr-4 py-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-[var(--accent)] transition-colors">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1 flex items-center gap-2">
                        <InstagramIcon className="h-3 w-3" />
                        {gt('social_instagram')}
                    </label>
                    <div className="relative group">
                        <input
                            {...register('instagramLink')}
                            placeholder="https://instagram.com/..."
                            className="w-full rounded-2xl border border-border bg-surface-elevated/20 pl-12 pr-4 py-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-[var(--accent)] transition-colors">
                            <InstagramIcon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
