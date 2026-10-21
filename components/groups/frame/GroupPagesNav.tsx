'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { CalendarDays, FileText, List, Settings, Users, type LucideIcon } from 'lucide-react';
import { UI } from '@/lib/constants';
import { pageForSegment, type GroupPageKey } from '@/lib/group-pages';
import { useGroupContext } from '@/components/providers/GroupProvider';
import PageNavLink from '@/components/ui/PageNavLink';

const ICONS: Record<GroupPageKey, LucideIcon> = { info: FileText, announcements: List, events: CalendarDays, members: Users, settings: Settings };

/**
 * A group's pages (AR-47): down the left from `md` (`side`, sticky like the own area's), in the ☰ drawer on phones (`drawer`).
 * The list comes from the service through the context; hidden pages are not in it. `active` is for the UI-elements demo.
 */
export default function GroupPagesNav({ variant, active }: { variant: 'side' | 'drawer'; active?: GroupPageKey }) {
    const t = useTranslations('group');
    const { pages } = useGroupContext();
    const segment = useSelectedLayoutSegment();
    const current = active ?? pageForSegment(segment);

    return (
        <nav data-ui={UI.groupMenu} aria-label={t('frame.pagesLabel')} className={clsx('flex-col gap-0.5', variant === 'side' ? 'sticky top-[calc(var(--spacing-header)+1.25rem)] hidden self-start md:flex' : 'flex pt-2')}>
            {pages.map(({ key, href, badge }) => (
                <PageNavLink key={key} href={href} icon={ICONS[key]} label={t(`pages.${key}`)} current={current === key} badge={badge} replace={variant === 'drawer'} full={key === 'info'} />
            ))}
        </nav>
    );
}
