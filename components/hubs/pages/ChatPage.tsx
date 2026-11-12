import { getTranslations } from 'next-intl/server';
import { ChatContextService } from '@/lib/services/chat-context.service';
import type { HubContext } from '@/lib/services/hub.service';
import { ChatProvider } from '@/components/providers/ChatProvider';
import ChatBar from '@/components/hubs/chat/ChatBar';
import ChatRoom from '@/components/hubs/chat/ChatRoom';

/**
 * Čats of a hub (K5-08..K5-14): the hub's own room. The page hydrates `ChatProvider` from the service; the SDK is loaded by the client parts only.
 * No Kur under the tabs (the room is the hub's), no explanation line under the title (K-109). Without Matrix the room pane says so; the bar still renders.
 */
export default async function ChatPage({ hub, locale, viewer }: { hub: HubContext; locale: string; viewer?: { id: string; role?: string | null } }) {
    const t = await getTranslations({ locale, namespace: 'hub' });
    const memberLine = t('memberLine', { members: hub.stats.memberCount, groups: hub.stats.groupCount });
    const ctx = await ChatContextService.pageContext(hub, viewer ?? null, memberLine, locale);
    return (
        <ChatProvider value={ctx}>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
                <ChatBar />
                <ChatRoom />
            </div>
        </ChatProvider>
    );
}
