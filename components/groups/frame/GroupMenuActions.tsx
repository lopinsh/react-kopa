'use client';

import { useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Eye, EyeOff, Flag, History, LogOut, MessageCircle, Pencil, Share2, Tags, UserCog, X } from 'lucide-react';
import { cancelJoinRequest, leaveGroup } from '@/actions/group-actions';
import { restoreGroup } from '@/actions/moderation-actions';
import { loadFullPage } from '@/lib/full-page';
import { useToast } from '@/hooks/use-toast';
import { useShareLink } from '@/hooks/useShareLink';
import { UI } from '@/lib/constants';
import { Link, useRouter } from '@/i18n/routing';
import { useGroupContext } from '@/components/providers/GroupProvider';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { NAV_ROW } from '@/components/ui/PageNavLink';
import { useGroupDialogs } from './GroupDialogs';

const ICON = 'size-4 text-foreground-muted';

function Row({ icon, onClick, disabled, children }: { icon: ReactNode; onClick: (el: HTMLElement) => void; disabled?: boolean; children: ReactNode }) {
    return (
        <button type="button" disabled={disabled} onClick={(e) => onClick(e.currentTarget)} className={clsx(NAV_ROW, 'w-full text-left disabled:opacity-50')}>
            {icon}{children}
        </button>
    );
}

/**
 * What a viewer can do with the group besides its pages (AR-51), as rows under the pages in the left menu (desktop column and phone drawer):
 * the viewer's role as a quiet line, then share, write to the team, report, leave or withdraw, and for site admins their tools.
 * Rows are hidden, never greyed. An undoable step (withdraw, leave) asks once in a pop-over at its row.
 */
export default function GroupMenuActions() {
    const c = useTranslations('common');
    const t = useTranslations('group');
    const tAdmin = useTranslations('adminTools');
    const tMod = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const share = useShareLink();
    const { success, error: toastError } = useToast();
    const g = useGroupContext();
    const { openHide, openReport, openWriteToTeam } = useGroupDialogs();
    const roleId = useId();
    const anchorRef = useRef<HTMLElement | null>(null);
    const [confirm, setConfirm] = useState<'withdraw' | 'leave' | null>(null);
    const [isPending, startTransition] = useTransition();

    const { role } = g.user;
    const isTeam = role === 'OWNER' || role === 'ADMIN';
    const canLeave = role === 'MEMBER' || role === 'ADMIN';
    const { isSiteAdmin, hidden } = g.moderation;
    const canHide = !hidden && role !== 'OWNER';
    const ask = (kind: 'withdraw' | 'leave', el: HTMLElement) => { anchorRef.current = el; setConfirm(kind); };

    const showError = (code: string) => toastError(tErrors.has(code) ? tErrors(code as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
    const run = (action: () => Promise<{ success: boolean; error?: string }>, done: () => void) => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            setConfirm(null);
            if (res.success) done();
            else showError(res.error ?? 'ACTION_FAILED');
        });
    };
    const withdraw = () => run(() => cancelJoinRequest(g.id), () => success(t('requestWithdrawn')));
    // The pages that need membership would redirect mid-render: go to Informācija first.
    const leave = () => run(() => leaveGroup(g.id), () => { success(t('leftGroup')); loadFullPage(`/${locale}${g.href}`); });
    const restore = () => run(() => restoreGroup(g.id, locale), () => router.refresh());

    return (
        <div data-ui={UI.groupMoreMenu} role="group" aria-label={c('moreOptions')} aria-describedby={role ? roleId : undefined} className="mt-3 flex flex-col gap-0.5 border-t border-border pt-3">
            {role && <p id={roleId} className="px-3 pb-1 text-meta text-foreground-muted">{t(`more.role.${role}`)}</p>}
            {role === 'PENDING' && <Row icon={<X aria-hidden className={ICON} />} onClick={(el) => ask('withdraw', el)}>{t('withdrawRequest')}</Row>}
            {role === 'MEMBER' && <Row icon={<MessageCircle aria-hidden className={ICON} />} onClick={openWriteToTeam}>{t('writeToTeam')}</Row>}
            <Row icon={<Share2 aria-hidden className={ICON} />} onClick={() => void share({ title: g.name, url: `${window.location.origin}/${locale}${g.href}` })}>{c('shareGroup')}</Row>
            {!isTeam && <Row icon={<Flag aria-hidden className={ICON} />} onClick={openReport}>{c('reportGroup')}</Row>}
            {canLeave && <Row icon={<LogOut aria-hidden className={ICON} />} onClick={(el) => ask('leave', el)}>{c('leaveGroup')}</Row>}

            {isSiteAdmin && (
                <>
                    <p className="mt-2 flex items-center gap-2 px-3 pb-1 pt-2 text-meta text-foreground-muted"><UserCog aria-hidden className={ICON} />{tAdmin('label')}</p>
                    {canHide && <Row icon={<EyeOff aria-hidden className={ICON} />} onClick={openHide}>{tMod('hideGroup')}</Row>}
                    {hidden && <Row icon={<Eye aria-hidden className={ICON} />} disabled={isPending} onClick={restore}>{tMod('restore')}</Row>}
                    <Link href={`/admin/groups/${g.category.l1Slug}/${g.slug}/categorization`} className={NAV_ROW}><Tags aria-hidden className={ICON} />{tAdmin('fixCategorization')}</Link>
                    <Link href={`${g.href}/settings`} className={NAV_ROW}><Pencil aria-hidden className={ICON} />{tAdmin('editGroup')}</Link>
                    <Link href={`/admin?tab=moderation&group=${g.id}`} className={NAV_ROW}><History aria-hidden className={ICON} />{tAdmin('moderationLog')}</Link>
                </>
            )}

            <ConfirmPopover
                anchorRef={anchorRef}
                isOpen={confirm !== null}
                onOpenChange={(o) => { if (!o) setConfirm(null); }}
                message={confirm === 'withdraw' ? t('confirmCancelRequest') : c('confirmLeave')}
                confirmLabel={confirm === 'withdraw' ? t('withdrawRequest') : c('leaveGroup')}
                destructive
                isPending={isPending}
                onConfirm={confirm === 'withdraw' ? withdraw : leave}
            />
        </div>
    );
}
