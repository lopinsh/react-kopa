import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Props = {
    l1Slug: string;
    variant: 'card' | 'row';
    /** The chosen category's tone (from the groups listed in it); without one the hover edge is neutral. */
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
 * The last item of a chosen category (AR-37): start a group here. In the grid the dashed card edge, no tear-off tab, stretching to the row height, + and title centred with "in this category" as a small muted line under the title; on phones a row with a dashed tile in the thumb's place.
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
                    <span className="mt-0.5 block truncate text-meta text-foreground-muted">{t('inThisCategory')}</span>
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
            className="card-note flex min-h-24 flex-col rounded-2xl border-[1.5px] border-dashed border-border bg-surface text-center transition-colors hover:bg-tint/40 hover:border-[color-mix(in_srgb,var(--c)_60%,var(--border))] focus-visible:border-[color-mix(in_srgb,var(--c)_60%,var(--border))]"
        >
            <span className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-5">
                <Round className="mb-1 size-9" />
                <span className="text-item text-foreground">{t('createNewGroup')}</span>
                <span className="text-meta text-foreground-muted">{t('inThisCategory')}</span>
            </span>
        </Link>
    );
}
