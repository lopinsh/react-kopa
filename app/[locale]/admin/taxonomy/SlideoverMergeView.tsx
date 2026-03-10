'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { bulkMergeAction } from '@/actions/taxonomy-actions';
import type { ActiveL2WithAliases, PendingCategoryWithContext } from '@/lib/services/taxonomy.service';
import { Merge } from 'lucide-react';

type Props = {
    selectedIds: string[];
    categories: ActiveL2WithAliases[];
    pendingTags: PendingCategoryWithContext[];
    onClose: () => void;
};

export default function SlideoverMergeView({ selectedIds, categories, pendingTags, onClose }: Props) {
    const t = useTranslations('admin.taxonomy.merge');
    const f = useTranslations('admin.taxonomy.fields');

    const [isPending, startTransition] = useTransition();
    const [canonicalId, setCanonicalId] = useState<string>('');
    const [nameEn, setNameEn] = useState('');
    const [nameLv, setNameLv] = useState('');
    const [slugEn, setSlugEn] = useState('');
    const [slugLv, setSlugLv] = useState('');

    const selectedItems = selectedIds.map(id => {
        const active = categories.find(c => c.id === id);
        if (active) return { id: active.id, type: 'active' as const, title: active.translations.find(t => t.lang === 'en')?.title || active.slug };
        const pending = pendingTags.find(p => p.id === id);
        if (pending) return { id: pending.id, type: 'pending' as const, title: pending.submittedLabel };
        return null;
    }).filter((i): i is NonNullable<typeof i> => i !== null);

    const handleCanonicalSelect = (id: string) => {
        setCanonicalId(id);
        const active = categories.find(c => c.id === id);
        if (active) {
            setNameEn(active.translations.find(t => t.lang === 'en')?.title || '');
            setNameLv(active.translations.find(t => t.lang === 'lv')?.title || '');
            setSlugEn(active.slug);
            setSlugLv(active.slugLv || '');
        } else {
            const pending = pendingTags.find(p => p.id === id);
            if (pending) {
                setNameEn(pending.submittedLabel);
                setNameLv(pending.submittedLabel);
                setSlugEn('');
                setSlugLv('');
            }
        }
    };

    const handleMerge = () => {
        if (!canonicalId || !nameEn || !nameLv || !slugEn || !slugLv) return;

        startTransition(async () => {
            const mergedIds = selectedIds.filter(id => id !== canonicalId);
            const res = await bulkMergeAction(
                canonicalId,
                mergedIds,
                { nameEn, nameLv, slugEn, slugLv }
            );
            if (res.success) {
                onClose();
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Merge className="w-5 h-5 text-primary" />
                    {t('title')}
                </h3>
                <p className="text-sm text-foreground-muted mt-2">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold">{t('selectCanonical')}</h4>
                <div className="flex flex-col gap-2">
                    {selectedItems.map(item => (
                        <label key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${canonicalId === item.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-elevated'}`}>
                            <input
                                type="radio"
                                name="canonical"
                                value={item.id}
                                checked={canonicalId === item.id}
                                onChange={() => handleCanonicalSelect(item.id)}
                                className="w-4 h-4 text-primary bg-surface border-border focus:ring-primary/20"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.title}</span>
                                <span className="text-xs text-foreground-muted uppercase tracking-wider">{item.type}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {canonicalId && (
                <div className="space-y-6 pt-4 border-t border-border">
                    <h4 className="font-semibold">{t('editDetails')}</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">{f('nameEn')}</label>
                            <input
                                type="text"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">{f('nameLv')}</label>
                            <input
                                type="text"
                                value={nameLv}
                                onChange={(e) => setNameLv(e.target.value)}
                                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">{f('slugEn')}</label>
                            <input
                                type="text"
                                value={slugEn}
                                onChange={(e) => setSlugEn(e.target.value)}
                                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground-muted mb-1.5">{f('slugLv')}</label>
                            <input
                                type="text"
                                value={slugLv}
                                onChange={(e) => setSlugLv(e.target.value)}
                                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleMerge}
                        disabled={isPending || !nameEn || !nameLv || !slugEn || !slugLv}
                        className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {isPending ? (
                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Merge className="w-4 h-4" />
                                {t('confirm')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
