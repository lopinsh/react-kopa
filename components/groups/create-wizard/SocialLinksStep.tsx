'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { MessageSquare, Instagram as InstagramIcon, Globe, Zap } from 'lucide-react';
import type { GroupFormValues } from '@/lib/validations/group';

export default function SocialLinksStep({ accentColor }: { accentColor: string }) {
    const t = useTranslations('wizard');
    const { register, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldDiscord')}
                </label>
                <input
                    type="text"
                    {...register('discordLink')}
                    placeholder="https://discord.gg/..."
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none transition-all',
                        errors.discordLink ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                />
            </div>

            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <InstagramIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldInstagram')}
                </label>
                <input
                    type="text"
                    {...register('instagramLink')}
                    placeholder="https://instagram.com/..."
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none transition-all',
                        errors.instagramLink ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                />
            </div>

            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Globe className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldWebsite')}
                </label>
                <input
                    type="text"
                    {...register('websiteLink')}
                    placeholder="https://..."
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none transition-all',
                        errors.websiteLink ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                />
            </div>
        </div>
    );
}
