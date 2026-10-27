'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, MapPin, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { cityLabel } from '@/lib/city-label';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import CategoryLine from '@/components/ui/CategoryLine';
import BannerName from './BannerName';
import GroupActions from './GroupActions';
import GroupPagesDrawer from './GroupPagesDrawer';

/**
 * The head of every group page (AR-47, AR-48, C5): a solid category-tone info tile on the page grid (`tone-fill`, text in `--on-cat`).
 * Full on Informācija (name, category, facts, then a divider and a foot row: tagline left, the role button right; the group picture beside it);
 * compact on every other page (one row, no tagline). `picture` is the server-rendered `HeadPicture`, shown on the full tile only. `variant` forces one (the handbook demo).
 */
export default function GroupHead({ picture, variant }: { picture?: ReactNode; variant?: 'full' | 'compact' }) {
    const t = useTranslations('group.frame');
    const tCities = useTranslations('cities');
    const g = useGroupContext();
    const segment = useSelectedLayoutSegment();
    const full = (variant ?? (segment === null ? 'full' : 'compact')) === 'full';
    const withPicture = full && !!picture;
    const { role, isMember, isAdmin } = g.user;
    const hasAction = segment !== 'settings' && (isAdmin || role === 'PENDING' || (!isMember && !g.moderation.hidden));

    const mark = (
        <span className="mark-on-tone grid size-10 shrink-0 place-items-center rounded-item md:col-start-1 md:row-start-1 md:size-12">
            <CategoryIcon slug={g.category.l1Slug} aria-hidden className="size-5 md:size-6" />
        </span>
    );
    const meta = (
        <div className="mt-1.5 grid gap-1">
            <CategoryLine onTone color="var(--accent)" category={g.category.l1Title} subCategories={g.category.subCategories} l1Slug={g.category.l1Slug} subSlugs={g.category.subCategorySlugs} />
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta [&_svg]:size-4 [&_svg]:shrink-0 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5">
                <span><MapPin aria-hidden />{cityLabel(tCities, g.city)}</span>
                <span><Users aria-hidden />{t('members', { count: g.memberCount })}</span>
                {g.isPrivate && <span><Lock aria-hidden />{t('membersOnly')}</span>}
            </p>
        </div>
    );

    return (
        <div className={clsx('mx-auto grid max-w-browse gap-3 px-gutter pt-3 md:gap-x-6 md:pt-5', withPicture && 'md:grid-cols-[minmax(0,1fr)_30%] lg:grid-cols-[190px_minmax(0,1fr)_var(--spacing-aside)]')}>
            <div
                data-ui={UI.groupBanner}
                className={clsx(
                    'tone-fill frame relative grid min-w-0 rounded-2xl p-4 md:gap-x-4',
                    full ? 'grid-cols-[auto_auto_1fr] items-center gap-y-3 md:grid-cols-[auto_1fr] md:items-start md:p-6 lg:p-7' : 'grid-cols-[auto_auto_1fr] items-center gap-y-2 md:grid-cols-[auto_1fr_auto] md:px-6 md:py-5',
                    withPicture && 'lg:col-span-2',
                )}
            >
                <GroupPagesDrawer onTone />
                {mark}
                <div className="col-span-3 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
                    <BannerName compact={!full} />
                    {meta}
                </div>
                {!full && hasAction && (
                    <div className="col-start-3 row-start-1 justify-self-end md:col-start-3 md:self-center">
                        <GroupActions phone="round" />
                    </div>
                )}
                {full && (g.lookingFor || hasAction) && (
                    <div className="col-span-3 flex min-w-0 flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between md:gap-4 md:border-t md:border-[color-mix(in_srgb,var(--on-cat)_30%,transparent)] md:pt-4">
                        {g.lookingFor && <p className="min-w-0 text-body-sm md:text-body">{g.lookingFor}</p>}
                        {hasAction && <div className="max-md:w-full md:ml-auto md:shrink-0"><GroupActions phone="full" /></div>}
                    </div>
                )}
            </div>
            {withPicture && picture}
        </div>
    );
}
