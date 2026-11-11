'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays, LayoutDashboard, StickyNote, Users, type LucideIcon } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { UI, type HubPageKey } from '@/lib/constants';
import { hubPageForPath, hubPages } from '@/lib/hub-pages';
import { useHubContext } from '@/components/providers/HubProvider';
import PageNavLink from '@/components/ui/PageNavLink';
import HubPlaceButton from './HubPlaceButton';

const ICONS: Record<HubPageKey, LucideIcon> = { overview: LayoutDashboard, groups: Users, events: CalendarDays, messages: StickyNote };

/**
 * The pages of a hub or city hub (K1-04, K3-17) under `base`: down the left from `lg` (`side`, sticky), in the ☰ drawer below that (`drawer`).
 * `children` ends the menu (a hub's Kur place on Pārskats, K1-06).
 */
export function PagesMenu({ base, variant, children }: { base: string; variant: 'side' | 'drawer'; children?: ReactNode }) {
    const t = useTranslations('hub');
    const pathname = usePathname();
    const current = hubPageForPath(pathname, base);

    return (
        <div className={variant === 'side' ? 'sticky top-5 hidden self-start lg:block' : 'pt-2'}>
            <nav data-ui={UI.hubMenu} aria-label={t('frame.pagesLabel')} className="flex flex-col gap-0.5">
                {hubPages(base).map(({ key, href }) => (
                    <PageNavLink key={key} href={href} icon={ICONS[key]} label={t(`pages.${key}`)} current={current === key} replace={variant === 'drawer'} />
                ))}
            </nav>
            {children}
        </div>
    );
}

/** A hub's menu: on Pārskats the Kur place is its last item (K1-06); on the other pages it ends the tab bar. */
export default function HubPagesNav({ variant }: { variant: 'side' | 'drawer' }) {
    const hub = useHubContext();
    const pathname = usePathname();
    return (
        <PagesMenu base={hub.href} variant={variant}>
            {hubPageForPath(pathname, hub.href) === 'overview' && <div className="mt-3 px-3"><HubPlaceButton /></div>}
        </PagesMenu>
    );
}
