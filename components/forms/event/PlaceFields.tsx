'use client';

import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import Field from '@/components/forms/event/Field';
import Switch from '@/components/ui/Switch';
import { useCities } from '@/components/providers/CitiesContext';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { cityLabel } from '@/lib/city-label';
import type { EventFormData } from '@/lib/validations/event';

import { Input, Select } from '@/components/ui/Input';
/**
 * Where an event happens (AR-57): its city (starts as the group's), "Tiešsaistē", and the address,
 * which turns into the meeting link when the event is online.
 */
export default function PlaceFields() {
    const t = useTranslations('eventWizard');
    const tCities = useTranslations('cities');
    const wt = useTranslations('wizard');
    const locale = useLocale();
    const { register, setValue, getValues, control, formState: { errors } } = useFormContext<EventFormData>();
    const groupCity = useGroupContext().city;
    const approved = useCities();
    // The city the event has when the form opens (the group's, or the saved one): it may still be waiting for approval.
    const [startCity] = useState(() => getValues('city'));
    const city = useWatch({ control, name: 'city' });
    const isOnline = useWatch({ control, name: 'isOnline' });

    const options = useMemo(() => {
        const bySlug = new Map(approved.map((c) => [c.slug, c.name]));
        for (const slug of [groupCity, startCity]) {
            if (slug && !bySlug.has(slug)) bySlug.set(slug, cityLabel(tCities, slug));
        }
        const collator = new Intl.Collator(locale);
        return [...bySlug.entries()].sort(([, a], [, b]) => collator.compare(a, b));
    }, [approved, groupCity, startCity, tCities, locale]);

    return (
        <>
            <Field
                id="event-city"
                label={t('fieldCity')}
                hint={t('fieldCityHint')}
                error={errors.city ? t(errors.city.message as 'CITY_REQUIRED') : undefined}
            >
                <Select
                    id="event-city"
                    {...register('city')}
                    aria-describedby="event-city-hint"
                >
                    {!city && <option value="" disabled>{wt('fieldCityPlaceholder')}</option>}
                    {options.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                </Select>
            </Field>

            <div>
                <div className="flex min-h-11 items-center justify-between gap-4">
                    <span id="event-online-label" className="text-body-sm text-foreground">{t('fieldOnline')}</span>
                    <Switch
                        checked={!!isOnline}
                        onChange={(on) => setValue('isOnline', on, { shouldDirty: true })}
                        labelledBy="event-online-label"
                        describedBy="event-online-hint"
                    />
                </div>
                <p id="event-online-hint" className="text-meta text-foreground-muted">{t('fieldOnlineHint')}</p>
            </div>

            <Field
                id="event-location"
                label={isOnline ? t('fieldLink') : t('fieldLocation')}
                hint={isOnline ? undefined : t('fieldLocationHint')}
                error={errors.location ? t(errors.location.message as 'LOCATION_REQUIRED') : undefined}
            >
                <Input
                    id="event-location"
                    type="text"
                    inputMode={isOnline ? 'url' : undefined}
                    {...register('location')}
                    placeholder={isOnline ? t('fieldLinkPlaceholder') : t('fieldLocationPlaceholder')}
                    aria-invalid={errors.location ? true : undefined}
                    aria-describedby={errors.location || !isOnline ? 'event-location-hint' : undefined}
                />
            </Field>
        </>
    );
}
