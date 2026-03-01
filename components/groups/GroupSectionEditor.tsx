'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical, HelpCircle, Save, Layout } from 'lucide-react';
import { clsx } from 'clsx';
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
    accentColor?: string;
}

export default function GroupSectionEditor({ groupId, initialSections, locale, accentColor = '#6366f1' }: Props) {
    const t = useTranslations('group');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sections, setSections] = useState<GroupSection[]>(initialSections.sort((a, b) => a.order - b.order));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const accentStyle = { '--accent': accentColor } as React.CSSProperties;

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
            title: 'New Section',
            content: '',
            order: sections.length,
            visibility: 'PUBLIC'
        };
        setSections([...sections, newSection]);
        setEditingId(newSection.id);
    };

    return (
        <div className="space-y-8" style={accentStyle}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Layout className="h-5 w-5 text-[var(--accent)]" />
                        Page Sections
                    </h2>
                    <p className="text-xs text-foreground-muted mt-1">
                        Customize your group page with up to 6 sections.
                    </p>
                </div>
                <div className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                    {sections.length} / 6 Sections
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
                                    <h3 className="font-bold text-foreground truncate">{index === 0 ? "Home / About us" : section.title}</h3>
                                    {section.visibility === 'MEMBERS_ONLY' && (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                                            <EyeOff className="h-3 w-3" />
                                            Members Only
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-foreground-muted mt-0.5 truncate max-w-md">
                                    {section.content.replace(/<[^>]*>/g, '').substring(0, 100) || "Empty section..."}
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
                                    type="button"
                                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                        editingId === section.id
                                            ? "bg-[var(--accent)] text-white shadow-premium"
                                            : "bg-surface-elevated text-foreground hover:bg-border"
                                    )}
                                >
                                    {editingId === section.id ? "Done" : "Edit"}
                                </button>
                            </div>
                        </div>

                        {/* Editor Form */}
                        {editingId === section.id && (
                            <div className="p-6 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="space-y-6 pt-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-foreground-muted">Section Title</label>
                                            <input
                                                type="text"
                                                defaultValue={section.title}
                                                disabled={index === 0}
                                                onChange={(e) => {
                                                    const updated = sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s);
                                                    setSections(updated);
                                                }}
                                                placeholder="e.g. FAQ, Rules, Schedule..."
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-[var(--accent)] transition-all disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-wider text-foreground-muted">Visibility</label>
                                            <div className={clsx(
                                                "flex p-1 bg-surface-elevated rounded-xl border border-border",
                                                index === 0 && "opacity-50 pointer-events-none"
                                            )}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = sections.map(s => s.id === section.id ? { ...s, visibility: 'PUBLIC' as const } : s);
                                                        setSections(updated);
                                                    }}
                                                    className={clsx(
                                                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                        section.visibility === 'PUBLIC'
                                                            ? "bg-[var(--accent)] text-white shadow-sm"
                                                            : "text-foreground-muted hover:text-foreground"
                                                    )}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Public
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = sections.map(s => s.id === section.id ? { ...s, visibility: 'MEMBERS_ONLY' as const } : s);
                                                        setSections(updated);
                                                    }}
                                                    className={clsx(
                                                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                        section.visibility === 'MEMBERS_ONLY'
                                                            ? "bg-[var(--accent)] text-white shadow-sm"
                                                            : "text-foreground-muted hover:text-foreground"
                                                    )}
                                                >
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                    Members Only
                                                </button>
                                            </div>
                                            {index === 0 && (
                                                <p className="text-[10px] text-foreground-muted mt-1 px-1 flex items-center gap-1">
                                                    <HelpCircle className="h-2.5 w-2.5" />
                                                    Home section must remain public.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-wider text-foreground-muted">Content</label>
                                        <RichTextEditor
                                            value={section.content}
                                            onChange={(val) => {
                                                const updated = sections.map(s => s.id === section.id ? { ...s, content: val } : s);
                                                setSections(updated);
                                            }}
                                            placeholder="Tell members more about this section..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        {index > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-xs px-2 py-1 rounded-lg hover:bg-red-500/5 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete Section
                                            </button>
                                        ) : (
                                            <div className="text-[10px] text-foreground-muted italic flex items-center gap-2">
                                                <HelpCircle className="h-3 w-3" />
                                                Initial section cannot be deleted or renamed.
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleSaveSection(section)}
                                            disabled={isPending}
                                            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-premium hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Section
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
