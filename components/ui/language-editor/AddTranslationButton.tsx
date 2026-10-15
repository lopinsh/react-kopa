'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { MenuItemButton, MenuPanel, useMenu } from '@/components/ui/Menu';
import { LOCALE_NAMES, UI } from '@/lib/constants';
import type { TextLang } from '@/lib/translations';

interface Props {
    /** Languages without a version yet; nothing is shown when there are none. */
    addable: readonly TextLang[];
    disabled?: boolean;
    onAdd: (lang: TextLang) => void;
}

/** "+ Add a translation": adds the one language left at once; with several left it asks which in a small menu. */
export default function AddTranslationButton({ addable, disabled, onAdd }: Props) {
    const t = useTranslations('common.languageEditor');
    const { open, rootRef, triggerProps, menuProps } = useMenu();
    if (addable.length === 0) return null;
    const single = addable.length === 1;
    return (
        <div className="relative" ref={rootRef}>
            <Button
                {...(single ? { onClick: () => onAdd(addable[0]) } : triggerProps)}
                variant="quiet"
                size="sm"
                disabled={disabled}
                aria-label={single ? t('addOne', { language: LOCALE_NAMES[addable[0]] }) : undefined}
                className="min-h-11 md:min-h-0"
            >
                <Plus aria-hidden />
                {t('add')}
            </Button>
            {!single && open && (
                <MenuPanel label={t('addMenuLabel')} placement="anchor" align="start" dataUi={UI.languageEditorMenu} {...menuProps}>
                    {addable.map((l) => (
                        <MenuItemButton key={l} onSelect={() => onAdd(l)}><span lang={l}>{LOCALE_NAMES[l]}</span></MenuItemButton>
                    ))}
                </MenuPanel>
            )}
        </div>
    );
}
