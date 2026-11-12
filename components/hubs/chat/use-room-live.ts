'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { chatNames, openRoom } from '@/actions/chat-actions';
import type { HubKey } from '@/lib/services/chat-access.service';
import { connectChat } from './matrix-client';
import type { ChatEntry } from './chat-lines';

export type LiveStatus = 'connecting' | 'ready' | 'unavailable';
type Names = Record<string, { name: string; mod: boolean }>;

const FIRST_SCREEN = 50;
const MORE = 30;
const SITE_SENDER = /^@u_([a-z0-9]+):/;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** The room appears in the client after the join reaches its sync; wait for it (K-33a). */
async function roomOf(client: MatrixClient, roomId: string): Promise<Room> {
    for (let i = 0; i < 60; i++) {
        const room = client.getRoom(roomId);
        if (room?.getMyMembership() === 'join') return room;
        await wait(250);
    }
    throw new Error('CHAT_UNAVAILABLE');
}

function isLine(e: MatrixEvent): boolean {
    const c = e.getContent();
    return e.getType() === 'm.room.message' && c.msgtype === 'm.text' && typeof c.body === 'string' && !e.isRedacted();
}

/**
 * The signed-in room (K5-11): connects the singleton client, joins and waits for the room, then follows its timeline. Lines are `m.room.message` text only,
 * names come from the site (`chatNames`), never from the SDK (F5). `hubKey` is the room's hub (stable per page).
 */
export function useRoomLive(userId: string, hubKey: HubKey) {
    const [status, setStatus] = useState<LiveStatus>('connecting');
    const [events, setEvents] = useState<MatrixEvent[]>([]);
    const [names, setNames] = useState<Names>({});
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const live = useRef<{ client: MatrixClient; room: Room } | null>(null);
    const asked = useRef(new Set<string>());
    const slug = hubKey.hubSlug;
    const city = hubKey.city;

    useEffect(() => {
        let gone = false;
        let off: (() => void) | undefined;
        (async () => {
            const sdk = await import('matrix-js-sdk');
            const client = await connectChat(userId);
            const opened = await openRoom({ hubKey: city ? { hubSlug: slug, city } : { hubSlug: slug } });
            if (!opened.success || !opened.data) throw new Error(opened.success ? 'CHAT_UNAVAILABLE' : opened.error);
            const room = await roomOf(client, opened.data.roomId);
            if (gone) return;
            live.current = { client, room };
            const read = () => {
                const timeline = room.getLiveTimeline();
                setEvents(timeline.getEvents().filter(isLine));
                setHasMore(!!timeline.getPaginationToken(sdk.Direction.Backward));
            };
            const onTimeline = (_e: MatrixEvent, r: Room | undefined) => { if (r?.roomId === room.roomId) read(); };
            room.on(sdk.RoomEvent.Timeline, onTimeline);
            room.on(sdk.RoomEvent.LocalEchoUpdated, read);
            room.on(sdk.RoomEvent.Redaction, read);
            off = () => { room.off(sdk.RoomEvent.Timeline, onTimeline); room.off(sdk.RoomEvent.LocalEchoUpdated, read); room.off(sdk.RoomEvent.Redaction, read); };
            read();
            setStatus('ready');
            if (room.getLiveTimeline().getEvents().filter(isLine).length < FIRST_SCREEN && room.getLiveTimeline().getPaginationToken(sdk.Direction.Backward)) {
                await client.scrollback(room, FIRST_SCREEN).catch(() => room);
                if (!gone) read();
            }
        })().catch(() => { if (!gone) setStatus('unavailable'); });
        return () => { gone = true; off?.(); live.current = null; };
    }, [userId, slug, city]);

    // Names for senders not asked about yet.
    useEffect(() => {
        const ids = [...new Set(events.map((e) => SITE_SENDER.exec(e.getSender() ?? '')?.[1]).filter((x): x is string => !!x))].filter((id) => !asked.current.has(id));
        if (ids.length === 0) return;
        ids.forEach((id) => asked.current.add(id));
        void chatNames({ ids }).then((res) => { if (res.success && res.data) setNames((n) => ({ ...n, ...res.data })); });
    }, [events]);

    const send = useCallback(async (text: string): Promise<boolean> => {
        const l = live.current;
        if (!l) return false;
        try {
            await l.client.sendTextMessage(l.room.roomId, text);
            return true;
        } catch {
            return false;
        }
    }, []);

    const loadMore = useCallback(async () => {
        const l = live.current;
        if (!l || loadingMore) return;
        setLoadingMore(true);
        try {
            await l.client.scrollback(l.room, MORE);
            const sdk = await import('matrix-js-sdk');
            const timeline = l.room.getLiveTimeline();
            setEvents(timeline.getEvents().filter(isLine));
            setHasMore(!!timeline.getPaginationToken(sdk.Direction.Backward));
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore]);

    const entries: ChatEntry[] = events.map((e) => {
        const id = SITE_SENDER.exec(e.getSender() ?? '')?.[1] ?? e.getSender() ?? '';
        return { id: e.getId() ?? e.getTxnId() ?? `${e.getTs()}`, sender: id, name: names[id]?.name || null, mod: !!names[id]?.mod, own: id === userId, ts: e.getTs(), body: String(e.getContent().body) };
    });
    return { status, entries, send, loadMore, hasMore, loadingMore };
}
