'use client';

import { useMeContext } from '@/components/providers/MeProvider';
import { UI } from '@/lib/constants';

/** The head of the own area on desktop: your picture, name and "city · groups" (AR-60). */
export default function PersonHeader() {
    const { name, avatarSrc, line } = useMeContext();
    return (
        <div data-ui={UI.personHeader} className="hidden border-b border-border bg-surface md:block">
            <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-3 px-[22px]">
            <img src={avatarSrc} alt="" className="size-12 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div className="min-w-0">
                <p className="truncate font-heading text-[19px] font-semibold leading-tight">{name}</p>
                {line && <p className="truncate text-[13px] text-foreground-muted">{line}</p>}
            </div>
            </div>
        </div>
    );
}
