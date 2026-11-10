'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import PageNavLink from '@/components/ui/PageNavLink';
import { UI } from '@/lib/constants';
import { useAdminFrame, useOptionalAdminFrame } from './AdminFrameProvider';
import AdminBadge from './AdminBadge';
import type { AdminNavItem } from '@/lib/constants/adminNav';

export type AdminPart = { id: string; href: string; label: string; flagged?: boolean };

/** The parts of an admin page: Design's `?part=`, the Handbook's chapters. Indented under the page in the drawer, the sidebar's tabs on `frame` pages. Empty outside the frame. */
export function useAdminParts(item: AdminNavItem | null): AdminPart[] {
    const t = useTranslations('admin.nav');
    const frame = useOptionalAdminFrame();
    if (!item || !frame) return [];
    const { chapters, flaggedParts } = frame;
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

/** The open section's pages. `row`: a tab row under the sections from `lg` (AF-01), none for a one-page section; `drawer`: the phone drawer's list, the open page's parts indented under it. */
export default function AdminPagesNav({ variant }: { variant: 'row' | 'drawer' }) {
    const t = useTranslations('admin.nav');
    const { location, counts } = useAdminFrame();
    if (!location.section) return null;
    if (variant === 'row') {
        if (location.section.items.length <= 1) return null;
        return (
            <nav data-ui={UI.tabs} aria-label={t('pagesLabel')} className="hidden border-b border-border lg:block">
                <ul className="container mx-auto flex gap-1 overflow-x-auto px-4">
                    {location.section.items.map((item) => {
                        const on = location.item?.id === item.id;
                        const Icon = item.icon;
                        const badge = item.badge ? counts[item.badge] : 0;
                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    aria-current={on ? 'page' : undefined}
                                    className={clsx(
                                        'flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
                                        on ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'
                                    )}
                                >
                                    <Icon aria-hidden className="size-4" />
                                    {t(item.id)}
                                    <AdminBadge count={badge} danger={item.badge === 'reports'} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }
    return (
        <nav aria-label={t('pagesLabel')} className="flex flex-col gap-0.5 pt-1">
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
                            replace
                        />
                        {open && <Parts item={item} part={location.part} replace />}
                    </div>
                );
            })}
        </nav>
    );
}
