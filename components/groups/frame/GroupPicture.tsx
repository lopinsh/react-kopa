import Image from 'next/image';
import PictureBox from '@/components/ui/PictureBox';
import PictureFallback from '@/components/ui/PictureFallback';

/**
 * The group's picture (C5): at the top of Informācija only, the event page's 16:9 format, reading width 760.
 * Without an image: a tile in the category tint with the category mark (PictureFallback).
 */
export default function GroupPicture({ image, l1Slug }: { image: string | null; l1Slug: string }) {
    return (
        <div className="max-w-page">
            <PictureBox className="">
                {image ? (
                    <Image src={image} alt="" fill sizes="(min-width: 768px) 760px, 100vw" unoptimized priority className="object-cover" />
                ) : (
                    <PictureFallback l1Slug={l1Slug} />
                )}
            </PictureBox>
        </div>
    );
}
