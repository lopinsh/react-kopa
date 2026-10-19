'use client';

import { useTranslations } from 'next-intl';
import { Dices } from 'lucide-react';
import { avatarUrl } from '@/lib/avatar';

type Props = {
    userId: string;
    /** A photo address wins; otherwise the generated figure for the seed. */
    image: string | undefined;
    seed: string | undefined;
    onNewSeed: (seed: string) => void;
};

/** The picture preview and the dice ("Jauns avatārs") of the edit form. The photo address field stays in the form. */
export default function AvatarField({ userId, image, seed, onNewSeed }: Props) {
    const t = useTranslations('profile.edit');
    return (
        <div className="flex items-center gap-5">
            <img
                src={avatarUrl({ id: userId, image, avatarSeed: seed })}
                alt=""
                className="size-20 shrink-0 rounded-full bg-tint object-cover"
                referrerPolicy="no-referrer"
            />
            <button
                type="button"
                onClick={() => onNewSeed(Math.random().toString(36).slice(2, 10))}
                className="flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-tint soft-press"
            >
                <Dices aria-hidden className="size-4" />
                {t('newAvatar')}
            </button>
        </div>
    );
}
