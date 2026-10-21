'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import CityField from '@/components/groups/CityField';
import { ImageIcon } from 'lucide-react';
import { GROUP_NAME_MAX, GROUP_LOOKING_FOR_MAX, type GroupFormValues } from '@/lib/validations/group';
import TextCounter from '@/components/ui/TextCounter';
import SettingsSection from './SettingsSection';

import { Input } from '@/components/ui/Input';
type Props = {
    /** The group name is changed by the owner only. */
    canEditName: boolean;
};

const LABEL = 'ml-1 text-tag text-foreground-muted';

/** Name, city, "Ko meklējam?" and banner. */
export default function BasicsSection({ canEditName }: Props) {
    const t = useTranslations('wizard');
    const gt = useTranslations('group');
    const gs = useTranslations('groupSettings');
    const { register, watch, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <SettingsSection
            title={gs('basicsTitle')}
            description={gt('tabProfileDescription')}
        >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {canEditName && (
                    <div className="space-y-2">
                        <label htmlFor="group-name" className={LABEL}>{t('fieldName')}</label>
                        <Input id="group-name" {...register('name')} aria-describedby="group-name-count" />
                        <div className="flex items-start gap-2">
                            {errors.name?.message && (
                                <p className="ml-1 text-meta text-danger">{t(errors.name.message as 'NAME_TOO_SHORT')}</p>
                            )}
                            <TextCounter id="group-name-count" length={(watch('name') ?? '').length} max={GROUP_NAME_MAX} />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="group-city" className={LABEL}>{t('fieldCity')}</label>
                    <CityField id="group-city" />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="group-looking-for" className={LABEL}>{t('fieldLookingFor')}</label>
                <Input
                    id="group-looking-for"
                    {...register('lookingFor')}
                    aria-describedby="group-looking-for-count group-looking-for-hint"
                    placeholder={t('fieldLookingForPlaceholder')}
                />
                <div className="flex items-start gap-2">
                    {errors.lookingFor?.message
                        ? <p id="group-looking-for-hint" className="ml-1 text-meta text-danger">{t(errors.lookingFor.message as 'LOOKING_FOR_TOO_LONG')}</p>
                        : <p id="group-looking-for-hint" className="ml-1 text-meta text-foreground-muted">{t('fieldLookingForHint')}</p>}
                    <TextCounter id="group-looking-for-count" length={(watch('lookingFor') ?? '').length} max={GROUP_LOOKING_FOR_MAX} />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="group-banner" className={LABEL}>{gt('bannerImageUrlLabel')}</label>
                <div className="group relative">
                    <Input
                        id="group-banner"
                        {...register('bannerImage')}
                        placeholder="https://images.unsplash.com/..."
                        className="pl-12"
                    />
                    <ImageIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground-muted transition-colors group-focus-within:text-primary" />
                </div>
                <p className="ml-1 text-meta text-foreground-muted">{gt('bannerImageUrlDesc')}</p>
                {errors.bannerImage?.message && (
                    <p className="ml-1 text-meta text-danger">{t(errors.bannerImage.message as 'INVALID_URL')}</p>
                )}
            </div>
        </SettingsSection>
    );
}
