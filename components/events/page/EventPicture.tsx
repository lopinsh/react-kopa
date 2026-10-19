import Image from 'next/image';
import PictureBox from '@/components/ui/PictureBox';

/**
 * The event's own picture (AR-59, C5): 16:9, rounded, inside the surface's padding. Only the event's own image is ever shown here;
 * the group's picture is on its Informācija page, so an event without its own has no picture at all.
 */
export default function EventPicture({ image }: { image: string | null }) {
    if (!image) return null;
    return (
        <PictureBox>
            <Image src={image} alt="" fill sizes="(min-width: 768px) 712px, 100vw" unoptimized className="object-cover" />
        </PictureBox>
    );
}
