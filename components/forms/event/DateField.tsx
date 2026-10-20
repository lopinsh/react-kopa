'use client';

import { useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';
import { formatDateText, parseDateText } from '@/lib/local-datetime';
import { FIELD_INPUT, fieldBorder } from '@/components/forms/event/Field';
import MonthGrid from '@/components/ui/MonthGrid';
import { isDayKey, monthOf } from '@/lib/discovery-dates';
import { useClickOutside } from '@/hooks/useClickOutside';

type Props = {
    id?: string;
    /** "YYYY-MM-DD", or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    disabled?: boolean;
};

/**
 * Date as day.month.year (European, both languages) with a Monday-first calendar.
 * The text box is the primary input (keyboard and screen readers); the calendar is a helper.
 */
export default function DateField({ id, value, onChange, invalid, disabled }: Props) {
    const t = useTranslations('eventWizard');
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

    useClickOutside(rootRef, () => setOpen(false), open);

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
                        FIELD_INPUT, 'min-w-0 flex-1 tabular-nums disabled:opacity-60', fieldBorder(!!invalid || badText)
                    )}
                />
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    aria-controls={open ? calendarId : undefined}
                    aria-label={t('openCalendar')}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl line text-foreground-muted hover:bg-surface-elevated disabled:opacity-60 md:h-10 md:w-10"
                >
                    <Calendar className="h-4 w-4" />
                </button>
            </div>
            {badText && <p className="mt-1 text-xs text-danger">{t('invalidDate')}</p>}
            {open && <DatePanel id={calendarId} value={value} onPick={(d) => { onChange(d); setOpen(false); }} onClose={() => setOpen(false)} />}
        </div>
    );
}

/** The calendar drop-down under the text box: one month, one day picked. Today comes from the browser (the event form's own clock). */
function DatePanel({ id, value, onPick, onClose }: { id: string; value: string; onPick: (day: string) => void; onClose: () => void }) {
    const t = useTranslations('eventWizard');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [month, setMonth] = useState(monthOf(isDayKey(value) ? value : today));
    return (
        <div id={id} role="dialog" aria-label={t('openCalendar')} className="absolute left-0 top-full z-30 mt-1 w-[19rem] max-w-[calc(100vw-3rem)] rounded-2xl line bg-surface p-3 shadow-premium">
            <MonthGrid
                month={month}
                onMonth={setMonth}
                today={today}
                selected={isDayKey(value) ? { from: value, to: value } : null}
                onPick={onPick}
                onEscape={onClose}
                labels={{ prev: t('previousMonth'), next: t('nextMonth') }}
            />
        </div>
    );
}
