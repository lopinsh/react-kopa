'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { TIME_OPTIONS } from '@/lib/local-datetime';

type Props = {
    id?: string;
    /** "HH:mm", or '' when no time is chosen. */
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    disabled?: boolean;
};

/**
 * 24-hour time in 15-minute steps. A native select on purpose: keyboard, screen readers and phone
 * pickers work out of the box, and it always shows 24-hour times whatever the browser's language.
 * A stored time that is not on the 15-minute grid (older events) stays selectable.
 */
export default function TimeSelect({ id, value, onChange, invalid, disabled }: Props) {
    const t = useTranslations('eventWizard');
    const options = value && !TIME_OPTIONS.includes(value) ? [...TIME_OPTIONS, value].sort() : TIME_OPTIONS;

    return (
        <select
            id={id}
            aria-label={t('timeLabel')}
            value={value}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            onChange={(e) => onChange(e.target.value)}
            className={clsx(
                'w-full rounded-xl border bg-background px-3 py-2.5 text-sm tabular-nums focus:outline-none disabled:opacity-60',
                invalid ? 'border-red-400' : 'border-border focus:border-primary'
            )}
        >
            {!value && <option value="" />}
            {options.map((o) => (
                <option key={o} value={o}>{o}</option>
            ))}
        </select>
    );
}
