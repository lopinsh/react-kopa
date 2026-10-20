'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import { LOCALES, LOCALE_NAMES, UI, type Locale } from '@/lib/constants';
import { MenuItemLink, MenuPanel, useMenu } from '@/components/ui/Menu';

/** "LV ▾": a short list of the site's languages; the choice keeps the page and its query (AR-15). */
export default function LanguageMenu({ initialOpen }: { initialOpen?: boolean }) {
    const t = useTranslations('nav');
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const { open, rootRef, triggerProps, menuProps } = useMenu(initialOpen);
    // The root layout does not re-render on a client-side language switch, so keep <html lang> in step.
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);
    const href = pathname + (search ? `?${search}` : '');

    return (
        <div className="relative shrink-0" ref={rootRef}>
            <button
                {...triggerProps}
                data-ui={UI.languageSwitch}
                aria-label={t('languageCurrent', { language: LOCALE_NAMES[locale] })}
                className={clsx(
                    'flex h-10 items-center gap-0.5 rounded-pill px-2 text-xs font-semibold text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-[13px]',
                    open && 'bg-tint'
                )}
            >
                {locale.toUpperCase()}
                <ChevronDown aria-hidden className="size-3 sm:size-3.5" />
            </button>
            {open && (
                <MenuPanel label={t('languageLabel')} width="sm" dataUi={UI.languageList} {...menuProps}>
                    {LOCALES.map((code) => (
                        <MenuItemLink
                            key={code}
                            href={href}
                            locale={code}
                            hrefLang={code}
                            current={code === locale}
                            icon={code === locale ? <Check aria-hidden className="size-[17px] text-primary" /> : <span aria-hidden className="size-[17px]" />}
                            trailing={<span className="ml-auto text-xs text-foreground-muted">{code.toUpperCase()}</span>}
                        >
                            <span lang={code}>{LOCALE_NAMES[code]}</span>
                        </MenuItemLink>
                    ))}
                </MenuPanel>
            )}
        </div>
    );
}
