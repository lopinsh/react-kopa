'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { List, SlidersHorizontal, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useChatContext } from '@/components/providers/ChatProvider';
import RoomSwitcher from './RoomSwitcher';
import { useOpenTabs } from './use-open-tabs';

const TAB = 'relative inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap text-body-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const ON = 'weight-strong text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary';

/**
 * The bar above the room (K5-12, K5-13): the room switcher; from `lg` also tabs for the rooms open in this community (newest last, max 8, close on hover or
 * focus); at the right Katalogs and Iestatījumi (signed in only). Phones show the switcher alone (K-81).
 */
export default function ChatBar() {
    const t = useTranslations('hub.chat');
    const { family, room, viewer, l2Id } = useChatContext();
    const view = useSearchParams().get('view');
    const { keys, close } = useOpenTabs(l2Id, room.key, family.map((r) => r.key));
    const current = family.find((r) => r.key === room.key) ?? { key: room.key, title: room.title, kind: room.kind, href: '' };
    const open = keys.flatMap((k) => family.find((r) => r.key === k) ?? []);
    const catalogHref = `${current.href}?view=catalog`;
    const roomActive = view !== 'catalog' && view !== 'settings';

    return (
        <div className="flex items-center gap-4 overflow-x-auto border-0 border-b border-border lg:gap-5 lg:overflow-visible">
            <RoomSwitcher key={current.key} family={family} current={current} open={keys} catalogHref={catalogHref} />
            <nav aria-label={t('tabs.label')} className="hidden items-center gap-5 lg:flex">
                {open.map((r) => {
                    const on = r.key === room.key;
                    return (
                        <span key={r.key} className="group/tab relative inline-flex items-center">
                            <Link href={r.href} aria-current={on && roomActive ? 'page' : undefined} className={clsx(TAB, on && roomActive ? ON : 'text-foreground-muted hover:text-foreground')}>{r.title}</Link>
                            {!on && (
                                <button type="button" onClick={() => close(r.key)} aria-label={t('tabs.close', { room: r.title })}
                                    className="ml-1 inline-flex size-6 items-center justify-center rounded-pill text-foreground-muted opacity-0 hover:bg-tint hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary group-hover/tab:opacity-100">
                                    <X aria-hidden className="size-3.5" />
                                </button>
                            )}
                        </span>
                    );
                })}
            </nav>
            <span className="ml-auto flex shrink-0 items-center gap-4 lg:gap-5">
                <Link href={catalogHref} aria-current={view === 'catalog' ? 'page' : undefined} className={clsx(TAB, view === 'catalog' ? ON : 'text-foreground-muted hover:text-foreground')}><List aria-hidden className="hidden size-4 lg:block" />{t('tabs.catalog')}</Link>
                {viewer && <Link href={`${current.href}?view=settings`} aria-current={view === 'settings' ? 'page' : undefined} className={clsx(TAB, view === 'settings' ? ON : 'text-foreground-muted hover:text-foreground')}><SlidersHorizontal aria-hidden className="hidden size-4 lg:block" />{t('tabs.settings')}</Link>}
            </span>
        </div>
    );
}
