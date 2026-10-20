'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { sectionBadge } from '@/lib/admin-nav';
import { useAdminFrame } from './AdminFrameProvider';
import AdminBadge from './AdminBadge';

/** The five sections across, sticky at the top of the shell's scroller; from `sm` (phones use the drawer). Opening one goes to its first page. */
export default function AdminSections() {
    const t = useTranslations('admin.nav');
    const { sections, counts, location } = useAdminFrame();
    return (
        <nav data-ui={UI.tabs} aria-label={t('sectionsLabel')} className="sticky top-0 z-30 hidden border-b border-border bg-background sm:block">
            <ul className="container mx-auto flex gap-1 px-4">
                {sections.map((s) => {
                    const on = location.section?.id === s.id;
                    return (
                        <li key={s.id}>
                            <Link
                                href={s.items[0].href}
                                aria-current={on ? 'page' : undefined}
                                className={clsx(
                                    'flex min-h-11 items-center gap-2 border-b-2 px-3 text-body-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
                                    on ? 'border-primary weight-strong text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground'
                                )}
                            >
                                {t(`sections.${s.id}`)}
                                <AdminBadge count={sectionBadge(s, counts)} danger={s.items.some((i) => i.badge === 'reports') && counts.reports > 0} />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
