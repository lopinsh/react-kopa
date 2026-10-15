import type { GroupCardData } from '@/lib/services/group-card';
import type { EventRowData } from '@/lib/services/event-row';
import type { CityOption } from '@/lib/services/city.service';

export interface SearchTheme {
    slug: string;
    title: string;
    color: string;
    count: number;
}

/** What `GET /api/search` answers (Date fields arrive as strings; `reviveSearchResults` turns them back). */
export interface SearchResults {
    word: string;
    theme: string | null;
    cities: string[];
    /** The chip row: the themes that match the word, or the busiest when the word is short. */
    themes: SearchTheme[];
    /** At most SEARCH_ROWS_MAX. */
    groups: GroupCardData[];
    /** At most SEARCH_ROWS_MAX, upcoming, public. */
    events: EventRowData[];
    total: { groups: number; events: number };
    /** Results outside the chosen places; 0 under Visur. */
    elsewhere: number;
    /** The Kur list: cities, groups per city, groups anywhere. */
    places: { cities: CityOption[]; byCity: Record<string, number>; anyPlace: number };
}

/** JSON carries dates as strings; the event rows need Date objects. */
export function reviveSearchResults(raw: SearchResults): SearchResults {
    return {
        ...raw,
        events: raw.events.map((e) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : null }))
    };
}
