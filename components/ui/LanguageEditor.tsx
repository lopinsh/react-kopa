'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import AddTranslationButton from '@/components/ui/language-editor/AddTranslationButton';
import EditorHint from '@/components/ui/language-editor/EditorHint';
import LanguageMenu from '@/components/ui/language-editor/LanguageMenu';
import { useMenu } from '@/components/ui/Menu';
import { LOCALE_NAMES, UI } from '@/lib/constants';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

const FIELDS = 'input, textarea, [contenteditable="true"]';
const SHOWN_OTHERS = 3;

export interface LanguageEditorProps {
    /** The language on screen; the form owns it (its field names depend on it). */
    lang: TextLang;
    onLangChange: (lang: TextLang) => void;
    originalLang: TextLang;
    onOriginalLangChange: (lang: TextLang) => void;
    /** Which languages hold readable text. */
    filled: Record<TextLang, boolean>;
    /** Languages with a validation problem (errors or over a counter's limit). */
    errorLangs?: readonly TextLang[];
    /** Copies the original's fields into `lang` (nothing is saved). */
    onCopyFromOriginal: (lang: TextLang) => void;
    /** Empties every field of `lang` (removing a translation). */
    onClear: (lang: TextLang) => void;
    /** While the form saves. */
    disabled?: boolean;
    /** UI elements specimen only. */
    initialMenuOpen?: boolean;
    /** The fields for `lang`. They set their own `lang` attribute. */
    children: ReactNode;
}

/** One bar above owner text in several languages: the language on screen, the other versions, "+ Add a translation". It owns no text. */
export default function LanguageEditor({ lang, onLangChange, originalLang, onOriginalLangChange, filled, errorLangs = [], onCopyFromOriginal, onClear, disabled, initialMenuOpen, children }: LanguageEditorProps) {
    const t = useTranslations('common.languageEditor');
    const labelId = useId();
    const menu = useMenu(initialMenuOpen);
    const fieldsRef = useRef<HTMLDivElement>(null);
    const focusFields = useRef(false);
    // An added translation is empty and exists only on screen until it gets text.
    const [added, setAdded] = useState<readonly TextLang[]>(() => TEXT_LANGS.filter((l) => l === originalLang || filled[l]));
    const [announcement, setAnnouncement] = useState('');

    // The language on screen is always a version (the editor may remount while an empty translation is open, e.g. a wizard step back).
    const versions = TEXT_LANGS.filter((l) => l === originalLang || l === lang || filled[l] || added.includes(l));
    const addable = TEXT_LANGS.filter((l) => !versions.includes(l));
    const others = versions.filter((l) => l !== lang);

    // After "add", the first field of the new language takes focus once it has rendered.
    useEffect(() => {
        if (!focusFields.current) return;
        focusFields.current = false;
        const frame = requestAnimationFrame(() => fieldsRef.current?.querySelector<HTMLElement>(FIELDS)?.focus());
        return () => cancelAnimationFrame(frame);
    }, [lang]);

    const select = (l: TextLang) => {
        onLangChange(l);
        menu.triggerProps.ref.current?.focus();
    };
    const add = (l: TextLang) => {
        setAdded((prev) => [...prev, l]);
        focusFields.current = true;
        onLangChange(l);
    };
    const makeOriginal = (l: TextLang) => {
        setAdded((prev) => [...prev, originalLang]);
        onOriginalLangChange(l);
        setAnnouncement(t('madeOriginal', { language: LOCALE_NAMES[l] }));
        menu.triggerProps.ref.current?.focus();
    };
    const remove = (l: TextLang) => {
        onClear(l);
        setAdded((prev) => prev.filter((x) => x !== l));
        onLangChange(originalLang);
        setAnnouncement(t('removed'));
        menu.triggerProps.ref.current?.focus();
    };

    return (
        <div data-ui={UI.languageEditor}>
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3">
                <div className="flex flex-nowrap items-center gap-x-3">
                    <span id={labelId} className="text-meta text-foreground-muted">{t('label')}</span>
                    <LanguageMenu
                        menu={menu}
                        labelId={labelId}
                        lang={lang}
                        original={originalLang}
                        versions={versions}
                        filled={filled}
                        errorLangs={errorLangs}
                        addable={addable}
                        disabled={disabled}
                        onSelect={select}
                        onAdd={add}
                        onMakeOriginal={makeOriginal}
                        onRemove={remove}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap md:ms-auto">
                    {others.length > 0 && (
                        <span className="flex flex-wrap items-center gap-x-1 text-meta text-foreground-muted">
                            {t('others')}
                            {others.slice(0, SHOWN_OTHERS).map((l) => (
                                <button key={l} type="button" lang={l} disabled={disabled} onClick={() => onLangChange(l)} className="min-h-11 rounded-pill px-2 weight-medium text-primary hover:bg-tint disabled:opacity-60 md:min-h-0 md:py-1">
                                    {LOCALE_NAMES[l]}
                                </button>
                            ))}
                            {others.length > SHOWN_OTHERS && (
                                <button type="button" onClick={() => menu.setOpen(true)} className="min-h-11 rounded-pill px-2 weight-medium text-primary hover:bg-tint md:min-h-0 md:py-1">
                                    {t('moreCount', { count: others.length - SHOWN_OTHERS })}
                                </button>
                            )}
                        </span>
                    )}
                    <AddTranslationButton addable={addable} disabled={disabled} onAdd={add} />
                </div>
            </div>
            <EditorHint lang={lang} original={originalLang} filled={filled} errorLangs={errorLangs} disabled={disabled} onSelect={onLangChange} onCopyFromOriginal={onCopyFromOriginal} />
            <span aria-live="polite" className="sr-only">{announcement}</span>
            <div ref={fieldsRef}>{children}</div>
        </div>
    );
}
