import Image from 'next/image';

/**
 * A category's photo as a design element (L3 D8-D11): a clipped box that fills with the picture, the tint under it as the loading tone.
 * No credit here: the hub's Pārskats carries the one credit line. The caller sets the size and corners (`h-10 rounded-xl`, `size-8 rounded-lg`).
 */
export default function CategoryPhoto({ src, sizes, className = '' }: { src: string; sizes: string; className?: string }) {
    return (
        <span aria-hidden className={`relative block shrink-0 overflow-hidden bg-tint ${className}`}>
            <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
        </span>
    );
}
