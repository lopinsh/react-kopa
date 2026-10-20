'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import Badge from '@/components/ui/Badge';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { MENU_TRAILING_CLASS, MenuItemButton, MenuPanel, MenuSeparator } from '@/components/ui/Menu';
import type { useMenu } from '@/components/ui/Menu';
import { LOCALE_NAMES, UI } from '@/lib/constants';
import { TEXT_LANGS, type TextLang } from '@/lib/translations';

interface Props {
    /** The `useMenu` state of the pill (the bar owns it so its "+N" button can open the menu). */
    menu: ReturnType<typeof useMenu>;
    labelId: string;
    lang: TextLang;
    original: TextLang;
    versions: readonly TextLang[];
    filled: Record<TextLang, boolean>;
    errorLangs: readonly TextLang[];
    /** Languages without a version yet. */
    addable: readonly TextLang[];
    disabled?: boolean;
    onSelect: (lang: TextLang) => void;
    onAdd: (lang: TextLang) => void;
    onMakeOriginal: (lang: TextLang) => void;
    onRemove: (lang: TextLang) => void;
}

/** The language pill and its menu: the versions with their state, then the actions for the language on screen. */
export default function LanguageMenu({ menu, labelId, lang, original, versions, filled, errorLangs, addable, disabled, onSelect, onAdd, onMakeOriginal, onRemove }: Props) {
    const t = useTranslations('common.languageEditor');
    const { open, rootRef, triggerProps, menuProps } = menu;
    const triggerId = useId();
    const noteId = useId();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const state = (l: TextLang) => (errorLangs.includes(l) ? 'stateError' : l === original ? 'original' : filled[l] ? 'stateFilled' : 'stateEmpty');
    const ordered = [original, ...TEXT_LANGS.filter((l) => l !== original && versions.includes(l))];
    const canRemove = lang !== original;
    const remove = () => {
        if (filled[lang]) setConfirmOpen(true);
        else onRemove(lang);
    };

    return (
        <div className="relative" ref={rootRef}>
            <button
                {...triggerProps}
                id={triggerId}
                disabled={disabled}
                aria-labelledby={`${labelId} ${triggerId}`}
                className={clsx(
                    'inline-flex h-11 items-center gap-2 rounded-pill line bg-surface px-4 text-button-sm text-foreground hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 md:h-9',
                    open && 'bg-tint'
                )}
            >
                <span lang={lang}>{LOCALE_NAMES[lang]}</span>
                {/* A space, so the accessible name reads "Latviešu Oriģināls", not "LatviešuOriģināls". */}
                {' '}
                {lang === original && <Badge tone="muted">{t('original')}</Badge>}
                <ChevronDown aria-hidden className="size-4" />
            </button>
            {open && (
                <MenuPanel label={t('menuLabel')} placement="anchor" align="start" describedBy={noteId} dataUi={UI.languageEditorMenu} {...menuProps}>
                    <p id={noteId} role="none" className="px-2.5 pb-1.5 pt-1 text-meta text-foreground-muted">{t('menuNote')}</p>
                    {ordered.map((l) => (
                        <MenuItemButton
                            key={l}
                            current={l === lang}
                            onSelect={() => onSelect(l)}
                            icon={l === lang ? <Check aria-hidden className="size-[17px] text-primary" /> : <span aria-hidden className="size-[17px]" />}
                            trailing={<span className={clsx(MENU_TRAILING_CLASS, errorLangs.includes(l) && 'text-danger')}>{t(state(l))}</span>}
                        >
                            <span lang={l}>{LOCALE_NAMES[l]}</span>
                        </MenuItemButton>
                    ))}
                    {(canRemove || addable.length > 0) && <MenuSeparator />}
                    {canRemove && filled[lang] && <MenuItemButton onSelect={() => onMakeOriginal(lang)}>{t('makeOriginal')}</MenuItemButton>}
                    {canRemove && <MenuItemButton onSelect={remove}>{t('remove')}</MenuItemButton>}
                    {addable.map((l) => (
                        <MenuItemButton key={l} onSelect={() => onAdd(l)}>{t('addOne', { language: LOCALE_NAMES[l] })}</MenuItemButton>
                    ))}
                </MenuPanel>
            )}
            <ConfirmPopover
                anchorRef={triggerProps.ref}
                isOpen={confirmOpen}
                onOpenChange={setConfirmOpen}
                message={t('removeConfirm', { language: LOCALE_NAMES[lang] })}
                confirmLabel={t('removeConfirmButton')}
                destructive
                onConfirm={() => {
                    setConfirmOpen(false);
                    onRemove(lang);
                }}
            />
        </div>
    );
}
