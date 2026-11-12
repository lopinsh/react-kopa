'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import type { MatrixClient } from 'matrix-js-sdk';
import Button from '@/components/ui/Button';
import { readPublicAction } from '@/actions/matrix-trial-actions';
import type { PublicLine } from '@/lib/services/matrix.service';
import { roomLines, type RoomLine } from './room-lines';

/** F4: the two signed-out readers side by side. A: a Matrix guest peeks in the browser. B: the site reads on the server. */
export default function MatrixGuestRead({ baseUrl, roomId }: { baseUrl: string; roomId: string }) {
    const t = useTranslations('admin.matrixTrial');
    const format = useFormatter();
    const [guestLines, setGuestLines] = useState<RoomLine[]>([]);
    const [serverLines, setServerLines] = useState<PublicLine[]>([]);
    const [info, setInfo] = useState('');
    const [isPending, startTransition] = useTransition();
    const clientRef = useRef<MatrixClient | null>(null);
    const time = (ts: number) => format.dateTime(new Date(ts), { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    useEffect(() => () => { clientRef.current?.stopClient(); }, []);

    const startGuest = () => startTransition(async () => {
        clientRef.current?.stopClient();
        const started = Date.now();
        const sdk = await import('matrix-js-sdk');
        const guest = await sdk.createClient({ baseUrl }).registerGuest();
        const client = sdk.createClient({ baseUrl, accessToken: guest.access_token, userId: guest.user_id, deviceId: guest.device_id });
        client.setGuest(true);
        clientRef.current = client;
        const room = await client.peekInRoom(roomId);
        client.on(sdk.RoomEvent.Timeline, () => setGuestLines(roomLines(client.getRoom(roomId))));
        setGuestLines(roomLines(room));
        setInfo(`peek ${Date.now() - started} ms · ${guest.user_id}`);
    });

    const readServer = () => startTransition(async () => {
        const res = await readPublicAction();
        if (res.success) setServerLines(res.data ?? []);
    });

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-2">
                <h2 className="text-title">{t('guestTitle')}</h2>
                <Button variant="secondary" onClick={startGuest} disabled={isPending}>{t('refresh')}</Button>
                {info && <p className="text-meta text-foreground-muted break-words">{info}</p>}
                <ul className="space-y-1">
                    {guestLines.map((l) => <li key={l.id} className="break-words"><span className="text-meta text-foreground-muted">{time(l.ts)} · {l.name} </span><span className="text-body">{l.body}</span></li>)}
                </ul>
            </section>
            <section className="space-y-2">
                <h2 className="text-title">{t('serverTitle')}</h2>
                <Button variant="secondary" onClick={readServer} disabled={isPending}>{t('refresh')}</Button>
                <ul className="space-y-1">
                    {serverLines.map((l) => <li key={`${l.ts}-${l.body}`} className="break-words"><span className="text-meta text-foreground-muted">{time(l.ts)} · {l.name} </span><span className="text-body">{l.body}</span></li>)}
                </ul>
            </section>
        </div>
    );
}
