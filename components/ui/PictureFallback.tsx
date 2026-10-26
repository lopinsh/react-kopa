import { CategoryIcon } from '@/components/ui/CategoryIcon';

/**
 * The picture a group has when it has no image: a tile in the category tint with the category mark large,
 * cropped at the right, and two fainter copies. Fills its parent; the colours come from `--accent` (server tones).
 */
export default function PictureFallback({ l1Slug }: { l1Slug: string }) {
    return (
        <div aria-hidden className="banner-tint absolute inset-0 text-[var(--accent)]">
            <CategoryIcon slug={l1Slug} className="icon-stroke-fine absolute -right-[6%] top-1/2 h-[60%] w-auto -translate-y-1/2" />
            <CategoryIcon slug={l1Slug} className="icon-stroke-fine absolute right-[34%] top-[8%] h-[24%] w-auto opacity-30" />
            <CategoryIcon slug={l1Slug} className="icon-stroke-fine absolute bottom-[8%] right-[26%] h-[18%] w-auto opacity-20" />
        </div>
    );
}
