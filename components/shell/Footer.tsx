'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import Logo from '@/components/ui/Logo';
import { UI } from '@/lib/constants';
import { FOOTER_PATHS } from '@/lib/navigation';
import { isPanelAddress } from '@/lib/panel-routes';

const FOOTER_LINK = 'font-semibold text-primary underline decoration-border underline-offset-[3px] hover:decoration-primary';

/** The slim footer that ends discovery and reading pages (AR-16); group, own-area and admin pages have none. */
export function Footer({ always }: { always?: boolean }) {
    const t = useTranslations('shell.footer');
    const tCommon = useTranslations('common');
    const pathname = usePathname();
    const onPage = !!always || (FOOTER_PATHS as readonly string[]).includes(pathname);
    // A panel (R6) puts its own address in the bar while the page underneath stays: keep that page's footer, so the list does not jump.
    const [pageHasFooter, setPageHasFooter] = useState(onPage);
    const panel = isPanelAddress(pathname);
    if (!panel && pageHasFooter !== onPage) setPageHasFooter(onPage);

    if (!(panel ? pageHasFooter : onPage)) return null;

    return (
        <footer data-ui={UI.footer} className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5 border-t border-border bg-surface px-3 py-3 text-[13px] text-foreground-muted md:px-5 md:py-3.5">
            <Link href="/" aria-label={tCommon('brandName')}>
                <Logo size="sm" />
            </Link>
            <span className="min-w-0 flex-[1_1_200px]">{t('logoSubtitle')}</span>
            <Link href="/about" className={FOOTER_LINK}>{tCommon('about')}</Link>
            <Link href="/privacy" className={FOOTER_LINK}>{t('privacy')}</Link>
        </footer>
    );
}
