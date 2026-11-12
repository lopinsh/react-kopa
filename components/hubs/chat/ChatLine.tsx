'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { linkParts, type ChatRun } from './chat-lines';

/** One run of lines (K-81, K-101): each message full width, then one small meta line under the last: time · name · Mod. Plain text; URLs are links. */
export default function ChatLine({ run }: { run: ChatRun }) {
    const t = useTranslations('hub.chat');
    const format = useFormatter();
    const last = run.entries[run.entries.length - 1];
    return (
        <li className="grid gap-0.5">
            {run.entries.map((e) => (
                <p key={e.id} className="whitespace-pre-wrap break-words text-body-sm text-foreground">
                    {linkParts(e.body).map((p, i) => (
                        p.href
                            ? <a key={i} href={p.href} target="_blank" rel="nofollow ugc noopener" className="break-all text-primary underline">{p.text}</a>
                            : <span key={i}>{p.text}</span>
                    ))}
                </p>
            ))}
            <p className="text-tag weight-normal text-foreground-muted/70">
                {format.dateTime(last.ts, { hour: '2-digit', minute: '2-digit' })}
                {last.name && <> · <span className={clsx(last.own && 'text-primary')}>{last.name}</span></>}
                {last.mod && <> · {t('mod')}</>}
            </p>
        </li>
    );
}
