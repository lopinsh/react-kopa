'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import type { MatrixClient } from 'matrix-js-sdk';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MatrixSession } from '@/lib/services/matrix.service';
import { roomLines, type RoomLine } from './room-lines';

/** F5: the signed-in view. matrix-js-sdk is loaded here only (dynamic import), no crypto (public rooms are plain). */
export default function MatrixLiveRoom({ session, roomId }: { session: MatrixSession; roomId: string }) {
    const t = useTranslations('admin.matrixTrial');
    const format = useFormatter();
    const [lines, setLines] = useState<RoomLine[]>([]);
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const clientRef = useRef<MatrixClient | null>(null);

    useEffect(() => {
        let stopped = false;
        let client: MatrixClient | null = null;
        void (async () => {
            const sdk = await import('matrix-js-sdk');
            if (stopped) return;
            client = sdk.createClient({ baseUrl: session.homeserverUrl, accessToken: session.accessToken, userId: session.userId, deviceId: session.deviceId });
            clientRef.current = client;
            const refresh = () => { if (client) setLines(roomLines(client.getRoom(roomId))); };
            client.on(sdk.RoomEvent.Timeline, refresh);
            client.on(sdk.ClientEvent.Sync, refresh);
            await client.joinRoom(roomId);
            await client.startClient({ initialSyncLimit: 20, lazyLoadMembers: true });
        })();
        return () => { stopped = true; client?.stopClient(); clientRef.current = null; };
    }, [session, roomId]);

    const send = () => {
        const body = text.trim();
        if (!body || !clientRef.current) return;
        startTransition(async () => {
            await clientRef.current?.sendTextMessage(roomId, body);
            setText('');
        });
    };

    return (
        <section className="space-y-2">
            <h2 className="text-title">{t('liveTitle')}</h2>
            <ul className="space-y-1">
                {lines.length === 0 && <li className="text-meta text-foreground-muted">{t('empty')}</li>}
                {lines.map((l) => (
                    <li key={l.id} className="break-words">
                        <span className="text-meta text-foreground-muted">{format.dateTime(new Date(l.ts), { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {l.name} </span>
                        <span className="text-body">{l.body}</span>
                    </li>
                ))}
            </ul>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('messagePlaceholder')} aria-label={t('messagePlaceholder')} />
                <Button type="submit" disabled={isPending || !text.trim()}>{t('send')}</Button>
            </form>
        </section>
    );
}
