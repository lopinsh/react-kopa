'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { BOTTOM_LINKS, type BottomTab } from '@/lib/navigation';
import { useBottomTab } from '@/hooks/useBottomTab';

const LINKS = BOTTOM_LINKS.filter((l) => l.tab === 'groups');

/** From md, signed in only: Manas grupas (the logo is the way to Atklāt; the phone bar keeps its Atklāt tab), as an icon beside the logo at 768-1023 px (the search keeps its room) and quiet text links to the right of the search from lg (R20). The open one is marked like the phone bar (same logic), in site colour only (AR-06). */
export default function HeaderLinks({ initialTab, signedIn }: { initialTab: BottomTab; signedIn: boolean }) {
    const t = useTranslations('nav');
    const marked = useBottomTab(initialTab);
    return (
        <nav aria-label={t('mobileLabel')} className="hidden shrink-0 items-center gap-1 md:order-2 md:flex lg:order-4">
            {signedIn && LINKS.map((l) => {
                const on = marked === l.tab;
                const label = t('myGroups');
                const Icon = l.icon;
                return (
                    // ui-allow: icon at md, text link from lg
                    <Link
                        key={l.tab}
                        href={l.href}
                        title={label}
                        aria-label={label}
                        aria-current={on ? 'page' : undefined}
                        className={clsx('grid size-10 place-items-center rounded-pill outline-none focus-visible:outline-2 focus-visible:outline-primary lg:inline-block lg:size-auto lg:px-3 lg:py-2 lg:text-body-sm', on ? 'weight-strong text-foreground' : 'text-foreground-muted hover:text-foreground')}
                    >
                        <Icon aria-hidden className={clsx('size-5 lg:hidden', on && 'icon-stroke-strong')} />
                        <span className="hidden lg:inline">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
