import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import type { AnnouncementItemData } from '@/lib/services/announcements-page';
import AnnouncementItem from './AnnouncementItem';

type Props = { item: AnnouncementItemData; /** The full list of the group's announcements. */ allHref: string };

/** The newest announcement as a compact preview in the group's side column: a cancelled concert is seen without opening anything. */
export default async function LatestAnnouncement({ item, allHref }: Props) {
    const t = await getTranslations('group');
    return (
        <section aria-labelledby="latest-announcement" className="rounded-2xl bg-surface px-3 pb-3 shadow-card">
            <h2 id="latest-announcement" className="sr-only">{t('latestAnnouncement')}</h2>
            <AnnouncementItem item={item} clamp />
            <p><Link href={allHref} className={TEXT_LINK_CLASS}>{t('allAnnouncements')} →</Link></p>
        </section>
    );
}
