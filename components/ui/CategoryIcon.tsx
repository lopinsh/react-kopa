import { createElement } from 'react';
import type { LucideProps } from 'lucide-react';
import { getCategoryIcon } from '@/lib/icons';

type Props = LucideProps & { slug: string };

/** Icon for a main category, picked by its slug. */
export function CategoryIcon({ slug, ...props }: Props) {
    return createElement(getCategoryIcon(slug), props);
}
