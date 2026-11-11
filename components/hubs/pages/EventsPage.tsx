import { CalendarDays } from 'lucide-react';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/routing';
import { DISCOVERY_EVENTS_MAX_LIMIT, HUB_EVENTS_STEP } from '@/lib/constants';
import { addDays, dayInZone, isThisWeek, isWeekChoice, weekRange } from '@/lib/discovery-dates';
import { discoveryHref, parseDiscoveryParams, type DiscoveryParams } from '@/lib/discovery-params';
import { eventWindow } from '@/lib/discovery-window';
import { groupByDay } from '@/lib/event-days';
import { hubPages, parseEventsLimit } from '@/lib/hub-pages';
import { HubService, type HubContext } from '@/lib/services/hub.service';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import DayStrip from '@/components/discovery/dates/DayStrip';
import DateChoices from '@/components/discovery/dates/DateChoices';
import DateButton from '@/components/discovery/dates/DateButton';
import EmptyState from '@/components/ui/EmptyState';
import TextLink from '@/components/ui/TextLink';
import { buttonClass } from '@/components/ui/Button';
import HubTabs from '@/components/hubs/HubTabs';
import HubEventDays from '@/components/hubs/HubEventDays';
import type { DiscoveryState } from '@/lib/types/discovery';

type Search = Record<string, string | string[] | undefined>;

/**
 * Pasākumi of a hub (K1-13..18): tabs Gaidāmie / Pagājušie with Kur at the end. Gaidāmie: the board's date choice and day strip, then the events under day
 * headings (cards from `lg`), the first 15 and "Rādīt vēl"; Pagājušie: newest first, no strip. The date parts read the board's `DiscoveryProvider`, here
 * filled with the hub's dates and links (`path`), no lists.
 */
export default async function EventsPage({ hub, sp, locale, viewerId }: { hub: HubContext; sp: Search; locale: string; viewerId?: string }) {
    const t = await getTranslations({ locale, namespace: 'hub' });
    const tDiscovery = await getTranslations({ locale, namespace: 'discovery' });
    const tCommon = await getTranslations({ locale, namespace: 'common' });
    const zone = await getTimeZone();
    const when = sp.tab === 'past' ? 'past' : 'upcoming';
    const eventsPath = `${hub.href}/events`;
    // The hub's Tēma and Veids are the page's own, not filters in the address: only Kur and the dates are.
    const p: DiscoveryParams = { ...parseDiscoveryParams({ ...sp, city: hub.local?.citySlug, tab: 'events' }), category: null, tags: [], q: '', path: eventsPath };
    const w = eventWindow(p, dayInZone(new Date(), zone), zone);
    if (when === 'upcoming' && w.expired) redirect({ href: discoveryHref(p, { date: { kind: 'week' }, day: null }), locale });

    const limit = parseEventsLimit(typeof sp.limit === 'string' ? sp.limit : undefined, HUB_EVENTS_STEP, DISCOVERY_EVENTS_MAX_LIMIT);
    const { events, hasMore, total, weekCounts, calendarCounts } = await HubService.getEvents(hub, { when, params: p, window: w, limit }, locale, zone, viewerId);

    const upcomingHref = hubPages(hub.href).find((x) => x.key === 'events')?.href ?? eventsPath;
    const tabs = [
        { key: 'upcoming', label: tCommon('eventsTabUpcoming'), href: upcomingHref },
        { key: 'past', label: tCommon('eventsTabPast'), href: `${upcomingHref}${upcomingHref.includes('?') ? '&' : '?'}tab=past` },
    ];
    const base = when === 'past' ? tabs[1].href : discoveryHref(p, {});
    const moreHref = `${base}${base.includes('?') ? '&' : '?'}limit=${Math.min(total, DISCOVERY_EVENTS_MAX_LIMIT)}`;
    const days = groupByDay(events, when === 'past' ? new Date(0) : w.bounds.from, zone);
    const nextWeek = when === 'upcoming' && isWeekChoice(w.choice)
        ? <TextLink href={discoveryHref(p, { date: weekRange(addDays(w.week, 7)), day: null })}>{tDiscovery('showNextWeek')}</TextLink>
        : null;
    const state: DiscoveryState = {
        kind: 'events', params: p, categories: [], veidi: [], alsoMatches: [],
        counts: { total, anyTopic: total, anyPlace: total, byCity: {}, online: 0 },
        kindTotals: { groups: 0, events: total },
        dates: { today: w.today, choice: w.choice, period: w.period, listFrom: w.listFrom, week: w.week, weekCounts, calendar: w.calendar, calendarCounts },
    };

    return (
        <>
            <HubTabs label={t('events.tabsLabel')} items={tabs} active={when} />
            {when === 'upcoming' && (
                <DiscoveryProvider state={state}>
                    <div className="@container/filter">
                        <div className="mb-2 hidden @4xl/filter:flex"><DateChoices /></div>
                        <div className="mb-2 flex @4xl/filter:hidden"><DateButton /></div>
                        <DayStrip window={w} params={p} counts={weekCounts} />
                    </div>
                </DiscoveryProvider>
            )}
            {events.length === 0 ? (
                <>
                    <EmptyState
                        icon={CalendarDays}
                        title={when === 'past' ? t('events.emptyPast') : isThisWeek(w.choice, w.today) ? tDiscovery('noEventsThisWeek') : tDiscovery('noEventsInPeriod')}
                    />
                    {nextWeek && <div className="text-center">{nextWeek}</div>}
                </>
            ) : (
                <>
                    <HubEventDays days={days} today={w.today} showCity={p.cities.length !== 1} />
                    {hasMore ? (
                        <div className="flex flex-col items-center gap-1">
                            <Link href={moreHref} scroll={false} className={buttonClass('secondary', undefined, 'sm')}>{t('events.showMore', { n: Math.min(total, DISCOVERY_EVENTS_MAX_LIMIT) - events.length })}</Link>
                            <p className="text-meta text-foreground-muted">{t('events.count', { shown: events.length, total })}</p>
                        </div>
                    ) : nextWeek && <div className="text-center">{nextWeek}</div>}
                </>
            )}
        </>
    );
}
