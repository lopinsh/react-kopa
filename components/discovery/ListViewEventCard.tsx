import Link from 'next/link';
import { Users, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    event: {
        id: string;
        title: string;
        slug: string;
        startDate: Date;
        location: string | null;
        group: {
            name: string;
            city: string | null;
        };
        _count: {
            attendees: number;
        };
    };
    locale: string;
    l1Slug: string;
    groupSlug: string;
    accentColor?: string;
};

export default function ListViewEventCard({ event, locale, l1Slug, groupSlug, accentColor = '#6366f1' }: Props) {
    const startDate = new Date(event.startDate);

    return (
        <Link
            href={`/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
            className="group relative flex h-14 items-center overflow-hidden rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-[var(--accent)] hover:shadow-md soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            {/* Date Box */}
            <div className="mr-4 flex flex-col items-center justify-center shrink-0 w-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground-muted">{format(startDate, 'MMM')}</span>
                <span className="text-lg font-black leading-none text-foreground">{format(startDate, 'd')}</span>
            </div>

            {/* Title & Group Line */}
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <h3 className="truncate text-base font-bold text-foreground group-hover:text-[var(--accent)]">
                    {event.title}
                </h3>
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground-muted shadow-sm">
                        {event.group.name}
                    </span>
                </div>
            </div>

            {/* Metadata (Right aligned) */}
            <div className="ml-4 flex shrink-0 items-center justify-end gap-4 text-xs font-semibold text-foreground-muted">
                <div className="hidden items-center gap-1.5 sm:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(startDate, 'HH:mm')}
                </div>
                <div className="hidden items-center gap-1 md:flex max-w-[120px] truncate">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location || event.group.city}
                </div>
                <div className="flex items-center gap-1.5 min-w-[3.5rem] justify-end font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    {event._count.attendees}
                </div>
            </div>
        </Link>
    );
}
