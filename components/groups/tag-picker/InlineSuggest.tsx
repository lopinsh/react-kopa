'use client';

import { X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PendingTags } from './usePendingTags';

type Props = {
    /** The L1 (a new Veids) or a Veids (a new sub-veids). */
    parentId: string;
    kind: 'veids' | 'sub';
    pending: PendingTags;
    disabled?: boolean;
};

/** The "+ add" row that turns into a name field and files a suggestion under `parentId`. */
export default function InlineSuggest({ parentId, kind, pending, disabled = false }: Props) {
    const t = useTranslations('wizard');
    const { inlineWildcardParentId, setInlineWildcardParentId, inlineWildcardText, setInlineWildcardText, createPending, isSubmittingPending } = pending;

    if (inlineWildcardParentId === parentId) {
        return (
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-surface-elevated p-2 line">
                <input /* ui-allow: sits inside the wrapper that carries the edge and ring */
                    autoFocus
                    className="w-full bg-transparent text-body md:text-body-sm focus:outline-none text-foreground"
                    placeholder={kind === 'sub' ? t('nameOfSubtypePlaceholder') : t('nameOfSubtopicPlaceholder')}
                    value={inlineWildcardText}
                    disabled={isSubmittingPending}
                    onChange={(e) => setInlineWildcardText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inlineWildcardText.trim()) {
                            e.preventDefault();
                            void createPending(parentId, inlineWildcardText.trim());
                        } else if (e.key === 'Escape') {
                            setInlineWildcardParentId(null);
                        }
                    }}
                />
                <button
                    type="button"
                    title={t('cancel')}
                    onClick={(e) => {
                        e.preventDefault();
                        setInlineWildcardParentId(null);
                    }}
                    className="hover:text-foreground text-foreground-muted"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                setInlineWildcardParentId(parentId);
                setInlineWildcardText('');
            }}
            className="group flex w-full items-center gap-2 rounded-lg py-1.5 text-left transition-colors disabled:opacity-50"
        >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-secondary text-foreground-muted transition-colors group-hover:bg-foreground group-hover:text-background">
                <Plus className="size-3.5" />
            </span>
            <span className="text-body-sm text-foreground-muted group-hover:text-foreground">{kind === 'sub' ? t('otherSubtype') : t('addSubtopic')}</span>
        </button>
    );
}
