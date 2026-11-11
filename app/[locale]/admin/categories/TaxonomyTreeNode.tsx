import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { L1Category, PendingCategoryWithContext } from '@/lib/services/taxonomy.service';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import { tint } from '@/lib/color-utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

import { useTranslations } from 'next-intl';
import TaxonomyTreeRow from './TaxonomyTreeRow';

type Props = {
    l1: L1Category;
    pendingL2s: PendingCategoryWithContext[];
    /** Pending suggestions by parent id: Veids suggestions under an L1, sub-veids ones under an L2. */
    pendingByParent: Record<string, PendingCategoryWithContext[]>;
    selectedNode: SelectedTaxonomyNode | null;
    onNodeSelect: (node: SelectedTaxonomyNode | null) => void;
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
    selectedActionIds: string[];
    onToggleActionId: (id: string) => void;
};

export default function TaxonomyTreeNode({ l1, pendingL2s, pendingByParent, selectedNode, onNodeSelect, isExpanded, onToggle, selectedActionIds, onToggleActionId }: Props) {
    const tNode = useTranslations('admin.taxonomy.node');
    const c = useTranslations('common');

    const [openL2, setOpenL2] = useState<Set<string>>(() => new Set(l1.subcategories.filter(l2 => pendingByParent[l2.id]?.length).map(l2 => l2.id)));
    const toggleL2 = (id: string) => setOpenL2(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

    const isSelected = selectedNode?.type === 'l1' && selectedNode.id === l1.id;

    return (
        <div className="flex flex-col border-b border-border last:border-b-0">
            {/* L1 Row */}
            <div
                className={`group flex items-center gap-3 px-4 py-3 cursor-default hover:bg-surface-elevated transition-colors border-l-4 ${isSelected ? 'bg-surface-elevated' : ''}`}
                style={{ borderLeftColor: l1.color }}
                onClick={() => onToggle(!isExpanded)}
            >
                <div className="p-1 text-foreground-muted">
                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </div>

                <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: tint(l1.color, 12), color: l1.color }}>
                    <CategoryIcon slug={l1.slug} className="w-4 h-4" />
                </div>

                <span className="weight-strong">{l1.title}</span>

                <span className="ml-auto text-tag bg-surface-elevated text-foreground-muted px-2 py-0.5 rounded-pill">
                    {tNode('children', { count: l1.subcategories.length })}
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onNodeSelect({ type: 'l1', id: l1.id });
                    }}
                    className="ml-2 text-tag bg-surface line px-3 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                    {c('edit')}
                </button>
            </div>

            {/* L2 Children (Active + Pending) */}
            {isExpanded && (
                <div className="flex flex-col ml-9 border-l border-border pb-2">
                    {l1.subcategories.map(l2 => {
                        const pendingSubs = pendingByParent[l2.id] ?? [];
                        const hasSubs = l2.tags.length + pendingSubs.length > 0;
                        return (
                            <div key={l2.id} className="flex flex-col">
                                <TaxonomyTreeRow
                                    title={l2.title}
                                    groupCount={0}
                                    tagsCount={l2.tags.length}
                                    langs={l2.langs}
                                    isPending={false}
                                    open={openL2.has(l2.id)}
                                    onToggleOpen={hasSubs ? () => toggleL2(l2.id) : undefined}
                                    isSelected={selectedNode?.type === 'l2' && selectedNode.id === l2.id}
                                    onSelect={() => onNodeSelect({ type: 'l2', id: l2.id, l1Id: l1.id })}
                                    isChecked={selectedActionIds.includes(l2.id)}
                                    onCheck={() => onToggleActionId(l2.id)}
                                />
                                {openL2.has(l2.id) && (
                                    <>
                                        {l2.tags.map(l3 => (
                                            <TaxonomyTreeRow
                                                key={l3.id}
                                                depth={3}
                                                title={l3.title}
                                                groupCount={0}
                                                tagsCount={0}
                                                langs={['en', 'lv']}
                                                isPending={false}
                                                isSelected={selectedNode?.type === 'l3' && selectedNode.id === l3.id}
                                                onSelect={() => onNodeSelect({ type: 'l3', id: l3.id, l2Id: l2.id, l1Id: l1.id })}
                                                isChecked={selectedActionIds.includes(l3.id)}
                                                onCheck={() => onToggleActionId(l3.id)}
                                            />
                                        ))}
                                        {pendingSubs.map(pending => (
                                            <TaxonomyTreeRow
                                                key={pending.id}
                                                depth={3}
                                                title={pending.submittedLabel}
                                                groupCount={pending.groups.length}
                                                tagsCount={0}
                                                langs={[pending.submittedLang]}
                                                isPending={true}
                                                isSelected={selectedNode?.type === 'pending' && selectedNode.id === pending.id}
                                                onSelect={() => onNodeSelect({ type: 'pending', id: pending.id })}
                                                isChecked={selectedActionIds.includes(pending.id)}
                                                onCheck={() => onToggleActionId(pending.id)}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {pendingL2s.map(pending => (
                        <TaxonomyTreeRow
                            key={pending.id}
                            title={pending.submittedLabel}
                            groupCount={pending.groups.length}
                            tagsCount={0}
                            langs={[pending.submittedLang]}
                            isPending={true}
                            isSelected={selectedNode?.type === 'pending' && selectedNode.id === pending.id}
                            onSelect={() => onNodeSelect({ type: 'pending', id: pending.id })}
                            isChecked={selectedActionIds.includes(pending.id)}
                            onCheck={() => onToggleActionId(pending.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
