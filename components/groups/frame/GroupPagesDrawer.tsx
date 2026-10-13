'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import Overlay from '@/components/ui/Overlay';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import CategoryLine from '@/components/ui/CategoryLine';
import GroupPagesNav from './GroupPagesNav';
import { groupChip } from './chip';

/** ☰ in the phone bar: opens the group's pages from the left over the page, above the bottom bar (AR-48). */
export default function GroupPagesDrawer() {
    const t = useTranslations('group.frame');
    const g = useGroupContext();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const id = useId();
    const pathname = usePathname();
    const openedOn = useRef(pathname);

    // Opening a page from the drawer ends it.
    useEffect(() => {
        if (open && pathname !== openedOn.current) setOpen(false);
    }, [pathname, open]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-label={t('pagesLabel')}
                aria-expanded={open}
                aria-controls={id}
                onClick={() => { openedOn.current = pathname; setOpen(true); }}
                className={clsx('grid size-10 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden', g.image ? groupChip(true) : 'hover:bg-tint')}
            >
                <Menu aria-hidden className="size-5" />
            </button>
            {open && (
                <Overlay layout="left" id={id} onClose={() => setOpen(false)} label={t('pagesLabel')} dataUi={UI.drawer} flush panelClassName="px-2.5 py-3.5" returnFocusRef={buttonRef}>
                    <div className="flex items-center gap-2.5 border-b border-border px-1 pb-3">
                        {g.image ? (
                            <img src={g.image} alt="" className="size-[34px] shrink-0 rounded-[10px] object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="mark-tint grid size-[34px] shrink-0 place-items-center rounded-[10px]">
                                <CategoryIcon slug={g.category.l1Slug} aria-hidden className="size-[18px]" />
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-heading text-base font-semibold leading-tight">{g.name}</p>
                            <div className="text-xs text-foreground-muted">
                                <CategoryLine color="var(--accent)" category={g.category.l1Title} subCategories={g.category.subCategories} />
                            </div>
                        </div>
                    </div>
                    <GroupPagesNav variant="drawer" />
                </Overlay>
            )}
        </>
    );
}
