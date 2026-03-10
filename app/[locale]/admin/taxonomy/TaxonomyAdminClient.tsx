'use client';

import { useState, useTransition } from 'react';
import type { ActiveL2WithAliases, PendingCategoryWithContext, TaxonomyTree as TaxonomyTreeData } from '@/lib/services/taxonomy.service';
import PendingInbox from './PendingInbox';
import TaxonomyTree, { SelectedTaxonomyNode } from './TaxonomyTree';
import TaxonomySlideover from './TaxonomySlideover';
import FloatingActionBar from './FloatingActionBar';
import { bulkApprovePendingAction, bulkDeleteAction } from '@/actions/taxonomy-actions';

type Props = {
    locale: string;
    pending: PendingCategoryWithContext[];
    categories: ActiveL2WithAliases[];
    tree: TaxonomyTreeData;
};

export default function TaxonomyAdminClient({ pending, categories, tree }: Props) {
    const [selectedNode, setSelectedNode] = useState<SelectedTaxonomyNode | null>(null);
    const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
    const [isPendingTransitions, startTransition] = useTransition();

    const toggleActionId = (id: string) => {
        setSelectedActionIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const hasPending = pending.some(p => selectedActionIds.includes(p.id));

    const handleApprove = () => {
        startTransition(async () => {
            const res = await bulkApprovePendingAction(selectedActionIds);
            if (res.success) {
                setSelectedActionIds([]);
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete the selected categories? This will permanently remove them from all groups.')) {
            startTransition(async () => {
                const res = await bulkDeleteAction(selectedActionIds);
                if (res.success) {
                    setSelectedActionIds([]);
                }
            });
        }
    };

    const handleMerge = () => {
        if (selectedActionIds.length < 2) return;
        setSelectedNode({ type: 'bulk-merge', ids: selectedActionIds });
    };

    return (
        <div className="space-y-6">
            <PendingInbox
                pendingTags={pending}
                categories={categories}
                onNodeSelect={setSelectedNode}
            />

            <TaxonomyTree
                tree={tree}
                pendingTags={pending}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
                selectedActionIds={selectedActionIds}
                onToggleActionId={toggleActionId}
            />

            <TaxonomySlideover
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
                onClose={() => setSelectedNode(null)}
                tree={tree}
                categories={categories}
                pendingTags={pending}
            />

            <FloatingActionBar
                selectedIds={selectedActionIds}
                onClearSelection={() => setSelectedActionIds([])}
                hasPending={hasPending}
                onApprove={handleApprove}
                onDelete={handleDelete}
                onMerge={handleMerge}
            />
        </div>
    );
}
