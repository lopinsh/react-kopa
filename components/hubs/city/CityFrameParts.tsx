'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Plus, Share2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCityHubContext } from '@/components/providers/CityHubProvider';
import { useShareLink } from '@/hooks/useShareLink';
import { buttonClass, iconButtonClass } from '@/components/ui/Button';
import HubHeadTile from '@/components/hubs/frame/HubHeadTile';
import { PagesMenu } from '@/components/hubs/frame/HubPagesNav';
import PagesDrawer from '@/components/hubs/frame/PagesDrawer';
import PagesStickyBar from '@/components/hubs/frame/PagesStickyBar';

/** The city hub's pages: Pārskats, Grupas, Pasākumi, Ziņas, no Kur (K-10, K-133). */
export function CityPagesNav({ variant }: { variant: 'side' | 'drawer' }) {
    return <PagesMenu base={useCityHubContext().href} variant={variant} />;
}

function CityDrawer({ onTone = false }: { onTone?: boolean }) {
    const city = useCityHubContext();
    return <PagesDrawer onTone={onTone} name={city.name} icon={<MapPin aria-hidden className="size-5" />} nav={<CityPagesNav variant="drawer" />} />;
}

export function CityStickyBar() {
    return <PagesStickyBar name={useCityHubContext().name} drawer={<CityDrawer />} />;
}

/** The head of the city hub: no path (one part would repeat the title, K3-17); Izveidot grupu and Dalīties. */
export function CityHead() {
    const t = useTranslations('hub.actions');
    const city = useCityHubContext();
    const share = useShareLink();
    return (
        <HubHeadTile
            path={[]}
            name={city.name}
            icon={<MapPin aria-hidden className="size-5 md:size-6" />}
            drawer={<CityDrawer onTone />}
            members={city.stats.memberCount}
            groups={city.stats.groupCount}
            actions={
                <div className="flex items-center gap-1">
                    <Link href="/create" className={buttonClass('onTone', 'px-4')}><Plus aria-hidden className="size-4" />{t('createGroup')}</Link>
                    <button type="button" onClick={() => share({ title: city.name, url: window.location.href })} aria-label={t('share')} className={iconButtonClass('onToneGhost', 'md', 'md:w-auto md:gap-1.5 md:px-3 md:text-button-sm')}>
                        <Share2 aria-hidden className="size-4" />
                        <span className="max-md:sr-only">{t('share')}</span>
                    </button>
                </div>
            }
        />
    );
}
