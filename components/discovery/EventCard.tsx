import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { format } from 'date-fns';

type Props = {
    event: {
        id: string;
        title: string;
        slug: string;
        startDate: Date;
        location: string | null;
        bannerImage: string | null;
        group: {
            name: string;
            city: string | null;
            bannerImage: string | null;
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

export default function EventCard({ event, locale, l1Slug, groupSlug, accentColor = '#6366f1' }: Props) {
    const startDate = new Date(event.startDate);

    return (
        <Link
            href={`/${locale}/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-surface transition-all hover:-translate-y-1 hover:border-border-hover hover:shadow-2xl"
        >
            {/* Banner Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {event.bannerImage || event.group.bannerImage ? (
                    <img
                        src={event.bannerImage || event.group.bannerImage || undefined}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-elevated">
                        <Calendar className="h-10 w-10 text-foreground-muted/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                {/* Date Badge Overlay */}
                <div className="absolute top-4 left-4 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{format(startDate, 'MMM')}</span>
                    <span className="text-xl font-black leading-none">{format(startDate, 'd')}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent)]" style={{ backgroundColor: accentColor }} />
                        {event.group.name}
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-[var(--accent)] transition-colors line-clamp-2" style={{ '--accent': accentColor } as any}>
                        {event.title}
                    </h3>
                </div>

                <div className="mt-auto space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-foreground-muted">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[120px]">{event.location || event.group.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{event._count.attendees} going</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                            {format(startDate, 'HH:mm')}
                        </div>
                        <div className="rounded-full bg-surface-elevated p-2 text-foreground transition-all group-hover:bg-[var(--accent)] group-hover:text-white" style={{ '--accent': accentColor } as any}>
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
