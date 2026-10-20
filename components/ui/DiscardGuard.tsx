'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Overlay from '@/components/ui/Overlay';
import { useOverlayForceClose } from '@/components/ui/overlay-support';
import { UI } from '@/lib/constants';

/** "Discard changes?" over a pop-up that holds typed input. Keep editing is the default; Back and Esc keep editing too. */
export default function DiscardGuard({ onKeep }: { onKeep: () => void }) {
    const t = useTranslations('common');
    const titleId = useId();
    const forceClose = useOverlayForceClose();
    return (
        <Overlay layout="dialog" size="sm" role="alertdialog" labelledBy={titleId} dataUi={UI.confirmDialog} onClose={onKeep} backClose={false} zIndexClassName="z-[60]">
            <h2 id={titleId} className="text-section text-foreground">{t('discardTitle')}</h2>
            <p className="mt-2 text-body-sm text-foreground">{t('discardText')}</p>
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" size="sm" data-autofocus onClick={onKeep}>{t('keepEditing')}</Button>
                <Button variant="danger" size="sm" onClick={forceClose}>{t('discard')}</Button>
            </div>
        </Overlay>
    );
}
