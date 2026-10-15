import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { EventService } from '@/lib/services/event.service';
import EventArticle from '@/components/events/page/EventArticle';
import EventOrganiserPanel from '@/components/events/EventOrganiserPanel';
import EventManageActions from '@/components/events/EventManageActions';
import MembersOnlyNotice from '@/components/events/MembersOnlyNotice';
import { eventJsonLd } from '@/lib/event-json-ld';
import { cityLabel } from '@/lib/city-label';
import { jsonForScript } from '@/lib/sanitize';

type Params = { locale: string; l1Slug: string; groupSlug: string; eventSlug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, l1Slug, groupSlug, eventSlug } = await params;
    const session = await auth();
    const event = await EventService.getEventPage(eventSlug, groupSlug, locale, session?.user?.id, l1Slug);

    // No event means missing or members-only for this viewer: say nothing about it, and keep it out of search engines.
    return event ? { title: `${event.title} | ${event.group.name}` } : { robots: { index: false } };
}

/** The event's own page (AR-59): everything comes from `getEventPage`, already cut to what this viewer may see. */
export default async function EventPage({ params }: { params: Promise<Params> }) {
    const { locale, l1Slug, groupSlug, eventSlug } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    const event = await EventService.getEventPage(eventSlug, groupSlug, locale, userId, l1Slug);

    if (!event) {
        // A members-only event gets a notice instead of a 404; anything else does not exist for this viewer.
        const gate = await EventService.getMembersOnlyGate(eventSlug, groupSlug, userId, l1Slug);
        if (!gate) notFound();
        return <MembersOnlyNotice />;
    }

    const tCities = await getTranslations('cities');
    const jsonLd = eventJsonLd(event, { locale, l1Slug, cityName: cityLabel(tCities, event.city), appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '' });
    const groupPath = `/${l1Slug}/group/${event.group.slug}`;
    const team = event.organiser;

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonForScript(jsonLd) }} />
            <EventArticle
                event={event}
                organiser={team && (
                    <div className="mt-3.5 grid gap-3">
                        <EventManageActions eventId={event.id} locale={locale} groupPath={groupPath} eventPath={`${groupPath}/events/${event.slug}`} canEdit={event.timing !== 'past'} />
                        {event.timing !== 'past' && <EventOrganiserPanel eventId={event.id} joinMode={event.joinMode} isFull={event.isFull} locale={locale} going={team.going} pending={team.pending} waitlist={team.waitlist} />}
                    </div>
                )}
            />
        </>
    );
}
