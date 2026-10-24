'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import PendingState from '@/components/groups/contact/PendingState';
import { useGroupDialogs } from './GroupDialogs';

/**
 * The banner's right end, once for both widths: "Sazināties" for visitors (round on phones, AP-08), the pending state while a
 * request waits, nothing for members and the team. The other actions (share, report, leave, site-admin tools) are in the left menu;
 * the pop-ups are owned by `GroupDialogsProvider`.
 */
export default function GroupActions() {
    const g = useGroupContext();
    const c = useTranslations('common');
    const { openContact } = useGroupDialogs();
    const { role, isMember } = g.user;
    const canContact = !isMember && role !== 'PENDING' && !g.moderation.hidden;

    if (!canContact && role !== 'PENDING') return null;
    return (
        <div className="flex shrink-0 items-center gap-2">
            {canContact && (
                <button /* ui-allow: round on phones, labelled pill from md */
                    type="button"
                    data-ui={UI.joinButton}
                    onClick={openContact}
                    className="grid size-10 shrink-0 place-items-center rounded-pill bg-primary text-button-sm text-primary-foreground hover:opacity-90 md:inline-flex md:w-auto md:gap-1.5 md:px-5"
                >
                    <MessageCircle aria-hidden className="size-5 md:hidden" />
                    <span className="sr-only md:not-sr-only">{c('contact')}</span>
                </button>
            )}
            {role === 'PENDING' && <PendingState />}
        </div>
    );
}
