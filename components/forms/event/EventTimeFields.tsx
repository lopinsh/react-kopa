'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations, useTimeZone } from 'next-intl';
import Field from '@/components/forms/event/Field';
import DateTimeField from '@/components/forms/event/DateTimeField';
import { addMinutesLocal, nextFullHourLocal, splitLocal } from '@/lib/local-datetime';
import type { EventFormData } from '@/lib/validations/event';

type Props = { onStartChange: (value: string) => void; onEndChange: (value: string) => void };

/** The start and the optional end of an event, in the viewer's zone. */
export default function EventTimeFields({ onStartChange, onEndChange }: Props) {
    const t = useTranslations('eventWizard');
    const timeZone = useTimeZone();
    const { control, formState: { errors } } = useFormContext<EventFormData>();
    const startValue = String(useWatch({ control, name: 'startDate' }) ?? '');
    const endValue = String(useWatch({ control, name: 'endDate' }) ?? '');

    return (
        <div className="space-y-4">
            <Field group id="event-start" label={t('fieldDate')} error={errors.startDate ? t(errors.startDate.message as 'INVALID_URL') : undefined}>
                <DateTimeField
                    idPrefix="event-start"
                    value={startValue}
                    onChange={onStartChange}
                    defaultTime={splitLocal(nextFullHourLocal()).time}
                    invalid={!!errors.startDate}
                />
            </Field>
            <Field group id="event-end" label={t('fieldEndDate')} error={errors.endDate ? t(errors.endDate.message as 'INVALID_URL') : undefined}>
                <DateTimeField
                    idPrefix="event-end"
                    value={endValue}
                    onChange={onEndChange}
                    defaultTime={splitLocal(addMinutesLocal(startValue, 120)).time || '12:00'}
                    invalid={!!errors.endDate}
                />
            </Field>
            <p className="text-meta text-foreground-muted">{t('timeZoneHint', { zone: timeZone ?? '' })}</p>
        </div>
    );
}
