import type { Room } from 'matrix-js-sdk';

export interface RoomLine { id: string; ts: number; name: string; body: string }

/** The last 30 text lines of a room's live timeline, oldest first (K-81 order). */
export function roomLines(room: Room | null): RoomLine[] {
    if (!room) return [];
    return room.getLiveTimeline().getEvents()
        .filter((e) => e.getType() === 'm.room.message' && typeof e.getContent().body === 'string')
        .slice(-30)
        .map((e) => ({ id: e.getId() ?? `${e.getTs()}`, ts: e.getTs(), name: e.sender?.name ?? e.getSender() ?? '', body: String(e.getContent().body) }));
}
