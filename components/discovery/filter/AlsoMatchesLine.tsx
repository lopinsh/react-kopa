'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link, useRouter } from '@/i18n/routing';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import { CHIP } from './chip-styles';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { useChipFit } from '@/hooks/useChipFit';
import { discoveryHref } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';
import type { DiscoveryState } from '@/lib/types/discovery';

type Match = DiscoveryState['alsoMatches'][number];

const QUIET = 'bg-[color-mix(in_srgb,var(--c)_12%,var(--surface))] font-medium text-foreground ring-border hover:bg-tint';

/** What a chip does (AR-43): the theme or Veids in place of the word; place (and on Pasākumi the dates) stay. */
function Dot({ match }: { match: Match }) {
    return match.kind === 'theme' ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" /> : null;
}

function MatchChip({ match, href }: { match: Match; href?: string }) {
    const body = (
        <>
            <Dot match={match} />
            <span className="truncate">{match.title}</span>
            <span className="hidden text-[11px] text-foreground-muted md:inline">{match.count}</span>
        </>
    );
    const style = { ['--c' as string]: match.color };
    return href
        ? <Link href={href} scroll={false} style={style} className={clsx(CHIP, QUIET, 'shrink-0')}>{body}</Link>
        : <span style={style} className={clsx(CHIP, QUIET, 'shrink-0')}>{body}</span>;
}

/**
 * "Atbilst arī:" under the filter line when a word is chosen and no Tēma: the themes and Veidi the word also matches, on one line,
 * "+N" for the rest. A tap chooses that Tēma or Veids in place of the word. Counts from `md`, none on phones.
 */
export default function AlsoMatchesLine() {
    const t = useTranslations('discovery.search');
    const router = useRouter();
    const { alsoMatches: matches } = useDiscovery();
    const { params } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const picked = useRef<string | null>(null);
    const hrefOf = (m: Match) => discoveryHref(params, m.kind === 'theme' ? { q: '', category: m.slug, tags: [] } : { q: '', category: m.l1Slug, tags: [m.slug] });
    const { row, probe, fit } = useChipFit(matches.map((m) => m.title).join('|'), matches.length, 0, false);

    if (matches.length === 0) return null;
    const hidden = matches.length - fit;
    // The phone sheet closes as by Back first, then the pick is pushed (a push before that would be undone when the sheet takes its entry off).
    const close = () => {
        const href = picked.current;
        picked.current = null;
        pop.setOpen(false);
        if (href) router.push(href, { scroll: false });
    };
    const more = <span className={clsx(CHIP, 'shrink-0 bg-surface font-semibold text-foreground-muted ring-border')}>+{hidden || 99}</span>;

    return (
        <div data-ui={UI.alsoMatches} role="group" aria-label={t('alsoMatchesTitle')} className="-mt-1.5 mb-3 flex min-w-0 items-center gap-2 md:-mt-2 md:mb-4">
            <span className="shrink-0 text-xs text-foreground-muted">{t('alsoMatches')}</span>
            <div ref={row} className="relative flex min-w-0 flex-1 items-center gap-1.5">
                <div className="flex min-w-0 items-center gap-1.5 overflow-hidden py-0.5">
                    {matches.slice(0, fit).map((m) => <MatchChip key={`${m.kind}-${m.slug}`} match={m} href={hrefOf(m)} />)}
                </div>
                {hidden > 0 && (
                    <div ref={bindHost} className="relative shrink-0">
                        <button
                            type="button"
                            aria-label={t('moreMatches', { count: hidden })}
                            aria-expanded={pop.open}
                            aria-controls={pop.id}
                            onClick={pop.toggle}
                            className={clsx(CHIP, 'shrink-0 bg-surface font-semibold text-foreground-muted ring-border hover:bg-tint', pop.open && 'ring-primary')}
                        >
                            +{hidden}
                        </button>
                        <FilterPopover pop={pop} title={t('alsoMatchesTitle')} onClose={close}>
                            {matches.map((m) => (
                                <Link
                                    key={`${m.kind}-${m.slug}`}
                                    href={hrefOf(m)}
                                    scroll={false}
                                    style={{ ['--c' as string]: m.color }}
                                    onClick={(e) => {
                                        if (pop.desktop) { pop.setOpen(false); return; }
                                        e.preventDefault();
                                        picked.current = hrefOf(m);
                                        window.history.back();
                                    }}
                                    className="flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm hover:bg-tint md:min-h-9"
                                >
                                    <Dot match={m} />
                                    <span className="min-w-0 flex-1 truncate">{m.title}</span>
                                    <span className="text-xs text-foreground-muted">{m.count}</span>
                                </Link>
                            ))}
                        </FilterPopover>
                    </div>
                )}
                <div ref={probe} inert aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-1.5 whitespace-nowrap">
                    {matches.map((m) => <MatchChip key={`${m.kind}-${m.slug}`} match={m} />)}
                    {more}
                </div>
            </div>
        </div>
    );
}
