'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import type { TaxonomyTree } from '@/actions/taxonomy-actions';
import { type TaxonomySelection } from '@/components/ui/TaxonomyPicker';
import { getCategoryIcon } from '@/lib/icons';

type Props = {
    taxonomy: TaxonomyTree;
    value: TaxonomySelection | null;
    onChange: (value: TaxonomySelection | null) => void;
    accentColor: string;
};

export default function L1Picker({ taxonomy, value, onChange, accentColor }: Props) {
    const t = useTranslations('wizard');
    const [isExpanded, setIsExpanded] = useState(!value);

    // If there is no value, it MUST be expanded
    const explicitlyExpanded = isExpanded || !value;

    const selectedL1 = value?.kind === 'existing'
        ? taxonomy.find(t => t.id === value.categoryId)
        : null;

    if (!explicitlyExpanded && selectedL1) {
        const CatIcon = getCategoryIcon(selectedL1.slug);
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('step1Title')}
                </label>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="relative flex w-full items-center justify-between gap-4 rounded-xl border-2 bg-surface p-4 text-left transition-all hover:scale-[1.01] shadow-sm soft-press"
                    style={{ borderColor: selectedL1.color }}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm border border-border">
                            <CatIcon className="h-6 w-6 stroke-2" style={{ color: selectedL1.color }} />
                        </div>
                        <div>
                            <span className="block text-base font-bold text-foreground">
                                {selectedL1.title}
                            </span>
                            <span className="text-xs font-semibold text-foreground-muted">
                                {t('clickToChange')}
                            </span>
                        </div>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground-muted transition-colors hover:bg-border hover:text-foreground">
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </button>

            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-foreground">
                <span>{t('step1Title')}</span>
                {value && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="text-xs font-bold text-foreground-muted hover:text-foreground underline underline-offset-2"
                    >
                        {t('cancel')}
                    </button>
                )}
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {taxonomy.map((l1) => {
                    const isSelected = value?.kind === 'existing' && value.categoryId === l1.id;
                    const CatIcon = getCategoryIcon(l1.slug);
                    return (
                        <button
                            key={l1.id}
                            type="button"
                            onClick={() => {
                                onChange({
                                    kind: 'existing',
                                    categoryId: l1.id,
                                    l1Color: l1.color,
                                    label: l1.title,
                                });
                                setIsExpanded(false);
                            }}
                            className={clsx(
                                'relative flex h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 bg-surface p-3 text-center transition-all hover:scale-[1.02] soft-press',
                                isSelected ? 'shadow-md' : 'border-border hover:border-foreground/20'
                            )}
                            style={{
                                borderColor: isSelected ? l1.color : undefined,
                            }}
                        >
                            {isSelected && (
                                <div
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm"
                                    style={{ backgroundColor: l1.color }}
                                >
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </div>
                            )}
                            <CatIcon className="h-6 w-6 stroke-2" style={{ color: l1.color }} />
                            <span className={clsx("text-sm font-semibold", isSelected ? 'text-foreground' : 'text-foreground-muted')}>
                                {l1.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
