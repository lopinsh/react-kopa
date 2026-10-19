'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, ShieldCheck } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { sectionBadge } from '@/lib/admin-nav';
import Overlay from '@/components/ui/Overlay';
import { useAdminFrame } from './AdminFrameProvider';
import AdminPagesNav from './AdminPagesNav';
import AdminBadge from './AdminBadge';

/** Below `lg`: the bar under the header (menu button, page title, part) and the drawer it opens: five sections as rows, the open one expanded (AR-68). */
export default function AdminDrawer({ title, part }: { title: string; part: string | null }) {
    const t = useTranslations('admin.nav');
    const { sections, counts, location } = useAdminFrame();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const id = useId();
    const pathname = usePathname();
    const openedOn = useRef(pathname);

    // Opening a page from the drawer ends it.
    useEffect(() => {
        if (open && pathname !== openedOn.current) setOpen(false);
    }, [pathname, open]);

    const total = sections.reduce((n, s) => n + sectionBadge(s, counts), 0);

    return (
        <div className="flex items-center gap-2 border-b border-border py-2 lg:hidden">
            <button
                ref={buttonRef}
                type="button"
                aria-label={t('openMenu')}
                aria-expanded={open}
                aria-controls={id}
                onClick={() => { openedOn.current = pathname; setOpen(true); }}
                className="relative grid size-10 shrink-0 place-items-center rounded-full hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <Menu aria-hidden className="size-5" />
                {total > 0 && <span aria-hidden className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
            </button>
            <p className="min-w-0 truncate font-heading text-base font-semibold">
                {title}
                {part && <span className="ml-2 text-xs font-normal text-foreground-muted">{part}</span>}
            </p>
            {open && (
                <Overlay layout="left" id={id} onClose={() => setOpen(false)} label={t('drawerTitle')} dataUi={UI.drawer} flush panelClassName="px-2.5 py-3.5" returnFocusRef={buttonRef}>
                    <div className="flex items-center gap-2.5 border-b border-border px-1 pb-3">
                        <span className="mark-tint grid size-[34px] shrink-0 place-items-center rounded-[10px]"><ShieldCheck aria-hidden className="size-[18px]" /></span>
                        <p className="font-heading text-base font-semibold">{t('drawerTitle')}</p>
                    </div>
                    <ul className="pt-2">
                        {sections.map((s) => {
                            const on = location.section?.id === s.id;
                            return (
                                <li key={s.id}>
                                    {on ? (
                                        <p className="flex items-center px-2.5 py-2 text-sm font-semibold">{t(`sections.${s.id}`)}</p>
                                    ) : (
                                        <Link href={s.items[0].href} replace className="flex min-h-10 items-center rounded-xl px-2.5 text-sm text-foreground hover:bg-tint">
                                            {t(`sections.${s.id}`)}
                                            <AdminBadge count={sectionBadge(s, counts)} danger={s.items.some((i) => i.badge === 'reports') && counts.reports > 0} />
                                        </Link>
                                    )}
                                    {on && <div className="mb-1 ml-2 border-l border-border pl-1"><AdminPagesNav variant="drawer" /></div>}
                                </li>
                            );
                        })}
                    </ul>
                </Overlay>
            )}
        </div>
    );
}
