'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cityLabel } from '@/lib/city-label';
import { topicHref } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import CategoryLine from '@/components/ui/CategoryLine';
import BannerName from './BannerName';
import GroupActions from './GroupActions';
import GroupPagesDrawer from './GroupPagesDrawer';

/**
 * The head of every group page (AR-47, AR-48, AR-70): 96 px from `md`, a 64 px bar on phones, one component for both.
 * The category tone area (tint or solid, as the look's tiles) and the category mark (C5: no background picture; the group's picture is on Informācija).
 */
export default function GroupBanner() {
    const t = useTranslations('group.frame');
    const tCities = useTranslations('cities');
    const g = useGroupContext();
    const city = cityLabel(tCities, g.city);
    const facts = [city, t('members', { count: g.memberCount }), g.isPrivate ? t('membersOnly') : ''].filter(Boolean);

    return (
        <div data-ui={UI.groupBanner} className="banner-tone relative isolate z-10 min-h-16 border-b border-border py-2 md:h-24 md:py-0">
            <div className="mx-auto flex h-full max-w-browse items-center gap-3 px-gutter md:gap-4">
                <GroupPagesDrawer />
                <span className="mark-surface grid size-9 shrink-0 place-items-center rounded-item md:size-11 md:rounded-[calc(var(--radius-item)+3px)]">
                    <CategoryIcon slug={g.category.l1Slug} aria-hidden className="size-5 md:size-6" />
                </span>
                <div className="min-w-0 flex-1">
                    <BannerName />
                    {g.lookingFor && <p className="truncate text-meta italic tile-ink">{g.lookingFor}</p>}
                    <p className={'flex items-center gap-1.5 text-meta tile-ink-muted md:hidden'}>
                        <span aria-hidden className={'size-2 shrink-0 rounded-full bg-current'} />
                        <span className="truncate"><Link href={topicHref(g.category.l1Slug)} className="hover:underline">{g.category.l1Title}</Link>{facts.map((f) => ` · ${f}`).join('')}</span>
                    </p>
                    <div className="hidden max-h-10 flex-wrap items-baseline gap-x-4 gap-y-0.5 overflow-hidden px-0.5 -mx-0.5 md:flex">
                        <CategoryLine onTone color="var(--accent)" category={g.category.l1Title} subCategories={g.category.subCategories} l1Slug={g.category.l1Slug} subSlugs={g.category.subCategorySlugs} />
                        <p className={'text-meta tile-ink-muted'}>{facts.join(' · ')}</p>
                    </div>
                </div>
                <GroupActions />
            </div>
        </div>
    );
}
