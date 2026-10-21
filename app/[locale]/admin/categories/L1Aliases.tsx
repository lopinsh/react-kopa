'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { addAlias, deleteAlias } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';

/** The aliases of a top-level category: list, remove, add. */
export default function L1Aliases({ l1 }: { l1: L1Category }) {
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

    return (
            <section>
                <div className="mb-4">
                    <h3 className="text-item">{t('aliases')}</h3>
                    <p className="text-body-sm text-foreground-muted mt-1">{t('aliasHelper')}</p>
                </div>

                <div className="space-y-4">
                    {(l1.aliases && l1.aliases.length > 0) ? (
                        <div className="space-y-2">
                            {l1.aliases.map(alias => (
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
                        <input
                            type="text"
                            value={aliasValue}
                            onChange={e => setAliasValue(e.target.value)}
                            className="flex-1 w-full bg-surface line rounded-md px-3 py-2 text-body md:text-body-sm"
                            placeholder={tAliases('valuePlaceholder')}
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select
                                value={aliasLocale}
                                onChange={e => setAliasLocale(e.target.value)}
                                className="bg-surface line rounded-md px-3 py-2 text-body md:text-body-sm flex-1 sm:w-auto"
                            >
                                <option value="">{tAliases('anyLocale')}</option>
                                <option value="en">en</option>
                                <option value="lv">lv</option>
                            </select>
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

    );
}
