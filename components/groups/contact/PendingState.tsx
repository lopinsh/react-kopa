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
 * While a join request waits (AR-46): "Pieteikums nosūtīts" as a status chip and "Atvērt sarunu" next to it; on phones
 * (`phone="round"`) one round chat chip. `onTone` is the group head tile: the chip and the link take the tile's ink and the light pill.
 * `phone="full"` keeps the chip and the link on phones too, full width. The viewer's own chat id comes from the group context.
 */
export default function PendingState({ onTone = false, phone = 'round' }: { onTone?: boolean; phone?: 'full' | 'round' }) {
    const g = useGroupContext();
    const t = useTranslations('group');
    const chatId = g.user.chatId;
    const href = chatId ? `/messages?c=${chatId}` : '/messages';
    const full = phone === 'full';

    return (
        <div data-ui={UI.pendingState} className={clsx('items-center gap-2', full ? 'flex max-md:w-full max-md:flex-col max-md:items-stretch' : 'flex')}>
            <div className={clsx('items-center gap-2', full ? 'flex max-md:flex-col max-md:items-stretch' : 'hidden md:flex')}>
                {/* A status, not a button: no hover, no press, not focusable. */}
                <span className={clsx('inline-flex h-10 items-center justify-center gap-1.5 rounded-pill px-4 text-button-sm', onTone ? 'mark-on-tone' : groupChip(false))}>
                    <Check aria-hidden className="size-4" />
                    {t('pending.sent')}
                </span>
                <Link href={href} className={buttonClass(onTone ? 'onTone' : 'quiet')}>
                    {t('openChat')}
                </Link>
            </div>
            {!full && (
                <Link
                    href={href}
                    aria-label={t('openChat')}
                    className={onTone ? buttonClass('onTone', 'size-10 px-0 md:hidden') : clsx('grid size-10 place-items-center rounded-full md:hidden', groupChip())}
                >
                    <MessageCircle aria-hidden className="size-5" />
                </Link>
            )}
        </div>
    );
}
