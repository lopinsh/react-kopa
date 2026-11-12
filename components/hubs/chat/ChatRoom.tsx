'use client';

import { useTranslations } from 'next-intl';
import { Hash, MapPin, MessageSquareOff, MessagesSquare } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { useChatContext } from '@/components/providers/ChatProvider';
import type { HubKey } from '@/lib/services/chat-access.service';
import ChatComposer from './ChatComposer';
import ChatLog from './ChatLog';
import ChatReadOnly from './ChatReadOnly';
import { useRoomLive } from './use-room-live';

const KIND_ICON = { hub: MessagesSquare, sub: Hash, city: MapPin } as const;

function LiveRoom({ userId, hubKey }: { userId: string; hubKey: HubKey }) {
    const t = useTranslations('hub.chat');
    const live = useRoomLive(userId, hubKey);
    if (live.status === 'unavailable') return <EmptyState icon={MessageSquareOff} title={t('unavailable')} className="m-auto" />;
    if (live.status === 'connecting') return <p role="status" className="m-auto text-body-sm text-foreground-muted">{t('connecting')}</p>;
    return (
        <>
            <ChatLog entries={live.entries} hasMore={live.hasMore} loadingMore={live.loadingMore} onLoadMore={live.loadMore} />
            <ChatComposer onSend={live.send} />
        </>
    );
}

/**
 * The room pane (K5-11): meta bar, the log and the composer (signed in, live through the SDK) or the read-only server lines and a sign-in footer (signed out).
 * Matrix unset or down: `hub.chat.unavailable` in place of the room (K5-14). The online column joins in K5-2b.
 */
export default function ChatRoom() {
    const t = useTranslations('hub.chat');
    const { configured, room, viewer, lines } = useChatContext();
    const Icon = KIND_ICON[room.kind];
    return (
        <section aria-label={t('room')} className="frame flex h-[max(24rem,calc(100dvh-var(--header-height)-var(--part-tabs-h)-var(--sticky-bar,0px)-3rem))] flex-col overflow-hidden rounded-2xl bg-surface shadow-card">
            <div className="flex min-h-11 items-center gap-3 border-b border-border px-4">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Icon aria-hidden className="size-4" /></span>
                <p className="min-w-0 flex-1 truncate text-meta text-foreground">
                    <span className="weight-strong">{room.title}</span><span className="sr-only"> ({t(`kind.${room.kind}`)})</span> · {room.memberLine}
                </p>
            </div>
            {!configured
                ? <EmptyState icon={MessageSquareOff} title={t('unavailable')} className="m-auto" />
                : viewer
                    ? <LiveRoom key={room.key} userId={viewer.id} hubKey={room.hubKey} />
                    : <ChatReadOnly lines={lines ?? []} />}
        </section>
    );
}
