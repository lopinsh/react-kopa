import { UI } from '@/lib/constants';

type Props = {
    /** The main category's tone from the service (`accentColor`). */
    color: string;
    category: string;
    subCategories: string[];
};

/** "● Sports  Nordic walking, Walks": the category with its dot, then the sub-categories, in one wrapping line. */
export default function CategoryLine({ color, category, subCategories }: Props) {
    return (
        <p data-ui={UI.categoryLine} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                {category}
            </span>
            {subCategories.length > 0 && <span className="text-foreground-muted">{subCategories.join(', ')}</span>}
        </p>
    );
}
