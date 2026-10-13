import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { capitalizeFirst, EVENT_DAY_TIME, useDateFormatter } from '@/lib/date-format';
import { langAttr } from '@/lib/translations';
import type { NextEventView } from '@/lib/services/event.service';

/** The next meeting as one row: date and time, the category dot and the title; the first words of the text under it. No "Eju", no group line (R5b swaps in the shared event row). */
export default function NextMeetingRow({ event, href }: { event: Pick<NextEventView, 'title' | 'titleLang' | 'startDate' | 'excerpt'>; href: string }) {
    const locale = useLocale();
    const formatter = useDateFormatter();
    const when = capitalizeFirst(formatter.dateTime(new Date(event.startDate), EVENT_DAY_TIME));
    return (
        <Link href={href} className="grid gap-0.5 rounded-xl py-2.5 hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <span className="flex items-baseline gap-2 text-sm">
                <span className="tabular-nums text-foreground-muted">{when}</span>
                <span aria-hidden className="size-2 shrink-0 translate-y-px rounded-full bg-[var(--accent)]" />
                <span lang={langAttr(event.titleLang, locale)} className="min-w-0 font-semibold">{event.title}</span>
            </span>
            {event.excerpt && <span className="truncate text-[13px] text-foreground-muted">{event.excerpt}</span>}
        </Link>
    );
}
