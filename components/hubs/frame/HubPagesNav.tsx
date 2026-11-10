'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CalendarDays, LayoutDashboard, Users, type LucideIcon } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { UI, type HubPageKey } from '@/lib/constants';
import { parseCities } from '@/lib/discovery-params';
import { hubPageForPath, hubPages } from '@/lib/hub-pages';
import { useHubContext } from '@/components/providers/HubProvider';
import PageNavLink from '@/components/ui/PageNavLink';
import HubPlaceButton from './HubPlaceButton';

const ICONS: Record<HubPageKey, LucideIcon> = { overview: LayoutDashboard, groups: Users, events: CalendarDays };

/**
 * A hub's pages (K1-04): down the left from `lg` (`side`, sticky), in the ☰ drawer below that (`drawer`). On Pārskats the Kur place is the last item (K1-06);
 * on the other pages it ends the tab bar.
 */
export default function HubPagesNav({ variant }: { variant: 'side' | 'drawer' }) {
    const t = useTranslations('hub');
    const hub = useHubContext();
    const pathname = usePathname();
    const search = useSearchParams();
    const current = hubPageForPath(pathname, hub.href);

    return (
        <div className={variant === 'side' ? 'sticky top-5 hidden self-start lg:block' : 'pt-2'}>
            <nav data-ui={UI.hubMenu} aria-label={t('frame.pagesLabel')} className="flex flex-col gap-0.5">
                {hubPages(hub.href, parseCities(search.get('city'))).map(({ key, href }) => (
                    <PageNavLink key={key} href={href} icon={ICONS[key]} label={t(`pages.${key}`)} current={current === key} replace={variant === 'drawer'} />
                ))}
            </nav>
            {current === 'overview' && <div className="mt-3 px-3"><HubPlaceButton /></div>}
        </div>
    );
}
