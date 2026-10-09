'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import LangSwitch from '@/components/ui/LangSwitch';
import OriginalLangControl from '@/components/ui/OriginalLangControl';
import UntranslatedNotice from '@/components/ui/UntranslatedNotice';
import { TEXT_LANGS, hasText, type TextLang } from '@/lib/translations';
import type { EventFormData } from '@/lib/validations/event';

type EventTexts = EventFormData['texts'][TextLang];

/** A language counts as written when any of its title, description or instructions has text. */
export function isEventLangFilled(text: EventTexts): boolean {
    return text.title.trim() !== '' || hasText(text.description) || hasText(text.instructions);
}

interface Props {
    lang: TextLang;
    onLangChange: (lang: TextLang) => void;
    onCopy: () => void;
}

/** One LV | EN switch for the whole event form, the original-language control and the empty-language hint. */
export default function EventLangBar({ lang, onLangChange, onCopy }: Props) {
    const t = useTranslations('eventWizard');
    const { watch, setValue, trigger, formState: { errors } } = useFormContext<EventFormData>();
    const original = watch('originalLang');
    const texts = watch('texts');
    const filled = { lv: isEventLangFilled(texts.lv), en: isEventLangFilled(texts.en) };

    // A title problem in the language that is not on screen would otherwise be invisible.
    const hiddenError = TEXT_LANGS.find((l) => l !== lang && errors.texts?.[l]?.title);

    // Which title is required just changed: re-check both.
    const changeOriginal = (l: TextLang) => {
        setValue('originalLang', l);
        void trigger(['texts.lv.title', 'texts.en.title']);
    };

    return (
        <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <LangSwitch value={lang} onChange={onLangChange} filled={filled} />
                <OriginalLangControl value={original} onChange={changeOriginal} filled={filled} />
            </div>
            {lang !== original && !filled[lang] && <UntranslatedNotice original={original} onCopy={onCopy} />}
            {hiddenError && (
                <p role="alert" className="text-xs text-red-500">
                    {t(hiddenError === original ? 'originalLangTitleError' : 'otherLangTitleError', { lang: hiddenError.toUpperCase() })}
                </p>
            )}
        </div>
    );
}
