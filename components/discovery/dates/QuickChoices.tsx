'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useDiscoveryDates } from '@/components/providers/DiscoveryProvider';
import { isThisWeek, type DateChoice } from '@/lib/discovery-dates';

type Props = {
    onPick: (choice: DateChoice) => void;
    /** `line`: segments inside the filter line's frame. `sheet`: full-width segments above the calendar. */
    variant: 'line' | 'sheet';
};

/** Šodien · Šonedēļ · Nedēļas nogalē. Šonedēļ looks pressed on the default; Šodien only once chosen (AR-24). */
export default function QuickChoices({ onPick, variant }: Props) {
    const t = useTranslations('discovery');
    const { choice, today } = useDiscoveryDates();
    const items: Array<{ key: string; label: string; value: DateChoice; pressed: boolean }> = [
        { key: 'today', label: t('today'), value: { kind: 'today' }, pressed: choice.kind === 'today' },
        { key: 'week', label: t('thisWeek'), value: { kind: 'week' }, pressed: isThisWeek(choice, today) },
        { key: 'weekend', label: t('weekend'), value: { kind: 'weekend' }, pressed: choice.kind === 'weekend' }
    ];
    return (
        <div role="group" aria-label={t('dateLabel')} className={clsx('flex', variant === 'sheet' ? 'gap-1.5' : 'shrink-0 items-center')}>
            {items.map((i) => (
                <button
                    key={i.key}
                    type="button"
                    aria-pressed={i.pressed}
                    onClick={() => onPick(i.value)}
                    className={clsx(
                        'whitespace-nowrap rounded-pill text-meta',
                        variant === 'sheet' ? 'min-h-11 flex-1 px-2 ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)]' : 'relative h-6 px-3 after:absolute after:-inset-y-1 after:inset-x-0',
                        i.pressed ? (variant === 'sheet' ? 'bg-tint weight-strong ring-[length:max(1.5px,var(--line-width))] ring-inset ring-[color:var(--line-active,var(--foreground))]' : 'tab-tint weight-strong') : 'weight-medium text-foreground-muted hover:bg-tint hover:text-foreground'
                    )}
                >
                    {i.label}
                </button>
            ))}
        </div>
    );
}
