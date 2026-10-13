import { GroupService } from '@/lib/services/group.service';
import { EventService } from '@/lib/services/event.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import EventRow from '@/components/groups/EventRow';
import { getTranslations } from 'next-intl/server';
import { Calendar, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import GroupPartTabs from '@/components/groups/frame/GroupPartTabs';
import type { Metadata } from 'next';
import { isEventPast } from '@/lib/event-dates';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/Button';

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

    const eventsData = await EventService.getGroupEvents(group.id, locale, session?.user?.id);
    const [t, tFrame, tCommon] = await Promise.all([getTranslations('group'), getTranslations('group.frame'), getTranslations('common')]);
    const isOwnerOrAdmin = group.user.isAdmin;
    const base = `/${l1Slug}/group/${groupSlug}`;

    // Gaidāmie and Pagājušie only; any other value (an old link to "Mani pasākumi") shows Gaidāmie.
    const currentTab = tab === 'past' ? 'past' : 'upcoming';
    const filteredEvents = eventsData.filter((event) => isEventPast(event) === (currentTab === 'past'));

    return (
        <>
            <GroupPartTabs
                title={t('pages.events')}
                label={tFrame('partsLabel')}
                active={currentTab}
                items={[
                    { key: 'upcoming', label: tCommon('eventsTabUpcoming'), href: `${base}/events` },
                    { key: 'past', label: tCommon('eventsTabPast'), href: `${base}/events?tab=past` },
                ]}
                action={isOwnerOrAdmin ? (
                    <Link href={`${base}/create-event`} className={buttonClass('secondary', undefined, 'sm')}>{t('createEvent')}</Link>
                ) : undefined}
            />
            {filteredEvents.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {filteredEvents.map((event) => (
                        <EventRow
                            key={event.id}
                            event={{
                                id: event.id,
                                title: event.title,
                                titleLang: event.titleLang,
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
                <EmptyState
                    icon={Calendar}
                    title={t('noEvents')}
                    description={currentTab === 'upcoming' ? t('noUpcomingEvents') : t('noPastEvents')}
                    action={isOwnerOrAdmin && currentTab === 'upcoming' ? (
                        <Link href={`/${l1Slug}/group/${groupSlug}/create-event`} className={buttonClass('secondary')}>
                            <Plus aria-hidden="true" />
                            {t('createFirstEvent')}
                        </Link>
                    ) : undefined}
                />
            )}
        </>
    );
}
