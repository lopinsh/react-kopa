import { getTranslations } from 'next-intl/server';
import { Pencil } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import AsideSlot from '@/components/ui/AsideSlot';

type Props = { name: string; avatarSrc: string; line: string; bio: string | null };

/**
 * The side column of your own area (AR-60): who you are, as others see you. One box: picture, name, "city · groups", a short bio,
 * "Skatīt profilu" and "Labot profilu". Shown on Manas grupas, Paziņojumi and Iestatījumi; Ziņas keeps the full width for the chat.
 */
export default async function ProfileCard({ name, avatarSrc, line, bio }: Props) {
    const t = await getTranslations('profile');
    return (
        <AsideSlot label={t('card.label')} showPaths={['/profile/my-groups', '/notifications', '/settings']}>
            <section className="grid justify-items-start gap-3 rounded-2xl bg-surface p-4 shadow-card frame">
                <img src={avatarSrc} alt="" className="size-16 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <p className="text-item break-words">{name}</p>
                    {line && <p className="text-meta text-foreground-muted">{line}</p>}
                </div>
                {bio && <p className="line-clamp-4 text-body-sm text-foreground-muted">{bio}</p>}
                <div className="flex flex-wrap gap-2">
                    <Link href="/profile" className={buttonClass('secondary', undefined, 'sm')}>{t('card.view')}</Link>
                    <Link href="/profile/edit" className={buttonClass('quiet', undefined, 'sm')}>
                        <Pencil aria-hidden className="size-4" />
                        {t('editTitle')}
                    </Link>
                </div>
            </section>
        </AsideSlot>
    );
}
