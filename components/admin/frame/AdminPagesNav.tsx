'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import PageNavLink from '@/components/ui/PageNavLink';
import { useAdminFrame } from './AdminFrameProvider';
import type { AdminNavItem } from '@/lib/constants/adminNav';

export type AdminPart = { id: string; href: string; label: string; flagged?: boolean };

/** The parts of an admin page, shown indented under it while it is open: Design's `?part=`, the Handbook's chapters. */
export function useAdminParts(item: AdminNavItem | null): AdminPart[] {
    const t = useTranslations('admin.nav');
    const { chapters, flaggedParts } = useAdminFrame();
    if (!item) return [];
    if (item.id === 'design') return (item.parts ?? []).map((p) => ({ id: p, href: `${item.href}?part=${p}`, label: t(`parts.${p}`), flagged: flaggedParts.includes(p) }));
    if (item.id === 'handbook') {
        return [
            ...chapters.map((c) => ({ id: c.slug, href: `${item.href}/${c.slug}`, label: c.title })),
            { id: 'ui-elements', href: `${item.href}/ui-elements`, label: t('uiElements') },
        ];
    }
    return [];
}

function Parts({ item, part, replace }: { item: AdminNavItem; part: string | null; replace?: boolean }) {
    const parts = useAdminParts(item);
    const td = useTranslations('admin.design');
    if (parts.length === 0) return null;
    return (
        <ul className="my-0.5 ml-5 space-y-0.5 border-l border-border pl-2">
            {parts.map((p) => (
                <li key={p.id}>
                    <Link
                        href={p.href}
                        scroll={item.id === 'design' ? false : undefined}
                        replace={replace}
                        aria-current={p.id === part ? 'page' : undefined}
                        className={clsx(
                            'block rounded-lg px-3 py-1.5 text-body-sm hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            p.id === part ? 'bg-tint weight-strong text-foreground' : 'text-foreground-muted'
                        )}
                    >
                        {p.label}
                        {p.flagged && (
                            <>
                                <span aria-hidden="true" className="ml-1.5 inline-block size-1.5 rounded-full bg-warning align-middle" />
                                <span className="sr-only">{td('contrast.partHasIssues')}</span>
                            </>
                        )}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

/** The open section's pages, down the left (AR-21): no title, the open page tinted, its parts indented under it. */
export default function AdminPagesNav({ variant }: { variant: 'side' | 'drawer' }) {
    const t = useTranslations('admin.nav');
    const { location, counts } = useAdminFrame();
    if (!location.section) return null;
    return (
        <nav aria-label={t('pagesLabel')} className={clsx('flex-col gap-0.5', variant === 'side' ? 'sticky top-14 hidden self-start lg:flex' : 'flex pt-1')}>
            {location.section.items.map((item) => {
                const open = location.item?.id === item.id;
                return (
                    <div key={item.id}>
                        <PageNavLink
                            href={item.href}
                            icon={item.icon}
                            label={t(item.id)}
                            current={open && (!item.parts && item.id !== 'handbook' || location.part === null)}
                            badge={item.badge ? counts[item.badge] : 0}
                            badgeDanger={item.badge === 'reports'}
                            replace={variant === 'drawer'}
                        />
                        {open && <Parts item={item} part={location.part} replace={variant === 'drawer'} />}
                    </div>
                );
            })}
        </nav>
    );
}
