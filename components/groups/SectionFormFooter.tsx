'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Save, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
    canDelete: boolean;
    isPending: boolean;
    saveDisabled: boolean;
    /** True right after a save, for the "Saved" tick. */
    justSaved: boolean;
    onDelete: () => void;
    onSave: () => void;
}

/** Delete on the left, the "Saved" tick and the save button on the right. */
export default function SectionFormFooter({ canDelete, isPending, saveDisabled, justSaved, onDelete, onSave }: Props) {
    const t = useTranslations('common');
    return (
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                {canDelete ? (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isPending}
                        className="flex items-center gap-1.5 text-meta text-danger transition-colors hover:text-danger disabled:opacity-40"
                    >
                        <Trash2 className="size-3.5" />
                        {t('deleteSection')}
                    </button>
                ) : <span />}

                <div className="flex items-center gap-3">
                    {justSaved && (
                        <span className="flex items-center gap-1 text-tag text-foreground-muted" role="status">
                            <Check className="size-3.5" />
                            {t('sectionSaved')}
                        </span>
                    )}
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={isPending || saveDisabled}
                    >
                        <Save className="size-4" />
                        {t('saveSection')}
                    </Button>
                </div>
            </div>
    );
}
