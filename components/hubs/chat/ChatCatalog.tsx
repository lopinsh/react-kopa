'use client';

import { useState } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { Hash, MapPin, MessagesSquare, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { relativeTo } from '@/lib/utils/relative-time';
import type { CatalogRow } from '@/lib/services/chat-catalog.service';
import type { RoomKind } from '@/lib/services/chat-context.service';
import { useOpenKeys } from './use-open-tabs';

const ICONS: Record<RoomKind, typeof Hash> = { hub: MessagesSquare, sub: Hash, city: MapPin };

/**
 * Katalogs (K5-21, K-88): the community's rooms (or a city's, K5-23) by last activity, a search that filters titles, and per row "Atvērta" (already a tab) or
 * an "Atvērt" link: the room's page puts it among the tabs. Activity is best effort; without it a row has just the kind word.
 */
export default function ChatCatalog({ rows, l2Id, className }: { rows: CatalogRow[]; l2Id: string | null; className?: string }) {
    const t = useTranslations('hub.chat');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const open = useOpenKeys(l2Id);
    const [q, setQ] = useState('');
    const needle = q.trim().toLocaleLowerCase();
    const shown = needle ? rows.filter((r) => r.title.toLocaleLowerCase().includes(needle)) : rows;

    return (
        <section aria-label={t('catalog.label')} className={className ?? 'frame grid content-start gap-3 rounded-2xl bg-surface p-4 shadow-card'}>
            <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('catalog.search')} aria-label={t('catalog.search')} className="pl-9" />
            </div>
            <p className="text-meta text-foreground-muted">{t('catalog.hint')}</p>
            {shown.length === 0 ? <p className="py-4 text-center text-body-sm text-foreground-muted">{t('catalog.empty')}</p> : (
                <ul className="list-none">
                    {shown.map((r) => {
                        const Icon = ICONS[r.kind];
                        const isOpen = open?.includes(r.key) ?? false;
                        const meta = [t(`kind.${r.kind}`), r.online !== null ? t('catalog.meta', { count: r.online }) : null, r.lastTs ? relativeTo(format, new Date(r.lastTs), now) : null].filter(Boolean).join(' · ');
                        return (
                            <li key={r.key} className="flex min-h-14 items-center gap-3 border-0 border-t border-dashed border-border py-2 first:border-t-0">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Icon aria-hidden className="size-4" /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-body-sm weight-strong text-foreground">{r.title}</span>
                                    <span className="block truncate text-meta text-foreground-muted">{meta}</span>
                                </span>
                                {isOpen
                                    ? <Link href={r.href} className="shrink-0 text-meta text-foreground-muted hover:text-foreground">{t('catalog.opened')}</Link>
                                    : <Link href={r.href} className={buttonClass('secondary', 'shrink-0', 'sm')}>{t('catalog.open')}</Link>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
