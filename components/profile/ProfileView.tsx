import type { ReactNode } from 'react';
import { getTranslations, getLocale, getTimeZone } from 'next-intl/server';
import GroupList from '@/components/discovery/GroupList';
import TextLink from '@/components/ui/TextLink';
import { cardActivities } from '@/lib/services/card-activity';
import { cityLabel } from '@/lib/city-label';
import { avatarUrl } from '@/lib/avatar';
import { createDateFormatter } from '@/lib/date-format';
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
    const [t, tCities, activity] = await Promise.all([
        getTranslations('profile'),
        getTranslations('cities'),
        cardActivities(view.groups.map((g) => g.card), locale, viewerId),
    ]);
    const format = createDateFormatter(await getLocale(), await getTimeZone());
    const { person, groups, groupsScope } = view;
    const name = person.name || t('anonymousUser');
    const facts = [
        person.cities.map((c) => cityLabel(tCities, c)).join(', '),
        t('memberSince', { date: format.dateTime(person.createdAt, { year: 'numeric', month: 'long' }) }),
    ].filter(Boolean).join(' · ');
    const mine = Object.fromEntries(groups.map((g) => [g.card.id, { role: g.role, requestCount: 0 }]));

    return (
        <div className="grid max-w-[680px] gap-6">
            <header className="flex items-center gap-3.5">
                <img src={avatarUrl(person)} alt="" className="size-16 shrink-0 rounded-full object-cover md:size-20" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <h1 className={`truncate text-section ${own ? 'md:sr-only' : ''}`}>{name}</h1>
                    {person.username && <p className="truncate text-body-sm text-foreground-muted">{t('handle', { username: person.username })}</p>}
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="text-body-sm text-foreground-muted">{facts}</p>
                {action}
            </div>

            {person.bio ? (
                <p className="whitespace-pre-wrap text-body-sm text-foreground">{person.bio}</p>
            ) : (
                own && (
                    <p className="text-body-sm italic text-foreground-muted">
                        {t('noBio')} <TextLink href="/profile/edit">{t('editTitle')}</TextLink>
                    </p>
                )
            )}

            {groupsScope !== 'none' && (
                <section className="grid gap-3">
                    <h2 className="text-section">{groupsScope === 'all' ? t('groupsHeading') : t('sharedGroups')}</h2>
                    <GroupList groups={groups.map((g) => g.card)} activity={activity} mine={mine} fullPage />
                </section>
            )}
        </div>
    );
}
