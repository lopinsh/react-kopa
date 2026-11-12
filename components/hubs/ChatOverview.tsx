import { MessagesSquare } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import type { ChatPreview } from '@/lib/services/chat-preview.service';
import TextLink from '@/components/ui/TextLink';
import HubSection from '@/components/hubs/HubSection';

/**
 * The Čats block on Pārskats (K5-28, K-150): "N tiešsaistē" at the heading, the room's last three lines as one-line rows (time · name · text, plain names, no card),
 * a link to the room. Server-rendered, no SDK. An empty room has one muted line and the link.
 */
export default async function ChatOverview({ preview, chatHref, locale }: { preview: ChatPreview; chatHref: string; locale: string }) {
    const [t, tChat, format] = await Promise.all([getTranslations({ locale, namespace: 'hub' }), getTranslations({ locale, namespace: 'hub.chat' }), getFormatter({ locale })]);
    return (
        <HubSection id="hub-chat" title={t('pages.chat')} action={<span className="text-meta text-foreground-muted">{tChat('onlineCount', { count: preview.count })}</span>}>
            <div className="frame grid gap-1 rounded-2xl bg-surface px-4 py-3 shadow-card">
                {preview.lines.length === 0 ? <p className="py-1 text-body-sm text-foreground-muted">{tChat('empty')}</p> : (
                    <ul className="list-none">
                        {preview.lines.map((l, i) => (
                            <li key={`${l.ts}-${i}`} className="flex min-h-9 items-baseline gap-2 text-body-sm">
                                <span className="shrink-0 text-meta tabular-nums text-foreground-muted">{format.dateTime(l.ts, { hour: '2-digit', minute: '2-digit' })}</span>
                                {l.name && <span className="max-w-[40%] shrink-0 truncate weight-strong text-foreground">{l.name}</span>}
                                <span className="min-w-0 flex-1 truncate text-foreground">{l.body}</span>
                            </li>
                        ))}
                    </ul>
                )}
                <TextLink href={chatHref} className="justify-self-start pt-1"><MessagesSquare aria-hidden className="size-4" />{tChat('block.open')}</TextLink>
            </div>
        </HubSection>
    );
}
