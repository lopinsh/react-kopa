'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ChevronDown, Hash, List, MapPin, MessagesSquare, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { RoomKind, RoomRef } from '@/lib/services/chat-context.service';

const ICONS: Record<RoomKind, typeof Hash> = { hub: MessagesSquare, sub: Hash, city: MapPin };
const ROW = 'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-body-sm text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-10';

/** The room switcher pill (K5-12): `# Title ▾`; opens a bottom sheet below 768 px, a drop-down from there, with search (K-73). Open rooms first, then the rest, then Katalogs. */
export default function RoomSwitcher({ family, current, open: openKeys, catalogHref }: { family: RoomRef[]; current: RoomRef; open: readonly string[]; catalogHref: string }) {
    const t = useTranslations('hub.chat');
    const id = useId();
    const [shown, setShown] = useState(false);
    const [q, setQ] = useState('');
    const root = useRef<HTMLDivElement>(null);
    useClickOutside(root, () => setShown(false), shown);
    useEffect(() => {
        if (!shown) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShown(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [shown]);

    const needle = q.trim().toLocaleLowerCase();
    const match = (r: RoomRef) => !needle || r.title.toLocaleLowerCase().includes(needle);
    const opened = family.filter((r) => openKeys.includes(r.key) && match(r));
    const others = family.filter((r) => !openKeys.includes(r.key) && match(r));
    const Icon = ICONS[current.kind];
    const row = (r: RoomRef) => {
        const RowIcon = ICONS[r.kind];
        return (
            <li key={r.key}>
                <Link href={r.href} aria-current={r.key === current.key ? 'page' : undefined} className={clsx(ROW, r.key === current.key && 'weight-strong')}>
                    <RowIcon aria-hidden className="size-4 shrink-0 text-foreground-muted" /><span className="min-w-0 flex-1 truncate">{r.title}</span>
                </Link>
            </li>
        );
    };
    const heading = 'px-3 pb-0.5 pt-2 text-meta weight-strong text-foreground-muted';

    return (
        <div ref={root} className="relative shrink-0 self-center">
            <button type="button" aria-expanded={shown} aria-controls={id} onClick={() => setShown((s) => !s)}
                className={buttonClass('secondary', 'max-w-48 shadow-control', 'sm')}>
                <Icon aria-hidden className="size-3.5 shrink-0" /><span className="truncate">{current.title}</span><ChevronDown aria-hidden className="size-3 shrink-0" />
            </button>
            {shown && (
                <>
                    <div aria-hidden className="fixed inset-0 z-40 bg-foreground/30 md:hidden" />
                    <div id={id} className="fixed inset-x-0 bottom-0 z-50 grid max-h-[75dvh] grid-rows-[auto_minmax(0,1fr)] rounded-t-2xl bg-surface p-3 shadow-premium md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-full md:mt-2 md:max-h-96 md:w-72 md:rounded-menu md:p-1.5 md:line">
                        <div className="relative pb-2">
                            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-[calc(50%+0.25rem)] text-foreground-muted" />
                            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('switcher.search')} aria-label={t('switcher.search')} className="pl-9" autoFocus />
                        </div>
                        <div className="min-h-0 overflow-y-auto">
                            {opened.length > 0 && <><p className={heading}>{t('switcher.open')}</p><ul className="list-none">{opened.map(row)}</ul></>}
                            {others.length > 0 && <><p className={heading}>{t('switcher.others')}</p><ul className="list-none">{others.map(row)}</ul></>}
                            {opened.length + others.length === 0 && <p className="px-3 py-4 text-center text-body-sm text-foreground-muted">{t('switcher.none')}</p>}
                            <Link href={catalogHref} className={clsx(ROW, 'mt-1 border-t border-border')}><List aria-hidden className="size-4 shrink-0 text-foreground-muted" />{t('tabs.catalog')}</Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
