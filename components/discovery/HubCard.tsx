import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import HubCardBlock from './HubCardBlock';
import type { HubSummary } from '@/lib/services/hub-summary';

type Props = { hubs: HubSummary[]; l1Slug: string; locale: string; variant: 'card' | 'row' };

/** How the chosen Veidi relate (K-74): one, a parent with its own children, two others, or three and more. */
export function hubMode(hubs: HubSummary[]): 'one' | 'parentChild' | 'split' | 'list' {
    if (hubs.length === 1) return 'one';
    const parents = hubs.filter((h) => h.level === 2);
    if (parents.length === 1 && hubs.every((h) => h === parents[0] || h.parentSlug === parents[0].slug)) return 'parentChild';
    return hubs.length === 2 ? 'split' : 'list';
}

/**
 * The hub card, first in the board's grid when a Veids is chosen (K1-26, K-13, K-15): the size of a group card, tinted and edged apart from the groups (no tear-off, no picture).
 * One hub: the full block; parent and child: the parent's block with compact child rows; two others: split equally with a dashed divider; three or more: a list "N kopienas". Always one cell (K-12).
 * On phones (`row`) it is a block above the rows.
 */
export default async function HubCard({ hubs, l1Slug, locale, variant }: Props) {
    if (hubs.length === 0) return null;
    const t = await getTranslations({ locale, namespace: 'hub' });
    const mode = hubMode(hubs);
    const main = mode === 'parentChild' ? hubs.find((h) => h.level === 2) ?? hubs[0] : hubs[0];
    const kids = hubs.filter((h) => h !== main);
    const shell = 'card-note relative flex flex-col gap-3 rounded-2xl bg-tint p-4 line';
    const tone = { ['--c' as string]: hubs[0].accentColor };
    const box = variant === 'card' ? `${shell} h-full min-h-24` : `${shell} mb-4`;

    return (
        <section aria-label={t('card.label')} data-hub-card={mode} style={tone} className={box}>
            {mode === 'list' ? (
                <>
                    <p className="flex items-center gap-2 text-item text-foreground"><CategoryDisc slug={l1Slug} color={hubs[0].accentColor} size={36} />{t('card.list', { n: hubs.length })}</p>
                    <ul className="flex flex-col divide-y divide-dashed divide-border">
                        {hubs.map((h) => <li key={h.slug}><Link href={h.href} className="block py-2 text-item text-foreground">{t('name', { title: h.title })}</Link></li>)}
                    </ul>
                </>
            ) : mode === 'split' ? (
                <div className="grid flex-1 grid-cols-1 gap-3 [&>*+*]:border-t [&>*+*]:border-dashed [&>*+*]:border-border [&>*+*]:pt-3">
                    {hubs.map((h) => <div key={h.slug} className="relative"><HubCardBlock hub={h} l1Slug={l1Slug} locale={locale} compact /></div>)}
                </div>
            ) : (
                <>
                    <div className="relative"><HubCardBlock hub={main} l1Slug={l1Slug} locale={locale} /></div>
                    {kids.length > 0 && (
                        <ul className="flex flex-col divide-y divide-dashed divide-border border-t border-dashed border-border">
                            {kids.map((k) => (
                                <li key={k.slug}>
                                    <Link href={k.href} className="flex items-baseline justify-between gap-2 py-2 text-item text-foreground">
                                        <span className="min-w-0 truncate">{t('name', { title: k.title })}</span>
                                        <span className="shrink-0 text-meta text-foreground-muted">{t('memberLine', { members: k.stats.memberCount, groups: k.stats.groupCount })}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}
