import { GroupService } from '@/lib/services/group.service';
import { getGroupEvents } from '@/actions/event-actions';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import EventRow from '@/components/groups/EventRow';
import { getTranslations } from 'next-intl/server';
import { Calendar, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Metadata } from 'next';
import { isEventPast } from '@/lib/event-dates';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    const tCommon = await getTranslations({ locale, namespace: 'common' });

    if (!group) return {};

    return {
        title: `${group.name} | ${tCommon('eventsTitle')}`,
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
    const isOwnerOrAdmin = group.user.isAdmin;

    const currentTab = (tab === 'my-rsvps' && session) ? 'my-rsvps' : (tab === 'past' ? 'past' : 'upcoming');
    const filteredEvents = eventsData.filter(event => {
        const past = isEventPast(event);
        if (currentTab === 'my-rsvps') {
            // Going, waiting for approval or on the waitlist
            return !past && !!event.viewer.myStatus && event.viewer.myStatus !== 'DECLINED';
        } else if (currentTab === 'past') {
            return past;
        } else {
            return !past;
        }
    });

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl mx-auto px-4 md:px-8 py-6">
            {isOwnerOrAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4">
                    <Link
                        href={`/${l1Slug}/group/${groupSlug}/create-event`}
                        className="group/cta flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all bg-[var(--accent)] text-white hover:opacity-90 shadow-sm shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('createEvent')}
                    </Link>
                </div>
            )}

            {filteredEvents.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {filteredEvents.map((event) => (
                        <EventRow
                            key={event.id}
                            event={{
                                id: event.id,
                                title: event.title,
                                startDate: event.startDate,
                                endDate: event.endDate,
                                location: event.location,
                                maxParticipants: event.maxParticipants,
                                isMembersOnly: event.visibility === 'MEMBERS_ONLY',
                                joinMode: event.joinMode,
                                isFull: event.isFull,
                                goingCount: event.viewer.goingCount,
                                myStatus: event.viewer.myStatus,
                                canManage: event.viewer.canManage,
                                pendingCount: event.viewer.pendingCount,
                            }}
                            locale={locale}
                            href={`/${locale}/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
                            requireSignIn={!session?.user?.id}
                            isPast={isEventPast(event)}
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
                            ? t('noUpcomingEvents')
                            : currentTab === 'past'
                                ? t('noPastEvents')
                                : t('noRsvps')}
                    </p>
                    {isOwnerOrAdmin && currentTab === 'upcoming' && (
                        <Link
                            href={`/${l1Slug}/group/${groupSlug}/create-event`}
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold bg-surface border border-border hover:bg-surface-elevated transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {t('createFirstEvent')}
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}
