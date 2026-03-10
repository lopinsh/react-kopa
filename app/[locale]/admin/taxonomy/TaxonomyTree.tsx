import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TaxonomyTree as TaxonomyTreeData, L1Category, PendingCategoryWithContext } from '@/lib/services/taxonomy.service';
import TaxonomyTreeNode from './TaxonomyTreeNode';

export type SelectedTaxonomyNode =
    | { type: 'l1'; id: string }
    | { type: 'l2'; id: string; l1Id: string }
    | { type: 'pending'; id: string }
    | { type: 'bulk-merge'; ids: string[] };

type Props = {
    tree: TaxonomyTreeData;
    pendingTags: PendingCategoryWithContext[];
    selectedNode: SelectedTaxonomyNode | null;
    onNodeSelect: (node: SelectedTaxonomyNode | null) => void;
    selectedActionIds: string[];
    onToggleActionId: (id: string) => void;
};

export default function TaxonomyTree({ tree, pendingTags, selectedNode, onNodeSelect, selectedActionIds, onToggleActionId }: Props) {
    const t = useTranslations('admin.taxonomy.tree');

    // Group pending tags by their parent L1 to render them under the correct L1
    const pendingByParent = pendingTags.reduce((acc, tag) => {
        if (!tag.parent) return acc;
        if (!acc[tag.parent.id]) {
            acc[tag.parent.id] = [];
        }
        acc[tag.parent.id].push(tag);
        return acc;
    }, {} as Record<string, PendingCategoryWithContext[]>);

    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        tree.forEach(l1 => {
            if (pendingByParent[l1.id]?.length > 0) {
                initial.add(l1.id);
            }
        });
        return initial;
    });

    const isAllExpanded = expandedIds.size > 0 && expandedIds.size === tree.length;

    const toggleExpandAll = () => {
        if (isAllExpanded) {
            setExpandedIds(new Set());
        } else {
            setExpandedIds(new Set(tree.map(t => t.id)));
        }
    };

    const handleToggleNode = (id: string, isExpanded: boolean) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (isExpanded) next.add(id);
            else next.delete(id);
            return next;
        });
    };


    return (
        <div className="w-full bg-surface border border-border rounded-xl shadow-premium overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated/30">
                <h2 className="text-lg font-bold">{t('title')}</h2>
                <button
                    type="button"
                    onClick={toggleExpandAll}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    {isAllExpanded ? t('collapseAll') : t('expandAll')}
                </button>
            </div>
            <div className="flex flex-col">
                {tree.map(l1 => (
                    <TaxonomyTreeNode
                        key={l1.id}
                        l1={l1}
                        pendingL2s={pendingByParent[l1.id] || []}
                        selectedNode={selectedNode}
                        onNodeSelect={onNodeSelect}
                        isExpanded={expandedIds.has(l1.id)}
                        onToggle={(expanded: boolean) => handleToggleNode(l1.id, expanded)}
                        selectedActionIds={selectedActionIds}
                        onToggleActionId={onToggleActionId}
                    />
                ))}
            </div>
        </div>
    );
}
