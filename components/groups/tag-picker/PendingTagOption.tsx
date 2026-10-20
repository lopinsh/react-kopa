'use client';

import { useTranslations } from 'next-intl';
import type { PendingTagOption as PendingOption } from '@/lib/services/taxonomy.service';
import TagCheck from './TagCheck';

type Props = {
    option: PendingOption;
    selected: boolean;
    onToggle: (id: string) => void;
};

/** A sub-category other people suggested that still awaits approval. */
export default function PendingTagOption({ option, selected, onToggle }: Props) {
    const t = useTranslations('wizard');

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onToggle(option.id);
            }}
            className="group flex w-full items-center justify-between rounded-lg border border-dashed border-border px-3 py-1.5 text-left transition-colors hover:bg-secondary/50"
        >
            <div className="flex flex-col">
                <span className="text-body-sm text-foreground">{option.title}</span>
                <span className="text-meta italic text-foreground-muted">{t('awaitingApproval')}</span>
            </div>
            <TagCheck selected={selected} />
        </button>
    );
}
