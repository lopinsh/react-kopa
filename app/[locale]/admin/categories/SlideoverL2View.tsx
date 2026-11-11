import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { addAlias, deleteAlias } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import type { ActiveL2WithAliases, TaxonomyTree as TaxonomyTreeData } from '@/lib/services/taxonomy.service';
import { tint } from '@/lib/color-utils';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import SlideoverTopicForm from './SlideoverTopicForm';
import SlideoverSubtopics from './SlideoverSubtopics';

import { Input, Select } from '@/components/ui/Input';
type Props = {
    l2: ActiveL2WithAliases;
    categories: ActiveL2WithAliases[];
    tree: TaxonomyTreeData;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

export default function SlideoverL2View({ l2, tree, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tAliases = useTranslations('admin.taxonomy.aliases');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [aliasValue, setAliasValue] = useState('');
    const [aliasLocale, setAliasLocale] = useState('');

    const handleAddAlias = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aliasValue.trim()) return;
        startTransition(async () => {
            const res = await addAlias(aliasValue.trim(), l2.id, aliasLocale || undefined);
            if (res.success) {
                success(tAliases('added'));
                setAliasValue('');
                setAliasLocale('');
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    const handleDeleteAlias = async (aliasId: string) => {
        startTransition(async () => {
            const res = await deleteAlias(aliasId);
            if (res.success) {
                success(tAliases('deleted'));
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    const parentL1 = tree.find(l1 => l1.id === l2.parentId);
    const sub = parentL1?.subcategories.find(x => x.id === l2.id);
    const l2Node = parentL1 && sub ? { l1: parentL1, sub } : null;

    return (
        <div className="space-y-8 pb-12">
            {/* Parent Navigation */}
            {parentL1 && (
                <div>
                    <h3 className="text-item text-foreground mb-2">{t('l1Title')}</h3>
                    <button
                        type="button"
                        onClick={() => onNodeSelect({ id: parentL1.id, type: 'l1' })}
                        className="w-full flex items-center justify-between p-3 line rounded-xl bg-surface hover:bg-surface-elevated/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: tint(parentL1.color, 12), color: parentL1.color }}>
                                <CategoryIcon slug={parentL1.slug} className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-item">{parentL1.title}</h4>
                                <span className="text-meta text-foreground-muted">{parentL1.slug}</span>
                            </div>
                        </div>
                        <ChevronLeft className="size-4 text-foreground-muted" />
                    </button>
                </div>
            )}

            <SlideoverTopicForm topic={l2} heading={t('l2Title')} image={l2Node?.sub.image ?? null} />

            {l2Node && <SlideoverSubtopics l2={l2Node.sub} l1Id={l2Node.l1.id} onNodeSelect={onNodeSelect} />}

            {/* Aliases */}
            <section>
                <div className="mb-4">
                    <h3 className="text-item">{t('aliases')}</h3>
                    <p className="text-body-sm text-foreground-muted mt-1">{t('aliasHelper')}</p>
                </div>

                <div className="space-y-4">
                    {l2.aliases.length > 0 ? (
                        <div className="space-y-2">
                            {l2.aliases.map(alias => (
                                <div key={alias.id} className="flex flex-wrap items-center justify-between p-3 line rounded-lg bg-surface">
                                    <div className="flex items-center gap-3">
                                        <span className="text-body-sm">{alias.value}</span>
                                        <span className="bg-surface-elevated text-meta px-2 py-0.5 rounded-pill text-foreground-muted">
                                            {alias.locale || tAliases('anyLocaleShort')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleDeleteAlias(alias.id)}
                                        className="text-tag text-danger hover:bg-danger/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {c('delete')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-body-sm text-foreground-muted italic bg-surface-elevated/30 p-4 rounded-lg line text-center">
                            {tAliases('empty')}
                        </p>
                    )}

                    <form onSubmit={handleAddAlias} className="flex flex-col sm:flex-row gap-2 mt-4 items-start sm:items-center">
                        <Input
                            type="text"
                            value={aliasValue}
                            onChange={e => setAliasValue(e.target.value)}
                            className="flex-1"
                            placeholder={tAliases('valuePlaceholder')}
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Select
                                value={aliasLocale}
                                onChange={e => setAliasLocale(e.target.value)}
                                className="flex-1 sm:w-auto"
                            >
                                <option value="">{tAliases('anyLocale')}</option>
                                <option value="en">en</option>
                                <option value="lv">lv</option>
                            </Select>
                            <button
                                type="submit"
                                disabled={isPending || !aliasValue.trim()}
                                className="px-4 py-2 text-button-sm bg-surface-elevated hover:bg-border transition-colors rounded-md disabled:opacity-50"
                            >
                                {t('addAlias')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
