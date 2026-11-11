'use client';

import { useTranslations } from 'next-intl';
import { useHubContext } from '@/components/providers/HubProvider';
import { Link } from '@/i18n/routing';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import HubActions from './HubActions';
import HubHeadTile from './HubHeadTile';
import HubPagesDrawer from './HubPagesDrawer';

/** The head of a hub page: its tile with the Tēma mark, the path, the member line (a topic x city hub adds its city's link) and the actions, with the photo blended into the tile when the hub has one (L3 D10; the credit is on Pārskats, D11). */
export default function HubHead() {
    const t = useTranslations('hub');
    const hub = useHubContext();
    return (
        <HubHeadTile
            path={hub.path}
            name={hub.name}
            icon={<CategoryIcon slug={hub.l1Slug} aria-hidden className="size-5 md:size-6" />}
            drawer={<HubPagesDrawer onTone />}
            members={hub.stats.memberCount}
            groups={hub.stats.groupCount}
            aside={hub.local && <><span aria-hidden>·</span><Link href={hub.local.cityHref} className="underline underline-offset-2">{t('cityParent', { city: hub.local.cityName })}</Link></>}
            actions={<HubActions />}
            photo={hub.image ?? undefined}
        />
    );
}
