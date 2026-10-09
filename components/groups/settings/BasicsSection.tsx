'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { cityLabel } from '@/lib/city-label';
import { ImageIcon, UserPlus, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { CITIES } from '@/lib/constants';
import { type GroupFormValues } from '@/lib/validations/group';
import SettingsSection from './SettingsSection';

type Props = {
    /** The group name is changed by the owner only. */
    canEditName: boolean;
};

const INPUT = 'w-full rounded-2xl border border-border bg-surface-elevated/20 px-4 py-3.5 font-medium outline-none transition-all focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5';
const LABEL = 'ml-1 text-xs font-black uppercase tracking-wider text-foreground-muted';

/** Name, city, banner and whether new members are accepted. */
export default function BasicsSection({ canEditName }: Props) {
    const t = useTranslations('wizard');
    const tCities = useTranslations('cities');
    const gt = useTranslations('group');
    const gs = useTranslations('groupSettings');
    const { register, formState: { errors }, watch } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={gs('basicsTitle')}
            description={gt('tabProfileDescription')}
            icon={Settings}
        >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {canEditName && (
                    <div className="space-y-2">
                        <label htmlFor="group-name" className={LABEL}>{t('fieldName')}</label>
                        <input id="group-name" {...register('name')} className={INPUT} />
                        {errors.name?.message && (
                            <p className="ml-1 text-xs text-red-500">{t(errors.name.message as 'NAME_TOO_SHORT')}</p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="group-city" className={LABEL}>{t('fieldCity')}</label>
                    <select
                        id="group-city"
                        {...register('city')}
                        className={clsx(INPUT, errors.city && 'border-red-400')}
                    >
                        <option value="">{t('fieldCityPlaceholder')}</option>
                        {CITIES.map((city) => (
                            <option key={city} value={city}>{cityLabel(tCities, city)}</option>
                        ))}
                    </select>
                    {errors.city?.message && (
                        <p className="ml-1 mt-1 text-xs text-red-500">{t(errors.city.message as 'CITY_REQUIRED')}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="group-banner" className={LABEL}>{gt('bannerImageUrlLabel')}</label>
                <div className="group relative">
                    <input
                        id="group-banner"
                        {...register('bannerImage')}
                        placeholder="https://images.unsplash.com/..."
                        className={clsx(INPUT, 'pl-12')}
                    />
                    <ImageIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted transition-colors group-focus-within:text-[var(--accent)]" />
                </div>
                <p className="ml-1 text-[11px] text-foreground-muted">{gt('bannerImageUrlDesc')}</p>
                {errors.bannerImage?.message && (
                    <p className="ml-1 text-xs text-red-500">{t(errors.bannerImage.message as 'INVALID_URL')}</p>
                )}
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-border bg-surface-elevated/10 p-5 transition-all hover:bg-surface-elevated/20 sm:p-6">
                <div className="relative flex shrink-0 items-center">
                    <input
                        type="checkbox"
                        {...register('isAcceptingMembers')}
                        id="isAcceptingMembers"
                        className="peer sr-only"
                    />
                    <label htmlFor="isAcceptingMembers" className="h-6 w-11 cursor-pointer rounded-full bg-border transition-colors peer-checked:bg-[var(--accent)]" />
                    <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
                <label htmlFor="isAcceptingMembers" className="min-w-0 flex-1 cursor-pointer">
                    <span className="text-sm font-black text-foreground">{gt('acceptingMembersLabel')}</span>
                    <p className="text-xs text-foreground-muted">{gt('acceptingMembersDesc')}</p>
                </label>
                <UserPlus className={clsx(
                    'hidden h-6 w-6 shrink-0 transition-colors sm:block',
                    watch('isAcceptingMembers') ? 'text-[var(--accent)]' : 'text-foreground-muted'
                )} />
            </div>
        </SettingsSection>
    );
}
