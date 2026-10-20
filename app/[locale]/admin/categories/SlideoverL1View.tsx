'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { tint } from '@/lib/color-utils';
import { Link } from '@/i18n/routing';
import { isCategoryToneSlug } from '@/lib/theme/category';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { updateL1, createL2 } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import L1Aliases from './L1Aliases';
import type { SelectedTaxonomyNode } from './TaxonomyTree';

type Props = {
    l1: L1Category;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

export default function SlideoverL1View({ l1, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tFields = useTranslations('admin.taxonomy.fields');
    const tNode = useTranslations('admin.taxonomy.node');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const savedColor = l1.storedColor || '#586474';
    const [color, setColor] = useState(savedColor);
    // The 15 designed categories take their colour from the site theme (Dizains); only added ones keep the stored colour here.
    const inDesign = isCategoryToneSlug(l1.slug);
    const shown = inDesign ? l1.color : color;

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
                <h3 className="text-item text-foreground mb-2">{t('l1Title')}</h3>
                <div className="flex items-center gap-4 p-4 line rounded-xl bg-surface-elevated/30">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: tint(shown, 12), color: shown }}>
                        <CategoryIcon slug={l1.slug} className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-section">{l1.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shown }} />
                            <span className="text-body-sm text-foreground-muted">{l1.slug}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Color */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-item">{tFields('color')}</h3>
                    {color !== savedColor && (
                        <span className="bg-warning/10 text-warning text-meta px-2 py-0.5 rounded-pill">{t('unsavedChanges')}</span>
                    )}
                </div>
                {inDesign ? (
                    <p className="text-body-sm text-foreground-muted">
                        {tFields('colorInDesign')}{' '}
                        <Link href="/admin/design?part=categories" className="weight-strong text-primary underline underline-offset-4">{tFields('colorInDesignLink')}</Link>
                    </p>
                ) : (
                    <div className="grid gap-4 bg-surface-elevated/30 p-4 line rounded-xl">
                        <div>
                            <label className="block text-tag text-foreground-muted mb-2">{tFields('color')}</label>
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
                                    className="flex-1 bg-surface line rounded px-3 py-2 text-body md:text-body-sm"
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleSaveColor}
                                disabled={isPending || color === savedColor}
                                className="px-4 py-2 text-button-sm bg-primary text-primary-foreground rounded-pill hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <L1Aliases l1={l1} />

            {/* Subcategories View */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-item">{t('subcategories', { count: l1.subcategories.length })}</h3>
                </div>
                <div className="line rounded-xl divide-y divide-border bg-surface mb-6">
                    {l1.subcategories.map(l2 => (
                        <button
                            key={l2.id}
                            type="button"
                            onClick={() => onNodeSelect({ id: l2.id, type: 'l2', l1Id: l1.id })}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-elevated/50 transition-colors"
                        >
                            <span className="text-body-sm">{l2.title}</span>
                            <div className="flex gap-2">
                                <span className="text-meta text-foreground-muted bg-surface-elevated px-2 py-0.5 rounded-pill line">
                                    {tNode('wildcard', { count: l2.tags.length })}
                                </span>
                            </div>
                        </button>
                    ))}
                    {l1.subcategories.length === 0 && (
                        <div className="p-4 text-body-sm text-foreground-muted text-center">
                            {t('noSubcategories')}
                        </div>
                    )}
                </div>

                <div className="line rounded-xl bg-surface-elevated/30 p-4">
                    <h4 className="text-item mb-3">{t('createSubcategory')}</h4>
                    <form onSubmit={handleCreateL2} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-tag text-foreground-muted mb-1">{tFields('nameEn')}</label>
                                <input
                                    type="text"
                                    value={newNameEn}
                                    onChange={e => setNewNameEn(e.target.value)}
                                    className="w-full bg-surface line rounded px-3 py-2 text-body md:text-body-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-tag text-foreground-muted mb-1">{tFields('nameLv')}</label>
                                <input
                                    type="text"
                                    value={newNameLv}
                                    onChange={e => setNewNameLv(e.target.value)}
                                    className="w-full bg-surface line rounded px-3 py-2 text-body md:text-body-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending || !newNameEn.trim() || !newNameLv.trim()}
                                className="px-4 py-2 text-button-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity rounded-pill disabled:opacity-50"
                                style={{ '--accent': shown } as React.CSSProperties}
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
