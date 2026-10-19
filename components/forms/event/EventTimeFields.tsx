'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations, useTimeZone } from 'next-intl';
import { Calendar } from 'lucide-react';
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
            <div role="group" aria-labelledby="event-start-label">
                <p id="event-start-label" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldDate')}
                </p>
                <DateTimeField
                    idPrefix="event-start"
                    value={startValue}
                    onChange={onStartChange}
                    defaultTime={splitLocal(nextFullHourLocal()).time}
                    invalid={!!errors.startDate}
                />
                {errors.startDate && <p className="mt-1 text-xs text-danger">{t(errors.startDate.message as 'INVALID_URL')}</p>}
            </div>

            <div role="group" aria-labelledby="event-end-label">
                <p id="event-end-label" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldEndDate')}
                </p>
                <DateTimeField
                    idPrefix="event-end"
                    value={endValue}
                    onChange={onEndChange}
                    defaultTime={splitLocal(addMinutesLocal(startValue, 120)).time || '12:00'}
                    invalid={!!errors.endDate}
                />
                {errors.endDate && <p className="mt-1 text-xs text-danger">{t(errors.endDate.message as 'INVALID_URL')}</p>}
            </div>
            <p className="text-xs text-foreground-muted">{t('timeZoneHint', { zone: timeZone ?? '' })}</p>
        </div>
    );
}
