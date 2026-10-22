import { LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { foldText } from '@/lib/text-fold';

type Props = {
    href: string;
    title: string;
    count: number;
    /** No slug / color: the "Visas" row (grid icon, site-colour dot). */
    slug?: string;
    color?: string;
    current?: boolean;
    folded?: boolean;
    /** A Veid row: the Tēma it belongs to, shown as a muted path. */
    parentTitle?: string;
    /** The typed word, to underline the first match. */
    needle?: string;
    onChoose?: () => void;
};

/** The first match of `needle` in `text`, underlined. Folds one character at a time so the index maps back to the original (Latvian letters fold to one character each). */
function Match({ text, needle }: { text: string; needle?: string }) {
    if (!needle) return <>{text}</>;
    let folded = '';
    const origin: number[] = [];
    for (let i = 0; i < text.length; i++) {
        const f = foldText(text[i]);
        folded += f;
        for (let k = 0; k < f.length; k++) origin.push(i);
    }
    const at = folded.indexOf(needle);
    if (at < 0) return <>{text}</>;
    const start = origin[at];
    const end = origin[at + needle.length - 1] + 1;
    return (
        <>
            {text.slice(0, start)}
            <mark className="bg-transparent text-inherit weight-strong underline decoration-foreground-muted underline-offset-2">{text.slice(start, end)}</mark>
            {text.slice(end)}
        </>
    );
}

/** One row of the category index (R19): icon, name, count; the chosen row carries a tone tint and a dot. Tone only through --c on the row. */
export default function CategoryRow({ href, title, count, slug, color, current = false, folded = false, parentTitle, needle, onChoose }: Props) {
    const all = !slug;
    const dot = current && (
        <span aria-hidden="true" className={clsx('shrink-0 rounded-full', all ? 'bg-primary' : 'bg-[var(--c)]', folded ? 'absolute right-1 top-1 size-1.5' : 'size-2')} />
    );
    return (
        <Link
            href={href}
            scroll={false}
            onClick={onChoose}
            aria-current={current ? 'true' : undefined}
            title={folded ? `${title} · ${count}` : undefined}
            aria-label={folded ? title : undefined}
            style={color ? { ['--c' as string]: color } : undefined}
            className={clsx(
                'relative group/row flex items-center gap-3 rounded-item px-2 text-body-sm weight-medium text-foreground transition-colors duration-quick hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                folded ? 'size-10 min-h-0 justify-center px-0' : 'min-h-11 md:min-h-[var(--list-row)]',
                current && (all ? 'bg-tint weight-strong' : 'topic-chosen weight-strong'),
            )}
        >
            {all ? (
                <LayoutGrid aria-hidden="true" className="size-4 shrink-0 text-foreground-muted" />
            ) : (
                <CategoryIcon slug={slug} aria-hidden="true" className={clsx('size-4 shrink-0 transition-colors duration-quick', current ? 'text-[var(--c)]' : 'text-foreground-muted group-hover/row:text-[var(--c)]')} />
            )}
            {!folded && (
                <>
                    <span className={clsx('min-w-0 flex-1 truncate', count === 0 && !current && 'text-foreground-muted')}>
                        {parentTitle && <span className="text-foreground-muted">{parentTitle} → </span>}
                        <Match text={title} needle={needle} />
                    </span>
                    <span className="text-meta text-foreground-muted tabular-nums">{count}</span>
                </>
            )}
            {dot}
        </Link>
    );
}
