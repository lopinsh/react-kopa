import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Props = {
    l1Slug: string;
    variant: 'card' | 'row';
};

/** The round outlined + (the bottom bar's icon). */
function Round({ className }: { className: string }) {
    return (
        <span className={clsx('grid shrink-0 place-items-center rounded-full border-[1.5px] border-foreground-muted/60 text-foreground', className)}>
            <Plus aria-hidden="true" className="size-4" />
        </span>
    );
}

/** The last item of a chosen category (AR-37): start a group here. A dashed card in the grid, a row with a round + on phones. */
export default function CreateCard({ l1Slug, variant }: Props) {
    const t = useTranslations('discovery');
    const href = `/create?category=${l1Slug}`;

    if (variant === 'row') {
        return (
            <Link href={href} data-ui={UI.createCard} className="flex min-h-14 items-center gap-2.5 border-t border-border py-2.5 first:border-t-0">
                <span className="min-w-0 flex-1">
                    <span className="block text-item text-foreground">{t('createNewGroup')}</span>
                    <span className="block text-meta text-foreground-muted">{t('inThisCategory')}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center"><Round className="size-8" /></span>
            </Link>
        );
    }
    return (
        <Link
            href={href}
            data-ui={UI.createCard}
            className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-border px-4 py-5 text-center transition-colors hover:bg-tint/40"
        >
            <Round className="mb-1 size-[34px]" />
            <span className="text-item text-foreground">{t('createNewGroup')}</span>
            <span className="text-meta text-foreground-muted">{t('inThisCategory')}</span>
        </Link>
    );
}
