'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { MapPin } from 'lucide-react';
import { CITIES } from '@/lib/constants';
import { type GroupFormValues } from '@/lib/validations/group';

export default function LocationStep() {
    const t = useTranslations('wizard');
    const { register, formState: { errors } } = useFormContext<GroupFormValues>();

    return (
        <div>
            <label htmlFor="group-city" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MapPin className="h-3.5 w-3.5 text-foreground-muted" />
                {t('fieldCity')}
            </label>
            <select
                id="group-city"
                autoFocus
                {...register('city')}
                className={clsx(
                    'w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10',
                    errors.city ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                )}
            >
                <option value="">{t('fieldCityPlaceholder')}</option>
                {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
    );
}
