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
                        'whitespace-nowrap rounded-full text-[13px]',
                        variant === 'sheet' ? 'min-h-11 flex-1 px-2 ring-1 ring-inset ring-border' : 'relative h-[26px] px-3 after:absolute after:-inset-y-2 after:inset-x-0',
                        i.pressed ? 'bg-tint font-semibold ring-[1.5px] ring-inset ring-foreground' : 'font-medium hover:bg-tint'
                    )}
                >
                    {i.label}
                </button>
            ))}
        </div>
    );
}
