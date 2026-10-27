import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { cardFaces } from '@/lib/services/card-faces';
import Faces from '@/components/ui/Faces';
import AsideSlot from '@/components/ui/AsideSlot';
import NextMeetingBox from '@/components/groups/NextMeetingBox';
import GroupSocialLinks from '@/components/groups/GroupSocialLinks';
import LatestAnnouncement from '@/components/groups/announcements/LatestAnnouncement';
import { getLatestForInfo } from '@/lib/services/announcements-page';
import SegmentGate from './SegmentGate';

type Group = {
    id: string;
    memberCount: number;
    base: string;
    isMember: boolean;
    /** Sections with tabs: the column starts level with the first section's text. */
    offsetOnInfo: boolean;
    socialLinks: { website?: string | null; instagram?: string | null; discord?: string | null };
};

/**
 * The side column of a group (AR-47, R17): the next meeting, the latest news (Informācija only), then who is in it: faces, count and the links.
 * The members box links to Biedri for members and the team only. Not on settings and create-event, which are focus pages.
 * On Informācija the next meeting shows here from 1024; below that the page shows it after its first section.
 */
export default async function GroupAside({ group, viewerId }: { group: Group; viewerId?: string }) {
    const [t, faces, latest] = await Promise.all([getTranslations('group.frame'), cardFaces([group.id], viewerId), getLatestForInfo(group.id, { isMember: group.isMember })]);
    const row = (
        <>
            <Faces faces={faces[group.id] ?? []} size="lg" />
            <span className="text-body-sm">{t('members', { count: group.memberCount })}</span>
        </>
    );
    const rowClass = 'flex items-center gap-3 rounded-xl';
    return (
        <AsideSlot label={t('aboutLabel')} hideSegments={['settings', 'create-event']} offsetOnInfo={group.offsetOnInfo}>
            <SegmentGate infoClassName="hidden lg:contents">
                <NextMeetingBox groupId={group.id} groupHref={group.base} viewerId={viewerId} />
            </SegmentGate>
            {latest && (
                <SegmentGate show="info">
                    <LatestAnnouncement item={latest} allHref={`${group.base}/announcements`} />
                </SegmentGate>
            )}
            <div className="grid gap-3 rounded-2xl bg-surface p-3 shadow-card frame">
                {group.isMember
                    ? <Link href={`${group.base}/members`} className={`${rowClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>{row}</Link>
                    : <div className={rowClass}>{row}</div>}
                <GroupSocialLinks websiteLink={group.socialLinks.website} instagramLink={group.socialLinks.instagram} discordLink={group.socialLinks.discord} />
            </div>
        </AsideSlot>
    );
}
