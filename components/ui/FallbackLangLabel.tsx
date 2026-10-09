import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { TextLang } from '@/lib/translations';

/**
 * Small label shown with owner-written text that is not in the visitor's language
 * ("Latviski" / "In English"). The label is written in the language it names.
 */
export default function FallbackLangLabel({ lang, className }: { lang: TextLang; className?: string }) {
    const t = useTranslations('common');
    return (
        <span
            lang={lang}
            className={clsx(
                'inline-flex shrink-0 items-center rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-foreground-muted',
                className
            )}
        >
            {t(lang === 'en' ? 'textLangEn' : 'textLangLv')}
        </span>
    );
}
