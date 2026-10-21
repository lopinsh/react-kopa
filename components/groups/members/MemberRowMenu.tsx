'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ArrowDownCircle, ArrowUpCircle, ExternalLink, MessageSquare, MoreHorizontal, UserMinus } from 'lucide-react';
import { promoteMember, demoteMember, kickMember } from '@/actions/group-actions';
import { getOrCreateDirectChat } from '@/actions/message-actions';
import { useToast } from '@/hooks/use-toast';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { MenuItemButton, MenuItemLink, MenuPanel, MenuSeparator, useMenu } from '@/components/ui/Menu';
import type { MemberAction } from '@/lib/services/group-members';
import type { MemberManageAction } from '@/lib/utils/permissions';
import { IconButton } from '@/components/ui/Button';

const ICON = 'size-[17px] text-foreground-muted';
const CONFIRM = { promote: 'confirmPromote', demote: 'confirmDemote', remove: 'confirmKick' } as const;
const LABEL = { promote: 'promote', demote: 'demote', remove: 'kick' } as const;

type Props = { groupId: string; userId: string; name: string; actions: MemberAction[]; profileHref: string | null };

/** The "…" of one member. The items come from the server (`actions`, one rule shared with the services, which still check every call); changes ask at the button. */
export default function MemberRowMenu({ groupId, userId, name, actions, profileHref }: Props) {
    const t = useTranslations('group');
    const c = useTranslations('common');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const { open, rootRef, triggerProps, menuProps } = useMenu();
    const [asking, setAsking] = useState<MemberManageAction | null>(null);
    const [isPending, startTransition] = useTransition();
    const has = (a: MemberAction) => actions.includes(a);
    const manage = (['promote', 'demote', 'remove'] as const).filter(has);
    const fail = (error: string) => toastError(tErrors.has(error) ? tErrors(error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));

    const message = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await getOrCreateDirectChat(userId);
            if (res.success && res.data) router.push(`/messages?c=${res.data.conversationId}`);
            else fail(!res.success ? res.error : 'ACTION_FAILED');
        });
    };

    const confirm = () => {
        const action = asking;
        if (!action || isPending) return;
        startTransition(async () => {
            const run = action === 'promote' ? promoteMember : action === 'demote' ? demoteMember : kickMember;
            const res = await run(groupId, userId, locale);
            setAsking(null);
            if (res.success) {
                success(c('manageSuccess'));
                router.refresh();
            } else fail(res.error);
        });
    };

    return (
        <div className="relative flex" ref={rootRef}>
            <IconButton size="lg"
                {...triggerProps}
                aria-label={`${t('memberActions')}: ${name}`}
            >
                <MoreHorizontal aria-hidden className="size-5" />
            </IconButton>
            {open && (
                <MenuPanel label={t('memberActions')} placement="anchor" {...menuProps}>
                    {has('message') && <MenuItemButton icon={<MessageSquare aria-hidden className={ICON} />} onSelect={message}>{t('sendMessage')}</MenuItemButton>}
                    {has('profile') && profileHref && <MenuItemLink href={profileHref} icon={<ExternalLink aria-hidden className={ICON} />}>{c('viewProfile')}</MenuItemLink>}
                    {manage.length > 0 && (has('message') || has('profile')) && <MenuSeparator />}
                    {manage.map((a) => (
                        <MenuItemButton
                            key={a}
                            icon={a === 'promote' ? <ArrowUpCircle aria-hidden className={ICON} /> : a === 'demote' ? <ArrowDownCircle aria-hidden className={ICON} /> : <UserMinus aria-hidden className={ICON} />}
                            onSelect={() => setAsking(a)}
                        >
                            {c(LABEL[a])}
                        </MenuItemButton>
                    ))}
                </MenuPanel>
            )}
            <ConfirmPopover
                anchorRef={triggerProps.ref}
                isOpen={asking !== null}
                onOpenChange={(o) => { if (!o) setAsking(null); }}
                message={asking ? t(CONFIRM[asking]) : ''}
                confirmLabel={asking ? c(LABEL[asking]) : ''}
                destructive={asking === 'remove'}
                isPending={isPending}
                onConfirm={confirm}
            />
        </div>
    );
}
