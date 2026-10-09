'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, ChevronUp, ChevronDown, GripVertical, Lock, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';
import { upsertSectionAction, reorderSectionsAction, deleteSectionAction } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';
import { isDefaultSectionTitle } from '@/lib/constants';
import { toTextLang, TEXT_LANGS, type TextLang } from '@/lib/translations';
import type { EditableSection } from '@/lib/services/group.service';
import SectionEditForm, { type SectionDraft } from '@/components/groups/SectionEditForm';

const MAX_SECTIONS = 6;

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

interface Props {
    groupId: string;
    initialSections: EditableSection[];
    locale: string;
}

export default function GroupSectionEditor({ groupId, initialSections, locale }: Props) {
    const t = useTranslations('group');
    const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sections, setSections] = useState<SectionDraft[]>([...initialSections].sort((a, b) => a.order - b.order));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState<{ id: string; lang: TextLang } | null>(null);

    const updateSection = (id: string, updates: Partial<SectionDraft>) => {
        setSaved(null);
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    };

    /** Saves one language of a section (the other languages are not touched). */
    const handleSave = (section: SectionDraft, lang: TextLang) => {
        setError(null);
        setSaved(null);
        const { title, content } = section.texts[lang];
        startTransition(async () => {
            const result = await upsertSectionAction(
                groupId,
                {
                    id: section.isNew ? undefined : section.id,
                    lang,
                    title,
                    content,
                    order: section.order,
                    visibility: section.visibility,
                    originalLang: section.isNew ? undefined : section.originalLang
                },
                locale
            );
            if (!result.success) {
                setError(result.error);
                return;
            }
            const sectionId = result.data!.sectionId;
            setSections((prev) => prev.map((s) => {
                if (s.id !== section.id) return s;
                // The server drops a leftover default title in the other language when the original is renamed.
                const clearDefault = lang === s.originalLang && !isDefaultSectionTitle(title);
                const texts = { ...s.texts };
                for (const other of TEXT_LANGS.filter((l) => l !== lang)) {
                    if (clearDefault && isDefaultSectionTitle(texts[other].title)) texts[other] = { ...texts[other], title: '' };
                }
                return { ...s, id: sectionId, isNew: false, texts };
            }));
            if (editingId === section.id) setEditingId(sectionId);
            setSaved({ id: sectionId, lang });
            router.refresh();
        });
    };

    const handleDelete = (section: SectionDraft) => {
        if (section.isNew) {
            setSections((prev) => prev.filter((s) => s.id !== section.id));
            setEditingId(null);
            return;
        }
        if (!window.confirm(t('deleteConfirm'))) return;

        setError(null);
        startTransition(async () => {
            const result = await deleteSectionAction(section.id, locale);
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

        // A new section starts in the editor's language; translations are added after the first save.
        const lang = toTextLang(locale);
        const empty = { title: '', content: '' };
        const newSection: SectionDraft = {
            id: 'new-' + Date.now(),
            order: sections.length,
            visibility: 'PUBLIC',
            originalLang: lang,
            texts: { lv: empty, en: empty, [lang]: { title: c_common('newSection'), content: '' } },
            isNew: true
        };
        setSections([...sections, newSection]);
        setEditingId(newSection.id);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div />
                <div className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                    {t('sections.count', { count: sections.length })}
                </div>
            </div>

            {error && (
                <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
                    {tErrors(error as 'ACTION_FAILED')}
                </div>
            )}

            <div className="grid gap-4">
                {sections.map((section, index) => {
                    const original = section.texts[section.originalLang];
                    const isEditing = editingId === section.id;
                    return (
                        <div
                            key={section.id}
                            className={clsx(
                                'group relative overflow-hidden rounded-2xl border transition-all duration-200',
                                isEditing
                                    ? 'border-[var(--accent)] bg-surface-elevated ring-4 ring-[var(--accent)]/5'
                                    : 'border-border bg-surface hover:border-[var(--accent)]/30'
                            )}
                        >
                            <div className="flex items-center gap-4 p-4 md:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-foreground-muted">
                                    {index === 0 ? <span className="text-xs font-black">0</span> : <GripVertical className="h-4 w-4" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 lang={section.originalLang} className="font-semibold text-foreground">{original.title}</h3>
                                        {section.visibility === 'MEMBERS_ONLY' && (
                                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
                                                <Lock className="h-2.5 w-2.5" />
                                                {c_common('visibilityMembersOnly')}
                                            </span>
                                        )}
                                    </div>
                                    <p lang={section.originalLang} className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">
                                        {original.content ? stripHtml(original.content) : c_common('emptyContent')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {index > 0 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 1 || isPending}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-elevated disabled:opacity-20"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === sections.length - 1 || isPending}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-elevated disabled:opacity-20"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setEditingId(isEditing ? null : section.id)}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-primary"
                                        title={isEditing ? c_common('done') : c_common('edit')}
                                    >
                                        <Settings2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="animate-in border-t border-border/50 p-6 pt-0 duration-300 fade-in slide-in-from-top-4">
                                    <SectionEditForm
                                        section={section}
                                        isPending={isPending}
                                        canDelete={index > 0}
                                        savedLang={saved?.id === section.id ? saved.lang : null}
                                        onChange={(updates) => updateSection(section.id, updates)}
                                        onSave={(lang) => handleSave(section, lang)}
                                        onDelete={() => handleDelete(section)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {sections.length < MAX_SECTIONS && (
                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="group relative flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-foreground-muted transition-all hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated transition-all group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{t('sections.add')}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
