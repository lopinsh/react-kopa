'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ImageIcon, UserPlus, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { CITIES } from '@/lib/constants';
import { type GroupFormValues } from '@/lib/validations/group';
import SettingsSection from './SettingsSection';

export default function ProfileSection() {
    const t = useTranslations('wizard');
    const gt = useTranslations('group');
    const { register, formState: { errors }, watch } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={gt('tabProfile')}
            description={gt('tabProfileDescription')}
            icon={Settings}
        >
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1">
                        {t('fieldName')}
                    </label>
                    <input
                        {...register('name')}
                        className="w-full rounded-2xl border border-border bg-surface-elevated/20 px-4 py-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1">
                        {t('fieldCity')}
                    </label>
                    <select
                        {...register('city')}
                        className={clsx(
                            "w-full rounded-2xl border bg-surface-elevated/20 px-4 py-4 text-base text-foreground outline-none transition-all focus:ring-4 focus:ring-[var(--accent)]/5 font-medium",
                            errors.city ? "border-red-400" : "border-border focus:border-[var(--accent)]"
                        )}
                    >
                        <option value="">{t('fieldCityPlaceholder')}</option>
                        {CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {errors.city && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.city.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1">
                    {gt('accentColorLabel')}
                </label>
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface-elevated/10">
                    <input
                        type="color"
                        {...register('accentColor')}
                        className="h-12 w-12 rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                    />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{gt('accentColorTitle')}</p>
                        <p className="text-xs text-foreground-muted">{gt('accentColorDesc')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-foreground-muted ml-1">
                    {gt('bannerImageUrlLabel')}
                </label>
                <div className="relative group">
                    <input
                        {...register('bannerImage')}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-2xl border border-border bg-surface-elevated/20 pl-12 pr-4 py-4 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all font-medium"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted group-focus-within:text-[var(--accent)] transition-colors" />
                </div>
                <p className="text-[10px] text-foreground-muted ml-1 opacity-70">{gt('bannerImageUrlDesc')}</p>
            </div>

            <div className="flex items-center gap-4 cursor-pointer group p-6 rounded-3xl border border-border bg-surface-elevated/10 hover:bg-surface-elevated/20 transition-all">
                <div className="relative flex items-center shrink-0">
                    <input
                        type="checkbox"
                        {...register('isAcceptingMembers')}
                        id="isAcceptingMembers"
                        className="peer sr-only"
                    />
                    <label htmlFor="isAcceptingMembers" className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-[var(--accent)] cursor-pointer" />
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-sm pointer-events-none" />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-black text-foreground">{gt('acceptingMembersLabel')}</span>
                    <p className="text-xs text-foreground-muted">{gt('acceptingMembersDesc')}</p>
                </div>
                <UserPlus className={clsx(
                    "h-6 w-6 transition-colors",
                    watch('isAcceptingMembers') ? "text-[var(--accent)]" : "text-foreground-muted"
                )} />
            </div>
        </SettingsSection>
    );
}
