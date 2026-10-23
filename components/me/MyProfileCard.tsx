'use client';

import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { iconButtonClass } from '@/components/ui/Button';
import { useMeContext } from '@/components/providers/MeProvider';

/**
 * The top of Manas grupas on phones: picture, name, a round pencil to Labot profilu and a quiet link to the public profile.
 * From 768 px the person already stands in the own area's head (and from 1024 px in the side column).
 */
export default function MyProfileCard() {
    const t = useTranslations('profile');
    const { name, avatarSrc, line, username } = useMeContext();
    return (
        <section aria-label={t('card.label')} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card frame md:hidden">
            <img src={avatarSrc} alt="" className="size-14 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <p className="min-w-0 truncate text-item">{name}</p>
                    <Link href="/profile/edit" aria-label={t('editTitle')} className={iconButtonClass('ghost', 'md', 'shrink-0')}>
                        <Pencil aria-hidden className="size-4" />
                    </Link>
                </div>
                {line && <p className="truncate text-meta text-foreground-muted">{line}</p>}
                <Link href={username ? `/profile/${username}` : '/profile'} className="text-meta text-foreground-muted hover:text-foreground hover:underline">{t('area.publicProfileLink')}</Link>
            </div>
        </section>
    );
}
