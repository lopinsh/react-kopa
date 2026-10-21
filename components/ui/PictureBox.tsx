import type { ReactNode } from 'react';

/** The 16:9 picture box of the event page and of Informācija (C5): rounded, clipped, a quiet tint behind. */
export default function PictureBox({ children, className = 'mb-4' }: { children: ReactNode; className?: string }) {
    return <div className={`relative aspect-video w-full overflow-hidden rounded-2xl frame bg-tint ${className}`}>{children}</div>;
}
