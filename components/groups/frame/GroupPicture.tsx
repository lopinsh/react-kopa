import Image from 'next/image';
import PictureBox from '@/components/ui/PictureBox';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

/**
 * The group's picture (C5): at the top of Informācija only, the event page's 16:9 format, reading width 760.
 * Without an image: a tile in the category tint with the category mark large, cropped at the right, and two fainter copies. The colours come from the layout's server tones.
 */
export default function GroupPicture({ image, l1Slug }: { image: string | null; l1Slug: string }) {
    return (
        <div className="max-w-page">
            <PictureBox className="">
                {image ? (
                    <Image src={image} alt="" fill sizes="(min-width: 768px) 760px, 100vw" unoptimized priority className="object-cover" />
                ) : (
                    <div aria-hidden className="banner-tint absolute inset-0 text-[var(--accent)]">
                        <CategoryIcon slug={l1Slug} className="stroke-1 absolute -right-[6%] top-1/2 h-[60%] w-auto -translate-y-1/2" />
                        <CategoryIcon slug={l1Slug} className="stroke-1 absolute right-[34%] top-[8%] h-[24%] w-auto opacity-30" />
                        <CategoryIcon slug={l1Slug} className="stroke-1 absolute bottom-[8%] right-[26%] h-[18%] w-auto opacity-20" />
                    </div>
                )}
            </PictureBox>
        </div>
    );
}
