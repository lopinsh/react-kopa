'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, Save, Lock, Globe, Check } from 'lucide-react';
import { clsx } from 'clsx';
import RichTextEditor from '@/components/ui/RichTextEditor';
import LangSwitch from '@/components/ui/LangSwitch';
import UntranslatedNotice from '@/components/ui/UntranslatedNotice';
import OriginalLangControl from '@/components/ui/OriginalLangControl';
import { isDefaultSectionTitle } from '@/lib/constants';
import { hasText, type TextLang } from '@/lib/translations';
import type { EditableSection } from '@/lib/services/group.service';

/** A section in the editor; `isNew` until its first save. */
export type SectionDraft = EditableSection & { isNew?: boolean };

/** A language counts as written when it has content or an owner-written (non-default) title. */
export function isLangFilled(text: { title: string; content: string }): boolean {
    return hasText(text.content) || (text.title.trim() !== '' && !isDefaultSectionTitle(text.title));
}

interface Props {
    section: SectionDraft;
    isPending: boolean;
    canDelete: boolean;
    /** Language that was just saved, for the "Saved" tick. */
    savedLang: TextLang | null;
    onChange: (updates: Partial<SectionDraft>) => void;
    onSave: (lang: TextLang) => void;
    onDelete: () => void;
}

export default function SectionEditForm({ section, isPending, canDelete, savedLang, onChange, onSave, onDelete }: Props) {
    const t = useTranslations('common');
    // Opens on the original language; a new section only has that one.
    const [lang, setLang] = useState<TextLang>(section.originalLang);
    // Bumped when text is copied in, so the rich-text editor reloads its value.
    const [rev, setRev] = useState(0);

    const text = section.texts[lang];
    const filled = { lv: isLangFilled(section.texts.lv), en: isLangFilled(section.texts.en) };
    const isFirst = section.order === 0;

    const setText = (updates: Partial<{ title: string; content: string }>) =>
        onChange({ texts: { ...section.texts, [lang]: { ...text, ...updates } } });

    const copyFromOriginal = () => {
        onChange({ texts: { ...section.texts, [lang]: { ...section.texts[section.originalLang] } } });
        setRev((r) => r + 1);
    };

    return (
        <div className="space-y-6 pt-6">
            {!section.isNew && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <LangSwitch value={lang} onChange={setLang} filled={filled} />
                    <OriginalLangControl value={section.originalLang} onChange={(l) => onChange({ originalLang: l })} filled={filled} />
                </div>
            )}

            {!section.isNew && !filled[lang] && lang !== section.originalLang && (
                <UntranslatedNotice original={section.originalLang} onCopy={copyFromOriginal} />
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">{t('fieldTitle')}</label>
                    <input
                        type="text"
                        lang={lang}
                        value={text.title}
                        onChange={(e) => setText({ title: e.target.value })}
                        placeholder={t('fieldTitlePlaceholder')}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">{t('fieldVisibility')}</label>
                    <div className="flex gap-2">
                        {(['PUBLIC', 'MEMBERS_ONLY'] as const).map((v) => {
                            const Icon = v === 'PUBLIC' ? Globe : Lock;
                            const locked = isFirst && v === 'MEMBERS_ONLY';
                            return (
                                <button
                                    key={v}
                                    type="button"
                                    disabled={locked}
                                    onClick={() => onChange({ visibility: v })}
                                    className={clsx(
                                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all disabled:opacity-40',
                                        section.visibility === v ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-foreground-muted hover:bg-surface-elevated'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {v === 'PUBLIC' ? t('public') : t('visibilityMembersOnly')}
                                </button>
                            );
                        })}
                    </div>
                    {isFirst && <span className="mt-1 inline-block text-[10px] text-foreground-muted">{t('homeVisibilityWarning')}</span>}
                </div>
            </div>

            <div className="space-y-2" lang={lang}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">{t('fieldContent')}</label>
                <RichTextEditor
                    key={`${lang}-${rev}`}
                    value={text.content}
                    onChange={(val) => setText({ content: val })}
                    placeholder={t('fieldContentPlaceholder')}
                />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
                {canDelete ? (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isPending}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-40"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('deleteSection')}
                    </button>
                ) : <span />}

                <div className="flex items-center gap-3">
                    {savedLang === lang && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-foreground-muted" role="status">
                            <Check className="h-3.5 w-3.5" />
                            {t('sectionSaved')}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onSave(lang)}
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-premium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {t('saveSection')}
                    </button>
                </div>
            </div>
        </div>
    );
}
