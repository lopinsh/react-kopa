'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { useMeContext } from '@/components/providers/MeProvider';
import { UI } from '@/lib/constants';
import { Link, usePathname } from '@/i18n/routing';
import MeDrawer from './MeDrawer';
import EditProfileLink from './EditProfileLink';
import { IconButton } from '@/components/ui/Button';

/** The own area's bar on phones, under the header: ☰ (opens the drawer with the own menu), picture, name and line (AR-60). */
export default function MePhoneBar() {
    const t = useTranslations('profile.area');
    const { name, avatarSrc, line } = useMeContext();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const drawerId = useId();
    // On Manas grupas the profile card right below carries the person; the bar keeps only the menu.
    const cardBelow = usePathname() === '/profile/my-groups';

    return (
        <div data-ui={UI.ownBarPhone} className="flex h-16 items-center gap-3 border-b border-border bg-surface px-3 md:hidden">
            <IconButton
                ref={buttonRef}
                type="button"
                aria-label={t('openMenu')}
                aria-expanded={open}
                aria-controls={drawerId}
                onClick={() => setOpen(true)}
            >
                <Menu aria-hidden className="size-5" />
            </IconButton>
            {!cardBelow && <Link href="/profile" aria-label={`${name}, ${t('viewProfile')}`} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <img src={avatarSrc} alt="" className="size-8 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <p className="truncate text-item">{name}</p>
                    {line && <p className="truncate text-meta text-foreground-muted">{line}</p>}
                </div>
            </Link>}
            {!cardBelow && <EditProfileLink />}
            {open && <MeDrawer id={drawerId} onClose={() => setOpen(false)} returnFocusRef={buttonRef} />}
        </div>
    );
}
