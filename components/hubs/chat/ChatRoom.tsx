'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ChevronRight, Hash, MapPin, MessageSquareOff, MessagesSquare } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import EmptyState from '@/components/ui/EmptyState';
import { useChatContext } from '@/components/providers/ChatProvider';
import type { HubKey } from '@/lib/services/chat-access.service';
import type { OnlineList } from '@/lib/services/chat-people.service';
import ChatComposer, { type MentionCandidate } from './ChatComposer';
import ChatLog from './ChatLog';
import ChatNameCard from './ChatNameCard';
import ChatPeople from './ChatPeople';
import ChatReadOnly from './ChatReadOnly';
import { NameCardProvider } from './name-card-context';
import { useRoomLive } from './use-room-live';
import { useRoomOnline } from './use-room-online';

const KIND_ICON = { hub: MessagesSquare, sub: Hash, city: MapPin } as const;

function LiveRoom({ userId, hubKey, online }: { userId: string; hubKey: HubKey; online: OnlineList | null }) {
    const t = useTranslations('hub.chat');
    const live = useRoomLive(userId, hubKey);
    const candidates = useMemo(() => {
        const byId = new Map<string, MentionCandidate>();
        for (const e of live.entries) if (!e.own && e.name) byId.set(e.sender, { id: e.sender, name: e.name });
        for (const p of online?.people ?? []) if (p.id && p.id !== userId && p.name) byId.set(p.id, { id: p.id, name: p.name });
        return [...byId.values()];
    }, [live.entries, online, userId]);
    if (live.status === 'unavailable') return <EmptyState icon={MessageSquareOff} title={t('unavailable')} className="m-auto" />;
    if (live.status === 'connecting') return <p role="status" className="m-auto text-body-sm text-foreground-muted">{t('connecting')}</p>;
    return (
        <>
            <ChatLog entries={live.entries} hasMore={live.hasMore} loadingMore={live.loadingMore} onLoadMore={live.loadMore} />
            <ChatComposer onSend={live.send} candidates={candidates} />
        </>
    );
}

/**
 * The room pane (K5-11): meta bar, the log and the composer (signed in, live through the SDK) or the read-only server lines and a sign-in footer (signed out).
 * Matrix unset or down: `hub.chat.unavailable` in place of the room (K5-14). The online list (K5-18) is a column from `lg`, the `?view=people` full view below it;
 * a name opens the name card when signed in (K5-19).
 */
export default function ChatRoom() {
    const t = useTranslations('hub.chat');
    const { configured, room, viewer, lines } = useChatContext();
    const view = useSearchParams().get('view');
    const [cardFor, setCardFor] = useState<{ id: string; anchor: HTMLElement } | null>(null);
    const online = useRoomOnline(room.hubKey, configured);
    const openCard = useCallback((id: string, anchor: HTMLElement) => setCardFor({ id, anchor }), []);
    const Icon = KIND_ICON[room.kind];
    const people = view === 'people' && configured;
    const pathname = usePathname();
    return (
        <section aria-label={t('room')} className="frame flex h-[max(24rem,calc(100dvh-var(--header-height)-var(--part-tabs-h)-var(--sticky-bar,0px)-3rem))] flex-col overflow-hidden rounded-2xl bg-surface shadow-card">
            <div className={clsx('min-h-11 items-center gap-3 border-b border-border px-4', people ? 'hidden lg:flex' : 'flex')}>
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Icon aria-hidden className="size-4" /></span>
                <p className="min-w-0 flex-1 truncate text-meta text-foreground">
                    <span className="weight-strong">{room.title}</span><span className="sr-only"> ({t(`kind.${room.kind}`)})</span> · {room.memberLine}
                </p>
                {configured && online && (
                    <Link href={`${pathname}?view=people`} className="inline-flex shrink-0 items-center gap-0.5 text-meta text-foreground-muted hover:text-foreground lg:hidden">{t('onlineCount', { count: online.count })}<ChevronRight aria-hidden className="size-4" /></Link>
                )}
            </div>
            <NameCardProvider value={viewer ? openCard : null}>
                <div className="flex min-h-0 flex-1">
                    <div className={clsx('min-w-0 flex-1 flex-col', people ? 'hidden lg:flex' : 'flex')}>
                        {!configured
                            ? <EmptyState icon={MessageSquareOff} title={t('unavailable')} className="m-auto" />
                            : viewer
                                ? <LiveRoom key={room.key} userId={viewer.id} hubKey={room.hubKey} online={online} />
                                : <ChatReadOnly lines={lines ?? []} />}
                    </div>
                    {configured && online && (
                        <ChatPeople list={online} backHref={pathname} className={clsx('lg:w-56 lg:shrink-0 lg:border-l lg:border-border', people ? 'w-full' : 'hidden lg:flex')} />
                    )}
                </div>
                {cardFor && <ChatNameCard key={cardFor.id} userId={cardFor.id} anchor={cardFor.anchor} onClose={() => setCardFor(null)} />}
            </NameCardProvider>
        </section>
    );
}
