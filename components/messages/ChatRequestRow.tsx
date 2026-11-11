'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import Button from '@/components/ui/Button';
import type { ChatRequestRow as Row, IncomingChatRequest } from '@/lib/services/chat-request.service';

type Props = { request: Row | IncomingChatRequest; busy?: boolean; onAccept?: () => void; onDecline?: () => void; highlighted?: boolean };

/**
 * A "Rakstīt privāti" request in the Ziņas inbox (K2-25). Incoming: face, name, the note it is about, their message (2 lines), Pieņemt / Noraidīt.
 * Outgoing: name, the note and "gaida apstiprinājumu" (the one state a sender ever sees, K-120). Both mention the note only while it exists.
 */
export default function ChatRequestRow({ request, busy, onAccept, onDecline, highlighted }: Props) {
    const t = useTranslations('messages.requests');
    const about = request.excerpt ? t('about', { excerpt: request.excerpt }) : t('aboutGone');
    return (
        <li id={`r-${request.id}`} className={clsx('grid gap-2 border-b border-border px-4 py-3 last:border-b-0', highlighted && 'bg-tint')}>
            <div className="flex items-center gap-3">
                <span className="size-10 shrink-0 overflow-hidden rounded-full line bg-surface">
                    <img src={avatarUrl(request.person)} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm weight-medium text-foreground">{request.person.name}</p>
                    <p className="line-clamp-2 text-meta text-foreground-muted">
                        {request.noteHref ? <Link href={request.noteHref} className="underline underline-offset-2 hover:text-foreground">{about}</Link> : about}
                    </p>
                </div>
            </div>
            {'content' in request ? (
                <>
                    <p className="line-clamp-2 whitespace-pre-line break-words text-body-sm text-foreground">{request.content}</p>
                    <div className="flex gap-2">
                        <Button size="sm" disabled={busy} onClick={onAccept}>{t('accept')}</Button>
                        <Button size="sm" variant="quiet" disabled={busy} onClick={onDecline}>{t('decline')}</Button>
                    </div>
                </>
            ) : (
                <p className="text-meta text-foreground-muted">{t('pending')}</p>
            )}
        </li>
    );
}
