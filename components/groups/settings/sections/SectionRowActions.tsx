'use client';

import { useTranslations } from 'next-intl';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';

type Props = {
    index: number;
    isLast: boolean;
    isEditing: boolean;
    isPending: boolean;
    onMove: (direction: 'up' | 'down') => void;
};

/** Move up/down (above the row's stretched toggle) and the open/closed chevron. */
export default function SectionRowActions({ index, isLast, isEditing, isPending, onMove }: Props) {
    const t = useTranslations('group');

    return (
        <div className="flex items-center gap-2">
            {index > 0 && (
                <>
                    <button
                        type="button"
                        onClick={() => onMove('up')}
                        disabled={index === 1 || isPending}
                        aria-label={t('sections.moveUp')}
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-elevated disabled:opacity-20"
                    >
                        <ArrowUp aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove('down')}
                        disabled={isLast || isPending}
                        aria-label={t('sections.moveDown')}
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-elevated disabled:opacity-20"
                    >
                        <ArrowDown aria-hidden="true" className="h-4 w-4" />
                    </button>
                </>
            )}

            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted group-hover:text-primary">
                {isEditing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
        </div>
    );
}
