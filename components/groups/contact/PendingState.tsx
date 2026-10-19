'use client';

import { useTranslations } from 'next-intl';
import { Check, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { buttonClass } from '@/components/ui/Button';
import { groupChip } from '@/components/groups/frame/chip';

/**
 * While a join request waits (AR-46): "Pieteikums nosūtīts" as a status chip and the quiet "Atvērt sarunu" (from `md`);
 * on phones one round chat chip at the bar's right end. The viewer's own chat id comes from the group context.
 */
export default function PendingState() {
    const g = useGroupContext();
    return <PendingStateView chatId={g.user.chatId} />;
}

function PendingStateView({ chatId }: { chatId: string | null }) {
    const t = useTranslations('group');
    const href = chatId ? `/messages?c=${chatId}` : '/messages';

    return (
        <div data-ui={UI.pendingState} className="flex items-center gap-2 max-md:order-last">
            <div className="hidden items-center gap-2 md:flex">
                {/* A status, not a button: no hover, no press, not focusable. */}
                <span className={clsx('inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold', groupChip(false))}>
                    <Check aria-hidden className="size-4" />
                    {t('pending.sent')}
                </span>
                <Link href={href} className={buttonClass('quiet')}>
                    {t('openChat')}
                </Link>
            </div>
            <Link
                href={href}
                aria-label={t('openChat')}
                className={clsx('grid size-10 place-items-center rounded-full md:hidden', groupChip())}
            >
                <MessageCircle aria-hidden className="size-5" />
            </Link>
        </div>
    );
}
