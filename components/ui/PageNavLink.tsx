'use client';

import type { LucideIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';

type Props = {
    href: string;
    icon: LucideIcon;
    label: string;
    current: boolean;
    /** A count chip at the right end ("9+" above 9); nothing for 0. */
    badge?: number;
    /** The count in the danger colour (open reports). */
    badgeDanger?: boolean;
    /** In a drawer the link takes over the drawer's history entry, so Back returns in one step. */
    replace?: boolean;
    /** A plain link that loads the page in full: a group's Informācija, whose address a soft click would open as a panel (R6). */
    full?: boolean;
};

/** The look of one row of a page menu: also the group menu's action rows. */
export const NAV_ROW = 'flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-body-sm text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/** One entry of a page menu (the own area's, a group's): icon, word, optional count; the open page is tinted. */
export default function PageNavLink({ href, icon: Icon, label, current, badge = 0, badgeDanger = false, replace, full = false }: Props) {
    const locale = useLocale();
    const className = clsx(
        NAV_ROW,
        current && 'bg-tint weight-strong'
    );
    const Tag = full ? 'a' : Link;
    return (
        <Tag
            href={full ? `/${locale}${href}` : href}
            replace={full ? undefined : replace}
            aria-current={current ? 'page' : undefined}
            className={className}
        >
            <Icon aria-hidden className="size-4 text-foreground-muted" />
            {label}
            {badge > 0 && (
                <span className={clsx('ml-auto rounded-pill px-2 text-tag', badgeDanger ? 'bg-danger/10 text-danger' : clsx('text-foreground-muted', current ? 'bg-surface' : 'bg-tint'))}>
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </Tag>
    );
}
