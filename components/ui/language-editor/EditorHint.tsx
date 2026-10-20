'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { LOCALE_NAMES } from '@/lib/constants';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

interface Props {
    lang: TextLang;
    original: TextLang;
    filled: Record<TextLang, boolean>;
    errorLangs: readonly TextLang[];
    disabled?: boolean;
    onSelect: (lang: TextLang) => void;
    onCopyFromOriginal: (lang: TextLang) => void;
}

const BOX = 'mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-tint p-3 text-body-sm text-foreground-muted';

/** The one line under the bar: a problem in another language, an empty translation, or an original without text. */
export default function EditorHint({ lang, original, filled, errorLangs, disabled, onSelect, onCopyFromOriginal }: Props) {
    const t = useTranslations('common.languageEditor');
    const elsewhere = TEXT_LANGS.find((l) => l !== lang && errorLangs.includes(l));
    if (elsewhere) {
        return (
            <div role="alert" className={BOX}>
                <p className="text-danger">{t('errorElsewhere', { language: LOCALE_NAMES[elsewhere] })}</p>
                <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onSelect(elsewhere)} className="shrink-0">{t('open')}</Button>
            </div>
        );
    }
    if (lang !== original && !filled[lang]) {
        return (
            <div className={BOX}>
                <p>{t('translationHint', { original: LOCALE_NAMES[original] })}</p>
                <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onCopyFromOriginal(lang)} className="shrink-0">{t('copyOriginal')}</Button>
            </div>
        );
    }
    if (lang === original && !filled[original] && TEXT_LANGS.some((l) => filled[l])) {
        return <p className={BOX}>{t('originalEmpty', { original: LOCALE_NAMES[original] })}</p>;
    }
    return null;
}
