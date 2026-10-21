'use client';

import { useTranslations } from 'next-intl';
import { CalendarDays, X } from 'lucide-react';
import { clsx } from 'clsx';
import MonthCalendar from './MonthCalendar';
import QuickChoices from './QuickChoices';
import { dateChoiceLabel } from './date-label';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import { useDiscoveryDates } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { useDateFormatter } from '@/lib/date-format';
import { isThisWeek } from '@/lib/discovery-dates';
import { UI } from '@/lib/constants';

const PANEL = 300;

/**
 * The date part of the filter line where there is room (AR-23): one framed pill with Šodien · Šonedēļ · Nedēļas nogalē and a fourth
 * segment, the calendar. A day, range or month from the calendar sits in that segment, chosen, with a × back to Šonedēļ.
 */
export default function DateChoices({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const format = useDateFormatter();
    const { choice, today } = useDiscoveryDates();
    const { go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover(PANEL);
    const custom = !isThisWeek(choice, today) && choice.kind !== 'today' && choice.kind !== 'weekend';
    const label = dateChoiceLabel(choice, today, format, { week: t('thisWeek'), today: t('today'), weekend: t('weekend') });

    return (
        <div data-ui={UI.dateChoices} className={clsx('h-8 min-w-0 shrink items-center rounded-pill bg-surface p-1 ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)]', className)}>
            <QuickChoices variant="line" onPick={(date) => go({ date, day: null })} />
            <div ref={bindHost} className="relative ml-0.5 h-[26px] min-w-0 shrink">
                <span className={clsx('flex h-full min-w-0 items-center rounded-pill', custom ? 'bg-tint ring-[length:max(1.5px,var(--line-width))] ring-inset ring-[color:var(--line-active,var(--foreground))]' : pop.open && 'bg-tint')}>
                    <button
                        type="button"
                        onClick={pop.toggle}
                        aria-expanded={pop.open}
                        aria-controls={pop.id}
                        aria-haspopup="true"
                        aria-label={custom ? t('dateChoiceLabel', { when: label }) : t('pickDates')}
                        className={clsx('relative flex h-full min-w-0 items-center gap-1.5 rounded-pill text-meta after:absolute after:-inset-y-2 after:inset-x-0', custom ? 'pl-3 pr-1 weight-strong' : 'px-3 text-foreground-muted hover:bg-tint')}
                    >
                        <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
                        {custom && <span className="min-w-0 truncate">{label}</span>}
                    </button>
                    {custom && (
                        <button type="button" onClick={() => go({ date: { kind: 'week' }, day: null })} aria-label={t('clearChoice', { what: label })} className="relative mr-1 grid size-5 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-surface hover:text-foreground after:absolute after:-inset-y-2 after:-inset-x-1">
                            <X aria-hidden="true" className="size-3.5" />
                        </button>
                    )}
                </span>
                <FilterPopover pop={pop} title={t('dateLabel')} width={PANEL} onClose={() => pop.setOpen(false)}>
                    <div className="p-1"><MonthCalendar onClose={() => pop.setOpen(false)} /></div>
                </FilterPopover>
            </div>
        </div>
    );
}
