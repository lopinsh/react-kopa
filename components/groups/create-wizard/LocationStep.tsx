'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import CityField from '@/components/groups/CityField';

export default function LocationStep() {
    const t = useTranslations('wizard');

    return (
        <div>
            <label htmlFor="group-city" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MapPin className="h-3.5 w-3.5 text-foreground-muted" />
                {t('fieldCity')}
            </label>
            <CityField
                id="group-city"
                autoFocus
                selectClassName="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
                inputClassName="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
            />
        </div>
    );
}
