'use client';

import { useSyncExternalStore } from 'react';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import MonthCalendar from '@/components/discovery/dates/MonthCalendar';
import QuickChoices from '@/components/discovery/dates/QuickChoices';
import { addDays } from '@/lib/discovery-dates';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import type { DiscoveryDates } from '@/lib/types/discovery';

const NOOP = () => undefined;
const noSubscribe = () => NOOP;

/** The date choices as static samples: the quick choices (Šonedēļ pressed) and the calendar with a range chosen. Nothing navigates. */
export function DatesDemo({ today }: { today: string }) {
    // The calendar renders in the browser only: Node's and the browser's ICU write full dates (its day names) differently.
    const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
    const from = addDays(today, 2);
    const to = addDays(today, 5);
    const calendarCounts = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [addDays(today, i), i % 3]));
    const dates: DiscoveryDates = {
        today, choice: { kind: 'range', from, to }, period: { from, to }, listFrom: from, week: today, weekCounts: {},
        calendar: { from: today, to: addDays(today, 39) }, calendarCounts
    };
    return (
        <DiscoveryProvider state={{ kind: 'events', params: parseDiscoveryParams({}), categories: [], veidi: [], counts: { total: 0, anyTopic: 0, anyPlace: 0, byCity: {}, online: 0 }, alsoMatches: [], dates }}>
            <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col gap-3">
                    <div className="inline-flex h-8 items-center rounded-full bg-surface p-[3px] ring-1 ring-inset ring-border"><QuickChoices variant="line" onPick={NOOP} /></div>
                    <div className="w-72"><QuickChoices variant="sheet" onPick={NOOP} /></div>
                </div>
                <div className="w-[300px] rounded-2xl bg-surface p-3 shadow-premium ring-1 ring-border">{mounted ? <MonthCalendar onClose={NOOP} onApply={NOOP} /> : <div className="h-80" />}</div>
            </div>
        </DiscoveryProvider>
    );
}
