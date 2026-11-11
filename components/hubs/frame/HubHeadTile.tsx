'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { UI } from '@/lib/constants';
import type { HubPathPart } from '@/lib/services/hub.service';
import HubPath from './HubPath';

/**
 * The head tile of every hub page (layout B like a group): a solid tone tile (`tone-fill`, text in `--on-cat`) with the mark, the path, the name,
 * the member line and the two actions. The ☰ drawer sits in the tile below 1024. Its `data-ui` marker is what the sticky bar watches.
 * A hub and a city hub fill it from their own contexts.
 */
export default function HubHeadTile({ path, name, icon, drawer, members, groups, aside, actions, photo }: {
    path: HubPathPart[];
    name: string;
    icon: ReactNode;
    drawer: ReactNode;
    members: number;
    groups: number;
    /** After the member line (a topic x city hub's parent city link). */
    aside?: ReactNode;
    actions: ReactNode;
    /** The hub's photo (L3 D10), drawn as a duotone in the tile's Tēma colour: the tile keeps its height. */
    photo?: string;
}) {
    const t = useTranslations('hub');

    return (
        <div className="mx-auto px-gutter pt-3 md:pt-5">
            <div data-ui={UI.hubBanner} className={`tone-fill frame relative isolate grid min-w-0 grid-cols-[auto_auto_1fr] items-center gap-y-3 rounded-2xl p-4 md:gap-x-4 md:p-6 lg:grid-cols-[auto_1fr_auto]`}>
                {photo && (
                    <span aria-hidden className="absolute inset-0 -z-10 isolate overflow-hidden rounded-2xl bg-(--accent)">
                        <Image src={photo} alt="" fill loading="eager" sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover grayscale brightness-(--hub-photo-dim) contrast-(--hub-photo-contrast) mix-blend-luminosity opacity-(--hub-photo-opacity)" />
                        <span className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_70%,transparent)_30%,transparent_100%)]" />
                    </span>
                )}
                {drawer}
                <span className="mark-on-tone grid size-10 shrink-0 place-items-center rounded-item md:size-12 lg:col-start-1 lg:row-start-1">{icon}</span>
                <div className="col-span-3 grid min-w-0 gap-1 lg:col-span-1 lg:col-start-2 lg:row-start-1">
                    {path.length > 0 && <HubPath path={path} label={t('frame.pathLabel')} />}
                    <h1 className="line-clamp-2 break-words py-[0.2em] -my-[0.2em] text-title">{name}</h1>
                    <p className="inline-flex flex-wrap items-center gap-x-1.5 text-meta [&_svg]:size-4 [&_svg]:shrink-0">
                        <Users aria-hidden />
                        {t('memberLine', { members, groups })}
                        {aside}
                    </p>
                </div>
                <div className="col-span-3 justify-self-start lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:justify-self-end">{actions}</div>
            </div>
        </div>
    );
}
