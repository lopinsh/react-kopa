import { EventService } from '@/lib/services/event.service';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Clock,
    Info,
    Lock,
    UserCheck,
    CalendarCheck
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { clsx } from 'clsx';
import EventParticipation from '@/components/events/EventParticipation';
import EventOrganiserPanel from '@/components/events/EventOrganiserPanel';
import AddToCalendar from '@/components/events/AddToCalendar';
import ShareEventButton from '@/components/events/ShareEventButton';
import MembersOnlyNotice from '@/components/events/MembersOnlyNotice';
import EventManageActions from '@/components/events/EventManageActions';
import { EVENT_TIME_ZONE } from '@/lib/constants';
import { sanitizeRichText, jsonForScript } from '@/lib/sanitize';
import { isEventPast } from '@/lib/event-dates';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import { langAttr } from '@/lib/translations';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; l1Slug: string; groupSlug: string; eventSlug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, eventSlug } = await params;
    const session = await auth();
    const event = await EventService.getEventWithContext(eventSlug, groupSlug, locale, session?.user?.id);

    // No event means missing or members-only for this viewer: say nothing about it, and keep it out of search engines.
    return event ? { title: `${event.title} | ${event.group.name}` } : { robots: { index: false } };
}

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
        // A members-only event gets a notice instead of a 404; anything else does not exist for this viewer.
        const gate = await EventService.getMembersOnlyGate(eventSlug, groupSlug, userId);
        if (!gate) notFound();
        return (
            <MembersOnlyNotice
                groupName={gate.groupName}
                groupHref={`/${gate.l1Slug}/group/${gate.groupSlug}`}
                isLoggedIn={!!userId}
            />
        );
    }

    const t = await getTranslations('event');
    const formatter = await getFormatter();
    const group = event.group;

    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const ended = isEventPast(event);
    const timeZone = EVENT_TIME_ZONE;
    const timeFormat = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone } as const;

    const { goingCount, canManage, instructionsLocked, myStatus } = event.viewer;
    const isRequest = event.joinMode === 'REQUEST';
    const toPerson = (a: (typeof event.attendees)[number]) => ({ userId: a.userId, name: a.user.name, username: a.user.username });
    // Nothing to say when nobody went to a finished event.
    const peopleLine = [
        ended ? (goingCount > 0 ? t('wentCount', { count: goingCount }) : null) : isRequest ? t('approvedCount', { count: goingCount }) : t('goingCount', { count: goingCount }),
        !ended && event.maxParticipants ? t('aboutPeople', { count: event.maxParticipants }) : null
    ].filter(Boolean).join(' · ');
    const isOnlineLocation = !!event.location && event.location.includes('http');

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
        <div className="bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonForScript(jsonLd) }}
            />

            <main className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
                <Link
                    href={`/${l1Slug}/group/${group.slug}/events`}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground-muted hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('allEvents')}
                </Link>

                {ended && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm font-semibold text-foreground-muted">
                        <CalendarCheck className="h-4 w-4 shrink-0" />
                        {t('tookPlace')}
                    </div>
                )}

                {event.bannerImage && (
                    <div className="mb-6 h-40 w-full overflow-hidden rounded-3xl border border-border md:h-56">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={event.bannerImage} alt="" className={clsx('h-full w-full object-cover', ended && 'opacity-60 grayscale')} />
                    </div>
                )}

                {/* Title block */}
                <header className="mb-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-1', ended ? 'bg-surface-elevated text-foreground-muted' : 'bg-[var(--accent)] text-white')}>
                            <Clock className="h-3.5 w-3.5" />
                            {formatter.dateTime(startDate, { weekday: 'long', month: 'short', day: 'numeric', timeZone })}
                        </span>
                        {event.visibility === 'MEMBERS_ONLY' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2.5 py-1 text-foreground-muted">
                                <Lock className="h-3 w-3" />
                                {t('membersOnly')}
                            </span>
                        )}
                        {isRequest && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2.5 py-1 text-foreground-muted">
                                <UserCheck className="h-3 w-3" />
                                {t('badgeRequest')}
                            </span>
                        )}
                        {event.isFull && !ended && (
                            <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-white">{t('full')}</span>
                        )}
                    </div>
                    <h1 className={clsx('text-3xl font-black leading-tight tracking-tight md:text-4xl', ended ? 'text-foreground-muted' : 'text-foreground')} lang={langAttr(event.titleLang, locale)}>{event.title}</h1>
                    {langAttr(event.titleLang, locale) && <FallbackLangLabel lang={event.titleLang} />}
                    {peopleLine && (
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-muted">
                            <Users className="h-4 w-4" />
                            {peopleLine}
                        </p>
                    )}
                    {canManage && (
                        <EventManageActions
                            eventId={event.id}
                            locale={locale}
                            groupPath={`/${l1Slug}/group/${group.slug}`}
                            eventPath={`/${l1Slug}/group/${group.slug}/events/${event.slug}`}
                            canEdit={!ended}
                        />
                    )}
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
                    {/* On small screens participation comes first; organisers see the details first, then their panel */}
                    <aside className={canManage ? "order-2" : "order-1 lg:order-2"}>
                        <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
                            {!ended && !(isRequest && canManage) && (
                                <div className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
                                    <h2 className="text-lg font-black tracking-tight text-foreground">{t('areYouComing')}</h2>
                                    <EventParticipation
                                        eventId={event.id}
                                        joinMode={event.joinMode}
                                        isFull={event.isFull}
                                        myStatus={myStatus}
                                        locale={locale}
                                        requireSignIn={!userId}
                                    />
                                </div>
                            )}

                            {canManage && !ended && (
                                <EventOrganiserPanel
                                    eventId={event.id}
                                    joinMode={event.joinMode}
                                    isFull={event.isFull}
                                    locale={locale}
                                    going={event.attendees.filter(a => a.status === 'GOING').map(toPerson)}
                                    pending={event.attendees.filter(a => a.status === 'PENDING').map(toPerson)}
                                    waitlist={event.attendees.filter(a => a.status === 'WAITLISTED').map(toPerson)}
                                />
                            )}

                            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm">
                                {!ended && <AddToCalendar
                                    event={{
                                        title: event.title,
                                        description: event.description || '',
                                        location: event.location || '',
                                        startDate: event.startDate,
                                        endDate: event.endDate || undefined
                                    }}
                                />}
                                <ShareEventButton title={event.title} />
                            </div>
                        </div>
                    </aside>

                    <div className={canManage ? "order-1 space-y-6 lg:col-span-2" : "order-2 space-y-6 lg:order-1 lg:col-span-2"}>
                        {/* When and where */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                                <div className="shrink-0 rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-foreground-muted">{t('dateAndTime')}</p>
                                    <p className="text-sm font-bold leading-snug text-foreground">
                                        {formatter.dateTime(startDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone })}
                                        <br />
                                        {formatter.dateTime(startDate, timeFormat)}{endDate && ` – ${formatter.dateTime(endDate, timeFormat)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                                <div className="shrink-0 rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-foreground-muted">{t('location')}</p>
                                    <p className="truncate text-sm font-bold leading-snug text-foreground">{event.location || t('tba')}</p>
                                    {event.location && (
                                        <a
                                            href={isOnlineLocation ? event.location : `https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-block text-[10px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline"
                                        >
                                            {isOnlineLocation ? t('joinLink') : t('openInMaps')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {event.description && (
                            <section className="space-y-3 rounded-2xl border border-border bg-surface p-5 md:p-6">
                                <h2 className="flex flex-wrap items-center gap-2 text-lg font-black tracking-tight text-foreground">
                                    {t('aboutEvent')}
                                    {langAttr(event.descriptionLang, locale) && <FallbackLangLabel lang={event.descriptionLang} />}
                                </h2>
                                <div
                                    lang={langAttr(event.descriptionLang, locale)}
                                    className="prose prose-invert max-w-none leading-relaxed text-foreground-muted"
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.description) }}
                                />
                            </section>
                        )}

                        {/* Instructions are stripped server-side on Request-to-join events until approved */}
                        {instructionsLocked && (
                            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-sm text-foreground-muted">
                                <Lock className="h-5 w-5 shrink-0" />
                                {t('instructionsLocked')}
                            </div>
                        )}
                        {event.instructions && (
                            <section className="space-y-3 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5 md:p-6">
                                <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[var(--accent)]">
                                    <Info className="h-5 w-5" />
                                    {t('importantInfo')}
                                    {langAttr(event.instructionsLang, locale) && <FallbackLangLabel lang={event.instructionsLang} />}
                                </h2>
                                <div
                                    lang={langAttr(event.instructionsLang, locale)}
                                    className="prose prose-invert max-w-none leading-relaxed text-foreground-muted prose-a:text-[var(--accent)]"
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.instructions) }}
                                />
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
