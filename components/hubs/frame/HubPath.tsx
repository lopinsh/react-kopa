import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { HubPathPart } from '@/lib/services/hub.service';

/** "Spēles › Galda spēles › Šahs" (K1-05): each part but the last links up (the Tēma to the board); inherits the ink of the tile. */
export default function HubPath({ path, label }: { path: HubPathPart[]; label: string }) {
    return (
        <nav aria-label={label}>
            <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-meta">
                {path.map((part, i) => (
                    <Fragment key={part.title + i}>
                        {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0" />}
                        {part.href ? <Link href={part.href} className="hover:underline">{part.title}</Link> : <span aria-current="page">{part.title}</span>}
                    </Fragment>
                ))}
            </p>
        </nav>
    );
}
