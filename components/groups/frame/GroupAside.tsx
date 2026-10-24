import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { cardFaces } from '@/lib/services/card-faces';
import { getSmartImageUrl } from '@/lib/image-utils';
import Faces from '@/components/ui/Faces';
import AsideSlot from '@/components/ui/AsideSlot';
import GroupPicture from './GroupPicture';
import NextMeetingBox from '@/components/groups/NextMeetingBox';
import GroupSocialLinks from '@/components/groups/GroupSocialLinks';
import LatestAnnouncement from '@/components/groups/announcements/LatestAnnouncement';
import { getLatestForInfo } from '@/lib/services/announcements-page';

type Group = {
    id: string;
    memberCount: number;
    bannerImage: string | null;
    l1Slug: string;
    base: string;
    isMember: boolean;
    socialLinks: { website?: string | null; instagram?: string | null; discord?: string | null };
};

/**
 * The side column of a group (AR-47): the picture, how many are in it (with a few faces, linking to the members page),
 * the next meeting and the links. Not on settings and create-event, which are focus pages.
 */
export default async function GroupAside({ group, viewerId }: { group: Group; viewerId?: string }) {
    const [t, faces, latest] = await Promise.all([getTranslations('group.frame'), cardFaces([group.id], viewerId), getLatestForInfo(group.id, { isMember: group.isMember })]);
    const shown = faces[group.id] ?? [];
    return (
        <AsideSlot label={t('aboutLabel')} hideSegments={['settings', 'create-event']}>
            <GroupPicture image={group.bannerImage ? getSmartImageUrl(group.bannerImage) : null} l1Slug={group.l1Slug} />
            <Link href={`${group.base}/members`} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card frame">
                <Faces faces={shown} size="lg" />
                <span className="text-body-sm">{t('members', { count: group.memberCount })}</span>
            </Link>
            <NextMeetingBox groupId={group.id} groupHref={group.base} viewerId={viewerId} />
            {latest && <LatestAnnouncement item={latest} allHref={`${group.base}/announcements`} />}
            <GroupSocialLinks websiteLink={group.socialLinks.website} instagramLink={group.socialLinks.instagram} discordLink={group.socialLinks.discord} />
        </AsideSlot>
    );
}
