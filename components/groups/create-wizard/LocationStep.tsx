'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import CityField from '@/components/groups/CityField';

export default function LocationStep() {
    const t = useTranslations('wizard');

    return (
        <div>
            <label htmlFor="group-city" className="mb-1.5 flex items-center gap-1.5 text-button-sm text-foreground">
                <MapPin className="size-3.5 text-foreground-muted" />
                {t('fieldCity')}
            </label>
            <CityField
                id="group-city"
                autoFocus
            />
        </div>
    );
}
