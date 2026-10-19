'use client';

import { useTransition } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { manageMembership } from '@/actions/group-actions';
import { useToast } from '@/hooks/use-toast';
import { Link, useRouter } from '@/i18n/routing';
import Button, { buttonClass } from '@/components/ui/Button';
import type { RequestRowData } from '@/lib/services/group-members';
import { UI } from '@/lib/constants';

/** One join request (AR-52): who, when, what they wrote, then get in touch, decline, approve. No question: a declined person may ask again. */
export default function RequestRow({ request }: { request: RequestRowData }) {
    const t = useTranslations('group');
    const c = useTranslations('common');
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const name = request.name || t('anonymousUser');

    const decide = (action: 'APPROVE' | 'DECLINE') => {
        if (isPending) return;
        startTransition(async () => {
            const res = await manageMembership(request.membershipId, action);
            if (res.success) {
                success(c('manageSuccess'));
                router.refresh();
            } else toastError(t('ACTION_FAILED'));
        });
    };

    return (
        <li data-ui={UI.requestCard} className="flex flex-wrap items-center gap-x-3 gap-y-3 py-4">
            <img src={request.avatar} alt="" className="size-11 shrink-0 self-start rounded-full border border-border bg-surface object-cover" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-semibold text-foreground">
                    {name}
                    {request.askedAt && <span className="font-normal text-foreground-muted"> · {format.relativeTime(new Date(request.askedAt), now)}</span>}
                </p>
                {request.message && <p className="mt-0.5 line-clamp-3 text-sm italic text-foreground-muted">&ldquo;{request.message}&rdquo;</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {request.chatId && (
                    <Link href={`/messages?c=${request.chatId}`} className={buttonClass('quiet', undefined, 'sm')}>
                        <MessageSquare aria-hidden />
                        {t('members.contact')}
                    </Link>
                )}
                <Button size="sm" variant="secondary" disabled={isPending} onClick={() => decide('DECLINE')}>{c('decline')}</Button>
                <Button size="sm" disabled={isPending} onClick={() => decide('APPROVE')}>{c('approve')}</Button>
            </div>
        </li>
    );
}
