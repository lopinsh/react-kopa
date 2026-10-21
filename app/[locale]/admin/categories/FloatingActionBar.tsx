'use client';

import { useTranslations } from 'next-intl';
import { X, CheckCircle, Merge, Trash2 } from 'lucide-react';

type Props = {
    selectedIds: string[];
    onClearSelection: () => void;
    onApprove: () => void;
    onMerge: () => void;
    onDelete: () => void;
    hasPending: boolean; // Determines if Approve is visible
};

export default function FloatingActionBar({
    selectedIds,
    onClearSelection,
    onApprove,
    onMerge,
    onDelete,
    hasPending,
}: Props) {
    const t = useTranslations('admin.taxonomy.bulk');
    const c = useTranslations('common');

    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex items-center gap-4 bg-surface-elevated line shadow-premium px-4 py-3 rounded-pill pointer-events-auto">

                {/* Selection Count & Clear (Clickable area) */}
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClearSelection(); }}
                    className="flex items-center gap-2 pr-4 border-r border-border group/clear cursor-pointer hover:bg-surface/50 rounded-l-full transition-colors transition-colors py-1 -ml-2 pl-3"
                    title={t('clearSelection')}
                >
                    <span className="pointer-events-none flex items-center gap-2">
                        <span className="text-body-sm bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full group-hover/clear:bg-primary-hover shadow-control">
                            {selectedIds.length}
                        </span>
                        <span className="text-body-sm">{t('selected')}</span>
                        <X className="size-4 ml-1 text-foreground-muted group-hover/clear:text-foreground transition-colors" />
                    </span>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {hasPending && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApprove(); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-button-sm rounded-pill hover:bg-success/10 text-success transition-colors cursor-pointer"
                        >
                            <span className="pointer-events-none flex items-center gap-2">
                                <CheckCircle className="size-4" />
                                {c('approve')}
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMerge(); }}
                        disabled={selectedIds.length < 2}
                        className="flex items-center gap-2 px-3 py-1.5 text-button-sm rounded-pill hover:bg-tint text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title={selectedIds.length < 2 ? t('mergeRequiresTwo') : ''}
                    >
                        <span className="pointer-events-none flex items-center gap-2">
                            <Merge className="size-4" />
                            {c('merge')}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-button-sm rounded-pill hover:bg-danger/10 text-danger transition-colors cursor-pointer"
                    >
                        <span className="pointer-events-none flex items-center gap-2">
                            <Trash2 className="size-4" />
                            {c('delete')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
