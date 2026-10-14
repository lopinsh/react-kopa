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
    /** In a drawer the link takes over the drawer's history entry, so Back returns in one step. */
    replace?: boolean;
    /** A plain link that loads the page in full: a group's Informācija, whose address a soft click would open as a panel (R6). */
    full?: boolean;
};

/** One entry of a page menu (the own area's, a group's): icon, word, optional count; the open page is tinted. */
export default function PageNavLink({ href, icon: Icon, label, current, badge = 0, replace, full = false }: Props) {
    const locale = useLocale();
    const className = clsx(
        'flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-sm text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        current && 'bg-tint font-semibold'
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
                <span className={clsx('ml-auto rounded-full px-2 text-[11px] font-semibold text-foreground-muted', current ? 'bg-surface' : 'bg-tint')}>
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </Tag>
    );
}
