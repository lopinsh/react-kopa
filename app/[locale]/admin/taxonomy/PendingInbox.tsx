import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { PendingCategoryWithContext, ActiveL2WithAliases } from '@/lib/services/taxonomy.service';
import PendingInboxCard from './PendingInboxCard';
import type { SelectedTaxonomyNode } from './TaxonomyTree';

type Props = {
    pendingTags: PendingCategoryWithContext[];
    categories: ActiveL2WithAliases[];
    onNodeSelect: (node: SelectedTaxonomyNode | null) => void;
};

export default function PendingInbox({ pendingTags, categories, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.inbox');
    const [isExpanded, setIsExpanded] = useState(false);

    if (pendingTags.length === 0) {
        return null; // Hidden when empty
    }

    return (
        <div className={`w-full rounded-xl border border-amber-200 shadow-sm overflow-hidden transition-colors ${isExpanded ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-surface'}`}>
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-amber-900 dark:text-amber-100">{t('title')}</span>
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingTags.length}
                    </span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 grid gap-4">
                    {pendingTags.map(tag => (
                        <PendingInboxCard
                            key={tag.id}
                            item={tag}
                            canonicalOptions={categories.filter(c => c.parentId === tag.parent?.id)}
                            onSelect={() => onNodeSelect({ type: 'pending', id: tag.id })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
