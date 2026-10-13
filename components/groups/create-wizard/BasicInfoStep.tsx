'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Type, AlignLeft, Image as ImageIcon } from 'lucide-react';
import type { GroupFormValues } from '@/lib/validations/group';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function BasicInfoStep() {
    const t = useTranslations('wizard');
    const { register, watch, setValue, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="group-name" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldName')}
                    <span className="text-danger">*</span>
                </label>
                <input
                    id="group-name"
                    type="text"
                    autoFocus
                    {...register('name')}
                    placeholder={t('fieldNamePlaceholder')}
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted transition-shadow focus:outline-none',
                        errors.name ? 'border-danger/40' : 'border-border focus:border-primary'
                    )}
                />
                {errors.name && <p className="mt-1 text-xs text-danger">{t(errors.name.message as 'NAME_TOO_SHORT')}</p>}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="group-desc" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <AlignLeft className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldDescription')}
                    <span className="ml-auto text-xs font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <RichTextEditor
                    value={watch('description') || ''}
                    onChange={(val) => setValue('description', val)}
                    placeholder={t('fieldDescriptionPlaceholder')}
                />
                {errors.description && <p className="mt-1 text-xs text-danger">{t(errors.description.message as 'DESCRIPTION_TOO_LONG')}</p>}
            </div>

            {/* Banner Image */}
            <div>
                <label htmlFor="group-banner" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ImageIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldBannerImage')}
                    <span className="ml-auto text-xs font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <input
                    id="group-banner"
                    type="text"
                    {...register('bannerImage')}
                    placeholder={t('fieldBannerImagePlaceholder')}
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted transition-shadow focus:outline-none',
                        errors.bannerImage ? 'border-danger/40' : 'border-border focus:border-primary'
                    )}
                />
                {errors.bannerImage && <p className="mt-1 text-xs text-danger">{t(errors.bannerImage.message as 'INVALID_URL')}</p>}
                <p className="mt-1 text-[11px] text-foreground-muted">{t('fieldBannerImageHint')}</p>
            </div>
        </div>
    );
}
