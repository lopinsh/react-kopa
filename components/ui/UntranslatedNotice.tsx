'use client';

import { useTranslations } from 'next-intl';
import type { TextLang } from '@/lib/translations';

interface Props {
    /** The language visitors fall back to. */
    original: TextLang;
    /** Copies the original text into the editor (nothing is saved yet). */
    onCopy: () => void;
}

/** Shown on an empty language tab: visitors see the original text; offers to start from it. */
export default function UntranslatedNotice({ original, onCopy }: Props) {
    const t = useTranslations('common');
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-elevated/60 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground-muted">{t('untranslatedHint', { original })}</p>
            <button
                type="button"
                onClick={onCopy}
                className="shrink-0 self-start rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-elevated"
            >
                {t('startFromOriginal', { original })}
            </button>
        </div>
    );
}
