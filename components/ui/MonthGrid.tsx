'use client';

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addMonths, dayNoon, monthOf, weekdayIndex, type DayKey } from '@/lib/discovery-dates';
import { useDateFormatter } from '@/lib/date-format';

type Props = {
    /** 'YYYY-MM' shown. */
    month: string;
    onMonth: (month: string) => void;
    today: DayKey;
    /** One day, or a range being built or chosen. */
    selected: { from: DayKey; to: DayKey } | null;
    isDisabled?: (day: DayKey) => boolean;
    onPick: (day: DayKey) => void;
    onEscape?: () => void;
    minMonth?: string;
    maxMonth?: string;
    labels: { prev: string; next: string };
};

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const pad = (n: number) => String(n).padStart(2, '0');
const BAND = 'bg-[color-mix(in_srgb,var(--primary)_15%,var(--surface))]';

/** One month, Monday first, weekend columns on the tint; picks a day. The parent places it (no popover chrome) and owns the month. */
export default function MonthGrid({ month, onMonth, today, selected, isDisabled, onPick, onEscape, minMonth, maxMonth, labels }: Props) {
    const t = useTranslations('common.weekdayInitials');
    const format = useDateFormatter();
    const gridRef = useRef<HTMLDivElement>(null);
    const byKeyboard = useRef(false);
    const [focusDay, setFocusDay] = useState<DayKey | null>(null);

    const first = `${month}-01`;
    const count = Number(addDays(`${addMonths(month, 1)}-01`, -1).slice(8));
    const fallback = selected && monthOf(selected.from) === month ? selected.from : monthOf(today) === month ? today : first;
    const focus = focusDay && monthOf(focusDay) === month ? focusDay : fallback;
    const cells: Array<DayKey | null> = [
        ...Array<null>(weekdayIndex(first)).fill(null),
        ...Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`)
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const canMove = (m: string) => (!minMonth || m >= minMonth) && (!maxMonth || m <= maxMonth);

    useEffect(() => {
        if (byKeyboard.current) gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    }, [focus]);

    function jump(target: DayKey) {
        const m = monthOf(target);
        if (!canMove(m)) return;
        if (m !== month) onMonth(m);
        byKeyboard.current = true;
        setFocusDay(target);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        const dom = Number(focus.slice(8));
        const inMonth = (n: number) => {
            const m = addMonths(monthOf(focus), n);
            return `${m}-${pad(Math.min(dom, Number(addDays(`${addMonths(m, 1)}-01`, -1).slice(8))))}`;
        };
        const moves: Record<string, DayKey> = {
            ArrowLeft: addDays(focus, -1), ArrowRight: addDays(focus, 1), ArrowUp: addDays(focus, -7), ArrowDown: addDays(focus, 7),
            PageUp: inMonth(-1), PageDown: inMonth(1), Home: addDays(focus, -weekdayIndex(focus)), End: addDays(focus, 6 - weekdayIndex(focus))
        };
        if (e.key === 'Escape' && onEscape) { e.stopPropagation(); onEscape(); return; }
        if (moves[e.key]) { e.preventDefault(); jump(moves[e.key]); }
    }

    const step = (n: number) => { byKeyboard.current = false; if (canMove(addMonths(month, n))) onMonth(addMonths(month, n)); };
    const arrow = 'grid size-8 place-items-center rounded-lg text-foreground-muted hover:bg-tint disabled:opacity-35 disabled:hover:bg-transparent';

    return (
        <div onKeyDown={onKeyDown}>
            <div className="mb-1.5 flex items-center justify-center gap-1">
                <p aria-live="polite" className="font-heading text-[15px] font-semibold text-foreground">{format.dateTime(dayNoon(first), { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
                <button type="button" aria-label={labels.prev} disabled={!canMove(addMonths(month, -1))} onClick={() => step(-1)} className={clsx(arrow, 'order-first')}><ChevronLeft aria-hidden="true" className="size-4" /></button>
                <button type="button" aria-label={labels.next} disabled={!canMove(addMonths(month, 1))} onClick={() => step(1)} className={arrow}><ChevronRight aria-hidden="true" className="size-4" /></button>
            </div>
            <div ref={gridRef} role="grid" className="grid grid-cols-7 text-center">
                {WEEKDAYS.map((w, i) => (
                    <span key={w} role="columnheader" className={clsx('py-1 text-[11px] font-semibold', i >= 5 ? 'bg-tint text-foreground' : 'text-foreground-muted')}>{t(w)}</span>
                ))}
                {cells.map((day, i) => {
                    const weekend = i % 7 >= 5;
                    if (!day) return <span key={i} className={weekend ? 'bg-tint' : undefined} />;
                    const start = selected?.from === day, end = selected?.to === day;
                    const between = !!selected && day > selected.from && day < selected.to;
                    const off = !!isDisabled?.(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            role="gridcell"
                            tabIndex={day === focus ? 0 : -1}
                            aria-selected={start || end || between}
                            aria-disabled={off || undefined}
                            aria-current={day === today ? 'date' : undefined}
                            aria-label={format.dateTime(dayNoon(day), { dateStyle: 'full', timeZone: 'UTC' })}
                            onClick={() => { if (!off) onPick(day); }}
                            className={clsx(
                                'h-9 text-sm tabular-nums',
                                start || end ? 'bg-primary font-semibold text-primary-foreground' : between ? BAND : clsx(weekend && 'bg-tint', !off && 'hover:bg-surface-elevated'),
                                start && end ? 'rounded-lg' : start ? 'rounded-l-lg' : end ? 'rounded-r-lg' : !between && 'rounded-lg',
                                off && 'cursor-default opacity-55',
                                day === today && 'font-bold underline underline-offset-4'
                            )}
                        >
                            {Number(day.slice(8))}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
