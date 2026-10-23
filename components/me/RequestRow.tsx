'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import GroupRow from '@/components/discovery/GroupRow';
import Button from '@/components/ui/Button';
import { cancelJoinRequest } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';
import { UI } from '@/lib/constants';
import type { MyRequest } from '@/lib/types/own-area';

/** One request that waits (AR-61, AR-46): the group as the phone group row (full page) with the "Gaida" tag, a little faded, and "Atsaukt" as a small outlined button asking in a pop-over. */
export default function RequestRow({ request }: { request: MyRequest }) {
    const tGroup = useTranslations('group');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    // A second click in the same moment must not send a second request (the state only catches up after a render).
    const sent = useRef(false);

    const withdraw = () => {
        if (isPending || sent.current) return;
        sent.current = true;
        startTransition(async () => {
            const res = await cancelJoinRequest(request.groupId);
            sent.current = false;
            if (res.success) {
                setOpen(false);
                success(tGroup('requestWithdrawn'));
                router.refresh();
            } else {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <li data-ui={UI.requestRow} className="border-t border-border px-4 first:border-t-0">
            <div className="min-w-0 opacity-75"><GroupRow group={request.card} fullPage role="PENDING" /></div>
            <div className="flex justify-end pb-3">
            <ConfirmPopover
                isOpen={open}
                onOpenChange={setOpen}
                message={tGroup('confirmCancelRequest')}
                confirmLabel={tGroup('withdrawRequest')}
                isPending={isPending}
                onConfirm={withdraw}
                renderTrigger={(props) => (
                    <Button variant="quiet" size="sm" disabled={isPending} className="shrink-0" {...props}>
                        {tGroup('withdrawRequestShort')}
                    </Button>
                )}
            />
            </div>
        </li>
    );
}
