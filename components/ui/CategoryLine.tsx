import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    /** The main category's tone from the service (`accentColor`), or `var(--accent)` inside a group page. */
    color: string;
    category: string;
    subCategories: string[];
    /** On a photo (the group banner): all text white and the dot ringed white. */
    onImage?: boolean;
    /** One line without wrapping; the sub-categories are cut with "…" (group cards). */
    oneLine?: boolean;
};

/** "● Sports  Nordic walking, Walks": the category with its dot, then the sub-categories, in one wrapping line. */
export default function CategoryLine({ color, category, subCategories, onImage = false, oneLine = false }: Props) {
    return (
        <p data-ui={UI.categoryLine} className={clsx('flex items-center gap-x-2 gap-y-0.5 text-[13px]', oneLine ? 'min-w-0 flex-nowrap overflow-hidden' : 'flex-wrap')}>
            <span className={clsx('inline-flex shrink-0 items-center gap-1.5 font-medium', onImage ? 'text-on-image' : 'text-foreground')}>
                <span aria-hidden="true" className={clsx('h-2 w-2 shrink-0 rounded-full', onImage && 'ring-[1.5px] ring-on-image')} style={{ backgroundColor: color }} />
                {category}
            </span>
            {subCategories.length > 0 && <span className={clsx(oneLine && 'min-w-0 truncate', onImage ? 'text-on-image' : 'text-foreground-muted')}>{subCategories.join(', ')}</span>}
        </p>
    );
}
