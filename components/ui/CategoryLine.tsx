import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { topicHref, type DiscoveryParams } from '@/lib/discovery-params';
import { UI } from '@/lib/constants';

type Props = {
    /** The main category's tone from the service (`accentColor`), or `var(--accent)` inside a group page. */
    color: string;
    category: string;
    subCategories: string[];
    /** With `l1Slug` the category and each sub-category (`subSlugs`, same order) link to discovery filtered by them. */
    l1Slug?: string;
    subSlugs?: string[];
    /** A card in the discovery list: the links add to the list's own filters instead of starting afresh. */
    from?: DiscoveryParams;
    /** One line without wrapping; the sub-categories are cut with "…" (group cards). */
    oneLine?: boolean;
    /** Inside a stretched card link: the links sit above it so the rest of the card stays one big link. */
    aboveCardLink?: boolean;
};

/** "● Sports  Nordic walking, Walks": the category with its dot, then the sub-categories, in one wrapping line. */
export default function CategoryLine({ color, category, subCategories, l1Slug, subSlugs = [], from, oneLine = false, aboveCardLink = false }: Props) {
    const link = (href: string, label: string) => (
        <Link href={href} className={clsx('hover:underline', aboveCardLink && 'relative z-10')}>{label}</Link>
    );
    return (
        <p data-ui={UI.categoryLine} className={clsx('flex items-center gap-x-2 gap-y-0.5 text-[13px]', oneLine ? 'min-w-0 flex-nowrap overflow-hidden' : 'flex-wrap')}>
            <span className={'inline-flex shrink-0 items-center gap-1.5 font-medium text-foreground'}>
                <span aria-hidden="true" className={'h-2 w-2 shrink-0 rounded-full'} style={{ backgroundColor: color }} />
                {l1Slug ? link(topicHref(l1Slug, undefined, from), category) : category}
            </span>
            {subCategories.length > 0 && (
                <span className={clsx(oneLine && 'min-w-0 truncate', 'text-foreground-muted')}>
                    {subCategories.map((title, i) => (
                        <span key={subSlugs[i] ?? title}>
                            {i > 0 && ', '}
                            {l1Slug && subSlugs[i] ? link(topicHref(l1Slug, subSlugs[i], from), title) : title}
                        </span>
                    ))}
                </span>
            )}
        </p>
    );
}
