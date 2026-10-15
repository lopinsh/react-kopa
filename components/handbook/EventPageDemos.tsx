import EventArticle from '@/components/events/page/EventArticle';
import EventOrganiserBox from '@/components/events/page/EventOrganiserBox';
import type { EventRowData } from '@/lib/services/event-row';
import type { EventPageData } from '@/lib/services/event-page';
import type { Face } from '@/lib/services/event-panel';

const FACES: Face[] = ['anna', 'janis', 'marta'].map((seed) => ({ id: seed, name: seed, image: `https://api.dicebear.com/10.x/clay/svg?seed=${seed}` }));
const PEOPLE = ['Anna', 'Jānis', 'Marta'].map((name, i) => ({ userId: `sample-${i}`, name, username: null }));

/**
 * The event page and its "Rīkotājiem" box with sample data: an open event with a picture and practical info, a request event whose
 * practical info is still locked (as a visitor sees it), and the team's view of a request event.
 */
export default function EventPageDemos({ row, text }: { row: EventRowData; text: string }) {
    const base: EventPageData = {
        id: 'sample-event', slug: row.slug, title: row.title, titleLang: row.titleLang,
        description: `<p>${text}</p>`, descriptionLang: 'lv', instructions: '<p>Tiekamies pie ieejas.</p>', instructionsLang: 'lv', instructionsLocked: false,
        startDate: row.startDate, endDate: new Date(row.startDate.getTime() + 2 * 3600_000), timing: 'upcoming',
        city: row.city, isOnline: false, location: 'Rožu iela 5', onlineLinkLocked: false, image: 'https://picsum.photos/seed/event-page/1200/675',
        membersOnly: false, joinMode: 'OPEN', isFull: false, maxParticipants: 20,
        category: row.category, subCategories: row.subCategories, group: { ...row.group, city: row.city },
        join: { eventId: 'sample-event', mode: 'OPEN', isFull: false, ended: false, myStatus: null, canManage: false },
        going: { count: 12, viewerGoing: false, people: FACES }, organiser: null,
    };
    const request: EventPageData = {
        ...base, image: null, joinMode: 'REQUEST', instructions: null, instructionsLocked: true, membersOnly: true,
        join: { ...base.join, mode: 'REQUEST' }, going: { count: 12, viewerGoing: false, people: null },
    };
    const team: EventPageData = { ...request, instructions: '<p>Tiekamies pie ieejas.</p>', instructionsLocked: false, join: { ...request.join, canManage: true } };
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <EventArticle event={base} />
            <EventArticle event={request} />
            <EventArticle
                event={team}
                organiser={<EventOrganiserBox event={team} lists={{ going: PEOPLE.slice(0, 2), pending: PEOPLE.slice(2), waitlist: [] }} locale="lv" groupPath="/sample/group/sample" eventPath="/sample/group/sample/events/sample" />}
            />
        </div>
    );
}
