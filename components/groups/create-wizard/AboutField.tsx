'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { AlignLeft } from 'lucide-react';
import LanguageEditor from '@/components/ui/LanguageEditor';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { TEXT_LANGS, hasText, langRecord, type TextLang } from '@/lib/translations';
import type { GroupCreateValues } from '@/lib/validations/group';

interface Props {
    /** The language on screen; the wizard owns it so a failed step can jump to the language with the problem. */
    lang: TextLang;
    onLangChange: (lang: TextLang) => void;
}

/** "Par mums" of a new group, written in one language at a time (the first language is the original). */
export default function AboutField({ lang, onLangChange }: Props) {
    const t = useTranslations('wizard');
    const { watch, setValue, getValues, formState: { errors } } = useFormContext<GroupCreateValues>();
    // Bumped when text is copied in or cleared, so the rich-text editor reloads its value.
    const [rev, setRev] = useState(0);
    const about = watch('about');
    const original = watch('originalLang');

    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <AlignLeft className="h-3.5 w-3.5 text-foreground-muted" />
                {t('fieldDescription')}
                <span className="ml-auto text-xs font-normal text-foreground-muted">{t('optional')}</span>
            </label>
            <LanguageEditor
                lang={lang}
                onLangChange={onLangChange}
                originalLang={original}
                onOriginalLangChange={(l) => setValue('originalLang', l)}
                filled={langRecord((l) => hasText(about?.[l]))}
                errorLangs={TEXT_LANGS.filter((l) => errors.about?.[l])}
                onCopyFromOriginal={(to) => {
                    setValue(`about.${to}`, getValues(`about.${getValues('originalLang')}`), { shouldValidate: true });
                    setRev((r) => r + 1);
                }}
                onClear={(l) => {
                    setValue(`about.${l}`, '', { shouldValidate: true });
                    setRev((r) => r + 1);
                }}
            >
                <div lang={lang}>
                    <RichTextEditor
                        key={`about-${lang}-${rev}`}
                        value={about?.[lang] || ''}
                        onChange={(val) => setValue(`about.${lang}`, val)}
                        placeholder={t('fieldDescriptionPlaceholder')}
                    />
                </div>
                {errors.about?.[lang] && <p className="mt-1 text-xs text-danger">{t('DESCRIPTION_TOO_LONG')}</p>}
            </LanguageEditor>
        </div>
    );
}
