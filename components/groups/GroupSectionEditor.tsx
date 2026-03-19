'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical, HelpCircle, Save, Layout, Lock, Globe, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};
import RichTextEditor from '@/components/ui/RichTextEditor';
import { upsertSectionAction, reorderSectionsAction, deleteSectionAction } from '@/actions/group-actions';
import { useRouter } from '@/i18n/routing';

interface GroupSection {
    id: string;
    title: string;
    content: string;
    order: number;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
}

interface Props {
    groupId: string;
    initialSections: GroupSection[];
    locale: string;
}

export default function GroupSectionEditor({ groupId, initialSections, locale }: Props) {
    const t = useTranslations('group');
  const c_common = useTranslations('common');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sections, setSections] = useState<GroupSection[]>(initialSections.sort((a, b) => a.order - b.order));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSaveSection = (section: Partial<GroupSection>) => {
        setError(null);
        startTransition(async () => {
            // Remove temp ID if it's a new section
            const data = { ...section };
            if (data.id?.startsWith('new-')) {
                delete data.id;
            }

            const result = await upsertSectionAction(
                groupId,
                data as { id?: string; title: string; content: string; order?: number; visibility?: 'PUBLIC' | 'MEMBERS_ONLY' },
                locale
            );

            if (result.success) {
                setEditingId(null);
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!window.confirm(t('deleteConfirm'))) return;

        setError(null);
        startTransition(async () => {
            const result = await deleteSectionAction(sectionId, locale);
            if (result.success) {
                setSections(prev => prev.filter(s => s.id !== sectionId));
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

        // Update orders
        const updated = newSections.map((s, i) => ({ ...s, order: i }));
        setSections(updated);

        startTransition(async () => {
            await reorderSectionsAction(groupId, updated.map(s => s.id), locale);
            router.refresh();
        });
    };

    const handleAddSection = () => {
        if (sections.length >= 6) return;

        const newSection: GroupSection = {
            id: 'new-' + Date.now(),
            title: c_common('newSection'),
            content: '',
            order: sections.length,
            visibility: 'PUBLIC'
        };
        setSections([...sections, newSection]);
        setEditingId(newSection.id);
    };

    // Helper to update a section's properties
    const updateSection = (id: string, updates: Partial<GroupSection>) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // Helper to remove a section
    const removeSection = (id: string) => {
        if (!window.confirm(t('deleteConfirm'))) return;
        handleDeleteSection(id);
    };

    const addSection = () => {
        if (sections.length >= 6) return;

        const newSection: GroupSection = {
            id: 'new-' + Date.now(),
            title: c_common('newSection'),
            content: '',
            order: sections.length,
            visibility: 'PUBLIC'
        };
        setSections([...sections, newSection]);
        setEditingId(newSection.id);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layout className="h-5 w-5 text-primary" />
                        {c_common('title')}
                    </h2>
                    <p className="text-sm text-foreground-muted mt-1">
                        {c_common('subtitle')}
                    </p>
                </div>
                <div className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                    {t('sections.count', { count: sections.length })}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={clsx(
                            "group relative rounded-2xl border transition-all duration-200 overflow-hidden",
                            editingId === section.id
                                ? "border-[var(--accent)] bg-surface-elevated ring-4 ring-[var(--accent)]/5"
                                : "border-border bg-surface hover:border-[var(--accent)]/30"
                        )}
                    >
                        {/* Summary Header */}
                        <div className="p-4 md:p-6 flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-elevated border border-border text-foreground-muted">
                                {index === 0 ? (
                                    <span className="font-black text-xs">0</span>
                                ) : (
                                    <GripVertical className="h-4 w-4" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">
                                        {section.id === 'initial' ? c_common('homeAbout') : section.title}
                                    </h3>
                                    {section.visibility === 'MEMBERS_ONLY' && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase">
                                            <Lock className="h-2.5 w-2.5" />
                                            {c_common('visibilityMembersOnly')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-foreground-muted line-clamp-1 mt-0.5">
                                    {section.content ? stripHtml(section.content) : c_common('emptyContent')}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {index > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, 'up')}
                                            disabled={index === 1 || isPending}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated text-foreground-muted disabled:opacity-20"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, 'down')}
                                            disabled={index === sections.length - 1 || isPending}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated text-foreground-muted disabled:opacity-20"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated text-foreground-muted hover:text-primary transition-colors cursor-pointer"
                                    title={editingId === section.id ? c_common('done') : c_common('edit')}
                                >
                                    <Settings2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Form */}
                        {editingId === section.id && (
                            <div className="p-6 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="space-y-6 pt-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase tracking-wider">
                                                {c_common('fieldTitle')}
                                            </label>
                                            <input
                                                type="text"
                                                value={section.title}
                                                disabled={section.id === 'initial'}
                                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                                placeholder={c_common('fieldTitlePlaceholder')}
                                                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase tracking-wider">
                                                {c_common('fieldVisibility')}
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateSection(section.id, { visibility: 'PUBLIC' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${section.visibility === 'PUBLIC' ? 'bg-primary/5 border-primary text-primary' : 'bg-surface border-border text-foreground-muted hover:bg-surface-elevated'}`}
                                                >
                                                    <Globe className="h-3.5 w-3.5" />
                                                    {c_common('public')}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={section.id === 'initial'}
                                                    onClick={() => updateSection(section.id, { visibility: 'MEMBERS_ONLY' })}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${section.visibility === 'MEMBERS_ONLY' ? 'bg-primary/5 border-primary text-primary' : 'bg-surface border-border text-foreground-muted hover:bg-surface-elevated'}`}
                                                >
                                                    <Lock className="h-3.5 w-3.5" />
                                                    {c_common('visibilityMembersOnly')}
                                                </button>
                                            </div>
                                            {section.id === 'initial' && (
                                                <span className="text-[10px] text-foreground-muted mt-1 inline-block">
                                                    {c_common('homeVisibilityWarning')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-foreground-muted mb-1.5 uppercase tracking-wider">
                                            {c_common('fieldContent')}
                                        </label>
                                        <RichTextEditor
                                            value={section.content}
                                            onChange={(val) => updateSection(section.id, { content: val })}
                                            placeholder={c_common('fieldContentPlaceholder')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <button
                                            type="button"
                                            disabled={section.id === 'initial'}
                                            onClick={() => removeSection(section.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:grayscale"
                                            title={section.id === 'initial' ? c_common('deleteDisabledWarning') : c_common('deleteSection')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            {c_common('deleteSection')}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSaveSection(section)}
                                            disabled={isPending}
                                            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-premium hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            {c_common('saveSection')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Ghost Card for Add Section */}
                {sections.length < 6 && (
                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="group relative h-24 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-foreground-muted hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all"
                    >
                        <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Add New Section</span>
                    </button>
                )}
            </div>
        </div>
    );
}
