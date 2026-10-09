'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

interface Props {
    value: TextLang;
    onChange: (lang: TextLang) => void;
    /** Which languages have text: only those can become the original language. */
    filled: Record<TextLang, boolean>;
}

/** "Original language: LV | EN" - the language visitors fall back to when a translation is missing. */
export default function OriginalLangControl({ value, onChange, filled }: Props) {
    const t = useTranslations('common');
    return (
        <div className="flex items-center gap-2" title={t('originalLangHint')}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">{t('originalLangLabel')}</span>
            <div role="group" aria-label={t('originalLangLabel')} className="inline-flex rounded-lg border border-border p-0.5">
                {TEXT_LANGS.map((lang) => (
                    <button
                        key={lang}
                        type="button"
                        disabled={!filled[lang] && value !== lang}
                        title={!filled[lang] ? t('originalLangNeedsText') : undefined}
                        aria-pressed={value === lang}
                        onClick={() => onChange(lang)}
                        className={clsx(
                            'rounded-md px-2.5 py-1 text-[11px] font-bold uppercase transition-colors disabled:opacity-40',
                            value === lang ? 'bg-foreground text-background' : 'text-foreground-muted hover:bg-surface-elevated'
                        )}
                    >
                        {lang}
                    </button>
                ))}
            </div>
        </div>
    );
}
