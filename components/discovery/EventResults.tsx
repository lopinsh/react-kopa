import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import EventCard from './EventCard';
import ListViewEventCard from './ListViewEventCard';
import EmptyState from '@/components/ui/EmptyState';
import type { DiscoverableEvent } from '@/lib/services/event.service';

/** The main category's slug of an event's group (its category may be a sub-category). */
function l1SlugOf(group: DiscoverableEvent['group']): string {
    const c = group.category;
    if (c.level === 3 && c.parent?.parent) return c.parent.parent.slug;
    if (c.level === 2 && c.parent) return c.parent.slug;
    return c.slug;
}

/** The Pasākumi list as today's event cards (R5b replaces them with rows and dates): a grid from `md`, rows on phones. */
export default async function EventResults({ events }: { events: DiscoverableEvent[] }) {
    const t = await getTranslations('discovery');
    const locale = await getLocale();

    if (events.length === 0) return <EmptyState icon={Search} title={t('noEventsFound')} description={t('adjustFilters')} />;
    return (
        <>
            <div className="hidden gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))]">
                {events.map((e) => <EventCard key={e.id} event={e} locale={locale} l1Slug={l1SlugOf(e.group)} groupSlug={e.group.slug} />)}
            </div>
            <div className="flex flex-col gap-3 md:hidden">
                {events.map((e) => <ListViewEventCard key={e.id} event={e} locale={locale} l1Slug={l1SlugOf(e.group)} groupSlug={e.group.slug} />)}
            </div>
        </>
    );
}
