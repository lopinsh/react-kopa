import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import type { ActiveL2WithAliases, TaxonomyTree as TaxonomyTreeData } from '@/lib/services/taxonomy.service';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import SlideoverTopicForm from './SlideoverTopicForm';
import { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Props = {
    l3: ActiveL2WithAliases;
    categories: ActiveL2WithAliases[];
    tree: TaxonomyTreeData;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

/** A sub-veids: its Veids (read-only line), names and slugs, and a merge into a sibling. */
export default function SlideoverL3View({ l3, categories, tree, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const [mergeId, setMergeId] = useState('');

    const parent = tree.flatMap(l1 => l1.subcategories.map(sub => ({ l1, sub }))).find(x => x.sub.id === l3.parentId);
    const image = parent?.sub.tags.find(tag => tag.id === l3.id)?.image ?? null;
    // Siblings only: a sub-veids merges into another one of the same Veids.
    const siblings = categories.filter(x => x.level === 3 && x.parentId === l3.parentId && x.id !== l3.id);
    const titleOf = (x: ActiveL2WithAliases) => x.translations.find(tr => tr.lang === 'lv')?.title || x.translations[0]?.title || x.slug;

    return (
        <div className="space-y-8 pb-12">
            {parent && (
                <div>
                    <h3 className="text-item text-foreground mb-2">{t('l3Parent')}</h3>
                    <button
                        type="button"
                        onClick={() => onNodeSelect({ type: 'l2', id: parent.sub.id, l1Id: parent.l1.id })}
                        className="w-full flex items-center justify-between gap-3 p-3 line rounded-xl bg-surface hover:bg-surface-elevated/50 transition-colors text-left"
                    >
                        <div className="min-w-0">
                            <h4 className="text-item truncate">{parent.sub.title}</h4>
                            <span className="text-meta text-foreground-muted truncate block">{parent.l1.title}</span>
                        </div>
                        <ChevronLeft className="size-4 shrink-0 text-foreground-muted" />
                    </button>
                </div>
            )}

            <SlideoverTopicForm topic={l3} heading={t('l3Title')} image={image} />

            {siblings.length > 0 && (
                <section>
                    <h3 className="text-item mb-2">{t('mergeWith')}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={mergeId} onChange={e => setMergeId(e.target.value)} className="flex-1 min-w-0">
                            <option value="">{t('mergePlaceholder')}</option>
                            {siblings.map(x => <option key={x.id} value={x.id}>{titleOf(x)}</option>)}
                        </Select>
                        <Button type="button" disabled={!mergeId} onClick={() => onNodeSelect({ type: 'bulk-merge', ids: [mergeId, l3.id] })}>
                            {t('mergeAction')}
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
