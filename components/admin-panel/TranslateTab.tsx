'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { getMissingTranslations } from '@/actions/translation-actions';
import TranslateMode from '@/components/translate/TranslateMode';
import TranslateSearch from '@/components/translate/TranslateSearch';
import TranslationForm from '@/components/translate/TranslationForm';
import { markedKeysOnPage } from '@/components/translate/useMarkedText';
import type { MessageLang } from '@/lib/translate-mode/messages';
import type { PanelTabProps } from './PanelTabBody';

type Missing = { key: string; langs: MessageLang[] };

/** Tulkot: the marked texts on the page, search for the ones that can't be clicked, the selected key's form and what is missing here. */
export default function TranslateTab({ selection, onSelect }: PanelTabProps) {
    const t = useTranslations('admin.panel.translate');
    const pathname = usePathname();
    const [missing, setMissing] = useState<Missing[]>([]);
    const [version, setVersion] = useState(0);

    // After mount and after the page changes: the keys on the page, then which still lack a language (300 ms lets the page settle).
    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(() => {
            const keys = markedKeysOnPage();
            if (keys.length === 0) { setMissing([]); return; }
            getMissingTranslations(keys).then((res) => {
                if (!cancelled) setMissing(res.success ? res.data ?? [] : []);
            });
        }, 300);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [pathname, version]);

    return (
        <>
            <TranslateMode onSelect={onSelect} />
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
                <TranslateSearch onPick={onSelect} />
                <section aria-labelledby="admin-panel-selected" className="space-y-2">
                    <h3 id="admin-panel-selected" className="text-meta text-foreground-muted">{t('selected')}</h3>
                    {selection ? (
                        <>
                            <p className="break-all font-mono text-meta text-foreground">{selection}</p>
                            <TranslationForm key={selection} messageKey={selection} onClose={() => { onSelect(null); setVersion((v) => v + 1); }} />
                        </>
                    ) : (
                        <p className="text-body-sm text-foreground-muted">{t('pickHint')}</p>
                    )}
                </section>
                <section aria-labelledby="admin-panel-missing" className="space-y-1">
                    <h3 id="admin-panel-missing" className="text-meta text-foreground-muted">{t('missing', { count: missing.length })}</h3>
                    {missing.length === 0 ? (
                        <p className="px-2 py-1 text-body-sm text-foreground-muted">{t('noneMissing')}</p>
                    ) : (
                        <ul>
                            {missing.map((m) => (
                                <li key={m.key}>
                                    <button type="button" onClick={() => onSelect(m.key)} className="flex w-full items-baseline justify-between gap-3 rounded-xl px-2 py-1 text-left text-meta hover:bg-surface-elevated">
                                        <span className="min-w-0 break-all font-mono text-foreground">{m.key}</span>
                                        <span className="shrink-0 text-foreground-muted">{m.langs.map((l) => l.toUpperCase()).join(' ')}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
            <footer className="border-t border-border px-4 py-2 text-meta text-foreground-muted">{t('missingFooter', { count: missing.length })}</footer>
        </>
    );
}
