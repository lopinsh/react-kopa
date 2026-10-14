import { Check } from 'lucide-react';
import { useLocale, useTimeZone, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Badge from '@/components/ui/Badge';
import { cityLabel } from '@/lib/city-label';
import { useDateFormatter } from '@/lib/date-format';
import { dayInZone, type DayKey } from '@/lib/discovery-dates';
import { langAttr } from '@/lib/translations';
import type { EventRowData } from '@/lib/services/event-row';
import { UI } from '@/lib/constants';

type Props = {
    event: EventRowData;
    /** Line two (the group, its category and sub-categories); left out on a group's own pages. */
    showGroup: boolean;
    /** The city at the right of line one; always shown for online events. */
    showCity: boolean;
    /** The day this row sits under, to say "kopš 12. okt." for an event that started earlier. */
    headingDay: DayKey;
};

/** The one event row (AR-54): time, dot, name, city; the viewer's tag under the time; the group line; the first words of the description. */
export default function EventRow({ event, showGroup, showCity, headingDay }: Props) {
    const t = useTranslations('event');
    const tCommon = useTranslations('common.tag');
    const tCities = useTranslations('cities');
    const locale = useLocale();
    const zone = useTimeZone() ?? 'UTC';
    const format = useDateFormatter();
    const start = new Date(event.startDate);
    const since = dayInZone(start, zone) < headingDay ? t('continuesFrom', { date: format.dateTime(start, { day: 'numeric', month: 'short' }) }) : null;
    const place = event.isOnline ? t('online') : showCity ? cityLabel(tCities, event.city) : '';
    const lineTwo = showGroup ? 'row-start-2' : 'hidden';

    return (
        <article
            data-ui={UI.eventRow}
            style={{ ['--c' as string]: event.category.color }}
            className="relative grid grid-cols-[2.75rem_0.5rem_minmax(0,1fr)_auto] items-center gap-x-2 break-inside-avoid rounded-lg border-b border-border px-1.5 py-1.5 last:border-b-0 hover:bg-tint"
        >
            <time dateTime={start.toISOString()} className="text-[13px] tabular-nums text-foreground-muted">
                {format.dateTime(start, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
            </time>
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--c)]" />
            <Link
                href={`/${event.category.l1Slug}/group/${event.group.slug}/events/${event.slug}`}
                lang={langAttr(event.titleLang, locale)}
                className="truncate font-semibold text-foreground after:absolute after:inset-0"
            >
                {event.title}
            </Link>
            <span className="whitespace-nowrap text-[13px] text-foreground-muted">{[place, since].filter(Boolean).join(' · ')}</span>
            {event.tag && (
                <span className="col-start-1 row-start-2 -ml-2 self-start pt-0.5">
                    {event.tag === 'going'
                        ? <Badge tone="tag"><Check aria-hidden="true" />{tCommon('going')}</Badge>
                        : <Badge tone="outline">{tCommon('pending')}</Badge>}
                </span>
            )}
            <p className={`col-span-2 col-start-3 flex min-w-0 text-xs text-foreground-muted ${lineTwo}`}>
                <Link href={`/${event.category.l1Slug}/group/${event.group.slug}`} className="relative z-10 min-w-0 shrink truncate font-medium text-foreground underline decoration-border underline-offset-2">{event.group.name}</Link>
                <span className="min-w-0 shrink-[4] truncate whitespace-pre"> · {event.category.l1Title}</span>
                {event.subCategories.length > 0 && <span className="min-w-0 shrink-[8] truncate whitespace-pre"> · {event.subCategories.join(', ')}</span>}
            </p>
            {event.excerpt && (
                <p className={`col-span-2 col-start-3 min-w-0 truncate text-[13px] text-foreground-muted ${showGroup ? 'row-start-3' : 'row-start-2'}`}>{event.excerpt}</p>
            )}
        </article>
    );
}
