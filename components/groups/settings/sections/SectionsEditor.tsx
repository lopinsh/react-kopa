'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { MAX_SECTIONS } from '@/lib/constants';
import type { EditableSection } from '@/lib/services/group.service';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SectionEditForm from '@/components/groups/SectionEditForm';
import SectionRow from './SectionRow';
import { useSectionsList } from './useSectionsList';

interface Props {
    groupId: string;
    initialSections: EditableSection[];
    locale: string;
}

export default function SectionsEditor({ groupId, initialSections, locale }: Props) {
    const t = useTranslations('group');
    const c_common = useTranslations('common');
    const tErrors = useTranslations('errors');
    const {
        sections, editingId, setEditingId, deleteTarget, setDeleteTarget,
        save, isPending, error, saved,
        updateSection, handleDelete, confirmDelete, handleMove, handleAddSection,
    } = useSectionsList(groupId, initialSections, locale);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div />
                <div className="rounded-pill line bg-surface-elevated px-3 py-1 text-tag text-foreground-muted">
                    {t('sections.count', { count: sections.length })}
                </div>
            </div>

            {error && (
                <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-body-sm text-danger">
                    {tErrors(error as 'ACTION_FAILED')}
                </div>
            )}

            <div className="grid gap-4">
                {sections.map((section, index) => (
                    <SectionRow
                        key={section.id}
                        section={section}
                        index={index}
                        isLast={index === sections.length - 1}
                        isEditing={editingId === section.id}
                        isPending={isPending}
                        onToggle={() => setEditingId(editingId === section.id ? null : section.id)}
                        onMove={(direction) => handleMove(index, direction)}
                    >
                        <SectionEditForm
                            section={section}
                            isPending={isPending}
                            canDelete={index > 0}
                            justSaved={saved === section.id}
                            onChange={(updates) => updateSection(section.id, updates)}
                            onSave={(lang) => save(section, lang)}
                            onDelete={() => handleDelete(section)}
                        />
                    </SectionRow>
                ))}

                {sections.length < MAX_SECTIONS && (
                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="group relative flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-foreground-muted transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full line bg-surface-elevated transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                            <Plus className="size-4" />
                        </div>
                        <span className="text-tag">{t('sections.add')}</span>
                    </button>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title={c_common('deleteSection')}
                message={t('deleteSectionConfirm')}
                confirmLabel={c_common('deleteSection')}
                destructive
                isPending={isPending}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
