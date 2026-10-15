import { plainExcerpt } from '@/lib/text-excerpt';
import type { EventPageData } from '@/lib/services/event-page';

const DESCRIPTION_MAX = 500;

/**
 * schema.org Event for search engines. Built only from `EventPageData`, so it carries exactly what this viewer may see: no
 * instructions, and the online link only when the page shows it. The description is plain text; `image` only when the event has its own.
 */
export function eventJsonLd(event: EventPageData, opts: { locale: string; l1Slug: string; cityName: string; appUrl: string }) {
    const link = event.location && /^https?:\/\//i.test(event.location.trim()) ? event.location.trim() : null;
    const description = plainExcerpt(event.description, DESCRIPTION_MAX);
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        ...(description && { description }),
        startDate: event.startDate.toISOString(),
        ...(event.endDate && { endDate: event.endDate.toISOString() }),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: event.isOnline ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
        location: event.isOnline
            ? { '@type': 'VirtualLocation', ...(link && { url: link }), name: link ? event.location : 'Online' }
            : {
                '@type': 'Place',
                name: event.location,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: event.location,
                    ...(opts.cityName && { addressLocality: opts.cityName })
                }
            },
        ...(event.image && { image: [event.image] }),
        organizer: {
            '@type': 'Organization',
            name: event.group.name,
            url: `${opts.appUrl}/${opts.locale}/${opts.l1Slug}/group/${event.group.slug}`
        }
    };
}
