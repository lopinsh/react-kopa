import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TaxonomyTreeRow({
    title,
    groupCount,
    tagsCount,
    depth = 2,
    open,
    onToggleOpen,
    langs,
    isPending,
    isSelected,
    onSelect,
    isChecked,
    onCheck
}: {
    title: string;
    groupCount: number;
    tagsCount: number;
    /** 2 = Veids row, 3 = sub-veids row (deeper indent, no chevron). */
    depth?: 2 | 3;
    /** A Veids row with sub-veidi shows a chevron that opens them. */
    open?: boolean;
    onToggleOpen?: () => void;
    langs: Array<'en' | 'lv'>;
    isPending: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isChecked: boolean;
    onCheck: () => void;
}) {
    const tNode = useTranslations('admin.taxonomy.node');
    const missingLangs = (['lv', 'en'] as const).filter((code) => !langs.includes(code));
    return (
        <div
            className={`group flex items-center gap-3 ${depth === 3 ? 'pl-14' : 'pl-6'} pr-4 py-2 cursor-pointer hover:bg-surface-elevated transition-colors border-l-2 -ml-px ${isPending
                ? 'border-dashed border-warning/40 hover:border-warning/40'
                : 'border-transparent hover:border-border'
                } ${isSelected ? 'bg-surface-elevated border-primary' : ''}`}
            onClick={onSelect}
        >
            <div
                className="flex items-center justify-center p-2 -ml-2 mr-0.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group/check"
                onClick={(e) => {
                    e.stopPropagation();
                    onCheck();
                }}
            >
                <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded-md border-border text-primary focus:ring-primary/20 bg-surface cursor-pointer pointer-events-none"
                />
            </div>

            <div data-drag-handle className="w-4 h-4 flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-30 transition-opacity">
                {/* Drag handle placeholder (drag logic out of scope) */}
            </div>

            {onToggleOpen && (
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}
                    className="p-1 -ml-2 text-foreground-muted"
                >
                    {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
            )}

            {isPending && <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />}

            <span className={`min-w-0 truncate ${depth === 3 ? 'text-meta' : 'text-body-sm'} ${isPending ? 'text-warning weight-medium' : 'weight-medium'}`}>
                {title}
            </span>

            {isPending && (
                <span className="text-meta text-foreground-muted">({tNode('pending')})</span>
            )}

            <div className="ml-auto flex gap-2">
                {missingLangs.map((code) => (
                    <span key={code} className="text-meta text-foreground-muted px-2 py-0.5 rounded-pill border border-dashed border-border">
                        {tNode('missingLang', { lang: code.toUpperCase() })}
                    </span>
                ))}
                {tagsCount > 0 && !isPending && (
                    <span className="text-meta text-foreground-muted px-2 py-0.5 rounded-pill line">
                        {tNode('subtopics', { count: tagsCount })}
                    </span>
                )}
                {groupCount > 0 && (
                    <span className="text-tag bg-surface px-2 py-0.5 rounded-pill line">
                        {tNode('group', { count: groupCount })}
                    </span>
                )}
            </div>
        </div>
    );
}
