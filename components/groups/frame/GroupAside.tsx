import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { MessageCircle, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { GroupHub } from '@/lib/services/group-hub';
import { buttonClass } from '@/components/ui/Button';
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
    hub: GroupHub | null;
    /** The group's picture as a box (`HeadPicture` box), from 1024 on Informācija; null without a picture. */
    picture: ReactNode;
    socialLinks: { website?: string | null; instagram?: string | null; discord?: string | null };
};

/**
 * The side column of a group (AR-47, R17, K-154): the group's picture (Informācija, from 1024), the hub box, the next meeting, the latest news (Informācija only), then who is in it: faces, count and the links.
 * The members box links to Biedri for members and the team only. Not on settings and create-event, which are focus pages.
 * On Informācija the next meeting shows here from 1024; below that the page shows it after its first section.
 */
export default async function GroupAside({ group, viewerId }: { group: Group; viewerId?: string }) {
    const [t, tHub, faces, latest] = await Promise.all([getTranslations('group.frame'), getTranslations('hub'), cardFaces([group.id], viewerId), getLatestForInfo(group.id, { isMember: group.isMember })]);
    const row = (
        <>
            <Faces faces={faces[group.id] ?? []} size="lg" />
            <span className="text-body-sm">{t('members', { count: group.memberCount })}</span>
        </>
    );
    const rowClass = 'flex items-center gap-3 rounded-xl';
    return (
        <AsideSlot label={t('aboutLabel')} hideSegments={['settings', 'create-event']} offsetOnInfo={group.offsetOnInfo}>
            {group.picture && <SegmentGate show="info" infoClassName="max-lg:hidden">{group.picture}</SegmentGate>}
            {group.hub && (
                <div className="grid gap-3 rounded-2xl bg-surface p-3 shadow-card frame">
                    <div>
                        <p className="text-meta text-foreground-muted">{t('hubLabel')}</p>
                        <p className="text-body"><Link href={group.hub.href} className="underline underline-offset-2 hover:no-underline">{group.hub.title}</Link></p>
                        <p className="inline-flex items-center gap-1.5 text-meta text-foreground-muted [&_svg]:size-4"><Users aria-hidden />{tHub('memberLine', { members: group.hub.memberCount, groups: group.hub.groupCount })}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={group.hub.href} className={buttonClass('quiet', undefined, 'sm')}>{t('hubOpen')}</Link>
                        <Link href={group.hub.chatHref} className={buttonClass('quiet', undefined, 'sm')}><MessageCircle aria-hidden />{t('hubChat')}</Link>
                    </div>
                </div>
            )}
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
