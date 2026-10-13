'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import CityField from '@/components/groups/CityField';
import { ImageIcon, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { type GroupFormValues } from '@/lib/validations/group';
import SettingsSection from './SettingsSection';

type Props = {
    /** The group name is changed by the owner only. */
    canEditName: boolean;
};

const INPUT = 'w-full rounded-2xl border border-border bg-surface-elevated/20 px-4 py-3.5 font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5';
const LABEL = 'ml-1 text-xs font-black uppercase tracking-wider text-foreground-muted';

/** Name, city and banner. */
export default function BasicsSection({ canEditName }: Props) {
    const t = useTranslations('wizard');
    const gt = useTranslations('group');
    const gs = useTranslations('groupSettings');
    const { register, formState: { errors } } = useFormContext<GroupFormValues>();

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
                    <CityField id="group-city" selectClassName={INPUT} inputClassName={INPUT} />
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
                    <ImageIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted transition-colors group-focus-within:text-primary" />
                </div>
                <p className="ml-1 text-[11px] text-foreground-muted">{gt('bannerImageUrlDesc')}</p>
                {errors.bannerImage?.message && (
                    <p className="ml-1 text-xs text-red-500">{t(errors.bannerImage.message as 'INVALID_URL')}</p>
                )}
            </div>
        </SettingsSection>
    );
}
