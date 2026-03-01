import { EventService } from '@/lib/services/event.service';
import { GroupService } from '@/lib/services/group.service';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
    Calendar,
    MapPin,
    Users,
    Share2,
    ArrowLeft,
    MoreHorizontal,
    Clock,
    Info,
    CheckCircle2,
    Star,
    ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { format } from 'date-fns';
import RSVPButtons from '@/components/events/RSVPButtons';
import AddToCalendar from '@/components/events/AddToCalendar';

export default async function EventPage({
    params,
}: {
    params: Promise<{ locale: string; l1Slug: string; groupSlug: string; eventSlug: string }>;
}) {
    const { locale, l1Slug, groupSlug, eventSlug } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const event = await EventService.getEventWithContext(eventSlug, groupSlug, locale, userId);

    if (!event) {
        notFound();
    }

    const t = await getTranslations('event');
    const group = event.group;

    const durationMs = event.endDate ? new Date(event.endDate).getTime() - new Date(event.startDate).getTime() : 0;
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));
    const durationText = durationHours > 0 ? `${durationHours}h` : '';

    const accentColor = event.group?.accentColor || '#6366f1';
    const hasEnded = event.endDate ? new Date(event.endDate) < new Date() : new Date(event.startDate) < new Date();

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    const isOwner = event.creatorId === userId;
    const userAttendance = event.attendees.find(a => a.userId === userId);
    const attendanceStatus = userAttendance?.status || 'NONE';

    // JSON-LD for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        ...(event.endDate && { endDate: event.endDate.toISOString() }),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: event.location?.toLowerCase().includes('http')
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': event.location?.toLowerCase().includes('http') ? 'VirtualLocation' : 'Place',
            name: event.location,
            ...(event.location?.toLowerCase().includes('http') ? { url: event.location } : { address: event.location })
        },
        image: [event.bannerImage],
        organizer: {
            '@type': 'Organization',
            name: group.name,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/${l1Slug}/group/${group.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-background" style={{ '--accent': accentColor } as any}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Sticky Header for Mobile */}
            <div className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl lg:hidden">
                <div className="flex h-16 items-center justify-between px-4">
                    <Link
                        href={`/${l1Slug}/group/${group.slug}`}
                        className="p-2 -ml-2 text-foreground-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <span className="font-bold truncate max-w-[200px]">{event.title}</span>
                    <button className="p-2 -mr-2 text-foreground-muted hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Banner Hero */}
            <div className="relative h-[40vh] min-h-[400px] w-full overflow-hidden">
                {event.bannerImage ? (
                    <img
                        src={event.bannerImage || undefined}
                        alt={event.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-surface-elevated flex items-center justify-center">
                        <Calendar className="h-20 w-20 text-white/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Hero Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
                    <div className="container mx-auto max-w-5xl">
                        <Link
                            href={`/${l1Slug}/group/${group.slug}`}
                            className="hidden lg:flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {group.name}
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div className="space-y-4 max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                    <Clock className="h-3 w-3" />
                                    {format(startDate, 'EEEE, MMM d')}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight text-shadow-xl">
                                    {event.title}
                                </h1>
                            </div>

                            {/* RSVP Summary for Desktop */}
                            <div className="hidden lg:flex flex-col items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 min-w-[160px]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Capacity</span>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-[var(--accent)]" />
                                    <span className="text-2xl font-black text-white">
                                        {event._count.attendees}{event.maxParticipants ? `/${event.maxParticipants}` : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-5xl px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4 shadow-sm">
                                <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">When</p>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-foreground-muted">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground">
                                        {event._count?.attendees || 0} spot{event._count?.attendees === 1 ? '' : 's'} taken
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4 shadow-sm">
                                <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Where</p>
                                    <p className="text-sm font-bold text-foreground mt-1 truncate">
                                        {event.location}
                                    </p>
                                    <button className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mt-1 hover:underline">
                                        Open in Maps
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* About the Event */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-foreground opacity-90">
                                <span className="h-px w-8 bg-[var(--accent)]" />
                                Details
                            </div>
                            <div
                                className="prose prose-invert max-w-none text-foreground-muted leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: event.description || '' }}
                            />
                        </section>

                        {/* Special Instructions */}
                        {event.instructions && (
                            <section className="rounded-3xl bg-surface-elevated/50 border border-border p-8 space-y-4">
                                <div className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                                    <Info className="h-5 w-5 text-[var(--accent)]" />
                                    Important Info
                                </div>
                                <div
                                    className="text-sm text-foreground-muted leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: event.instructions }}
                                />
                            </section>
                        )}
                    </div>

                    {/* Right Column: Sidebar Actions */}
                    <aside className="space-y-8">
                        {/* RSVP Card */}
                        <div className="sticky top-[calc(var(--header-height)+2rem)] space-y-6">
                            <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-foreground">Are you coming?</h3>
                                    <p className="text-sm text-foreground-muted">Join the community at this event.</p>
                                </div>

                                <RSVPButtons
                                    eventId={event.id}
                                    initialStatus={attendanceStatus}
                                    accentColor={accentColor}
                                    locale={locale}
                                />

                                <div className="pt-2 flex flex-col gap-4">
                                    <AddToCalendar
                                        event={{
                                            title: event.title,
                                            description: event.description || '',
                                            location: event.location || '',
                                            startDate: event.startDate,
                                            endDate: event.endDate || undefined
                                        }}
                                        accentColor={accentColor}
                                    />
                                    <button className="flex w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-foreground transition-colors">
                                        <Share2 className="h-3 w-3" />
                                        Share Event
                                    </button>
                                </div>
                            </div>

                            {/* Organizer Info */}
                            <div className="rounded-3xl border border-border bg-white/[0.02] p-6 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Organizer</p>
                                <Link
                                    href={`/${l1Slug}/group/${group.slug}`}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-surface-elevated flex items-center justify-center">
                                        {group.bannerImage ? (
                                            <img src={group.bannerImage || undefined} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Users className="h-5 w-5 text-foreground-muted/40" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground group-hover:text-[var(--accent)] transition-colors truncate">
                                            {group.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                                            Visit Community
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
