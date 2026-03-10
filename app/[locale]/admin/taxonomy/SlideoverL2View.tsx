import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { approveTag, addAlias, deleteAlias } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import type { ActiveL2WithAliases, TaxonomyTree as TaxonomyTreeData } from '@/lib/services/taxonomy.service';
import { getCategoryIcon } from '@/lib/icons';
import type { SelectedTaxonomyNode } from './TaxonomyTree';

type Props = {
    l2: ActiveL2WithAliases;
    categories: ActiveL2WithAliases[];
    tree: TaxonomyTreeData;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

export default function SlideoverL2View({ l2, categories, tree, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tFields = useTranslations('admin.taxonomy.fields');
    const tAliases = useTranslations('admin.taxonomy.aliases');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const initialEn = l2.translations.find(t => t.lang === 'en')?.title || '';
    const initialLv = l2.translations.find(t => t.lang === 'lv')?.title || '';

    const [nameEn, setNameEn] = useState(initialEn);
    const [nameLv, setNameLv] = useState(initialLv);
    const [slugEn, setSlugEn] = useState(l2.slug);
    const [slugLv, setSlugLv] = useState(l2.slugLv || l2.slug);

    const [aliasValue, setAliasValue] = useState('');
    const [aliasLocale, setAliasLocale] = useState('');

    const handleSave = async () => {
        startTransition(async () => {
            const res = await approveTag(l2.id, {
                nameEn: nameEn.trim(),
                nameLv: nameLv.trim(),
                slugEn: slugEn.trim(),
                slugLv: slugLv.trim()
            });
            if (res.success) {
                success(t('save') + ' - ' + c('success'));
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

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
    const ParentIcon = parentL1 ? getCategoryIcon(parentL1.slug) : null;

    return (
        <div className="space-y-8 pb-12">
            {/* Parent Navigation */}
            {parentL1 && (
                <div>
                    <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">{t('l1Title')}</h3>
                    <button
                        type="button"
                        onClick={() => onNodeSelect({ id: parentL1.id, type: 'l1' })}
                        className="w-full flex items-center justify-between p-3 border border-border rounded-xl bg-surface hover:bg-surface-elevated/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${parentL1.color}20`, color: parentL1.color }}>
                                {ParentIcon && <ParentIcon className="w-4 h-4" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">{parentL1.title}</h4>
                                <span className="text-xs text-foreground-muted">{parentL1.slug}</span>
                            </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-foreground-muted" />
                    </button>
                </div>
            )}

            {/* L2 Edit Form */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{t('l2Title')}</h3>
                    {(nameEn !== initialEn || nameLv !== initialLv || slugEn !== l2.slug || slugLv !== (l2.slugLv || l2.slug)) && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">Unsaved changes</span>
                    )}
                </div>

                <div className="grid gap-4 bg-surface-elevated/30 p-4 border border-border rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameEn')}</label>
                            <input
                                type="text"
                                value={nameEn}
                                onChange={e => setNameEn(e.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameLv')}</label>
                            <input
                                type="text"
                                value={nameLv}
                                onChange={e => setNameLv(e.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('slugEn')}</label>
                            <input
                                type="text"
                                value={slugEn}
                                onChange={e => setSlugEn(e.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('slugLv')}</label>
                            <input
                                type="text"
                                value={slugLv}
                                onChange={e => setSlugLv(e.target.value)}
                                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {t('save')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Aliases */}
            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-bold">{t('aliases')}</h3>
                    <p className="text-sm text-foreground-muted mt-1">{t('aliasHelper')}</p>
                </div>

                <div className="space-y-4">
                    {l2.aliases.length > 0 ? (
                        <div className="space-y-2">
                            {l2.aliases.map(alias => (
                                <div key={alias.id} className="flex flex-wrap items-center justify-between p-3 border border-border rounded-lg bg-surface">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-sm">{alias.value}</span>
                                        <span className="bg-surface-elevated text-xs px-2 py-0.5 rounded-full text-foreground-muted">
                                            {alias.locale || tAliases('anyLocaleShort')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleDeleteAlias(alias.id)}
                                        className="text-xs text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                    >
                                        {c('delete')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-foreground-muted italic bg-surface-elevated/30 p-4 rounded-lg border border-border text-center">
                            {tAliases('empty')}
                        </p>
                    )}

                    <form onSubmit={handleAddAlias} className="flex flex-col sm:flex-row gap-2 mt-4 items-start sm:items-center">
                        <input
                            type="text"
                            value={aliasValue}
                            onChange={e => setAliasValue(e.target.value)}
                            className="flex-1 w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                            placeholder={tAliases('valuePlaceholder')}
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select
                                value={aliasLocale}
                                onChange={e => setAliasLocale(e.target.value)}
                                className="bg-surface border border-border rounded px-3 py-2 text-sm flex-1 sm:w-auto"
                            >
                                <option value="">{tAliases('anyLocale')}</option>
                                <option value="en">en</option>
                                <option value="lv">lv</option>
                            </select>
                            <button
                                type="submit"
                                disabled={isPending || !aliasValue.trim()}
                                className="px-4 py-2 text-sm font-semibold bg-surface-elevated hover:bg-border transition-colors rounded disabled:opacity-50"
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
