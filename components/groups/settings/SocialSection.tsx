'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Globe, MessageSquare, Instagram as InstagramIcon } from 'lucide-react';
import { type GroupFormValues } from '@/lib/validations/group';
import SettingsSection from './SettingsSection';

import { Input } from '@/components/ui/Input';
export default function SocialSection() {
  const c_common = useTranslations('common');
    const { register } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={c_common('tabSocial')}
            description={c_common('tabSocialDescription')}
        >
            <div className="grid gap-8 md:grid-cols-1 max-w-2xl">
                <div className="space-y-3">
                    <label className="text-tag text-foreground-muted ml-1 flex items-center gap-2">
                        <Globe className="size-3" />
                        {c_common('social_website')}
                    </label>
                    <div className="relative group">
                        <Input
                            {...register('websiteLink')}
                            placeholder="https://..."
                            className="pl-12 pr-4"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-primary transition-colors">
                            <Globe className="size-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-tag text-foreground-muted ml-1 flex items-center gap-2">
                        <MessageSquare className="size-3" />
                        {c_common('social_discord')}
                    </label>
                    <div className="relative group">
                        <Input
                            {...register('discordLink')}
                            placeholder="https://discord.gg/..."
                            className="pl-12 pr-4"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-primary transition-colors">
                            <MessageSquare className="size-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-tag text-foreground-muted ml-1 flex items-center gap-2">
                        <InstagramIcon className="size-3" />
                        {c_common('social_instagram')}
                    </label>
                    <div className="relative group">
                        <Input
                            {...register('instagramLink')}
                            placeholder="https://instagram.com/..."
                            className="pl-12 pr-4"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-foreground-muted group-focus-within:text-primary transition-colors">
                            <InstagramIcon className="size-5" />
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
