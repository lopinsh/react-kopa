import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { HUB_OVERVIEW_CHIPS } from '@/lib/constants';
import { topicHref } from '@/lib/discovery-params';
import type { HubContext } from '@/lib/services/hub.service';

const CHIP = 'inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill line press bg-surface px-3 text-meta text-foreground hover:bg-tint';

/** Apakšveidi at the bottom of Pārskats (K-94, K-20): a few chips, each opening its own hub, then "+N" to the board with the Veids set. */
export default async function SubTopicChips({ hub, locale }: { hub: HubContext; locale: string }) {
    const t = await getTranslations({ locale, namespace: 'hub' });
    const shown = hub.subTopics.slice(0, HUB_OVERVIEW_CHIPS);
    const more = hub.subTopics.length - shown.length;
    return (
        <ul className="flex flex-wrap items-center gap-1.5">
            {shown.map((s) => (
                <li key={s.slug}>
                    <Link href={s.href} className={CHIP}>{t('name', { title: s.title })}<ChevronRight aria-hidden="true" className="size-3 shrink-0 text-foreground-muted" /></Link>
                </li>
            ))}
            {more > 0 && <li><Link href={topicHref(hub.l1Slug, hub.slug)} className={`${CHIP} underline underline-offset-2`}>{t('subTopics.more', { n: more })}</Link></li>}
        </ul>
    );
}
