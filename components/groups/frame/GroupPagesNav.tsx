'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CalendarDays, FileText, List, Settings, Users, type LucideIcon } from 'lucide-react';
import { UI } from '@/lib/constants';
import { pageForSegment, type GroupPageKey } from '@/lib/group-pages';
import { useGroupContext } from '@/components/providers/GroupProvider';
import PageNavLink from '@/components/ui/PageNavLink';
import GroupMenuActions from './GroupMenuActions';

const ICONS: Record<GroupPageKey, LucideIcon> = { info: FileText, announcements: List, events: CalendarDays, members: Users, settings: Settings };

/**
 * A group's pages (AR-47): down the left from `lg` (1024) (`side`, sticky like the own area's), in the ☰ drawer below that (`drawer`).
 * The list comes from the service through the context; hidden pages are not in it. `active` is for the UI-elements demo.
 */
export default function GroupPagesNav({ variant, active }: { variant: 'side' | 'drawer'; active?: GroupPageKey }) {
    const t = useTranslations('group');
    const { pages } = useGroupContext();
    const segment = useSelectedLayoutSegment();
    const current = active ?? pageForSegment(segment);

    return (
        <div className={variant === 'side' ? 'sticky top-5 hidden self-start lg:block' : 'pt-2'}>
        <nav data-ui={UI.groupMenu} aria-label={t('frame.pagesLabel')} className="flex flex-col gap-0.5">
            {pages.map(({ key, href, badge }) => (
                <PageNavLink key={key} href={href} icon={ICONS[key]} label={t(`pages.${key}`)} current={current === key} badge={badge} replace={variant === 'drawer'} full={key === 'info'} />
            ))}
        </nav>
        <GroupMenuActions />
        </div>
    );
}
