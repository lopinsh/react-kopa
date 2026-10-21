import { getTranslations, getLocale, getTimeZone } from 'next-intl/server';
import TextLink from '@/components/ui/TextLink';
import { cityLabel } from '@/lib/city-label';
import { avatarUrl } from '@/lib/avatar';
import { createDateFormatter } from '@/lib/date-format';
import type { ProfileViewContext } from '@/lib/types/profile';

type Person = ProfileViewContext['person'];

/** Picture, name and @handle. `compact` is the aside size (the name wraps, not truncates). */
export async function ProfileIdentity({ person, own = false, compact = false }: { person: Person; own?: boolean; compact?: boolean }) {
    const t = await getTranslations('profile');
    const name = person.name || t('anonymousUser');
    return (
        <div className={compact ? 'grid justify-items-start gap-3' : 'flex items-center gap-4'}>
            <img src={avatarUrl(person)} alt="" className={`shrink-0 rounded-full object-cover ${compact ? 'size-16' : 'size-16 md:size-20'}`} referrerPolicy="no-referrer" />
            <div className="min-w-0">
                {compact
                    ? <p className="text-item break-words">{name}</p>
                    : <h1 className={`truncate py-[0.15em] -my-[0.15em] text-section ${own ? 'md:sr-only' : ''}`}>{name}</h1>}
                {person.username && <p className={`${compact ? 'break-words' : 'truncate'} text-body-sm text-foreground-muted`}>{t('handle', { username: person.username })}</p>}
            </div>
        </div>
    );
}

/** "Rīga, Jūrmala · Member since …". */
export async function ProfileFacts({ person }: { person: Person }) {
    const [t, tCities] = await Promise.all([getTranslations('profile'), getTranslations('cities')]);
    const format = createDateFormatter(await getLocale(), await getTimeZone());
    const facts = [
        person.cities.map((c) => cityLabel(tCities, c)).join(', '),
        t('memberSince', { date: format.dateTime(person.createdAt, { year: 'numeric', month: 'long' }) }),
    ].filter(Boolean).join(' · ');
    return <p className="text-body-sm text-foreground-muted">{facts}</p>;
}

/** The about text; on your own profile an empty one invites you to write it. */
export async function ProfileBio({ person, own = false, clamp = false, link = true }: { person: Person; own?: boolean; clamp?: boolean; link?: boolean }) {
    const t = await getTranslations('profile');
    if (person.bio) return <p className={`whitespace-pre-wrap text-body-sm text-foreground ${clamp ? 'line-clamp-6' : ''}`}>{person.bio}</p>;
    if (!own) return null;
    return (
        <p className="text-body-sm italic text-foreground-muted">
            {t('noBio')}{link && <> <TextLink href="/profile/edit">{t('editTitle')}</TextLink></>}
        </p>
    );
}
