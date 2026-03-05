import { GroupService } from '@/lib/services/group.service';
import { getGroupEvents } from '@/actions/event-actions';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import EventCard from '@/components/groups/EventCard';
import { getTranslations } from 'next-intl/server';
import { Calendar, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { clsx } from 'clsx';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) return {};

    return {
        title: `${group.name} | Events | Ejam kopā`,
    };
}

export default async function GroupEventsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const { tab } = await searchParams;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    const eventsData = await getGroupEvents(group.id);
    const t = await getTranslations('group');
    const accentColor = group.accentColor;
    const isOwnerOrAdmin = group.userRole === 'OWNER' || group.userRole === 'ADMIN';

    const currentTab = (tab === 'my-rsvps' && session) ? 'my-rsvps' : (tab === 'past' ? 'past' : 'upcoming');
    const now = new Date();

    const filteredEvents = eventsData.filter(event => {
        const startDate = new Date(event.startDate);
        if (currentTab === 'my-rsvps') {
            return event.isAttending;
        } else if (currentTab === 'past') {
            return startDate < now;
        } else {
            return startDate >= now;
        }
    });

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ '--accent': accentColor } as any}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                {/* Events Tab Menu */}
                <div className="flex items-center gap-6 border-b border-border overflow-x-auto no-scrollbar w-full sm:w-auto">
                    <Link
                        href={`/${l1Slug}/group/${groupSlug}/events?tab=upcoming` as any}
                        className={clsx(
                            "pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                            currentTab === 'upcoming'
                                ? "border-[var(--accent)] text-foreground"
                                : "border-transparent text-foreground-muted hover:text-foreground"
                        )}
                    >
                        {t('eventsTabUpcoming')}
                    </Link>
                    {session && (
                        <Link
                            href={`/${l1Slug}/group/${groupSlug}/events?tab=my-rsvps` as any}
                            className={clsx(
                                "pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                                currentTab === 'my-rsvps'
                                    ? "border-[var(--accent)] text-foreground"
                                    : "border-transparent text-foreground-muted hover:text-foreground"
                            )}
                        >
                            {t('eventsTabMyRsvps')}
                        </Link>
                    )}
                    <Link
                        href={`/${l1Slug}/group/${groupSlug}/events?tab=past` as any}
                        className={clsx(
                            "pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                            currentTab === 'past'
                                ? "border-[var(--accent)] text-foreground"
                                : "border-transparent text-foreground-muted hover:text-foreground"
                        )}
                    >
                        {t('eventsTabPast')}
                    </Link>
                </div>

                {isOwnerOrAdmin && (
                    <Link
                        href={`/${l1Slug}/group/${groupSlug}/create-event` as any}
                        className="group/cta flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all bg-foreground text-background hover:opacity-90 shadow-sm shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('createEvent')}
                    </Link>
                )}
            </div>

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={{
                                id: event.id,
                                title: event.title,
                                description: event.description,
                                startDate: event.startDate,
                                location: event.location,
                                isAttending: event.isAttending,
                                attendeeCount: event.attendeeCount,
                                attendeeList: (event as any).attendeeList,
                                // @ts-ignore
                                isRecurring: event.isRecurring,
                                // @ts-ignore
                                recurrencePattern: event.recurrencePattern,
                                bannerImage: (event as any).bannerImage,
                                instructions: (event as any).instructions,
                            }}
                            locale={locale}
                            accentColor={accentColor}
                            isMember={group.isMember}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-20 text-center bg-surface/30">
                    <div className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
                        <Calendar className="h-8 w-8 text-foreground-muted" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('noEvents')}</h3>
                    <p className="text-foreground-muted max-w-xs mx-auto mb-8">
                        {currentTab === 'upcoming'
                            ? "There are no upcoming events planned for this group."
                            : currentTab === 'past'
                                ? "There are no past events for this group."
                                : "You haven't RSVPed to any events in this group."}
                    </p>
                    {isOwnerOrAdmin && currentTab === 'upcoming' && (
                        <Link
                            href={`/${l1Slug}/group/${groupSlug}/create-event` as any}
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold bg-surface border border-border hover:bg-surface-elevated transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create the first event
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}
