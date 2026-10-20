'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { useMeContext } from '@/components/providers/MeProvider';
import { UI } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import MeDrawer from './MeDrawer';
import EditProfileLink from './EditProfileLink';

/** The own area's bar on phones, under the header: ☰ (opens the drawer with the own menu), picture, name and line (AR-60). */
export default function MePhoneBar() {
    const t = useTranslations('profile.area');
    const { name, avatarSrc, line } = useMeContext();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const drawerId = useId();

    return (
        <div data-ui={UI.ownBarPhone} className="flex h-16 items-center gap-2.5 border-b border-border bg-surface px-3 md:hidden">
            <button
                ref={buttonRef}
                type="button"
                aria-label={t('openMenu')}
                aria-expanded={open}
                aria-controls={drawerId}
                onClick={() => setOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-pill hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <Menu aria-hidden className="size-5" />
            </button>
            <Link href="/profile" aria-label={`${name}, ${t('viewProfile')}`} className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <img src={avatarSrc} alt="" className="size-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <p className="truncate font-heading text-[15px] font-semibold leading-tight">{name}</p>
                    {line && <p className="truncate text-xs text-foreground-muted">{line}</p>}
                </div>
            </Link>
            <EditProfileLink />
            {open && <MeDrawer id={drawerId} onClose={() => setOpen(false)} returnFocusRef={buttonRef} />}
        </div>
    );
}
