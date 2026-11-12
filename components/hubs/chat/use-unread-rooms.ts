'use client';

import { useEffect, useState } from 'react';
import type { MatrixClient, Room } from 'matrix-js-sdk';
import type { RoomRef } from '@/lib/services/chat-context.service';
import { connectChat } from './matrix-client';

/** The room alias the site gave a room (K5-01): ids, never slugs. */
const aliasOf = (r: RoomRef): string | null => (r.categoryId ? (r.cityId ? `ejk_room_${r.categoryId}_${r.cityId}` : `ejk_room_${r.categoryId}`) : null);

/** The newest text line of a room that someone else wrote and the person has not read (K-145: SDK read receipts). */
function hasUnread(room: Room, mxid: string): boolean {
    const events = room.getLiveTimeline().getEvents();
    for (let i = events.length - 1; i >= 0; i--) {
        const e = events[i];
        if (e.getType() !== 'm.room.message' || e.isRedacted()) continue;
        const id = e.getId();
        return !!id && e.getSender() !== mxid && !room.hasUserReadEvent(mxid, id);
    }
    return false;
}

/**
 * Keys of the rooms in `family` with lines the person has not read (K5-26), for the tab and switcher dots. Reads the singleton client's sync, so no request of its own;
 * the room on screen is never marked (it is read when shown). `[]` until the client is ready or when chat is off.
 */
export function useUnreadRooms(userId: string | null, family: RoomRef[], currentKey: string, enabled: boolean): Set<string> {
    const [unread, setUnread] = useState<Set<string>>(new Set());
    const sig = family.map((r) => `${r.key}=${aliasOf(r) ?? ''}`).join('|');

    useEffect(() => {
        if (!userId || !enabled) return;
        let gone = false;
        let off: (() => void) | undefined;
        void connectChat(userId).then(async (client: MatrixClient) => {
            const sdk = await import('matrix-js-sdk');
            if (gone) return;
            const byAlias = new Map(sig.split('|').flatMap((p) => { const [k, a] = p.split('='); return a ? [[a, k] as const] : []; }));
            const mxid = client.getUserId() ?? '';
            const scan = () => {
                const next = new Set<string>();
                for (const room of client.getRooms()) {
                    if (room.getMyMembership() !== 'join') continue;
                    const alias = [room.getCanonicalAlias(), ...room.getAltAliases()].find((a) => a && byAlias.has(/^#([^:]+):/.exec(a)?.[1] ?? ''));
                    const key = alias ? byAlias.get(/^#([^:]+):/.exec(alias)?.[1] ?? '') : undefined;
                    if (key && key !== currentKey && hasUnread(room, mxid)) next.add(key);
                }
                if (!gone) setUnread(next);
            };
            scan();
            client.on(sdk.RoomEvent.Timeline, scan);
            client.on(sdk.RoomEvent.Receipt, scan);
            off = () => { client.off(sdk.RoomEvent.Timeline, scan); client.off(sdk.RoomEvent.Receipt, scan); };
        }).catch(() => undefined);
        return () => { gone = true; off?.(); };
    }, [userId, enabled, sig, currentKey]);

    return userId && enabled ? unread : new Set();
}
