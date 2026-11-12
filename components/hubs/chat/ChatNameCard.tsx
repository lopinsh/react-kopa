'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { personCard, sendDirectChatRequest } from '@/actions/chat-actions';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import type { ChatCard } from '@/lib/services/chat-card.service';
import { directChatRequestSchema } from '@/lib/validations/chat';
import { useToast } from '@/hooks/use-toast';
import Badge from '@/components/ui/Badge';
import Button, { buttonClass } from '@/components/ui/Button';
import ChatRequestSheet from '@/components/hubs/ChatRequestSheet';
import NameCardPop from './NameCardPop';

/**
 * The name card (K5-19, K5-20): a tap on a name in a line or the online list. A sheet from the bottom on phones, a pop-up at the name from 768 px (design.md Pop-up, `NameCardPop`).
 * Avatar, name + Mod, status, shared groups, "Rakstīt ziņu" (a chat request into Ziņas, K-82) and the profile link.
 */
export default function ChatNameCard({ userId, anchor, onClose }: { userId: string; anchor: HTMLElement; onClose: () => void }) {
    const t = useTranslations('hub.chat');
    const tErrors = useTranslations('errors');
    const { error: toastError } = useToast();
    const [card, setCard] = useState<ChatCard | null>(null);
    const [failed, setFailed] = useState(false);
    const [writing, setWriting] = useState(false);
    const [sent, setSent] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let gone = false;
        void personCard({ userId }).then((res) => {
            if (gone) return;
            if (res.success && res.data) setCard(res.data); else setFailed(true);
        });
        return () => { gone = true; };
    }, [userId]);

    const fail = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
    const send = (content: string) => {
        const parsed = directChatRequestSchema.safeParse({ userId, content });
        if (isPending || !parsed.success) return;
        startTransition(async () => {
            const result = await sendDirectChatRequest(parsed.data);
            if (result.success || result.error === 'CHAT_REQUEST_EXISTS') { setSent(true); setWriting(false); }
            if (!result.success) fail(result.error);
        });
    };

    return (
        <NameCardPop anchor={anchor} onClose={onClose} title={card?.name || t('card.title')} locked={isPending}>
            {!card ? (
                <p role="status" className="text-body-sm text-foreground-muted">{failed ? t('card.failed') : t('connecting')}</p>
            ) : (
                <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                        <span className="size-12 shrink-0 overflow-hidden rounded-pill bg-tint">
                            <img src={avatarUrl(card)} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                        </span>
                        <div className="min-w-0">
                            {card.mod && <Badge tone="role" role="mod">{t('mod')}</Badge>}
                            {card.status && <p className="text-meta text-foreground-muted">{card.status}</p>}
                        </div>
                    </div>
                    {card.sharedGroups.length > 0 && (
                        <div className="grid gap-1">
                            <p className="text-tag text-foreground-muted">{t('card.shared')}</p>
                            <ul className="flex flex-wrap gap-2">
                                {card.sharedGroups.map((g) => <li key={g.href}><Link href={g.href}><Badge tone="tag">{g.name}</Badge></Link></li>)}
                            </ul>
                        </div>
                    )}
                    {writing ? (
                        <ChatRequestSheet name={card.name} isPending={isPending} onSubmit={send} onCancel={() => setWriting(false)} />
                    ) : (
                        <div className="grid gap-2">
                            {card.canRequest === 'yes' && !sent && <Button onClick={() => setWriting(true)}><Mail aria-hidden className="size-4" />{t('card.write')}</Button>}
                            {(card.canRequest === 'pending' || sent) && <Button disabled>{t('card.pending')}</Button>}
                            {card.canRequest === 'open' && card.chatHref && <Link href={card.chatHref} className={buttonClass('primary')}>{t('card.openChat')}</Link>}
                            {card.canRequest === 'off' && <p className="text-meta text-foreground-muted">{t('card.dmOff')}</p>}
                            {card.profileHref && <Link href={card.profileHref} className="text-body-sm text-primary hover:underline">{t('card.profile')}</Link>}
                        </div>
                    )}
                </div>
            )}
        </NameCardPop>
    );
}
