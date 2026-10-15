import Image from 'next/image';

/**
 * The event's own picture (AR-59, C5): 16:9, rounded, inside the surface's padding. Only the event's own image is ever shown here;
 * the group's image is in the banner above, so an event without its own has no picture at all.
 */
export default function EventPicture({ image }: { image: string | null }) {
    if (!image) return null;
    return (
        <div className="relative mb-3.5 aspect-video w-full overflow-hidden rounded-2xl bg-tint">
            <Image src={image} alt="" fill sizes="(min-width: 768px) 712px, 100vw" unoptimized className="object-cover" />
        </div>
    );
}
