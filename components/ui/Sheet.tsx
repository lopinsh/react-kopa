'use client';

import { useId, useState, type ReactNode, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import DiscardGuard from '@/components/ui/DiscardGuard';
import Overlay from '@/components/ui/Overlay';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { UI } from '@/lib/constants';

type Props = {
    title: ReactNode;
    onClose: () => void;
    locked?: boolean;
    dirty?: boolean;
    returnFocusRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
};

function CloseButton({ locked }: { locked: boolean }) {
    const t = useTranslations('common');
    const close = useOverlayClose();
    return (
        <button type="button" onClick={() => close()} disabled={locked} aria-label={t('close')} className="-mr-2 -mt-2 grid size-10 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-tint disabled:opacity-50">
            <X className="size-5" />
        </button>
    );
}

/** A panel from the bottom (AR-67), for choosers that are phone-only. Mount = open. */
export default function Sheet({ title, onClose, locked = false, dirty = false, returnFocusRef, children }: Props) {
    const titleId = useId();
    const [asking, setAsking] = useState(false);
    return (
        <Overlay layout="sheet" onClose={onClose} locked={locked} dirty={dirty} onBlocked={() => setAsking(true)} labelledBy={titleId} dataUi={UI.sheet} returnFocusRef={returnFocusRef}>
            <div className="mb-2.5 flex items-start justify-between gap-3">
                <h2 id={titleId} className="font-heading text-lg font-semibold text-foreground">{title}</h2>
                <CloseButton locked={locked} />
            </div>
            {children}
            {asking && <DiscardGuard onKeep={() => setAsking(false)} />}
        </Overlay>
    );
}
