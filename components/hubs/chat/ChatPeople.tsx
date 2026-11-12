'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ChevronLeft, House } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { avatarUrl } from '@/lib/avatar';
import type { OnlineList, OnlinePerson } from '@/lib/services/chat-people.service';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useNameCard } from './name-card-context';

/** From this many people on the list gets a search field (K5-18: "from 16 people up"). */
const SEARCH_FROM = 16;

function Row({ p }: { p: OnlinePerson }) {
    const t = useTranslations('hub.chat');
    const open = useNameCard();
    const id = p.id;
    const body = (
        <>
            {id && (
                <span className="relative size-8 shrink-0">
                    <img src={avatarUrl({ id, image: p.image, avatarSeed: p.avatarSeed })} alt="" className="size-full rounded-pill object-cover" referrerPolicy="no-referrer" />
                    <span aria-hidden className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-pill bg-role-live line" />
                </span>
            )}
            <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-body-sm text-foreground">{p.name}</span>
                {p.status && <span className="block truncate text-tag text-foreground-muted">{p.status}</span>}
            </span>
            {p.group && <House aria-label={p.group.name} className="size-4 shrink-0 text-foreground-muted" />}
            {p.mod && <Badge tone="role" role="mod">{t('mod')}</Badge>}
        </>
    );
    const cls = 'flex min-h-11 w-full items-center gap-2 rounded-xl px-2 py-1';
    return (
        <li>
            {open && id
                ? <button type="button" onClick={(e) => open(id, e.currentTarget)} className={clsx(cls, 'hover:bg-tint focus-visible:outline-2 focus-visible:outline-primary')}>{body}</button>
                : <div className={cls}>{body}</div>}
        </li>
    );
}

function Group({ title, people }: { title: string; people: OnlinePerson[] }) {
    if (people.length === 0) return null;
    return (
        <section aria-label={title}>
            <h3 className="sticky top-0 bg-surface px-2 py-1 text-tag text-foreground-muted">{title}</h3>
            <ul className="grid list-none">{people.map((p, i) => <Row key={p.id ?? `${p.name}-${i}`} p={p} />)}</ul>
        </section>
    );
}

/**
 * The online list (K5-18, drawing `peopleList`): "Tiešsaistē N", search from 16 people, Moderatori then everyone A-Z. Signed in, a name opens the card;
 * signed out the names are plain text (K-149). Phone: the full `?view=people` view with a back arrow (`backHref`).
 */
export default function ChatPeople({ list, backHref, className }: { list: OnlineList | null; backHref: string; className?: string }) {
    const t = useTranslations('hub.chat');
    const [q, setQ] = useState('');
    const canOpen = !!useNameCard();
    const people = list?.people ?? [];
    const needle = q.trim().toLocaleLowerCase();
    const shown = people.filter((p) => !needle || p.name.toLocaleLowerCase().includes(needle));
    return (
        <aside aria-label={t('people.title')} className={clsx('flex min-h-0 flex-col', className)}>
            <div className="flex min-h-11 items-center gap-2 px-3">
                <Link href={backHref} aria-label={t('people.back')} className="-ml-2 inline-flex size-10 items-center justify-center rounded-pill hover:bg-tint lg:hidden"><ChevronLeft aria-hidden className="size-5" /></Link>
                <h2 className="text-section text-foreground">{t('people.title')} {list ? list.count : ''}</h2>
            </div>
            {people.length >= SEARCH_FROM && (
                <div className="px-3 pb-2"><Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('people.search')} aria-label={t('people.search')} /></div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
                <Group title={t('people.mods')} people={shown.filter((p) => p.mod)} />
                <Group title={t('people.all')} people={shown.filter((p) => !p.mod)} />
            </div>
            {canOpen && <p className="px-3 pb-3 text-tag text-foreground-muted/70">{t('people.legend')}</p>}
        </aside>
    );
}
