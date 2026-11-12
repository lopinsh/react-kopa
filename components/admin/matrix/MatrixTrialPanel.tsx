'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { matrixSessionAction, runMatrixChecksAction, setupMatrixTrialAction } from '@/actions/matrix-trial-actions';
import type { MatrixStatus, MatrixSession } from '@/lib/services/matrix.service';
import type { TrialCheck, TrialRooms } from '@/lib/services/matrix-trial.service';
import MatrixLiveRoom from './MatrixLiveRoom';
import MatrixGuestRead from './MatrixGuestRead';

/** The K4 test page body: status, "create rooms", the F-checks and the three room views. */
export default function MatrixTrialPanel({ status, trial }: { status: MatrixStatus; trial: TrialRooms | null }) {
    const t = useTranslations('admin.matrixTrial');
    const te = useTranslations('errors');
    const [rooms, setRooms] = useState<TrialRooms | null>(trial);
    const [checks, setChecks] = useState<TrialCheck[]>([]);
    const [session, setSession] = useState<MatrixSession | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!status.configured) return <p className="text-body text-foreground-muted">{t('notConfigured')}</p>;
    if (!status.reachable) return <p className="text-body text-foreground-muted">{t('unreachable')}</p>;

    const fail = (code: string) => setError(te.has(code) ? te(code) : code);
    const setup = () => startTransition(async () => {
        setError(null);
        const res = await setupMatrixTrialAction();
        if (!res.success) return fail(res.error);
        setRooms(res.data ?? null);
        const s = await matrixSessionAction();
        if (s.success && s.data) setSession(s.data);
    });
    const run = () => startTransition(async () => {
        setError(null);
        const res = await runMatrixChecksAction();
        if (!res.success) return fail(res.error);
        setChecks(res.data ?? []);
    });
    const open = () => startTransition(async () => {
        const s = await matrixSessionAction();
        if (s.success && s.data) setSession(s.data); else if (!s.success) fail(s.error);
    });

    return (
        <div className="space-y-6">
            <p className="text-meta text-foreground-muted">{t('status', { server: status.serverName ?? '', version: status.version ?? '' })}</p>
            <div className="flex flex-wrap gap-3">
                <Button onClick={setup} disabled={isPending}>{t('setup')}</Button>
                {rooms && <Button variant="secondary" onClick={run} disabled={isPending}>{t('runChecks')}</Button>}
                {rooms && !session && <Button variant="secondary" onClick={open} disabled={isPending}>{t('liveTitle')}</Button>}
            </div>
            {error && <p role="alert" className="text-meta text-danger">{error}</p>}
            {rooms && <p className="text-meta text-foreground-muted">{rooms.titles.room} · {rooms.aliases.room}</p>}
            {checks.length > 0 && (
                <ul className="space-y-1">
                    {checks.map((c) => (
                        <li key={c.id} className="text-meta break-words">
                            <span className={c.ok ? 'text-success' : 'text-danger'}>{c.id} {c.ok ? t('checkOk') : t('checkFailed')}</span> · {c.detail}
                        </li>
                    ))}
                </ul>
            )}
            {rooms && session && <MatrixLiveRoom session={session} roomId={rooms.room} />}
            {rooms && <MatrixGuestRead baseUrl={status.publicUrl ?? ''} roomId={rooms.room} />}
        </div>
    );
}
