import { getTranslations } from 'next-intl/server';
import { Pencil } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import AsideSlot from '@/components/ui/AsideSlot';
import { ProfileIdentity, ProfileFacts, ProfileBio } from '@/components/profile/ProfileParts';
import type { ProfileViewContext } from '@/lib/types/profile';

/**
 * The side column of your own area (AR-60): your profile as others see it (the same parts as Mans profils, from the layout's
 * `asStranger` view, so privacy is respected): picture, name, @handle, places, since when, about text and "Labot profilu".
 * Shown on every own-area page except Mans profils (/profile), whose main column is the profile itself.
 */
export default async function ProfileCard({ person }: { person: ProfileViewContext['person'] }) {
    const t = await getTranslations('profile');
    return (
        <AsideSlot label={t('card.label')} lgOnly hidePaths={['/profile', '/messages']}>
            <section className="grid gap-3 rounded-2xl bg-surface p-4 shadow-card frame">
                <ProfileIdentity person={person} compact />
                <ProfileFacts person={person} />
                <ProfileBio person={person} own clamp link={false} />
                <div>
                    <Link href="/profile/edit" className={buttonClass('quiet', undefined, 'sm')}>
                        <Pencil aria-hidden className="size-4" />
                        {t('editTitle')}
                    </Link>
                </div>
            </section>
        </AsideSlot>
    );
}
