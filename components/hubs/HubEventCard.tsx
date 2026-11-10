import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cityLabel } from '@/lib/city-label';
import { useDateFormatter } from '@/lib/date-format';
import { langAttr } from '@/lib/translations';
import { UI } from '@/lib/constants';
import type { EventRowData } from '@/lib/services/event-row';

/** One event as a card in the desktop grid (K-91, K-103): the row's content stacked, the whole card opens the event. Phones keep `EventRow`. */
export default function HubEventCard({ event }: { event: EventRowData }) {
    const t = useTranslations('event');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const format = useDateFormatter();
    const start = new Date(event.startDate);
    const place = event.isOnline ? t('online') : cityLabel(tCities, event.city);

    return (
        <article data-ui={UI.eventRow} data-panel-origin={event.id} style={{ ['--c' as string]: event.category.color }} className="relative flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-card line hover:bg-tint">
            <time dateTime={start.toISOString()} className="text-meta tabular-nums text-foreground-muted">
                {format.dateTime(start, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
            </time>
            <Link
                href={`/${event.category.l1Slug}/group/${event.group.slug}/events/${event.slug}`}
                scroll={false}
                data-opens-panel
                lang={langAttr(event.titleLang, locale)}
                className="text-item text-foreground after:absolute after:inset-0"
            >
                {event.title}
            </Link>
            <p className="flex min-w-0 items-center gap-1.5 text-meta text-foreground-muted">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" />
                <Link href={`/${event.category.l1Slug}/group/${event.group.slug}`} className="relative z-10 min-w-0 truncate weight-medium text-foreground underline decoration-border underline-offset-2">{event.group.name}</Link>
                <span className="shrink-0">· {place}</span>
            </p>
            {event.excerpt && <p className="mt-1 line-clamp-3 text-meta text-foreground">{event.excerpt}</p>}
        </article>
    );
}
