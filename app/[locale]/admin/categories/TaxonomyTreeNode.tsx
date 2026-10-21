import { ChevronRight, ChevronDown } from 'lucide-react';
import type { L1Category, PendingCategoryWithContext } from '@/lib/services/taxonomy.service';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import { tint } from '@/lib/color-utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

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
    const tNode = useTranslations('admin.taxonomy.node');
    const c = useTranslations('common');

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
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                    {l1.subcategories.map(l2 => (
                        <L2Node
                            key={l2.id}
                            title={l2.title}
                            groupCount={0}
                            tagsCount={l2.tags.length}
                            langs={l2.langs}
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

function L2Node({
    title,
    groupCount,
    tagsCount,
    langs,
    isPending,
    isSelected,
    onSelect,
    isChecked,
    onCheck
}: {
    title: string;
    groupCount: number;
    tagsCount: number;
    langs: Array<'en' | 'lv'>;
    isPending: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isChecked: boolean;
    onCheck: () => void;
}) {
    const tNode = useTranslations('admin.taxonomy.node');
    const missingLangs = (['lv', 'en'] as const).filter((code) => !langs.includes(code));
    return (
        <div
            className={`group flex items-center gap-3 pl-6 pr-4 py-2 cursor-pointer hover:bg-surface-elevated transition-colors border-l-2 -ml-px ${isPending
                ? 'border-dashed border-warning/40 hover:border-warning/40'
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

            {isPending && <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />}

            <span className={`text-body-sm ${isPending ? 'text-warning weight-medium' : 'weight-medium'}`}>
                {title}
            </span>

            {isPending && (
                <span className="text-meta text-foreground-muted">({tNode('pending')})</span>
            )}

            <div className="ml-auto flex gap-2">
                {missingLangs.map((code) => (
                    <span key={code} className="text-meta text-foreground-muted px-2 py-0.5 rounded-pill border border-dashed border-border">
                        {tNode('missingLang', { lang: code.toUpperCase() })}
                    </span>
                ))}
                {tagsCount > 0 && !isPending && (
                    <span className="text-meta text-foreground-muted px-2 py-0.5 rounded-pill line">
                        {tNode('wildcard', { count: tagsCount })}
                    </span>
                )}
                {groupCount > 0 && (
                    <span className="text-tag bg-surface px-2 py-0.5 rounded-pill line">
                        {tNode('group', { count: groupCount })}
                    </span>
                )}
            </div>
        </div>
    );
}
