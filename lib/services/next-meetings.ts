import { EventService } from './event.service';

/** Group id → start of its next visible meeting, for the groups that show it (those without a "Ko meklējam?" line). */
export async function nextMeetingDates(groups: Array<{ id: string; lookingFor: string | null }>, locale: string, viewerId?: string): Promise<Record<string, Date>> {
    const next = await EventService.getNextVisibleEvents(groups.filter((g) => !g.lookingFor).map((g) => g.id), locale, viewerId);
    return Object.fromEntries([...next].map(([id, e]) => [id, e.startDate]));
}
