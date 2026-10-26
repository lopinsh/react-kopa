'use client';

import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Stepper({ label, value, display, canLess, canMore, disabled, onStep }: { label: string; value: string; display: string; canLess: boolean; canMore: boolean; disabled: boolean; onStep: (dir: -1 | 1) => void }) {
    const t = useTranslations('admin.design.type');
    return (
        <div className="flex min-h-11 items-center justify-between gap-3">
            <span className="text-body text-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" aria-label={t('less', { field: label })} disabled={disabled || !canLess} onClick={() => onStep(-1)}><Minus className="size-4" aria-hidden="true" /></Button>
                <span className="min-w-16 text-center text-body tabular-nums" aria-live="polite" aria-label={display}>{value}</span>
                <Button type="button" variant="secondary" size="sm" aria-label={t('more', { field: label })} disabled={disabled || !canMore} onClick={() => onStep(1)}><Plus className="size-4" aria-hidden="true" /></Button>
            </div>
        </div>
    );
}
