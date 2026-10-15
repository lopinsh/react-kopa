'use client';

import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { MapPin } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { useCities } from '@/components/providers/CitiesContext';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { cityLabel } from '@/lib/city-label';
import type { EventFormData } from '@/lib/validations/event';

const INPUT = 'w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none';

/**
 * Where an event happens (AR-57): its city (starts as the group's), "Tiešsaistē", and the address,
 * which turns into the meeting link when the event is online.
 */
export default function EventPlaceFields() {
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
            <div>
                <label htmlFor="event-city" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-foreground-muted" />
                    {t('fieldCity')}
                    <span className="text-danger">*</span>
                </label>
                <select
                    id="event-city"
                    {...register('city')}
                    aria-describedby="event-city-hint"
                    className={clsx(INPUT, errors.city ? 'border-danger/40' : 'border-border focus:border-primary')}
                >
                    {!city && <option value="" disabled>{wt('fieldCityPlaceholder')}</option>}
                    {options.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                </select>
                <p id="event-city-hint" className={clsx('mt-1 text-xs', errors.city ? 'text-danger' : 'text-foreground-muted')}>
                    {errors.city ? t(errors.city.message as 'CITY_REQUIRED') : t('fieldCityHint')}
                </p>
            </div>

            <div>
                <div className="flex min-h-11 items-center justify-between gap-4">
                    <span id="event-online-label" className="text-sm font-medium text-foreground">{t('fieldOnline')}</span>
                    <Switch
                        checked={!!isOnline}
                        onChange={(on) => setValue('isOnline', on, { shouldDirty: true })}
                        labelledBy="event-online-label"
                        describedBy="event-online-hint"
                    />
                </div>
                <p id="event-online-hint" className="text-xs text-foreground-muted">{t('fieldOnlineHint')}</p>
            </div>

            <div>
                <label htmlFor="event-location" className="mb-1.5 block text-sm font-medium text-foreground">
                    {isOnline ? t('fieldLink') : t('fieldLocation')}
                </label>
                <input
                    id="event-location"
                    type="text"
                    inputMode={isOnline ? 'url' : undefined}
                    {...register('location')}
                    placeholder={isOnline ? t('fieldLinkPlaceholder') : t('fieldLocationPlaceholder')}
                    className={clsx(INPUT, errors.location ? 'border-danger/40' : 'border-border focus:border-primary')}
                />
                {!isOnline && !errors.location && <p className="mt-1 text-xs text-foreground-muted">{t('fieldLocationHint')}</p>}
                {errors.location && <p className="mt-1 text-xs text-danger">{t(errors.location.message as 'LOCATION_REQUIRED')}</p>}
            </div>
        </>
    );
}
