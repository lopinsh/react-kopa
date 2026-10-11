'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateText, parseDateText } from '@/lib/local-datetime';
import { useDateFormatter, type DateFormatter } from '@/lib/date-format';

type Props = {
    id?: string;
    /** "YYYY-MM-DD", or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    disabled?: boolean;
};

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Date as day.month.year (European, both languages) with a Monday-first calendar.
 * The text box is the primary input (keyboard and screen readers); the calendar is a helper.
 */
export default function DateField({ id, value, onChange, invalid, disabled }: Props) {
    const t = useTranslations('eventWizard');
    const format = useDateFormatter();
    const calendarId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState(formatDateText(value));
    const [open, setOpen] = useState(false);
    const [badText, setBadText] = useState(false);

    // Follow outside changes (start moved the end), but keep what is being typed.
    const [seenValue, setSeenValue] = useState(value);
    if (value !== seenValue) {
        setSeenValue(value);
        setText((current) => (parseDateText(current) === value ? current : formatDateText(value)));
        setBadText(false);
    }

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    function commit(next: string) {
        setText(next);
        if (next.trim() === '') {
            setBadText(false);
            if (value !== '') onChange('');
            return;
        }
        const parsed = parseDateText(next);
        setBadText(!parsed);
        if (parsed && parsed !== value) onChange(parsed);
    }

    return (
        <div ref={rootRef} className="relative">
            <div className="flex gap-2">
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={text}
                    disabled={disabled}
                    placeholder={t('datePlaceholder')}
                    aria-invalid={invalid || badText || undefined}
                    aria-label={t('dateLabel')}
                    onChange={(e) => commit(e.target.value)}
                    onBlur={() => {
                        const parsed = parseDateText(text);
                        if (parsed) setText(formatDateText(parsed));
                    }}
                    onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
                    className={clsx(
                        'min-w-0 flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm tabular-nums focus:outline-none disabled:opacity-60',
                        invalid || badText ? 'border-red-400' : 'border-border focus:border-[var(--accent)]'
                    )}
                />
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    aria-controls={open ? calendarId : undefined}
                    aria-label={t('openCalendar')}
                    className="shrink-0 rounded-xl border border-border px-3 text-foreground-muted hover:bg-surface-elevated disabled:opacity-60"
                >
                    <Calendar className="h-4 w-4" />
                </button>
            </div>
            {badText && <p className="mt-1 text-xs text-red-500">{t('invalidDate')}</p>}
            {open && (
                <MonthGrid
                    id={calendarId}
                    selected={value}
                    format={format}
                    prevLabel={t('previousMonth')}
                    nextLabel={t('nextMonth')}
                    onPick={(d) => { onChange(d); setOpen(false); }}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}

type GridProps = {
    id: string;
    selected: string;
    format: DateFormatter;
    prevLabel: string;
    nextLabel: string;
    onPick: (date: string) => void;
    onClose: () => void;
};

function MonthGrid({ id, selected, format, prevLabel, nextLabel, onPick, onClose }: GridProps) {
    const today = new Date();
    const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());
    const [focus, setFocus] = useState(/^\d{4}-\d{2}-\d{2}$/.test(selected) ? selected : todayKey);
    const gridRef = useRef<HTMLDivElement>(null);
    const movedByKeyboard = useRef(false);

    const [fy, fm, fd] = focus.split('-').map(Number);
    const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));
    const first = utc(fy, fm - 1, 1);
    const offset = (first.getUTCDay() + 6) % 7; // Monday first
    const daysInMonth = utc(fy, fm, 0).getUTCDate();
    const cells: Array<number | null> = [...Array<null>(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const shift = (days: number, months = 0) => {
        const target = utc(fy, fm - 1 + months, 1);
        const lastDay = utc(target.getUTCFullYear(), target.getUTCMonth() + 1, 0).getUTCDate();
        const d = utc(target.getUTCFullYear(), target.getUTCMonth(), Math.min(fd, lastDay) + days);
        setFocus(dayKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };

    useEffect(() => {
        if (movedByKeyboard.current) gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    }, [focus]);

    function onKeyDown(e: React.KeyboardEvent) {
        const weekdayIndex = (first.getUTCDay() + 6 + fd - 1) % 7; // 0 = Monday
        const moves: Record<string, () => void> = {
            ArrowLeft: () => shift(-1),
            ArrowRight: () => shift(1),
            ArrowUp: () => shift(-7),
            ArrowDown: () => shift(7),
            PageUp: () => shift(0, -1),
            PageDown: () => shift(0, 1),
            Home: () => shift(-weekdayIndex),
            End: () => shift(6 - weekdayIndex),
        };
        if (e.key === 'Escape') {
            e.stopPropagation();
            onClose();
            return;
        }
        const move = moves[e.key];
        if (move) {
            e.preventDefault();
            movedByKeyboard.current = true;
            move();
        }
    }

    const monthTitle = format.dateTime(first, { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const weekdays = Array.from({ length: 7 }, (_, i) => format.dateTime(utc(2024, 0, 1 + i), { weekday: 'short', timeZone: 'UTC' }));

    return (
        <div
            id={id}
            role="dialog"
            aria-label={monthTitle}
            onKeyDown={onKeyDown}
            className="absolute left-0 top-full z-30 mt-1 w-[19rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-surface p-3 shadow-premium"
        >
            <div className="mb-2 flex items-center justify-between">
                <button type="button" aria-label={prevLabel} onClick={() => { movedByKeyboard.current = false; shift(0, -1); }} className="rounded-lg p-2 text-foreground-muted hover:bg-surface-elevated">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <p aria-live="polite" className="text-sm font-semibold capitalize text-foreground">{monthTitle}</p>
                <button type="button" aria-label={nextLabel} onClick={() => { movedByKeyboard.current = false; shift(0, 1); }} className="rounded-lg p-2 text-foreground-muted hover:bg-surface-elevated">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-0.5 text-center">
                {weekdays.map((w, i) => (
                    <span key={i} role="columnheader" className="py-1 text-[11px] font-semibold uppercase text-foreground-muted">{w}</span>
                ))}
                {cells.map((day, i) => {
                    if (!day) return <span key={i} />;
                    const k = dayKey(fy, fm - 1, day);
                    const isSelected = k === selected;
                    return (
                        <button
                            key={i}
                            type="button"
                            role="gridcell"
                            tabIndex={day === fd ? 0 : -1}
                            aria-selected={isSelected}
                            aria-current={k === todayKey ? 'date' : undefined}
                            aria-label={format.dateTime(utc(fy, fm - 1, day), { dateStyle: 'full', timeZone: 'UTC' })}
                            onClick={() => onPick(k)}
                            className={clsx(
                                'aspect-square rounded-lg text-sm tabular-nums',
                                isSelected ? 'bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]' : 'text-foreground hover:bg-surface-elevated',
                                !isSelected && k === todayKey && 'border border-[var(--accent)]'
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
