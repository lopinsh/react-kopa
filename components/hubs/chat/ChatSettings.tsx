'use client';

import { useId, useState, useTransition, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { saveChatSettings } from '@/actions/chat-actions';
import Switch from '@/components/ui/Switch';
import { useChatLook } from './use-chat-look';

function Row({ title, hint, children }: { title: string; hint?: string; children: (ids: { label: string; hint?: string }) => ReactNode }) {
    const id = useId();
    return (
        <div className="flex min-h-11 items-center justify-between gap-4 border-0 border-t border-dashed border-border py-3 first:border-t-0">
            <div className="min-w-0">
                <p id={`${id}-l`} className="text-body-sm text-foreground">{title}</p>
                {hint && <p id={`${id}-h`} className="text-meta text-foreground-muted">{hint}</p>}
            </div>
            {children({ label: `${id}-l`, hint: hint ? `${id}-h` : undefined })}
        </div>
    );
}

/**
 * Iestatījumi (K5-22): global, not per room (K-81). The mention switch and chat requests save to the account; compact view and times are this device's (localStorage).
 * Each account switch has its own `isPending` and goes back if the save fails.
 */
export default function ChatSettings({ initial }: { initial: { mentionNotify: boolean; allowRequests: boolean } }) {
    const t = useTranslations('hub.chat.settings');
    const [saved, setSaved] = useState(initial);
    const [pending, start] = useTransition();
    const [error, setError] = useState(false);
    const [look, setLook] = useChatLook();

    const save = (patch: Partial<typeof initial>) => {
        const before = saved;
        setSaved({ ...saved, ...patch });
        setError(false);
        start(async () => {
            const res = await saveChatSettings(patch);
            if (!res.success) { setSaved(before); setError(true); }
        });
    };
    const group = 'grid gap-1';
    const heading = 'text-meta weight-strong text-foreground-muted';

    return (
        <section aria-label={t('label')} className="frame grid content-start gap-section rounded-2xl bg-surface p-4 shadow-card">
            <div className={group}>
                <h2 className={heading}>{t('notifications')}</h2>
                <Row title={t('mentions')}>{(i) => <Switch checked={saved.mentionNotify} disabled={pending} onChange={(v) => save({ mentionNotify: v })} labelledBy={i.label} />}</Row>
            </div>
            <div className={group}>
                <h2 className={heading}>{t('look')}</h2>
                <Row title={t('compact')} hint={t('compactHint')}>{(i) => <Switch checked={look.compact} onChange={(v) => setLook({ compact: v })} labelledBy={i.label} describedBy={i.hint} />}</Row>
                <Row title={t('times')}>{(i) => <Switch checked={look.times} onChange={(v) => setLook({ times: v })} labelledBy={i.label} />}</Row>
            </div>
            <div className={group}>
                <h2 className={heading}>{t('who')}</h2>
                <Row title={t('requests')} hint={t('requestsHint')}>{(i) => <Switch checked={saved.allowRequests} disabled={pending} onChange={(v) => save({ allowRequests: v })} labelledBy={i.label} describedBy={i.hint} />}</Row>
            </div>
            {error && <p role="alert" className="text-meta text-danger">{t('saveFailed')}</p>}
        </section>
    );
}
