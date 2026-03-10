import { ChevronRight, ChevronDown } from 'lucide-react';
import type { L1Category, PendingCategoryWithContext } from '@/lib/services/taxonomy.service';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import { getCategoryIcon } from '@/lib/icons';

import { useTranslations } from 'next-intl';

type Props = {
    l1: L1Category;
    pendingL2s: PendingCategoryWithContext[];
    selectedNode: SelectedTaxonomyNode | null;
    onNodeSelect: (node: SelectedTaxonomyNode | null) => void;
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
    selectedActionIds: string[];
    onToggleActionId: (id: string) => void;
};

export default function TaxonomyTreeNode({ l1, pendingL2s, selectedNode, onNodeSelect, isExpanded, onToggle, selectedActionIds, onToggleActionId }: Props) {
    const t = useTranslations('admin.taxonomy.tree');

    const isSelected = selectedNode?.type === 'l1' && selectedNode.id === l1.id;
    const Icon = getCategoryIcon(l1.slug);

    return (
        <div className="flex flex-col border-b border-border last:border-b-0">
            {/* L1 Row */}
            <div
                className={`group flex items-center gap-3 px-4 py-3 cursor-default hover:bg-surface-elevated transition-colors border-l-4 ${isSelected ? 'bg-surface-elevated' : ''}`}
                style={{ borderLeftColor: l1.color }}
                onClick={() => onToggle(!isExpanded)}
            >
                <div className="p-1 text-foreground-muted">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>

                <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${l1.color}20`, color: l1.color }}>
                    <Icon className="w-4 h-4" />
                </div>

                <span className="font-semibold">{l1.title}</span>

                <span className="ml-auto text-xs font-semibold bg-surface-elevated text-foreground-muted px-2 py-0.5 rounded-full">
                    {l1.subcategories.length} children
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onNodeSelect({ type: 'l1', id: l1.id });
                    }}
                    className="ml-2 text-xs font-semibold bg-surface border border-border px-3 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                    {t('edit')}
                </button>
            </div>

            {/* L2 Children (Active + Pending) */}
            {isExpanded && (
                <div className="flex flex-col ml-[2.25rem] border-l border-border pb-2">
                    {l1.subcategories.map(l2 => (
                        <L2Node
                            key={l2.id}
                            id={l2.id}
                            l1Id={l1.id}
                            title={l2.title}
                            groupCount={0} /* Group count isn't fully in this type yet, might need adjustment or alias count */
                            tagsCount={l2.tags.length}
                            isPending={false}
                            isSelected={selectedNode?.type === 'l2' && selectedNode.id === l2.id}
                            onSelect={() => onNodeSelect({ type: 'l2', id: l2.id, l1Id: l1.id })}
                            isChecked={selectedActionIds.includes(l2.id)}
                            onCheck={() => onToggleActionId(l2.id)}
                        />
                    ))}
                    {pendingL2s.map(pending => (
                        <L2Node
                            key={pending.id}
                            id={pending.id}
                            l1Id={l1.id}
                            title={pending.submittedLabel}
                            groupCount={pending.groups.length}
                            tagsCount={0}
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

function L2Node({
    id,
    l1Id,
    title,
    groupCount,
    tagsCount,
    isPending,
    isSelected,
    onSelect,
    isChecked,
    onCheck
}: {
    id: string;
    l1Id: string;
    title: string;
    groupCount: number;
    tagsCount: number;
    isPending: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isChecked: boolean;
    onCheck: () => void;
}) {
    return (
        <div
            className={`group flex items-center gap-3 pl-6 pr-4 py-2 cursor-pointer hover:bg-surface-elevated transition-colors border-l-2 ml-[-1px] ${isPending
                ? 'border-dashed border-amber-200 hover:border-amber-300'
                : 'border-transparent hover:border-border'
                } ${isSelected ? 'bg-surface-elevated border-primary' : ''}`}
            onClick={onSelect}
        >
            <div
                className="flex items-center justify-center p-2 -ml-2 mr-0.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group/check"
                onClick={(e) => {
                    e.stopPropagation();
                    onCheck();
                }}
            >
                <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-surface cursor-pointer pointer-events-none"
                />
            </div>

            <div data-drag-handle className="w-4 h-4 flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-30 transition-opacity">
                {/* Drag handle placeholder (drag logic out of scope) */}
            </div>

            {isPending && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}

            <span className={`text-sm ${isPending ? 'text-amber-700 dark:text-amber-500 font-medium' : 'font-medium'}`}>
                {title}
            </span>

            {isPending && (
                <span className="text-xs text-foreground-muted">(pending)</span>
            )}

            <div className="ml-auto flex gap-2">
                {tagsCount > 0 && !isPending && (
                    <span className="text-xs text-foreground-muted px-2 py-0.5 rounded-full border border-border" title="Includes user-generated L3 wildcards">
                        {tagsCount} wildcards
                    </span>
                )}
                {groupCount > 0 && (
                    <span className="text-xs font-semibold bg-surface px-2 py-0.5 rounded-full border border-border">
                        {groupCount} {groupCount === 1 ? 'group' : 'groups'}
                    </span>
                )}
            </div>
        </div>
    );
}
