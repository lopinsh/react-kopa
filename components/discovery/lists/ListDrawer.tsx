'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import Overlay from '@/components/ui/Overlay';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { UI } from '@/lib/constants';

function CloseButton() {
    const t = useTranslations('common');
    const close = useOverlayClose();
    return (
        <button type="button" onClick={() => close()} aria-label={t('close')} className="-mr-1 grid size-10 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-tint">
            <X aria-hidden="true" className="size-5" />
        </button>
    );
}

/** The category tree on phones: a side drawer from the left, the same list as the desktop column (AR-30). Mount = open; the list scrolls inside. */
export default function ListDrawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    const titleId = useId();
    return (
        <Overlay layout="left" onClose={onClose} labelledBy={titleId} dataUi={UI.drawer} flush panelClassName="px-2.5 py-3.5">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-1 pb-2">
                <h2 id={titleId} className="text-section text-foreground">{title}</h2>
                <CloseButton />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pt-2">{children}</div>
        </Overlay>
    );
}
