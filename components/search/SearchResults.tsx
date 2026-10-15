'use client';

import { useState } from 'react';
import { useTimeZone, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import GroupRow from '@/components/discovery/GroupRow';
import EventDayList from '@/components/events/EventDayList';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { dayInZone } from '@/lib/discovery-dates';
import { groupByDay } from '@/lib/event-days';
import { saveRecent } from '@/lib/recent-searches';
import { UI } from '@/lib/constants';
import type { SearchModel } from '@/hooks/useSearch';

const HEADING = 'px-0.5 pb-1 pt-3 text-xs font-semibold text-foreground-muted';

type Props = { search: SearchModel; requestClose: () => void };

/** Groups as group rows, events as event rows under day headings, the word marked; then what is left elsewhere and "Rādīt visus rezultātus (N)". */
export default function SearchResults({ search, requestClose }: Props) {
    const t = useTranslations('discovery');
    const tSearch = useTranslations('discovery.search');
    const zone = useTimeZone() ?? 'UTC';
    const [now] = useState(() => new Date());
    const { results, theme, word, setCities, showAllHref, here } = search;

    if (!results) return <div aria-hidden="true" className="pt-3"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>;

    const { groups, events, total, cities, elsewhere } = results;
    const marked = results.word;
    const themeTitle = results.themes.find((c) => c.slug === theme)?.title;
    const heading = (kind: string) => (themeTitle ? tSearch('headingWithTheme', { kind, theme: themeTitle }) : kind);
    const found = total.groups + total.events;

    return (
        // A click on any result link keeps the word in the recent searches (links only: the rows are the links).
        <div data-ui={UI.searchResults} onClick={(e) => { if (e.target instanceof Element && e.target.closest('a[href]')) saveRecent(word); }}>
            {groups.length > 0 && (
                <section>
                    <h3 className={HEADING}>{heading(t('groups'))}</h3>
                    {groups.map((g) => <GroupRow key={g.id} group={g} highlight={marked} replace searchItem />)}
                </section>
            )}
            {events.length > 0 && (
                <section>
                    <h3 className={HEADING}>{heading(t('events'))}</h3>
                    <EventDayList flat days={groupByDay(events, now, zone)} today={dayInZone(now, zone)} showGroup showCity={cities.length !== 1} highlight={marked} replace searchItem />
                </section>
            )}
            {found === 0 && groups.length === 0 && events.length === 0 && (marked || theme) && (
                <p className="px-0.5 py-4 italic text-primary">{t('nothingFound')}</p>
            )}
            {cities.length > 0 && elsewhere > 0 && (
                <p className="px-0.5 pt-3 text-[13px] text-foreground-muted">
                    {tSearch('elsewhere', { count: elsewhere })}{' · '}
                    <button type="button" onClick={() => setCities([])} className="font-medium text-primary underline-offset-2 hover:underline">{tSearch('everywhere')}</button>
                </p>
            )}
            {found > 0 && (
                <div className="sticky bottom-0 mt-3 border-t border-border bg-surface pt-1">
                    <Link
                        href={showAllHref}
                        replace
                        scroll={false}
                        data-search-item
                        onClick={(e) => { if (here) { e.preventDefault(); requestClose(); } }}
                        className="flex min-h-11 items-center gap-1.5 rounded-lg px-0.5 text-sm font-semibold text-primary hover:underline md:min-h-9"
                    >
                        {tSearch('showAllCount', { count: found })}
                        <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
