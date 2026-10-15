'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import VeidsList from '@/components/discovery/lists/VeidsList';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { useChipFit } from '@/hooks/useChipFit';
import { UI } from '@/lib/constants';

const CHIP = 'relative inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs ring-1 ring-inset after:absolute after:-inset-y-2 after:inset-x-0';
const CHOSEN = 'bg-[color-mix(in_srgb,var(--c)_15%,var(--surface))] font-semibold text-foreground ring-[color-mix(in_srgb,var(--c)_45%,transparent)]';

export function Chip({ label, chosen, onClick }: { label: string; chosen: boolean; onClick?: () => void }) {
    return (
        <button type="button" aria-pressed={chosen} onClick={onClick} className={clsx(CHIP, chosen ? clsx(CHOSEN, 'min-w-0 shrink') : 'shrink-0 bg-surface font-medium text-foreground ring-border hover:bg-tint')}>
            {/* A chosen chip always stays; on a narrow line its name is cut instead. */}
            <span className="min-w-0 truncate">{label}</span>
            {chosen && <X aria-hidden="true" className="size-3 shrink-0" />}
        </button>
    );
}

/** The Veidi of the chosen Tēma as chips on one line: the chosen ones first (tinted, with ×), then the busiest; "+N" opens the full list. */
export default function VeidsChips() {
    const t = useTranslations('discovery');
    const { veidi, categories } = useDiscovery();
    const { params, go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const [draft, setDraft] = useState<string[]>([]);
    // The phone sheet's name click: applied by `close` once Back has taken the sheet's history entry off (AR-67).
    const picked = useRef<string[] | null>(null);

    const all = veidi.filter((v) => v.l1Slug === params.category);
    const chosen = params.tags.flatMap((slug) => all.find((v) => v.slug === slug) ?? []);
    const rest = all.filter((v) => !params.tags.includes(v.slug) && v.count > 0).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
    const chips = [...chosen, ...rest];
    const { row, probe, fit } = useChipFit(chips.map((c) => c.title).join('|'), chips.length, chosen.length, all.length > chips.length);

    if (!params.category || all.length === 0) return null;
    const hidden = all.length - fit;
    const toggle = (slug: string) => go({ tags: params.tags.includes(slug) ? params.tags.filter((s) => s !== slug) : [...params.tags, slug] });
    const close = () => {
        const next = picked.current ?? draft;
        picked.current = null;
        if (!pop.desktop && next.join() !== params.tags.join()) go({ tags: next });
        pop.setOpen(false);
    };
    // A name click: only that Veids, and the list closes; on a phone the sheet closes as by Back first, then `close` pushes it.
    const pick = (slug: string) => {
        setDraft([slug]);
        if (!pop.desktop) {
            picked.current = [slug];
            window.history.back();
            return;
        }
        go({ tags: [slug] }, { replace: true });
        pop.setOpen(false);
        pop.host?.querySelector('button')?.focus();
    };
    const more = <span className={clsx(CHIP, 'shrink-0 bg-surface font-semibold text-foreground-muted ring-border')}>+{hidden || 99}</span>;

    return (
        <div ref={row} role="group" aria-label={t('veids')} data-ui={UI.veidsLine} style={{ ['--c' as string]: categories.find((c) => c.slug === params.category)?.color }} className="relative flex min-w-0 items-center gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden py-0.5">
                {chips.slice(0, fit).map((v) => <Chip key={v.slug} label={v.title} chosen={params.tags.includes(v.slug)} onClick={() => toggle(v.slug)} />)}
            </div>
            {hidden > 0 && (
                <div ref={bindHost} className="relative shrink-0">
                    <button type="button" aria-label={t('moreVeidi', { count: hidden })} aria-expanded={pop.open} aria-controls={pop.id} onClick={() => { setDraft(params.tags); pop.toggle(); }} className={clsx(CHIP, 'shrink-0 bg-surface font-semibold text-foreground-muted ring-border hover:bg-tint', pop.open && 'ring-primary')}>
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
                {chips.map((v) => <Chip key={v.slug} label={v.title} chosen={params.tags.includes(v.slug)} />)}
                {more}
            </div>
        </div>
    );
}
