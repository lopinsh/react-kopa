'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import MonthGrid from '@/components/ui/MonthGrid';
import Button from '@/components/ui/Button';
import { useDiscoveryDates } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { capitalizeFirst, EVENT_DAY, useDateFormatter } from '@/lib/date-format';
import { addDays, addMonths, dayNoon, monthOf, type DayKey } from '@/lib/discovery-dates';
import { DISCOVERY_CALENDAR_MONTHS_AHEAD, DISCOVERY_DAY_RANGE_MAX, UI } from '@/lib/constants';

/** The calendar of the date choice: first tap a day, second a range (either order); "Rādīt N" applies; before any tap "Viss mēnesis". */
export default function MonthCalendar({ onClose, onApply }: { onClose: () => void; onApply?: () => void }) {
    const t = useTranslations('discovery');
    const format = useDateFormatter();
    const { today, choice, calendar, calendarCounts } = useDiscoveryDates();
    const { go, pending } = useDiscoveryNav();
    const thisMonth = monthOf(today);
    const preset = choice.kind === 'day' ? { from: choice.day, to: choice.day } : choice.kind === 'range' ? choice : null;
    const [start, setStart] = useState<DayKey | null>(preset?.from ?? null);
    const [end, setEnd] = useState<DayKey | null>(preset?.to ?? null);
    const [month, setMonth] = useState(preset ? monthOf(preset.from) : choice.kind === 'month' ? choice.month : thisMonth);

    const picking = start !== null && end === null;
    const range = start ? { from: end && end < start ? end : start, to: end && end > start ? end : start } : null;
    const span = DISCOVERY_DAY_RANGE_MAX - 1;
    const isDisabled = (day: DayKey) => day < today || (picking && start !== null && (day > addDays(start, span) || day < addDays(start, -span)));
    const onPick = (day: DayKey) => {
        if (picking) setEnd(day);
        else { setStart(day); setEnd(null); }
    };
    const dayText = (day: DayKey) => capitalizeFirst(format.dateTime(dayNoon(day), { ...EVENT_DAY, timeZone: 'UTC' }));
    const picked = !range ? null : picking ? t('pickEnd') : range.from === range.to
        ? dayText(range.from)
        : capitalizeFirst(format.dateTimeRange(dayNoon(range.from), dayNoon(range.to), { ...EVENT_DAY, timeZone: 'UTC' }));

    // N is the sum of the per-day counts the page loaded (this month and the next); beyond them the button reads plain "Rādīt".
    let count: number | null = null;
    if (range && range.from >= calendar.from && range.to <= calendar.to) {
        count = 0;
        for (let d = range.from; d <= range.to; d = addDays(d, 1)) count += calendarCounts[d] ?? 0;
    }
    const apply = () => {
        if (!range) return;
        if (onApply) { onApply(); return; }
        go({ date: range.from === range.to ? { kind: 'day', day: range.from } : { kind: 'range', from: range.from, to: range.to }, day: null });
        onClose();
    };

    return (
        <div data-ui={UI.datePicker}>
            <MonthGrid
                month={month}
                onMonth={setMonth}
                today={today}
                selected={range}
                isDisabled={isDisabled}
                onPick={onPick}
                minMonth={thisMonth}
                maxMonth={addMonths(thisMonth, DISCOVERY_CALENDAR_MONTHS_AHEAD)}
                labels={{ prev: t('previousMonth'), next: t('nextMonth') }}
            />
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-xs text-foreground-muted">
                {picked ? <span className="min-w-0">{picked}</span> : (
                    <button type="button" onClick={() => { go({ date: { kind: 'month', month }, day: null }); onClose(); }} className="font-semibold text-primary underline decoration-border underline-offset-4">{t('wholeMonth')}</button>
                )}
                <Button size="sm" disabled={!range || pending} onClick={apply}>{count === null ? t('show') : t('showCount', { count })}</Button>
            </div>
        </div>
    );
}
