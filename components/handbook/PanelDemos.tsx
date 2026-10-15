import GroupPanel from '@/components/panels/GroupPanel';
import EventPanel from '@/components/panels/EventPanel';
import JoinStep from '@/components/events/JoinStep';
import type { GroupCardData } from '@/lib/services/group-card';
import type { EventRowData } from '@/lib/services/event-row';
import type { EventJoinView, EventPanelData, Face } from '@/lib/services/event-panel';
import type { GroupPanelData } from '@/lib/services/group-panel';

const FRAME = 'w-full max-w-[360px] overflow-hidden rounded-2xl border border-border bg-surface shadow-premium';
const JOIN: EventJoinView = { eventId: 'sample', mode: 'OPEN', isFull: false, ended: false, myStatus: null, canManage: false };

/** The group panel and the event panel as bodies in a 360 px column (the real Overlay is not used), plus the four join steps side by side. */
export default async function PanelDemos({ group, row, text }: { group: GroupCardData; row: EventRowData; text: string }) {
    const groupData = (image: string | null): GroupPanelData => ({
        id: group.id, name: group.name, slug: group.slug, l1Slug: group.category.l1Slug,
        category: { l1Title: group.category.l1Title, color: group.category.color, subCategories: group.subCategories, subCategorySlugs: group.subCategorySlugs },
        city: group.city, lookingFor: group.lookingFor, memberCount: group.memberCount, image, text, tagline: group.tagline, events: [row],
        textLang: 'lv', nextMeeting: { slug: row.slug, title: row.title, titleLang: row.titleLang, startDate: row.startDate },
        viewer: { canContact: true, isAcceptingMembers: true, pending: null, isMember: false },
    });
    const faces: Face[] = ['anna', 'janis', 'marta'].map((seed) => ({ id: seed, name: seed, image: `https://api.dicebear.com/10.x/clay/svg?seed=${seed}` }));
    const eventData = (people: Face[] | null, image: string | null): EventPanelData => ({
        id: row.id, slug: row.slug, title: row.title, titleLang: row.titleLang, text, textLang: 'lv',
        startDate: row.startDate, endDate: new Date(row.startDate.getTime() + 2 * 3600_000), city: row.city, isOnline: false, location: 'Rožu iela 5', image,
        membersOnly: false, category: row.category, subCategories: row.subCategories, group: { ...row.group, city: row.city },
        join: JOIN, going: { count: 12, viewerGoing: false, people },
    });
    const steps: EventJoinView[] = [JOIN, { ...JOIN, mode: 'REQUEST' }, { ...JOIN, mode: 'REQUEST', isFull: true }, { ...JOIN, mode: 'REQUEST', myStatus: 'PENDING' }];
    return (
        <div className="grid gap-6">
            <div className="flex flex-wrap items-start gap-4">
                <div className={FRAME}><GroupPanel data={groupData('https://picsum.photos/seed/panel/800/400')} /></div>
                <div className={FRAME}><GroupPanel data={groupData(null)} /></div>
                <div className={FRAME}><EventPanel event={eventData(faces, 'https://picsum.photos/seed/panel2/800/400')} l1Slug={row.category.l1Slug} /></div>
                <div className={FRAME}><EventPanel event={eventData(null, null)} l1Slug={row.category.l1Slug} /></div>
            </div>
            <div className="flex flex-wrap items-start gap-6">
                {steps.map((join, i) => <div key={i} className="w-[260px]"><JoinStep join={join} /></div>)}
            </div>
        </div>
    );
}
