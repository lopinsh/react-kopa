'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { UI } from '@/lib/constants';
import { useHubContext } from '@/components/providers/HubProvider';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import HubActions from './HubActions';
import HubPagesDrawer from './HubPagesDrawer';
import HubPath from './HubPath';

/**
 * The head of every hub page (layout B like a group): a solid category-tone tile (`tone-fill`, text in `--on-cat`) with the mark, the path, the name,
 * the member line and the two actions. The ☰ drawer sits in the tile below 1024. Its `data-ui` marker is what the sticky bar watches.
 */
export default function HubHead() {
    const t = useTranslations('hub');
    const hub = useHubContext();

    return (
        <div className="mx-auto px-gutter pt-3 md:pt-5">
            <div data-ui={UI.hubBanner} className="tone-fill frame relative grid min-w-0 grid-cols-[auto_auto_1fr] items-center gap-y-3 rounded-2xl p-4 md:gap-x-4 md:p-6 lg:grid-cols-[auto_1fr_auto]">
                <HubPagesDrawer onTone />
                <span className="mark-on-tone grid size-10 shrink-0 place-items-center rounded-item md:size-12 lg:col-start-1 lg:row-start-1">
                    <CategoryIcon slug={hub.l1Slug} aria-hidden className="size-5 md:size-6" />
                </span>
                <div className="col-span-3 grid min-w-0 gap-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
                    <HubPath path={hub.path} label={t('frame.pathLabel')} />
                    <h1 className="line-clamp-2 break-words py-[0.2em] -my-[0.2em] text-title">{hub.name}</h1>
                    <p className="inline-flex items-center gap-1.5 text-meta [&_svg]:size-4 [&_svg]:shrink-0">
                        <Users aria-hidden />
                        {t('memberLine', { members: hub.stats.memberCount, groups: hub.stats.groupCount })}
                    </p>
                </div>
                <div className="col-span-3 justify-self-start lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:justify-self-end">
                    <HubActions />
                </div>
            </div>
        </div>
    );
}
