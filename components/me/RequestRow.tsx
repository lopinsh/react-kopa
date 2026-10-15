'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import RoleTag from '@/components/ui/RoleTag';
import { cancelJoinRequest } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';
import { EVENT_DAY, useDateFormatter } from '@/lib/date-format';
import { UI } from '@/lib/constants';
import type { MyRequest } from '@/lib/types/own-area';

/** One request that waits (AR-61, AR-46): the group (full page), since when, "Gaida", and "Atsaukt pieteikumu" asking in a pop-over at the button. */
export default function RequestRow({ request }: { request: MyRequest }) {
    const t = useTranslations('profile.myGroups');
    const tGroup = useTranslations('group');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const format = useDateFormatter();
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
        <li data-ui={UI.requestRow} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3.5 py-2.5 first:border-t-0">
            <div className="flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <a href={`/${locale}${request.path}`} className="min-w-0 truncate font-semibold text-foreground hover:underline">{request.name}</a>
                <span className="text-foreground-muted">· {t('since', { date: format.dateTime(request.since, EVENT_DAY) })}</span>
                <RoleTag role="PENDING" />
            </div>
            <ConfirmPopover
                isOpen={open}
                onOpenChange={setOpen}
                message={tGroup('confirmCancelRequest')}
                confirmLabel={tGroup('withdrawRequest')}
                isPending={isPending}
                onConfirm={withdraw}
                renderTrigger={(props) => (
                    <button type="button" disabled={isPending} className="min-h-11 rounded-full px-2 text-sm text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground md:min-h-8" {...props}>
                        {tGroup('withdrawRequest')}
                    </button>
                )}
            />
        </li>
    );
}
