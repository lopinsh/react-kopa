import Image from 'next/image';
import PictureBox from '@/components/ui/PictureBox';
import PictureFallback from '@/components/ui/PictureFallback';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

/**
 * The group's picture (C5): at the top of Informācija only, the event page's 16:9 format, reading width 760.
 * Without an image: a tile in the category tint with the category mark (PictureFallback).
 */
export default function GroupPicture({ image, l1Slug, credit }: { image: string | null; l1Slug: string; credit?: Credit }) {
    return (
        <div className="max-w-page">
            <PictureBox className="">
                {image ? (
                    <Image src={image} alt="" fill sizes="(min-width: 768px) 760px, 100vw" unoptimized priority className="object-cover" />
                ) : (
                    <PictureFallback l1Slug={l1Slug} />
                )}
            </PictureBox>
            {image && <BannerCredit credit={credit} className="mt-1" />}
        </div>
    );
}
