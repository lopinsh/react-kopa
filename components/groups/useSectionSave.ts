'use client';

import { useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import { upsertSectionAction } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';
import { isDefaultSectionTitle } from '@/lib/constants';
import { hasText, TEXT_LANGS, type TextLang } from '@/lib/translations';
import { isSectionTextFilled } from '@/lib/validations/section';
import { isTextChanged, type SectionDraft } from '@/components/groups/SectionEditForm';

interface Options {
    groupId: string;
    locale: string;
    setSections: Dispatch<SetStateAction<SectionDraft[]>>;
    setEditingId: Dispatch<SetStateAction<string | null>>;
}

/** The languages to write for one save, the original first (a new original already has its title when the others follow). */
function languagesToSave(section: SectionDraft, currentLang: TextLang): TextLang[] {
    const wanted = section.isNew
        // A new section is created with the original; the others follow when they hold text.
        ? TEXT_LANGS.filter((l) => l === section.originalLang || isSectionTextFilled(section.texts[l]))
        : TEXT_LANGS.filter((l) => l === currentLang || isTextChanged(section.texts[l], section.savedTexts[l]));
    return [...wanted].sort((a, b) => Number(b === section.originalLang) - Number(a === section.originalLang));
}

/** Saving a group section: one language per call, unchanged languages are not touched; state, error and the "Saved" tick live here. */
export function useSectionSave({ groupId, locale, setSections, setEditingId }: Options) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    // Id of the section that was just saved, for the "Saved" tick.
    const [saved, setSaved] = useState<string | null>(null);

    const save = (section: SectionDraft, currentLang: TextLang) => {
        setError(null);
        setSaved(null);
        const langs = languagesToSave(section, currentLang);
        startTransition(async () => {
            let sectionId = section.id;
            let isNew = section.isNew;
            const done: TextLang[] = [];
            let failed: string | null = null;
            for (const lang of langs) {
                const { title, content } = section.texts[lang];
                // A lost connection rejects the call: stop like a failed save, so the drafts stay and the languages done are kept.
                const result = await upsertSectionAction(
                    groupId,
                    // The first save of a new section creates it with that language as its original.
                    { id: isNew ? undefined : sectionId, lang, title, content, visibility: section.visibility, originalLang: isNew ? undefined : section.originalLang },
                    locale
                ).catch(() => ({ success: false as const, error: 'SAVE_FAILED' }));
                if (!result.success) {
                    failed = result.error;
                    break;
                }
                sectionId = result.data!.sectionId;
                isNew = false;
                done.push(lang);
            }
            if (failed) setError(failed);
            if (done.length === 0) return;

            setSections((prev) => prev.map((s) => {
                if (s.id !== section.id) return s;
                const texts = { ...s.texts };
                const savedTexts = { ...s.savedTexts };
                for (const l of done) savedTexts[l] = section.texts[l];
                // The server drops an untouched default title row in the other language when the original is renamed.
                const original = section.texts[section.originalLang];
                if (done.includes(section.originalLang) && !isDefaultSectionTitle(original.title)) {
                    for (const other of TEXT_LANGS.filter((l) => !done.includes(l))) {
                        if (isDefaultSectionTitle(savedTexts[other].title) && !hasText(savedTexts[other].content)) {
                            savedTexts[other] = { title: '', content: '' };
                            if (!isTextChanged(texts[other], s.savedTexts[other])) texts[other] = savedTexts[other];
                        }
                    }
                }
                return { ...s, id: sectionId, isNew: false, texts, savedTexts };
            }));
            if (sectionId !== section.id) setEditingId((cur) => (cur === section.id ? sectionId : cur));
            if (!failed) setSaved(sectionId);
            router.refresh();
        });
    };

    return { save, isPending, startTransition, error, setError, saved, setSaved };
}
