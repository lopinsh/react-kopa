'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Type, AlignLeft, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import TextCounter from '@/components/ui/TextCounter';
import EventTimeFields from '@/components/forms/event/EventTimeFields';
import PlaceFields from '@/components/forms/event/PlaceFields';
import { EVENT_TITLE_MAX, type EventFormData } from '@/lib/validations/event';
import type { TextLang } from '@/lib/translations';

type Props = {
    lang: TextLang;
    /** Bumped when text is copied in, so the editor reloads its value. */
    rev: number;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
};

/** Step 1: name, description, picture, time and place. */
export default function WhatWhenStep({ lang, rev, onStartChange, onEndChange }: Props) {
    const t = useTranslations('eventWizard');
    const { register, setValue, control, formState: { errors } } = useFormContext<EventFormData>();
    const texts = useWatch({ control, name: 'texts' });
    const titleError = errors.texts?.[lang]?.title;

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Type className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldName')}
                </label>
                <input
                    key={`title-${lang}`}
                    type="text"
                    lang={lang}
                    {...register(`texts.${lang}.title`)}
                    aria-describedby="event-title-count"
                    placeholder={t('fieldNamePlaceholder')}
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                        titleError ? 'border-danger/40' : 'border-border focus:border-primary'
                    )}
                />
                <div className="mt-1 flex items-start gap-2">
                    {titleError && <p className="text-xs text-danger">{t(titleError.message as 'INVALID_URL')}</p>}
                    <TextCounter id="event-title-count" length={(texts?.[lang]?.title ?? '').length} max={EVENT_TITLE_MAX} />
                </div>
            </div>

            <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <AlignLeft className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldDescription')}
                </label>
                <div lang={lang}>
                    <RichTextEditor
                        key={`description-${lang}-${rev}`}
                        value={texts?.[lang]?.description || ''}
                        onChange={(val) => setValue(`texts.${lang}.description`, val)}
                        placeholder={t('fieldDescriptionPlaceholder')}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="event-banner" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <ImageIcon className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldBannerImage')}
                </label>
                <input
                    id="event-banner"
                    type="text"
                    {...register('bannerImage')}
                    placeholder={t('fieldBannerImagePlaceholder')}
                    className={clsx(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none',
                        errors.bannerImage ? 'border-danger/40' : 'border-border focus:border-primary'
                    )}
                />
                {errors.bannerImage && <p className="mt-1 text-xs text-danger">{t(errors.bannerImage.message as 'INVALID_URL')}</p>}
            </div>

            <EventTimeFields onStartChange={onStartChange} onEndChange={onEndChange} />
            <PlaceFields />
        </div>
    );
}
