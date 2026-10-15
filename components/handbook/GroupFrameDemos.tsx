import { getTranslations } from 'next-intl/server';
import type { GroupContext } from '@/lib/services/group.service';
import { groupPages } from '@/lib/group-pages';
import { SAMPLE_ACCENT, type UiSamples } from '@/lib/handbook/ui-samples';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { toGroupState } from '@/components/providers/to-group-state';
import AccentScope from '@/components/handbook/AccentScope';
import GroupBanner from '@/components/groups/frame/GroupBanner';
import GroupPagesNav from '@/components/groups/frame/GroupPagesNav';
import PartTabs from '@/components/ui/PartTabs';
import GroupSocialLinks from '@/components/groups/GroupSocialLinks';
import { NextMeetingView } from '@/components/groups/NextMeetingBox';
import { buttonClass } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

/** A plain picture for the sample banner (no network): a soft landscape in two greys. */
const SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfd6c4"/><stop offset="1" stop-color="#8f9a82"/></linearGradient></defs><rect width="1600" height="400" fill="url(#g)"/><circle cx="1250" cy="120" r="70" fill="#f1f3ec"/></svg>')}`;

export type Viewer = 'visitor' | 'pending' | 'member' | 'team';
const USER: Record<Viewer, GroupContext['user']> = {
    visitor: { isMember: false, role: null, isAdmin: false, chatId: null },
    pending: { isMember: false, role: 'PENDING', isAdmin: false, chatId: 'sample-chat' },
    member: { isMember: true, role: 'MEMBER', isAdmin: false, chatId: null },
    team: { isMember: true, role: 'OWNER', isAdmin: true, chatId: null },
};

export function sampleState(group: GroupContext, viewer: Viewer, o: { image?: boolean; isPrivate?: boolean } = {}) {
    const user = USER[viewer];
    const base = `/${group.category.l1Slug}/group/${group.slug}`;
    const state = toGroupState({
        ...group,
        user,
        type: o.isPrivate ? 'PRIVATE' : 'PUBLIC',
        pages: groupPages({ base, isMember: user.isMember, isTeam: user.isAdmin, pendingCount: user.isAdmin ? 2 : 0 }),
    });
    // The picture is set after the mapping, which would send a data address through the image proxy.
    return { ...state, image: o.image ? SAMPLE_IMAGE : null };
}

/** The banner (96 px from `md`, a 64 px bar on phones): with a picture and without, for a visitor, a pending request, a member and the team. */
export function GroupBannerDemo({ samples }: { samples: UiSamples }) {
    const cases: Array<{ viewer: Viewer; image: boolean; isPrivate?: boolean }> = [
        { viewer: 'visitor', image: true },
        { viewer: 'visitor', image: false, isPrivate: true },
        { viewer: 'pending', image: true },
        { viewer: 'pending', image: false },
        { viewer: 'team', image: false },
    ];
    return (
        <div className="grid gap-4">
            {cases.map(({ viewer, image, isPrivate }) => (
                <AccentScope key={`${viewer}-${image}`} color={SAMPLE_ACCENT}>
                    <GroupProvider value={sampleState(samples.group, viewer, { image, isPrivate })}>
                        <GroupBanner />
                    </GroupProvider>
                </AccentScope>
            ))}
        </div>
    );
}

/** The pages column (the team's, with the waiting count), the page's part tabs with their action, the next-meeting box and the social links. */
export async function GroupPagesDemo({ samples }: { samples: UiSamples }) {
    const [t, tCommon, tFrame] = await Promise.all([getTranslations('group'), getTranslations('common'), getTranslations('group.frame')]);
    const base = `/${samples.group.category.l1Slug}/group/${samples.group.slug}`;
    const nextEvent = { slug: 'sample', title: samples.eventDays[0]?.rows[0]?.title ?? '', titleLang: 'lv' as const, startDate: samples.eventDays[0]?.rows[0]?.startDate ?? new Date(), excerpt: samples.group.description };
    return (
        <AccentScope color={SAMPLE_ACCENT}>
            <GroupProvider value={sampleState(samples.group, 'team')}>
                <div className="grid gap-[22px] md:grid-cols-[190px_minmax(0,1fr)]">
                    <GroupPagesNav variant="side" active="events" />
                    <div className="grid min-w-0 content-start gap-3">
                        <PartTabs
                            title={t('pages.events')}
                            label={tFrame('partsLabel')}
                            active="upcoming"
                            items={[
                                { key: 'upcoming', label: tCommon('eventsTabUpcoming'), href: '#groupPages' },
                                { key: 'past', label: tCommon('eventsTabPast'), href: '#groupPages' },
                            ]}
                            action={<Link href="#groupPages" className={buttonClass('secondary', undefined, 'sm')}>{t('createEvent')}</Link>}
                        />
                        <NextMeetingView event={nextEvent} title={t('nextMeeting.title')} allLabel={t('nextMeeting.all')} groupHref={base} />
                        <GroupSocialLinks websiteLink="https://example.org" instagramLink="https://example.org/instagram" />
                    </div>
                </div>
            </GroupProvider>
        </AccentScope>
    );
}
