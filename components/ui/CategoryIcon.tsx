import { createElement } from 'react';
import type { LucideProps } from 'lucide-react';
import { getCategoryIcon } from '@/lib/icons';
import { tint } from '@/lib/color-utils';
import { UI } from '@/lib/constants';

type Props = LucideProps & { slug: string };

/** Icon for a main category, picked by its slug. */
export function CategoryIcon({ slug, ...props }: Props) {
    return createElement(getCategoryIcon(slug), props);
}

/** Round disc in the category's tone: tinted fill, tone-coloured icon. `color` comes from the service (`accentColor`). */
export function CategoryDisc({ slug, color, size = 26 }: { slug: string; color: string; size?: number }) {
    return (
        <span
            data-ui={UI.categoryDisc}
            className="inline-flex shrink-0 items-center justify-center rounded-full"
            style={{ width: size, height: size, backgroundColor: tint(color, 18), color }}
        >
            <CategoryIcon slug={slug} aria-hidden="true" size={Math.round((size * 15) / 26)} />
        </span>
    );
}
