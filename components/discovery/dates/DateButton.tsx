'use client';

import { useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';
import { clsx } from 'clsx';
import DateSheet from './DateSheet';
import { dateChoiceLabel } from './date-label';
import FilterButton from '@/components/discovery/filter/FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import { useDiscoveryDates } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { useDateFormatter } from '@/lib/date-format';
import { isThisWeek } from '@/lib/discovery-dates';
import { UI } from '@/lib/constants';

const PANEL = 300;

/** The one date button (phones, and a narrow filter line): "Šonedēļ ▾", or the choice with a × to go back to Šonedēļ. Opens the sheet (drop-down from md). */
export default function DateButton({ className }: { className?: string }) {
    const t = useTranslations('discovery');
    const format = useDateFormatter();
    const { choice, today } = useDiscoveryDates();
    const { go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover(PANEL);
    const label = dateChoiceLabel(choice, today, format, { week: t('thisWeek'), today: t('today'), weekend: t('weekend') });
    const chosen = !isThisWeek(choice, today);

    return (
        <div ref={bindHost} data-ui={UI.datePhone} className={clsx('relative min-w-0 shrink-0', className)}>
            <FilterButton
                icon={<CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />}
                label={label}
                ariaLabel={t('dateChoiceLabel', { when: label })}
                chosen={chosen}
                open={pop.open}
                onToggle={pop.toggle}
                controls={pop.id}
                onClear={() => go({ date: { kind: 'week' }, day: null })}
                clearLabel={t('clearChoice', { what: label })}
                widthClass="max-w-[8rem]"
            />
            <FilterPopover pop={pop} title={t('dateLabel')} width={PANEL} onClose={() => pop.setOpen(false)}>
                <DateSheet onClose={() => pop.setOpen(false)} />
            </FilterPopover>
        </div>
    );
}
