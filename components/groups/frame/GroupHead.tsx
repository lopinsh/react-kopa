'use client';

import type { ReactNode } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, MapPin, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { cityLabel } from '@/lib/city-label';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import CategoryLine from '@/components/ui/CategoryLine';
import HubPhoto from '@/components/ui/HubPhoto';
import HubPath from '@/components/hubs/frame/HubPath';
import BannerName from './BannerName';
import GroupActions from './GroupActions';
import GroupShare from './GroupShare';
import GroupPagesDrawer from './GroupPagesDrawer';

/**
 * The head of every group page (AR-47, AR-48, C5): a solid category-tone info tile on the page grid (`tone-fill`, text in `--on-cat`).
 * Full on Informācija (name, category, facts, then a divider and a foot row: tagline left, the role button right; the group picture beside it);
 * compact on every other page (one row, no tagline). `photo` is the head photo (K-151): the group's own picture, else its closest hub's, else none (plain tone), drawn as the hub head's duotone on every page. `picture` is the server-rendered `HeadPicture` strip, shown under the full tile below 1024 (the box is in the side column from 1024). The path is the closest hub's (K-152); the actions are the role button and Dalīties (K-153). `variant` forces one (the handbook demo).
 */
export default function GroupHead({ picture, photo, variant }: { picture?: ReactNode; photo?: string; variant?: 'full' | 'compact' }) {
    const t = useTranslations('group.frame');
    const tCities = useTranslations('cities');
    const tHub = useTranslations('hub');
    const g = useGroupContext();
    const segment = useSelectedLayoutSegment();
    const full = (variant ?? (segment === null ? 'full' : 'compact')) === 'full';
    const canShare = segment !== 'settings';
    const actions = <div className="flex items-center gap-1 max-md:[&>:first-child]:flex-1"><GroupActions phone={full ? 'full' : 'round'} />{canShare && <GroupShare />}</div>;

    const mark = (
        <span className="mark-on-tone grid size-10 shrink-0 place-items-center rounded-item lg:col-start-1 lg:row-start-1 md:size-12">
            <CategoryIcon slug={g.category.l1Slug} aria-hidden className="size-5 md:size-6" />
        </span>
    );
    const meta = (
        <div className="mt-1.5 grid gap-1">
            {g.hub
                ? <HubPath path={g.hub.path} label={tHub('frame.pathLabel')} />
                : <CategoryLine onTone color="var(--accent)" category={g.category.l1Title} subCategories={g.category.subCategories} l1Slug={g.category.l1Slug} subSlugs={g.category.subCategorySlugs} linkTo="hub" />}
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta [&_svg]:size-4 [&_svg]:shrink-0 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5">
                <span><MapPin aria-hidden />{g.cityHref ? <Link href={g.cityHref} className="hover:underline">{cityLabel(tCities, g.city)}</Link> : cityLabel(tCities, g.city)}</span>
                <span><Users aria-hidden />{t('members', { count: g.memberCount })}</span>
                {g.isPrivate && <span><Lock aria-hidden />{t('membersOnly')}</span>}
            </p>
        </div>
    );

    return (
        <div className="mx-auto grid max-w-browse gap-3 px-gutter pt-3 md:pt-5">
            <div
                data-ui={UI.groupBanner}
                className={clsx(
                    'tone-fill frame relative isolate grid min-w-0 rounded-2xl p-4 md:gap-x-4',
                    full ? 'grid-cols-[auto_auto_1fr] items-center gap-y-3 md:p-6 lg:grid-cols-[auto_1fr] lg:items-start lg:p-7' : 'grid-cols-[auto_auto_1fr] items-center gap-y-2 md:px-6 md:py-5 lg:grid-cols-[auto_1fr_auto]',
                )}
            >
                {photo && <HubPhoto src={photo} />}
                <GroupPagesDrawer onTone />
                {mark}
                <div className="col-span-3 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-1">
                    <BannerName compact={!full} />
                    {meta}
                </div>
                {!full && canShare && <div className="col-start-3 row-start-1 justify-self-end lg:col-start-3 lg:self-center">{actions}</div>}
                {full && (
                    <div className="col-span-3 flex min-w-0 flex-col gap-3 lg:col-span-2 md:flex-row md:items-center md:justify-between md:gap-4 md:border-t md:border-[color-mix(in_srgb,var(--on-cat)_30%,transparent)] md:pt-4">
                        {g.lookingFor && <p className="min-w-0 text-body-sm md:text-body">{g.lookingFor}</p>}
                        {canShare && <div className="max-md:w-full md:ml-auto md:shrink-0">{actions}</div>}
                    </div>
                )}
            </div>
            {full && picture && <div className="lg:hidden">{picture}</div>}
        </div>
    );
}
