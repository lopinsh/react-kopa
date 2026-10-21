'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import RichTextEditor from '@/components/ui/RichTextEditor';
import TextCounter from '@/components/ui/TextCounter';
import Field from '@/components/forms/event/Field';
import EventTimeFields from '@/components/forms/event/EventTimeFields';
import PlaceFields from '@/components/forms/event/PlaceFields';
import { EVENT_TITLE_MAX, type EventFormData } from '@/lib/validations/event';
import type { TextLang } from '@/lib/translations';

import { Input } from '@/components/ui/Input';
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
            <Field
                id="event-title"
                label={t('fieldName')}
                error={titleError ? t(titleError.message as 'INVALID_URL') : undefined}
                counter={<TextCounter id="event-title-count" length={(texts?.[lang]?.title ?? '').length} max={EVENT_TITLE_MAX} />}
            >
                <Input
                    id="event-title"
                    key={`title-${lang}`}
                    type="text"
                    lang={lang}
                    {...register(`texts.${lang}.title`)}
                    aria-describedby={titleError ? 'event-title-hint event-title-count' : 'event-title-count'}
                    aria-invalid={titleError ? true : undefined}
                    placeholder={t('fieldNamePlaceholder')}
                />
            </Field>

            <Field group id="event-description" label={t('fieldDescription')}>
                <div lang={lang}>
                    <RichTextEditor
                        key={`description-${lang}-${rev}`}
                        value={texts?.[lang]?.description || ''}
                        onChange={(val) => setValue(`texts.${lang}.description`, val)}
                        placeholder={t('fieldDescriptionPlaceholder')}
                    />
                </div>
            </Field>

            <Field id="event-banner" label={t('fieldBannerImage')} error={errors.bannerImage ? t(errors.bannerImage.message as 'INVALID_URL') : undefined}>
                <Input
                    id="event-banner"
                    type="text"
                    {...register('bannerImage')}
                    placeholder={t('fieldBannerImagePlaceholder')}
                    aria-invalid={errors.bannerImage ? true : undefined}
                    aria-describedby={errors.bannerImage ? 'event-banner-hint' : undefined}
                />
            </Field>

            <EventTimeFields onStartChange={onStartChange} onEndChange={onEndChange} />
            <PlaceFields />
        </div>
    );
}
