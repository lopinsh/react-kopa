'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { reorderSectionsAction, deleteSectionAction } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';
import { MAX_SECTIONS } from '@/lib/constants';
import { langRecord, toTextLang } from '@/lib/translations';
import type { EditableSection } from '@/lib/services/group.service';
import { type SectionDraft } from '@/components/groups/SectionEditForm';
import { useSectionSave } from '@/components/groups/useSectionSave';

/** List state and actions of the sections editor: open row, save, delete, move, add. */
export function useSectionsList(groupId: string, initialSections: EditableSection[], locale: string) {
    const c_common = useTranslations('common');
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<SectionDraft | null>(null);
    const [sections, setSections] = useState<SectionDraft[]>(() =>
        [...initialSections].sort((a, b) => a.order - b.order).map((s) => ({ ...s, savedTexts: s.texts }))
    );
    const [editingId, setEditingId] = useState<string | null>(null);
    const { save, isPending, startTransition, error, setError, saved, setSaved } = useSectionSave({ groupId, locale, setSections, setEditingId });

    const updateSection = (id: string, updates: Partial<SectionDraft>) => {
        setSaved(null);
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    const handleDelete = (section: SectionDraft) => {
        if (section.isNew) {
            setSections((prev) => prev.filter((s) => s.id !== section.id));
            setEditingId(null);
            return;
        }
        setDeleteTarget(section);
    };

    const confirmDelete = () => {
        const section = deleteTarget;
        if (!section || isPending) return;
        setError(null);
        startTransition(async () => {
            const result = await deleteSectionAction(section.id, locale);
            setDeleteTarget(null);
            if (result.success) {
                setSections((prev) => prev.filter((s) => s.id !== section.id));
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 1 || targetIndex >= sections.length) return; // Cannot move index 0 or out of bounds

        const [moved] = newSections.splice(index, 1);
        newSections.splice(targetIndex, 0, moved);

        const updated = newSections.map((s, i) => ({ ...s, order: i }));
        setSections(updated);

        startTransition(async () => {
            await reorderSectionsAction(groupId, updated.filter((s) => !s.isNew).map((s) => s.id), locale);
            router.refresh();
        });
    };

    const handleAddSection = () => {
        if (sections.length >= MAX_SECTIONS || sections.some((s) => s.isNew)) return;

        // A new section starts in the editor's language; translations can be written before the first save.
        const lang = toTextLang(locale);
        const empty = { title: '', content: '' };
        const newSection: SectionDraft = {
            id: 'new-' + Date.now(),
            order: sections.length,
            visibility: 'PUBLIC',
            originalLang: lang,
            texts: langRecord((l) => (l === lang ? { title: c_common('newSection'), content: '' } : empty)),
            savedTexts: langRecord(() => empty),
            isNew: true
        };
        setSections([...sections, newSection]);
        setEditingId(newSection.id);
    };

    return {
        sections, editingId, setEditingId, deleteTarget, setDeleteTarget,
        save, isPending, error, saved,
        updateSection, handleDelete, confirmDelete, handleMove, handleAddSection,
    };
}
