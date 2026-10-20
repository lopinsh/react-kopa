import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import type { AnnouncementItemData } from '@/lib/services/announcements-page';
import AnnouncementItem from './AnnouncementItem';

type Props = { item: AnnouncementItemData; /** Only members have the full list to go to. */ allHref?: string };

/** The newest announcement at the top of Informācija: a cancelled concert is seen before anything else. */
export default async function LatestAnnouncement({ item, allHref }: Props) {
    const t = await getTranslations('group');
    return (
        <section aria-labelledby="latest-announcement" className="mb-4 max-w-[760px]">
            <h3 id="latest-announcement" className="mb-1.5 text-item">{t('latestAnnouncement')}</h3>
            <AnnouncementItem item={item} clamp />
            {allHref && <p className="mt-1.5"><Link href={allHref} className={TEXT_LINK_CLASS}>{t('allAnnouncements')} →</Link></p>}
        </section>
    );
}
