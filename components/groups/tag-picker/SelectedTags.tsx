'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FlatTag, PendingTag } from './types';

type Props = {
    tags: FlatTag[];
    pending: PendingTag[];
    onRemove: (id: string) => void;
};

/** The chosen chips, each with a remove button. */
export default function SelectedTags({ tags, pending, onRemove }: Props) {
    const t = useTranslations('wizard');
    if (tags.length === 0 && pending.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
                <span
                    key={tag.id}
                    className="flex items-center gap-1 rounded-pill bg-primary px-2 py-1 text-tag text-primary-foreground shadow-card"
                >
                    {tag.title}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove(tag.id);
                        }}
                        className="ml-0.5 rounded-pill hover:bg-foreground/20 p-0.5 transition-colors"
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            {pending.map((tag) => (
                <span
                    key={tag.id}
                    className="flex items-center gap-1 rounded-md border-2 border-dashed border-primary px-2 py-1 text-tag text-primary shadow-card"
                >
                    {tag.title} ({t('awaitingApproval')})
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove(tag.id);
                        }}
                        className="ml-0.5 rounded-pill hover:bg-foreground/10 p-0.5 transition-colors"
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}
