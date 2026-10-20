'use client';

import { useTranslations } from 'next-intl';
import { Lock, Globe } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    value: 'PUBLIC' | 'MEMBERS_ONLY';
    /** The first section is always public. */
    isFirst: boolean;
    onChange: (value: 'PUBLIC' | 'MEMBERS_ONLY') => void;
}

/** Who sees a section: public or members only (per section, not per language). */
export default function SectionVisibilityField({ value, isFirst, onChange }: Props) {
    const t = useTranslations('common');
    return (
        <div>
            <label className="mb-1.5 block text-tag text-foreground-muted">{t('fieldVisibility')}</label>
            <div className="flex gap-2">
                {(['PUBLIC', 'MEMBERS_ONLY'] as const).map((v) => {
                    const Icon = v === 'PUBLIC' ? Globe : Lock;
                    const locked = isFirst && v === 'MEMBERS_ONLY';
                    return (
                        <button
                            key={v}
                            type="button"
                            disabled={locked}
                            onClick={() => onChange(v)}
                            className={clsx(
                                'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-meta transition-all disabled:opacity-40',
                                value === v ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-foreground-muted hover:bg-surface-elevated'
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {v === 'PUBLIC' ? t('public') : t('visibilityMembersOnly')}
                        </button>
                    );
                })}
            </div>
            {isFirst && <span className="mt-1 inline-block text-meta text-foreground-muted">{t('homeVisibilityWarning')}</span>}
        </div>
    );
}
