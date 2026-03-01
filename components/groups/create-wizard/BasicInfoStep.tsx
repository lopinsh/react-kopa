'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Type, AlignLeft, Image as ImageIcon, HelpCircle } from 'lucide-react';
import type { GroupFormValues } from '@/lib/validations/group';
import RichTextEditor from '@/components/ui/RichTextEditor';

type Props = {
    accentColor: string;
};

export default function BasicInfoStep({ accentColor }: Props) {
    const t = useTranslations('wizard');
    const { register, watch, setValue, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label htmlFor="group-name" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldName')}
                </label>
                <input
                    id="group-name"
                    type="text"
                    autoFocus
                    {...register('name')}
                    placeholder={t('fieldNamePlaceholder')}
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted transition-shadow focus:outline-none',
                        errors.name ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                    style={{ ['--tw-ring-color' as string]: accentColor }}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Banner Image */}
            <div>
                <label htmlFor="group-banner" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ImageIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    Banner Image URL
                    <span className="ml-auto text-xs font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <input
                    id="group-banner"
                    type="text"
                    {...register('bannerImage')}
                    placeholder="https://images.unsplash.com/..."
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted transition-shadow focus:outline-none',
                        errors.bannerImage ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                    style={{ ['--tw-ring-color' as string]: accentColor }}
                />
                {errors.bannerImage && <p className="mt-1 text-xs text-red-500">{errors.bannerImage.message}</p>}
                <p className="mt-1 text-[10px] text-foreground-muted">Paste a URL for a background banner image.</p>
            </div>

            {/* Instructions */}
            <div>
                <label htmlFor="group-instructions" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <HelpCircle className="h-3.5 w-3.5 text-foreground-muted" />
                    Instructions
                    <span className="ml-auto text-xs font-normal text-foreground-muted">{t('optional')}</span>
                </label>
                <RichTextEditor
                    value={watch('instructions') || ''}
                    onChange={(val) => setValue('instructions', val)}
                    placeholder="Member-only instructions (e.g. meeting point details)..."
                />
                {errors.instructions && <p className="mt-1 text-xs text-red-500">{errors.instructions.message}</p>}
                <p className="mt-1 text-[10px] text-foreground-muted">These instructions are only visible to group members.</p>
            </div>
        </div>
    );
}
