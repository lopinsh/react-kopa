'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import Logo from '@/components/ui/Logo';
import { UI } from '@/lib/constants';
import { FOOTER_PATHS } from '@/lib/navigation';

const FOOTER_LINK = 'font-semibold text-primary underline decoration-border underline-offset-[3px] hover:decoration-primary';

/** The slim footer that ends discovery and reading pages (AR-16); group, own-area and admin pages have none. */
export function Footer({ always }: { always?: boolean }) {
    const t = useTranslations('shell.footer');
    const tCommon = useTranslations('common');
    const pathname = usePathname();

    if (!always && !(FOOTER_PATHS as readonly string[]).includes(pathname)) return null;

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
