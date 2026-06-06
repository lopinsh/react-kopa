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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div className="flex items-center gap-4 bg-surface-elevated border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-4 py-3 rounded-full pointer-events-auto">

                {/* Selection Count & Clear (Clickable area) */}
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClearSelection(); }}
                    className="flex items-center gap-2 pr-4 border-r border-border group/clear cursor-pointer hover:bg-surface/50 rounded-l-full transition-colors transition-all py-1 -ml-2 pl-3"
                    title={t('clearSelection')}
                >
                    <span className="pointer-events-none flex items-center gap-2">
                        <span className="text-sm font-semibold bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full group-hover/clear:bg-primary-hover shadow-sm">
                            {selectedIds.length}
                        </span>
                        <span className="text-sm font-medium">{t('selected')}</span>
                        <X className="w-4 h-4 ml-1 text-foreground-muted group-hover/clear:text-foreground transition-colors" />
                    </span>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {hasPending && (
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApprove(); }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                        >
                            <span className="pointer-events-none flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {c('approve')}
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMerge(); }}
                        disabled={selectedIds.length < 2}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title={selectedIds.length < 2 ? t('mergeRequiresTwo') : ''}
                    >
                        <span className="pointer-events-none flex items-center gap-2">
                            <Merge className="w-4 h-4" />
                            {c('merge')}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                    >
                        <span className="pointer-events-none flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {c('delete')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
