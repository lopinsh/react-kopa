import { getTranslations } from 'next-intl/server';
import { ChatCatalogService } from '@/lib/services/chat-catalog.service';
import { ChatContextService } from '@/lib/services/chat-context.service';
import type { HubContext } from '@/lib/services/hub.service';
import { UserService } from '@/lib/services/user.service';
import { ChatProvider } from '@/components/providers/ChatProvider';
import ChatBar from '@/components/hubs/chat/ChatBar';
import ChatCatalog from '@/components/hubs/chat/ChatCatalog';
import ChatRoom from '@/components/hubs/chat/ChatRoom';
import ChatSettings from '@/components/hubs/chat/ChatSettings';

/**
 * Čats of a hub (K5-08..K5-14): the hub's own room. The page hydrates `ChatProvider` from the service; the SDK is loaded by the client parts only.
 * No Kur under the tabs (the room is the hub's), no explanation line under the title (K-109). Without Matrix the room pane says so; the bar still renders.
 * `?view=catalog` is Katalogs (K5-21), `?view=settings` Iestatījumi (K5-22, signed in only); both replace the room pane under the same bar.
 */
export default async function ChatPage({ hub, locale, viewer, view }: { hub: HubContext; locale: string; viewer?: { id: string; role?: string | null }; view?: string }) {
    const t = await getTranslations({ locale, namespace: 'hub' });
    const memberLine = t('memberLine', { members: hub.stats.memberCount, groups: hub.stats.groupCount });
    const ctx = await ChatContextService.pageContext(hub, viewer ?? null, memberLine, locale);
    const settings = view === 'settings' && viewer ? await UserService.getChatSettings(viewer.id) : null;
    const rows = view === 'catalog' ? await ChatCatalogService.forFamily(ctx.l2Id, locale) : null;
    return (
        <ChatProvider value={ctx}>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
                <ChatBar />
                {rows ? <ChatCatalog rows={rows} l2Id={ctx.l2Id} /> : settings ? <ChatSettings initial={settings} /> : <ChatRoom />}
            </div>
        </ChatProvider>
    );
}
