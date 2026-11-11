import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { MapPin } from 'lucide-react';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import type { HubSummary } from '@/lib/services/hub-summary';

const CHIP = 'inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-pill line press bg-surface px-3 text-meta text-foreground hover:bg-tint';

/** The round mark of a hub: the Tēma's icon, or a pin for the city hub. */
export function HubDisc({ hub, l1Slug, size }: { hub: HubSummary; l1Slug: string; size: number }) {
    if (hub.kind === 'topic') return <CategoryDisc slug={l1Slug} color={hub.accentColor} size={size} />;
    return (
        // ui-allow: a disc whose size comes from the size prop
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-surface text-foreground" style={{ width: size, height: size }}>
            <MapPin aria-hidden="true" size={Math.round((size * 15) / 26)} />
        </span>
    );
}

/** "Kopiena Galda spēles", or "Kopiena Galda spēles · Jelgava" for an open topic x city hub. */
export function hubLabel(t: (key: 'name' | 'localName', values: Record<string, string>) => string, hub: HubSummary): string {
    const name = t('name', { title: hub.title });
    return hub.cityName ? t('localName', { name, city: hub.cityName }) : name;
}

/** One hub inside the card: the round icon, the name as the link, "N dalībnieki M grupās", the next public event or the last activity, up to three sub-veidi chips and "+N" (K-75). `compact` is the smaller half of a split. */
export default async function HubCardBlock({ hub, l1Slug, locale, compact = false }: { hub: HubSummary; l1Slug: string; locale: string; compact?: boolean }) {
    const t = await getTranslations({ locale, namespace: 'hub' });
    const format = await getFormatter({ locale });
    const now = new Date();
    const when = hub.nextEvent
        ? t('card.nextEvent', { title: hub.nextEvent.title, date: format.dateTime(hub.nextEvent.startsAt, { day: 'numeric', month: 'short' }) })
        : hub.lastActivityAt
            ? t('card.lastActivity', { when: format.relativeTime(hub.lastActivityAt, { now: hub.lastActivityAt > now ? hub.lastActivityAt : now }) })
            : t('card.noActivity');
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
                <HubDisc hub={hub} l1Slug={l1Slug} size={compact ? 28 : 36} />
                <Link href={hub.href} className={`min-w-0 text-item text-foreground after:absolute after:inset-0 ${compact ? 'truncate' : 'line-clamp-2'}`}>{hubLabel(t, hub)}</Link>
            </div>
            <p className="text-meta text-foreground-muted">{t('memberLine', { members: hub.stats.memberCount, groups: hub.stats.groupCount })}</p>
            <p className="line-clamp-2 text-meta text-foreground">{when}</p>
            {hub.subTopics.length > 0 && (
                <ul className="relative z-10 flex flex-wrap items-center gap-1.5">
                    {hub.subTopics.map((s) => <li key={s.slug}><Link href={s.href} className={CHIP}>{s.title}</Link></li>)}
                    {hub.moreCount > 0 && <li><Link href={hub.href} className={`${CHIP} underline underline-offset-2`}>{t('subTopics.more', { n: hub.moreCount })}</Link></li>}
                </ul>
            )}
        </div>
    );
}
