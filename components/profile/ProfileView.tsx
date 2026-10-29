import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import GroupList from '@/components/discovery/GroupList';
import { ProfileIdentity, ProfileFacts, ProfileBio } from '@/components/profile/ProfileParts';
import ContactLine from '@/components/profile/ContactLine';
import { cardActivities } from '@/lib/services/card-activity';
import type { ProfileViewContext } from '@/lib/types/profile';

type Props = {
    view: ProfileViewContext;
    viewerId?: string;
    locale: string;
    /** At the right of the facts line: "Labot profilu" on Mans profils, "Sūtīt ziņu" on another person's profile. */
    action?: ReactNode;
    /** Mans profils: the person header already names you, so the name stays for screen readers on desktop. */
    own?: boolean;
};

/**
 * One profile for every page (R9c): picture, name, places, since when, about text and groups, all from the service's
 * `ProfileViewContext`. It holds no visibility logic: what is in `view` is what the viewer may see.
 */
export default async function ProfileView({ view, viewerId, locale, action, own = false }: Props) {
    const [t, activity] = await Promise.all([
        getTranslations('profile'),
        cardActivities(view.groups.map((g) => g.card), locale, viewerId),
    ]);
    const { person, groups, groupsScope } = view;
    const mine = Object.fromEntries(groups.map((g) => [g.card.id, { role: g.role, requestCount: 0 }]));

    return (
        <div className="grid max-w-page gap-6">
            <ProfileIdentity person={person} own={own} />

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <ProfileFacts person={person} />
                {action}
            </div>

            <ProfileBio person={person} own={own} />
            {person.contact && <ContactLine contact={person.contact} />}

            {groupsScope !== 'none' && (
                <section className="grid gap-3">
                    <h2 className="text-section">{groupsScope === 'all' ? t('groupsHeading') : t('sharedGroups')}</h2>
                    <GroupList groups={groups.map((g) => g.card)} activity={activity} mine={mine} fullPage />
                </section>
            )}
        </div>
    );
}
