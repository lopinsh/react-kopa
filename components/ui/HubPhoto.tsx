import Image from 'next/image';

/**
 * The duotone photo layer of a head tile (L3 D10): the picture in grey, blended into the tile's Tēma colour, with the colour fading in from the left.
 * Sits behind the tile's content (`-z-10`; the tile is `isolate`) and keeps the tile's height. Shared by the hub head and the group head (K-151).
 */
export default function HubPhoto({ src }: { src: string }) {
    return (
        <span aria-hidden className="absolute inset-0 -z-10 isolate overflow-hidden rounded-2xl bg-(--accent)">
            <Image src={src} alt="" fill loading="eager" sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover grayscale brightness-(--hub-photo-dim) contrast-(--hub-photo-contrast) mix-blend-luminosity opacity-(--hub-photo-opacity)" />
            <span className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent)_70%,transparent)_30%,transparent_100%)]" />
        </span>
    );
}
