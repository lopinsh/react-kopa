import { Plus, Scissors } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Props = {
    l1Slug: string;
    variant: 'card' | 'row';
    /** The chosen category's tone (from the groups listed in it); without one the tab is neutral. */
    color?: string;
};

/** The round outlined + (the bottom bar's icon). */
function Round({ className }: { className: string }) {
    // ui-allow: a circle sized by the caller's className
    return (
        <span className={clsx('grid shrink-0 place-items-center rounded-full border-[1.5px] border-foreground-muted/60 text-foreground', className)}>
            <Plus aria-hidden="true" className="size-4" />
        </span>
    );
}

/**
 * The last item of a chosen category (AR-37): start a group here. In the grid the same shape as a group card (dashed edge, the tab at the same height holding
 * "in this category"); on phones a row with a dashed tile in the thumb's place.
 */
export default function CreateCard({ l1Slug, variant, color }: Props) {
    const t = useTranslations('discovery');
    const href = `/create?category=${l1Slug}`;
    const tone = { ['--c' as string]: color ?? 'var(--foreground-muted)' };

    if (variant === 'row') {
        return (
            <Link href={href} data-ui={UI.createCard} style={tone} className="flex min-h-[5.5rem] items-center gap-3 border-t border-dashed border-border py-3 first:border-t-0">
                {/* ui-allow: the thumb's place, a 56 px dashed tile */}
                <span className="grid size-14 shrink-0 place-items-center rounded-item border-[1.5px] border-dashed border-border"><Plus aria-hidden="true" className="size-5 text-foreground-muted" /></span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-item text-foreground">{t('createNewGroup')}</span>
                    <span className="mt-1.5 flex h-7 items-center rounded-item px-2 tab-tint text-meta text-foreground-muted"><span className="truncate">{t('inThisCategory')}</span></span>
                </span>
                <Round className="size-7" />
            </Link>
        );
    }
    return (
        <Link
            href={href}
            data-ui={UI.createCard}
            style={tone}
            className="flex min-h-24 flex-col rounded-2xl border-[1.5px] border-dashed border-border bg-surface text-center transition-colors hover:bg-tint/40"
        >
            <span className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-5">
                <Round className="mb-1 size-9" />
                <span className="text-item text-foreground">{t('createNewGroup')}</span>
            </span>
            <span className="relative mt-auto grid h-24 place-items-center rounded-b-2xl px-[var(--card-pad)] tab-tint text-meta text-foreground-muted">
                <span aria-hidden="true" className="perforation" />
                <Scissors aria-hidden="true" className="tear-scissors size-4" />
                {t('inThisCategory')}
            </span>
        </Link>
    );
}
