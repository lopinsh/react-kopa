import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import type { L1Category, ActiveL2WithAliases, PendingCategoryWithContext, TaxonomyTree as TaxonomyTreeData } from '@/lib/services/taxonomy.service';
import SlideoverL1View from './SlideoverL1View';
import SlideoverL2View from './SlideoverL2View';
import SlideoverPendingView from './SlideoverPendingView';
import SlideoverMergeView from './SlideoverMergeView';

type Props = {
    selectedNode: SelectedTaxonomyNode | null;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
    onClose: () => void;
    tree: TaxonomyTreeData;
    categories: ActiveL2WithAliases[];
    pendingTags: PendingCategoryWithContext[];
};

export default function TaxonomySlideover({ selectedNode, onNodeSelect, onClose, tree, categories, pendingTags }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (selectedNode) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedNode, onClose]);

    if (!selectedNode) return null;

    let content = null;

    if (selectedNode.type === 'l1') {
        const l1 = tree.find(t => t.id === selectedNode.id);
        if (l1) content = <SlideoverL1View l1={l1} onNodeSelect={onNodeSelect} />;
    } else if (selectedNode.type === 'l2') {
        const l2 = categories.find(c => c.id === selectedNode.id);
        if (l2) content = <SlideoverL2View l2={l2} categories={categories} tree={tree} onNodeSelect={onNodeSelect} />;
    } else if (selectedNode.type === 'pending') {
        const pending = pendingTags.find(p => p.id === selectedNode.id);
        if (pending) {
            const canonicalOptions = categories.filter(c => c.parentId === pending.parent?.id);
            content = <SlideoverPendingView pending={pending} canonicalOptions={canonicalOptions} onClose={onClose} />;
        }
    } else if (selectedNode.type === 'bulk-merge') {
        content = <SlideoverMergeView selectedIds={selectedNode.ids} categories={categories} pendingTags={pendingTags} onClose={onClose} />;
    }

    if (!content) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg h-full bg-surface shadow-premium flex flex-col transform transition-transform animate-slide-in-right">
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated/30">
                    <h2 className="text-lg font-bold">{t('details')}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-border rounded-full transition-colors text-foreground-muted hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {content}
                </div>
            </div>
        </div>
    );
}
