import { FACES_MAX } from '@/lib/constants';
import type { Face } from '@/lib/services/event-panel';

/** A few overlapping round faces (decorative: the sentence or count beside them says it). `ring` is the colour of the edge that separates them. */
export default function Faces({ faces, size = 'sm', ring = 'ring-surface' }: { faces: Face[]; size?: 'sm' | 'md'; ring?: string }) {
    const shown = faces.slice(0, FACES_MAX);
    if (shown.length === 0) return null;
    return (
        <span aria-hidden="true" className="flex shrink-0">
            {shown.map((f, i) => (
                <img key={f.id} src={f.image} alt="" referrerPolicy="no-referrer" className={`${size === 'md' ? 'size-6' : 'size-5'} rounded-full object-cover ring-2 ${ring} ${i > 0 ? '-ml-1.5' : ''}`} />
            ))}
        </span>
    );
}
