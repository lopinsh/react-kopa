'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import VeidsList from '@/components/discovery/lists/VeidsList';
import CategorySuggest from '@/components/discovery/CategorySuggest';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { useChipFit } from '@/hooks/useChipFit';
import { UI } from '@/lib/constants';
import { CHIP, CHOSEN, OPEN } from './chip-styles';
import { isVeidsChosen, subsChosen, toggleSub, toggleVeids } from './veids-choice';

export function Chip({ label, chosen, onClick, muted = false }: { label: string; chosen: boolean; onClick?: () => void; muted?: boolean }) {
    return (
        <button type="button" aria-pressed={chosen} onClick={onClick} className={clsx(CHIP, chosen ? clsx(CHOSEN, 'min-w-0 shrink-0') : clsx('shrink-0 bg-surface weight-medium hover:bg-tint', muted ? 'text-foreground-muted' : 'text-foreground'))}>
            {/* A chosen chip always stays; on a narrow line its name is cut instead. */}
            <span className="min-w-0 truncate">{label}</span>
            {chosen && <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center"><X className="size-3" /></span>}
        </button>
    );
}

type Entry = { key: string; label: string; chosen: boolean; muted: boolean; divider?: boolean; onClick: () => void };

/**
 * The Veidi of the chosen Tēma as chips on one line: the chosen ones first (tinted, with ×), then the busiest (a Veids with no groups yet still shows, muted, last); "+N" opens the full list.
 * A lone chosen Veids with sub-veidi opens them after it (K-73 B); choosing one replaces the Veids in the filter and the Veids stays as the group's head (× clears the group).
 */
export default function VeidsChips() {
    const t = useTranslations('discovery');
    const { veidi, categories } = useDiscovery();
    const { params, go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const [draft, setDraft] = useState<string[]>([]);
    const [suggestFor, setSuggestFor] = useState<{ id: string; title: string } | null>(null);
    // The phone sheet's name click: applied by `close` once Back has taken the sheet's history entry off (AR-67).
    const picked = useRef<string[] | null>(null);

    const all = veidi.filter((v) => v.l1Slug === params.category);
    const heads = all.filter((v) => isVeidsChosen(params.tags, v)).sort((a, b) => firstAt(params.tags, a) - firstAt(params.tags, b));
    const rest = all.filter((v) => !isVeidsChosen(params.tags, v)).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
    const open = heads.length === 1 && heads[0].subs.length > 0 ? heads[0] : null;
    const entries: Entry[] = [];
    let pinned = 0;
    for (const v of heads) {
        entries.push({ key: v.slug, label: v.title, chosen: true, muted: false, onClick: () => go({ tags: toggleVeids(params.tags, v) }) });
        const done = subsChosen(params.tags, v);
        const subs = (open === v ? [...v.subs] : v.subs.filter((s) => done.includes(s.slug))).sort((a, b) => Number(done.includes(b.slug)) - Number(done.includes(a.slug)) || b.count - a.count || a.title.localeCompare(b.title));
        subs.forEach((s, i) => entries.push({ key: s.slug, label: s.title, chosen: done.includes(s.slug), muted: s.count === 0, divider: i === 0, onClick: () => go({ tags: toggleSub(params.tags, v, s.slug) }) }));
        pinned += 1 + done.length;
    }
    // The "+ Cits" chip closes an open group (K-55 style), and files a sub-veids under that Veids.
    if (open) entries.push({ key: '+other', label: t('otherSubtype'), chosen: false, muted: true, onClick: () => setSuggestFor({ id: open.id, title: open.title }) });
    rest.forEach((v) => entries.push({ key: v.slug, label: v.title, chosen: false, muted: v.count === 0, onClick: () => go({ tags: toggleVeids(params.tags, v) }) }));
    const shownSubs = entries.filter((e) => e.divider !== undefined).length;
    const { row, probe, fit } = useChipFit(entries.map((e) => e.label).join('|'), entries.length, pinned, all.some((v) => v.subs.length > 0) && shownSubs < all.reduce((n, v) => n + v.subs.length, 0));

    if (!params.category || all.length === 0) return null;
    const hidden = entries.length - fit;
    const chip = (e: Entry, live: boolean) => {
        const el = <Chip key={e.key} label={e.label} chosen={e.chosen} muted={e.muted} onClick={live ? e.onClick : undefined} />;
        return e.divider ? <span key={e.key} className="inline-flex shrink-0 items-center gap-1.5"><span aria-hidden="true" className="h-4 w-px bg-border" />{el}</span> : el;
    };
    const close = () => {
        const next = picked.current ?? draft;
        picked.current = null;
        if (!pop.desktop && next.join() !== params.tags.join()) go({ tags: next });
        pop.setOpen(false);
    };
    // A name click: only that one, and the list closes; on a phone the sheet closes as by Back first, then `close` pushes it.
    const pick = (next: string[]) => {
        setDraft(next);
        if (!pop.desktop) {
            picked.current = next;
            window.history.back();
            return;
        }
        go({ tags: next }, { replace: true });
        pop.setOpen(false);
        pop.host?.querySelector('button')?.focus();
    };
    const more = <span className={clsx(CHIP, 'shrink-0 bg-surface weight-strong text-foreground-muted')}>+{hidden || 99}</span>;

    return (
        <div ref={row} role="group" aria-label={t('veids')} data-ui={UI.veidsLine} style={{ ['--c' as string]: categories.find((c) => c.slug === params.category)?.color }} className="relative flex items-center gap-1.5 md:min-w-0">
            <div className="flex items-center gap-1.5 pt-[calc(0.25rem+var(--shadow-room))] pb-[calc(0.25rem+var(--shadow-room))] pr-[var(--shadow-room)] md:min-w-0 md:overflow-hidden">
                {/* On a phone every Veids shows and the line scrolls sideways (no "+N"); from md up the ones that don't fit sit behind "+N". */}
                {entries.map((e, i) => (i < fit ? chip(e, true) : <span key={e.key} className="contents md:hidden">{chip(e, true)}</span>))}
            </div>
            {hidden > 0 && (
                <div ref={bindHost} className="relative shrink-0 max-md:hidden">
                    <button type="button" aria-label={t('moreVeidi', { count: hidden })} aria-expanded={pop.open} aria-controls={pop.id} onClick={() => { setDraft(params.tags); pop.toggle(); }} className={clsx(CHIP, 'shrink-0 bg-surface weight-strong text-foreground-muted hover:bg-tint', pop.open && OPEN)}>
                        +{hidden}
                    </button>
                    <FilterPopover pop={pop} title={t('veids')} onClose={close}>
                        <VeidsList
                            l1Slug={params.category}
                            selected={draft}
                            onChange={(next) => { setDraft(next); if (pop.desktop) go({ tags: next }, { replace: true }); }}
                            onPick={pick}
                            autoFocus={pop.desktop}
                        />
                    </FilterPopover>
                </div>
            )}
            <div ref={probe} inert aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-1.5 whitespace-nowrap">
                {entries.map((e) => chip(e, false))}
                {more}
            </div>
            {suggestFor && <CategorySuggest word="" parent={suggestFor} onClose={() => setSuggestFor(null)} />}
        </div>
    );
}

/** Where a Veids (or one of its sub-veidi) first appears in `tags`, to keep the chosen in the order they were chosen. */
function firstAt(tags: string[], v: { slug: string; subs: Array<{ slug: string }> }): number {
    const at = tags.findIndex((slug) => slug === v.slug || v.subs.some((s) => s.slug === slug));
    return at < 0 ? Number.MAX_SAFE_INTEGER : at;
}
