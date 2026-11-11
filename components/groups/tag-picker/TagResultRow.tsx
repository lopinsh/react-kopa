'use client';

import TagCheck from './TagCheck';
import type { FlatTag } from './types';

type Props = {
    tag: FlatTag;
    l1Title: string;
    selected: boolean;
    disabled?: boolean;
    onToggle: (id: string) => void;
};

/** One search result: the title, where it sits (category or category - sub-category) and the tick. */
export default function TagResultRow({ tag, l1Title, selected, disabled = false, onToggle }: Props) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                onToggle(tag.id);
            }}
            className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary disabled:opacity-50"
        >
            <div className="flex flex-col">
                <span className="text-body-sm text-foreground">{tag.title}</span>
                <span className="text-meta text-foreground-muted">{tag.level === 3 ? `${tag.l2Title} › ${tag.title}` : l1Title}</span>
            </div>
            <TagCheck selected={selected} />
        </button>
    );
}
