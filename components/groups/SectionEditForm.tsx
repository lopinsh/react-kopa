'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import RichTextEditor from '@/components/ui/RichTextEditor';
import TextCounter from '@/components/ui/TextCounter';
import LanguageEditor from '@/components/ui/LanguageEditor';
import SectionFormFooter from '@/components/groups/SectionFormFooter';
import SectionVisibilityField from '@/components/groups/SectionVisibilityField';
import { isOverLimit } from '@/lib/text-limit';
import { SECTION_TITLE_MAX, isSectionTextFilled } from '@/lib/validations/section';
import { DEFAULT_SECTION_TITLES } from '@/lib/constants';
import { TEXT_LANGS, langRecord, type TextLang } from '@/lib/translations';
import type { EditableSection } from '@/lib/services/group.service';

type SectionText = { title: string; content: string };

/** A section in the editor; `savedTexts` is the last saved text (to find unsaved edits), `isNew` until its first save. */
export type SectionDraft = EditableSection & { savedTexts: Record<TextLang, SectionText>; isNew?: boolean };

/** True when a language has edits that are not saved yet. */
export function isTextChanged(text: SectionText, saved: SectionText): boolean {
    return text.title !== saved.title || text.content !== saved.content;
}

interface Props {
    section: SectionDraft;
    isPending: boolean;
    canDelete: boolean;
    /** True right after a save, for the "Saved" tick. */
    justSaved: boolean;
    onChange: (updates: Partial<SectionDraft>) => void;
    onSave: (lang: TextLang) => void;
    onDelete: () => void;
}

export default function SectionEditForm({ section, isPending, canDelete, justSaved, onChange, onSave, onDelete }: Props) {
    const t = useTranslations('common');
    const tErrors = useTranslations('errors');
    // Opens on the original language.
    const [lang, setLang] = useState<TextLang>(section.originalLang);
    // Bumped when text is copied in or cleared, so the rich-text editor reloads its value.
    const [rev, setRev] = useState(0);
    // Set by a save with no title in the original language (checked here, no round trip).
    const [titleMissing, setTitleMissing] = useState(false);

    const text = section.texts[lang];
    const counterId = useId();
    const titleId = useId();
    const titleOver = TEXT_LANGS.some((l) => isOverLimit(section.texts[l].title, SECTION_TITLE_MAX));
    const missing = titleMissing && lang === section.originalLang && section.texts[lang].title.trim() === '';
    const errorLangs = TEXT_LANGS.filter((l) => isOverLimit(section.texts[l].title, SECTION_TITLE_MAX) || (titleMissing && l === section.originalLang && section.texts[l].title.trim() === ''));

    const setText = (updates: Partial<SectionText>) =>
        onChange({ texts: { ...section.texts, [lang]: { ...text, ...updates } } });

    const copyFromOriginal = (to: TextLang) => {
        const original = section.texts[section.originalLang];
        // A built-in title ("Par mums") is copied as its own translation ("About us").
        const defaults = Object.values(DEFAULT_SECTION_TITLES).find((d) => d[section.originalLang] === original.title.trim());
        onChange({ texts: { ...section.texts, [to]: { title: defaults ? defaults[to] : original.title, content: original.content } } });
        setRev((r) => r + 1);
    };

    const clear = (l: TextLang) => {
        onChange({ texts: { ...section.texts, [l]: { title: '', content: '' } } });
        setRev((r) => r + 1);
    };

    const save = () => {
        if (section.texts[section.originalLang].title.trim() === '') {
            setTitleMissing(true);
            setLang(section.originalLang);
            requestAnimationFrame(() => document.getElementById(titleId)?.focus());
            return;
        }
        onSave(lang);
    };

    return (
        <div className="pt-6">
            <LanguageEditor
                lang={lang}
                onLangChange={setLang}
                originalLang={section.originalLang}
                onOriginalLangChange={(l) => onChange({ originalLang: l })}
                filled={langRecord((l) => isSectionTextFilled(section.texts[l]))}
                errorLangs={errorLangs}
                onCopyFromOriginal={copyFromOriginal}
                onClear={clear}
                disabled={isPending}
            >
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor={titleId} className="mb-1.5 block text-tag text-foreground-muted">{t('fieldTitle')}</label>
                            <input
                                key={`title-${lang}`}
                                id={titleId}
                                type="text"
                                lang={lang}
                                value={text.title}
                                onChange={(e) => setText({ title: e.target.value })}
                                placeholder={t('fieldTitlePlaceholder')}
                                aria-describedby={counterId}
                                aria-invalid={missing || undefined}
                                className="w-full rounded-lg line bg-surface px-3 py-2 text-body md:text-body-sm focus:border-primary focus:outline-none aria-[invalid]:border-danger/40"
                            />
                            <div className="mt-1 flex items-start gap-2">
                                {missing && <p role="alert" className="text-meta text-danger">{tErrors('TITLE_REQUIRED')}</p>}
                                <TextCounter id={counterId} length={text.title.length} max={SECTION_TITLE_MAX} />
                            </div>
                        </div>

                        <SectionVisibilityField value={section.visibility} isFirst={section.order === 0} onChange={(visibility) => onChange({ visibility })} />
                    </div>

                    <div className="space-y-2" lang={lang}>
                        <label className="mb-1.5 block text-tag text-foreground-muted">{t('fieldContent')}</label>
                        <RichTextEditor
                            key={`${lang}-${rev}`}
                            value={text.content}
                            onChange={(val) => setText({ content: val })}
                            placeholder={t('fieldContentPlaceholder')}
                        />
                    </div>
                </div>
            </LanguageEditor>

            <SectionFormFooter canDelete={canDelete} isPending={isPending} saveDisabled={titleOver} justSaved={justSaved} onDelete={onDelete} onSave={save} />
        </div>
    );
}
