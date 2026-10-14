import { GroupService } from '@/lib/services/group.service';
import { EventService } from '@/lib/services/event.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import EventDayList from '@/components/events/EventDayList';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { Calendar, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import GroupPartTabs from '@/components/groups/frame/GroupPartTabs';
import type { Metadata } from 'next';
import { dayInZone, zonedDayStart } from '@/lib/discovery-dates';
import { groupByDay } from '@/lib/event-days';
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

    // Gaidāmie and Pagājušie only; any other value (an old link to "Mani pasākumi") shows Gaidāmie.
    const currentTab = tab === 'past' ? 'past' : 'upcoming';
    const [rows, zone, t, tFrame, tCommon] = await Promise.all([
        EventService.getGroupEventRows(group.id, locale, session?.user?.id, currentTab),
        getTimeZone(),
        getTranslations('group'), getTranslations('group.frame'), getTranslations('common')
    ]);
    const isOwnerOrAdmin = group.user.isAdmin;
    const base = `/${l1Slug}/group/${groupSlug}`;

    const today = dayInZone(new Date(), zone);
    const days = groupByDay(rows, currentTab === 'past' ? new Date(0) : zonedDayStart(today, zone), zone);

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
            {rows.length > 0 ? (
                <EventDayList days={days} today={today} showGroup={false} showCity />
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
