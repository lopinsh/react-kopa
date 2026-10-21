'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Type, Image as ImageIcon } from 'lucide-react';
import { GROUP_NAME_MAX, GROUP_LOOKING_FOR_MAX, type GroupFormValues } from '@/lib/validations/group';
import TextCounter from '@/components/ui/TextCounter';
import AboutField from '@/components/groups/create-wizard/AboutField';
import type { TextLang } from '@/lib/translations';

import { Input } from '@/components/ui/Input';
interface Props {
    /** The language of "Par mums" on screen. */
    lang: TextLang;
    onLangChange: (lang: TextLang) => void;
}

export default function BasicInfoStep({ lang, onLangChange }: Props) {
    const t = useTranslations('wizard');
    const { register, watch, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="group-name" className="mb-1.5 flex items-center gap-1.5 text-button-sm text-foreground">
                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldName')}
                    <span className="text-danger">*</span>
                </label>
                <Input
                    id="group-name"
                    type="text"
                    autoFocus
                    {...register('name')}
                    aria-describedby="group-name-count"
                    placeholder={t('fieldNamePlaceholder')}
                    aria-invalid={errors.name ? true : undefined}
                />
                <div className="mt-1 flex items-start gap-2">
                    {errors.name && <p className="text-meta text-danger">{t(errors.name.message as 'NAME_TOO_SHORT')}</p>}
                    <TextCounter id="group-name-count" length={(watch('name') ?? '').length} max={GROUP_NAME_MAX} />
                </div>
            </div>

            {/* Ko meklējam? (AR-35) */}
            <div>
                <label htmlFor="group-looking-for" className="mb-1.5 flex items-center gap-1.5 text-button-sm text-foreground">
                    {t('fieldLookingFor')}
                    <span className="ml-auto text-meta font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <Input
                    id="group-looking-for"
                    type="text"
                    {...register('lookingFor')}
                    aria-describedby="group-looking-for-count group-looking-for-hint"
                    placeholder={t('fieldLookingForPlaceholder')}
                    aria-invalid={errors.lookingFor ? true : undefined}
                />
                <div className="mt-1 flex items-start gap-2">
                    {errors.lookingFor
                        ? <p id="group-looking-for-hint" className="text-meta text-danger">{t(errors.lookingFor.message as 'LOOKING_FOR_TOO_LONG')}</p>
                        : <p id="group-looking-for-hint" className="text-meta text-foreground-muted">{t('fieldLookingForHint')}</p>}
                    <TextCounter id="group-looking-for-count" length={(watch('lookingFor') ?? '').length} max={GROUP_LOOKING_FOR_MAX} />
                </div>
            </div>

            {/* Par mums: one language at a time */}
            <AboutField lang={lang} onLangChange={onLangChange} />

            {/* Banner Image */}
            <div>
                <label htmlFor="group-banner" className="mb-1.5 flex items-center gap-1.5 text-button-sm text-foreground">
                    <ImageIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldBannerImage')}
                    <span className="ml-auto text-meta font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <Input
                    id="group-banner"
                    type="text"
                    {...register('bannerImage')}
                    placeholder={t('fieldBannerImagePlaceholder')}
                    aria-invalid={errors.bannerImage ? true : undefined}
                />
                {errors.bannerImage && <p className="mt-1 text-meta text-danger">{t(errors.bannerImage.message as 'INVALID_URL')}</p>}
                <p className="mt-1 text-meta text-foreground-muted">{t('fieldBannerImageHint')}</p>
            </div>
        </div>
    );
}
