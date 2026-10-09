'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

interface Props {
    value: TextLang;
    onChange: (lang: TextLang) => void;
    /** Which languages have text; shown as a filled / empty dot. */
    filled: Record<TextLang, boolean>;
    className?: string;
}

/** LV | EN switch for owner-written text, with a dot per language: filled when that language has text. */
export default function LangSwitch({ value, onChange, filled, className }: Props) {
    const t = useTranslations('common');
    return (
        <div role="group" aria-label={t('langSwitchLabel')} className={clsx('inline-flex rounded-xl border border-border bg-surface p-0.5', className)}>
            {TEXT_LANGS.map((lang) => (
                <button
                    key={lang}
                    type="button"
                    onClick={() => onChange(lang)}
                    aria-pressed={value === lang}
                    className={clsx(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors',
                        value === lang ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-foreground-muted hover:bg-surface-elevated'
                    )}
                >
                    {lang}
                    <span
                        aria-hidden="true"
                        className={clsx(
                            'h-2 w-2 rounded-full border border-current',
                            filled[lang] ? 'bg-current' : 'bg-transparent opacity-60'
                        )}
                    />
                    <span className="sr-only">{filled[lang] ? t('langFilled') : t('langEmpty')}</span>
                </button>
            ))}
        </div>
    );
}
