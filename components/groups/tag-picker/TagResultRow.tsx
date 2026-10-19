'use client';

import TagCheck from './TagCheck';
import type { FlatTag } from './types';

type Props = {
    tag: FlatTag;
    l1Title: string;
    selected: boolean;
    onToggle: (id: string) => void;
};

/** One search result: the title, where it sits (category or category - sub-category) and the tick. */
export default function TagResultRow({ tag, l1Title, selected, onToggle }: Props) {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                onToggle(tag.id);
            }}
            className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
        >
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{tag.title}</span>
                <span className="text-xs text-foreground-muted">{tag.level === 3 ? `${l1Title} - ${tag.l2Title}` : l1Title}</span>
            </div>
            <TagCheck selected={selected} />
        </button>
    );
}
