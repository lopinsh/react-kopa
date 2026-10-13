'use client';

import { useMeContext } from '@/components/providers/MeProvider';
import { UI } from '@/lib/constants';

/** The head of the own area on desktop: your picture, name and "city · groups" (AR-60). */
export default function PersonHeader() {
    const { name, avatarSrc, line } = useMeContext();
    return (
        <div data-ui={UI.personHeader} className="hidden h-[72px] items-center gap-3 border-b border-border bg-surface px-[22px] md:flex">
            <img src={avatarSrc} alt="" className="size-12 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div className="min-w-0">
                <p className="truncate font-heading text-[19px] font-semibold leading-tight">{name}</p>
                {line && <p className="truncate text-[13px] text-foreground-muted">{line}</p>}
            </div>
        </div>
    );
}
