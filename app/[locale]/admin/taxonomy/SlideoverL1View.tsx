'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { getCategoryIcon } from '@/lib/icons';
import { updateL1, addAlias, deleteAlias, createL2 } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import type { SelectedTaxonomyNode } from './TaxonomyTree';

type Props = {
    l1: L1Category;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

export default function SlideoverL1View({ l1, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tFields = useTranslations('admin.taxonomy.fields');
    const tAliases = useTranslations('admin.taxonomy.aliases');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const Icon = getCategoryIcon(l1.slug);

    const [color, setColor] = useState(l1.color || '#6366f1');

    const [aliasValue, setAliasValue] = useState('');
    const [aliasLocale, setAliasLocale] = useState('');

    const [newNameEn, setNewNameEn] = useState('');
    const [newNameLv, setNewNameLv] = useState('');

    const handleSaveColor = async () => {
        startTransition(async () => {
            const res = await updateL1(l1.id, color);
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
            const res = await addAlias(aliasValue.trim(), l1.id, aliasLocale || undefined);
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

    const handleCreateL2 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNameEn.trim() || !newNameLv.trim()) return;
        startTransition(async () => {
            const res = await createL2(l1.id, { nameEn: newNameEn.trim(), nameLv: newNameLv.trim() });
            if (res.success) {
                success(t('subcategoryCreated'));
                setNewNameEn('');
                setNewNameLv('');
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2">{t('l1Title')}</h3>
                <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-surface-elevated/30">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: `${color}20`, color: color }}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{l1.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm text-foreground-muted">{l1.slug}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Color */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{tFields('color')}</h3>
                    {color !== l1.color && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">Unsaved changes</span>
                    )}
                </div>
                <div className="grid gap-4 bg-surface-elevated/30 p-4 border border-border rounded-xl">
                    <div>
                        <label className="block text-xs font-semibold text-foreground-muted mb-2">{tFields('color')}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="h-10 w-14 cursor-pointer rounded bg-transparent border-0 p-0"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm uppercase"
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleSaveColor}
                            disabled={isPending || color === l1.color}
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
                    {(l1.aliases && l1.aliases.length > 0) ? (
                        <div className="space-y-2">
                            {l1.aliases.map(alias => (
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

            {/* Subcategories View */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Subcategories ({l1.subcategories.length})</h3>
                </div>
                <div className="border border-border rounded-xl divide-y divide-border bg-surface mb-6">
                    {l1.subcategories.map(l2 => (
                        <button
                            key={l2.id}
                            type="button"
                            onClick={() => onNodeSelect({ id: l2.id, type: 'l2', l1Id: l1.id })}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-elevated/50 transition-colors"
                        >
                            <span className="font-medium text-sm">{l2.title}</span>
                            <div className="flex gap-2">
                                <span className="text-xs text-foreground-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border">
                                    {l2.tags.length} wildcards
                                </span>
                            </div>
                        </button>
                    ))}
                    {l1.subcategories.length === 0 && (
                        <div className="p-4 text-sm text-foreground-muted text-center">
                            No subcategories found.
                        </div>
                    )}
                </div>

                <div className="border border-border rounded-xl bg-surface-elevated/30 p-4">
                    <h4 className="text-sm font-bold mb-3">{t('createSubcategory')}</h4>
                    <form onSubmit={handleCreateL2} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameEn')}</label>
                                <input
                                    type="text"
                                    value={newNameEn}
                                    onChange={e => setNewNameEn(e.target.value)}
                                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-foreground-muted mb-1">{tFields('nameLv')}</label>
                                <input
                                    type="text"
                                    value={newNameLv}
                                    onChange={e => setNewNameLv(e.target.value)}
                                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending || !newNameEn.trim() || !newNameLv.trim()}
                                className="px-4 py-2 text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity rounded disabled:opacity-50"
                                style={{ '--accent': color } as React.CSSProperties}
                            >
                                {t('addSubcategory')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
