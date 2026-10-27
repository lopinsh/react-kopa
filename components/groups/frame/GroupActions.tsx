'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MessageCircle, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import PendingState from '@/components/groups/contact/PendingState';
import { buttonClass } from '@/components/ui/Button';
import { useGroupDialogs } from './GroupDialogs';

/**
 * The head tile's one role button (AR-51, section 2 of the R27 spec): "Labot grupu" for the team, "Sazināties" for visitors, the pending state
 * while a request waits, nothing for members and on the settings page. A light pill from `md`; on phones `phone="full"` is a full-width button
 * (Informācija) and `phone="round"` a round icon (the compact tile). The other actions are in the left menu; the pop-ups belong to `GroupDialogsProvider`.
 */
export default function GroupActions({ phone }: { phone: 'full' | 'round' }) {
    const g = useGroupContext();
    const t = useTranslations('group.frame');
    const c = useTranslations('common');
    const segment = useSelectedLayoutSegment();
    const { openContact } = useGroupDialogs();
    const { role, isMember, isAdmin } = g.user;
    const canContact = !isMember && role !== 'PENDING' && !g.moderation.hidden;

    if (segment === 'settings') return null;
    const round = phone === 'round';
    const cls = buttonClass('onTone', clsx(round ? 'max-md:size-10 max-md:px-0' : 'max-md:w-full', 'md:px-5'));
    const icon = (Icon: typeof Pencil) => round && <Icon aria-hidden className="md:hidden" />;
    const label = (text: string) => <span className={clsx(round && 'max-md:sr-only')}>{text}</span>;

    if (isAdmin) {
        return (
            <Link href={`${g.href}/settings`} className={cls}>
                {icon(Pencil)}{label(t('editGroup'))}
            </Link>
        );
    }
    if (role === 'PENDING') return <PendingState onTone phone={phone} />;
    if (!canContact) return null;
    return (
        <button type="button" data-ui={UI.joinButton} onClick={openContact} className={cls}>
            {icon(MessageCircle)}{label(c('contact'))}
        </button>
    );
}
