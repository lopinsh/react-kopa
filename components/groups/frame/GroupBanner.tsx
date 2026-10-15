'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { cityLabel } from '@/lib/city-label';
import { topicHref } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import CategoryLine from '@/components/ui/CategoryLine';
import GroupActions from './GroupActions';
import GroupPagesDrawer from './GroupPagesDrawer';

/**
 * The head of every group page (AR-47, AR-48, AR-70): 96 px from `md`, a 64 px bar on phones, one component for both.
 * With the group's picture: the picture under a dark shade, white text. Without: the category tint and the category mark.
 */
export default function GroupBanner() {
    const t = useTranslations('group.frame');
    const tCities = useTranslations('cities');
    const g = useGroupContext();
    const onImage = g.image !== null;
    const quiet = onImage ? 'text-on-image' : 'text-foreground-muted';
    const city = cityLabel(tCities, g.city);
    const facts = [city, t('members', { count: g.memberCount }), g.isPrivate ? t('membersOnly') : ''].filter(Boolean);

    return (
        <div data-ui={UI.groupBanner} data-image={onImage ? '' : undefined} className={clsx('relative isolate z-10 h-16 md:h-24', onImage ? 'text-on-image' : 'banner-tint border-b border-border text-foreground')}>
            {g.image && (
                <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                    <Image src={g.image} alt="" fill sizes="100vw" unoptimized loading="eager" fetchPriority="high" className="object-cover" />
                    <span className="image-shade absolute inset-0" />
                </div>
            )}
            <div className="mx-auto flex h-full max-w-6xl items-center gap-2.5 px-3 md:gap-4 md:px-[22px]">
                <GroupPagesDrawer />
                {!onImage && (
                    <span className="mark-tint grid size-[34px] shrink-0 place-items-center rounded-[10px] md:size-11 md:rounded-[13px]">
                        <CategoryIcon slug={g.category.l1Slug} aria-hidden className="size-[18px] md:size-6" />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <h1 className="truncate font-heading text-[15px] font-semibold leading-tight md:text-xl">{g.name}</h1>
                    <p className={clsx('flex items-center gap-1.5 text-xs md:hidden', quiet)}>
                        <span aria-hidden className={clsx('size-2 shrink-0 rounded-full bg-[var(--accent)]', onImage && 'ring-[1.5px] ring-on-image')} />
                        <span className="truncate"><Link href={topicHref(g.category.l1Slug)} className="hover:underline">{g.category.l1Title}</Link>{facts.map((f) => ` · ${f}`).join('')}</span>
                    </p>
                    <div className="hidden max-h-10 flex-wrap items-baseline gap-x-3.5 gap-y-0.5 overflow-hidden px-0.5 -mx-0.5 md:flex">
                        <CategoryLine color="var(--accent)" category={g.category.l1Title} subCategories={g.category.subCategories} l1Slug={g.category.l1Slug} subSlugs={g.category.subCategorySlugs} onImage={onImage} />
                        <p className={clsx('text-[13px]', quiet)}>{facts.join(' · ')}</p>
                    </div>
                    {g.lookingFor && <p className={clsx('hidden truncate text-[13px] italic md:block', onImage ? 'text-on-image' : 'text-primary')}>{g.lookingFor}</p>}
                </div>
                <GroupActions />
            </div>
        </div>
    );
}
