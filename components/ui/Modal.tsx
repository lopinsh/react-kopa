'use client';

import { useId, useState, type ReactNode, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import DiscardGuard from '@/components/ui/DiscardGuard';
import Overlay from '@/components/ui/Overlay';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { IconButton } from '@/components/ui/Button';
import { UI } from '@/lib/constants';

type Props = {
    onClose: () => void;
    /** Heading text; it labels the dialog (`aria-labelledby`). */
    title: ReactNode;
    /** Small text under the heading. */
    subtitle?: ReactNode;
    /** `right`: a panel from the right edge, full height. Dialogs open as a sheet from the bottom on phones. */
    placement?: 'center' | 'right';
    size?: 'sm' | 'md' | 'lg' | '2xl' | '4xl';
    /** Panel without padding and a ruled header, for lists that scroll inside. */
    flush?: boolean;
    /** `alertdialog` for confirmations that need an answer. */
    role?: 'dialog' | 'alertdialog';
    /** id of an element inside that describes the dialog. */
    describedBy?: string;
    /** While something is saving: Esc, scrim, × and Back do nothing. */
    locked?: boolean;
    /** The form holds typed input: closing asks "Discard changes?" first (keep editing is the default). */
    dirty?: boolean;
    hideClose?: boolean;
    /** Marks the pop-up as not translatable in translate mode. */
    translateIgnore?: boolean;
    zIndexClassName?: string;
    panelClassName?: string;
    /** Where focus goes on close when the opener (a menu item) no longer exists: the menu's trigger. */
    returnFocusRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
};

function CloseButton({ locked }: { locked: boolean }) {
    const t = useTranslations('common');
    const close = useOverlayClose();
    return (
        <IconButton
            type="button"
            onClick={() => close()}
            disabled={locked}
            aria-label={t('close')}
            className="-mr-2 -mt-2"
        >
            <X className="size-5" />
        </IconButton>
    );
}

/** A pop-up with a title and ×: a dialog in the middle (dim + 1.5 px blur), a sheet from the bottom on phones. Mount = open. */
export default function Modal({
    onClose, title, subtitle, placement = 'center', size = 'md', flush = false, role = 'dialog', describedBy, locked = false, dirty = false,
    hideClose = false, translateIgnore = false, zIndexClassName, panelClassName, returnFocusRef, children,
}: Props) {
    const titleId = useId();
    const [asking, setAsking] = useState(false);
    return (
        <Overlay
            layout={placement === 'right' ? 'right' : 'dialog'}
            onClose={onClose}
            locked={locked}
            dirty={dirty}
            onBlocked={() => setAsking(true)}
            role={role}
            labelledBy={titleId}
            describedBy={describedBy}
            dataUi={role === 'alertdialog' ? UI.confirmDialog : UI.modal}
            size={size}
            flush={flush}
            zIndexClassName={zIndexClassName}
            translateIgnore={translateIgnore}
            panelClassName={panelClassName}
            returnFocusRef={returnFocusRef}
        >
            <div className={clsx('flex shrink-0 items-start justify-between gap-3', flush ? 'border-b border-border px-4 py-3' : 'mb-3')}>
                <div className="min-w-0">
                    <h2 id={titleId} className="text-section text-foreground">{title}</h2>
                    {subtitle}
                </div>
                {!hideClose && <CloseButton locked={locked} />}
            </div>
            {children}
            {asking && <DiscardGuard onKeep={() => setAsking(false)} />}
        </Overlay>
    );
}
