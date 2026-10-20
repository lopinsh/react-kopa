'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { getInbox } from '@/actions/message-actions';
import { DROPDOWN_ROWS } from '@/lib/constants';
import type { InboxRow } from '@/lib/services/message.service';
import { DropdownFooter, DropdownHead } from '@/components/shell/DropdownParts';
import EmptyState from '@/components/ui/EmptyState';
import { LoadingRegion, SkeletonRow } from '@/components/ui/Skeleton';
import ConversationRow from './ConversationRow';

/**
 * What the messages icon opens (cmv9ahbt5): the last five chats, then "Visas ziņas". Fetched when it opens, so a closed list costs nothing.
 * A row goes to the page with that chat open; quick replies happen on the Ziņas page.
 */
export default function MessagesDropdown({ headingId }: { headingId: string }) {
    const t = useTranslations('messages');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const [rows, setRows] = useState<InboxRow[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        void getInbox(locale, DROPDOWN_ROWS).then((res) => {
            if (cancelled) return;
            if (res.success) setRows(res.data ?? []);
            else setFailed(true);
        });
        return () => { cancelled = true; };
    }, [locale]);

    return (
        <>
            <DropdownHead id={headingId} title={t('title')} />
            {failed ? (
                <p className="px-4 py-6 text-center text-body-sm text-foreground-muted">{t('loadFailed')}</p>
            ) : rows === null ? (
                <LoadingRegion label={tCommon('loading')}>
                    <div className="px-4 py-2">{Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />)}</div>
                </LoadingRegion>
            ) : rows.length === 0 ? (
                <EmptyState icon={MessageSquare} title={t('emptyTitle')} description={t('emptyText')} />
            ) : (
                <div>
                    {rows.map((conv) => (
                        <ConversationRow
                            key={conv.id}
                            conversation={conv}
                            title={conv.viewerIsContact ? (conv.group?.name ?? t('deletedGroup')) : (conv.other?.name || t('unknownUser'))}
                            href={`/messages?c=${conv.id}`}
                        />
                    ))}
                </div>
            )}
            <DropdownFooter href="/messages" label={t('allMessages')} />
        </>
    );
}
