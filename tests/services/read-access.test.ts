// Characterization tests (F-2): what each viewer gets from the group, announcement and event loaders TODAY.
// They pin the code's behaviour, including where it looks inconsistent; those rows are marked `OPEN: owner decision`.
// Never edit a service to make a row pass: change the expectation only when the owner decides the behaviour.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { GroupService } from '@/lib/services/group.service';
import { EventService } from '@/lib/services/event.service';
import { getRole } from '@/lib/services/post.service';
import { getAnnouncementsPage } from '@/lib/services/announcements-page';
import { VIEWERS, makeCast, makeGroup, type Cast, type Fixture, type GroupKind, type Viewer } from './helpers';

let cast: Cast;
const fx = {} as Record<GroupKind, Fixture>;
const KINDS: GroupKind[] = ['public', 'private', 'hidden'];

before(async () => {
    cast = await makeCast();
    for (const k of KINDS) fx[k] = await makeGroup(cast, k);
});
after(() => prisma.$disconnect());

type Table<T> = Record<GroupKind, Record<Viewer, T>>;
const same = <T>(v: T): Record<Viewer, T> => ({ signedOut: v, outsider: v, pending: v, member: v, admin: v, owner: v, siteAdmin: v });
const row = <T>(base: T, over: Partial<Record<Viewer, T>>): Record<Viewer, T> => ({ ...same(base), ...over });

function each<T>(name: string, table: Table<T>, probe: (f: Fixture, viewer: Viewer) => Promise<T>) {
    describe(name, () => {
        for (const kind of KINDS) {
            for (const viewer of VIEWERS) {
                it(`${kind} group, ${viewer}`, async () => {
                    assert.deepEqual(await probe(fx[kind], viewer), table[kind][viewer]);
                });
            }
        }
    });
}

// The group page: what the layout learns about the viewer. `null` = 404.
type Ctx = { role: string | null; isMember: boolean; isAdmin: boolean; pendingCount: number; siteAdmin: boolean } | null;
const ctx = (role: string | null, isMember: boolean, isAdmin: boolean, pendingCount = 0, siteAdmin = false): Ctx => ({ role, isMember, isAdmin, pendingCount, siteAdmin });
const OPEN_GROUP: Record<Viewer, Ctx> = {
    signedOut: ctx(null, false, false),
    outsider: ctx(null, false, false),
    pending: ctx('PENDING', false, false),
    member: ctx('MEMBER', true, false),
    admin: ctx('ADMIN', true, true, 1),
    owner: ctx('OWNER', true, true, 1),
    siteAdmin: ctx(null, false, false, 1, true),
};
each<Ctx>('getGroupWithContext', {
    public: OPEN_GROUP,
    private: OPEN_GROUP,
    // OPEN: owner decision. A hidden group's page is visible to its owner and site admins only; its own admins and members get a 404.
    hidden: row<Ctx>(null, { owner: OPEN_GROUP.owner, siteAdmin: OPEN_GROUP.siteAdmin }),
}, async (f, v) => {
    const c = await GroupService.getGroupWithContext(f.slug, 'lv', f.l1Slug, cast.id(v));
    return c && { role: c.user.role, isMember: c.user.isMember, isAdmin: c.user.isAdmin, pendingCount: c.stats.pendingCount, siteAdmin: c.moderation.isSiteAdmin };
});

// PostService.getRole: the viewer's group role as the announcements see it. Signed-out viewers never reach it.
const ROLE_OPEN: Record<Viewer, string | null> = { signedOut: null, outsider: null, pending: 'PENDING', member: 'MEMBER', admin: 'ADMIN', owner: 'OWNER', siteAdmin: null };
each<string | null>('post getRole', {
    public: ROLE_OPEN,
    private: ROLE_OPEN,
    // OPEN: owner decision. In a hidden group only the owner has a role here (its admins and members lose theirs; site admins never had one).
    hidden: row<string | null>(null, { owner: 'OWNER' }),
}, async (f, v) => (cast.id(v) ? getRole(f.groupId, cast.id(v)!) : null));

// The announcements page: how many the viewer gets on the current tab, the archive count, and whether they may manage.
type Ann = { items: number; archive: number; canManage: boolean };
const ann = (items: number, canManage = false): Ann => ({ items, archive: 0, canManage });
each<Ann>('announcements page', {
    public: row(ann(1), { member: ann(2), admin: ann(2, true), owner: ann(2, true) }),
    // A private group's announcements are for members only; its non-members see none.
    private: row(ann(0), { member: ann(2), admin: ann(2, true), owner: ann(2, true) }),
    // OPEN: owner decision. Hidden group: announcements are readable by the owner only. Its admins and members, and site admins, see nothing.
    hidden: row(ann(0), { owner: ann(2, true) }),
}, async (f, v) => {
    const p = await getAnnouncementsPage(f.groupId, cast.id(v) ?? null, 'current');
    return { items: p.items.length, archive: p.counts.archive, canManage: p.canManage };
});

// The event page. 'none' = 404 (or the members-only notice); 'seen' = the page; 'organiser' = the page with the organiser's lists.
type Seen = 'none' | 'seen' | 'organiser';
const eventPage = async (f: Fixture, v: Viewer, vis: 'PUBLIC' | 'MEMBERS_ONLY'): Promise<Seen> => {
    const p = await EventService.getEventPage(f.eventSlug[vis], f.slug, 'lv', cast.id(v), f.l1Slug);
    return !p ? 'none' : p.organiser ? 'organiser' : 'seen';
};
const PUBLIC_EVENT: Record<Viewer, Seen> = row<Seen>('seen', { admin: 'organiser', owner: 'organiser' });
// The creator is the owner; an admin organises too; a site admin only reads (no organiser lists).
const MEMBERS_EVENT: Record<Viewer, Seen> = row<Seen>('none', { member: 'seen', admin: 'organiser', owner: 'organiser', siteAdmin: 'seen' });
const NOBODY = same<Seen>('none');
// OPEN: owner decision. Event pages of a hidden group are visible to nobody, not even its owner or a site admin (the group page is).
each<Seen>('event page, public event', { public: PUBLIC_EVENT, private: PUBLIC_EVENT, hidden: NOBODY }, (f, v) => eventPage(f, v, 'PUBLIC'));
each<Seen>('event page, members-only event', { public: MEMBERS_EVENT, private: MEMBERS_EVENT, hidden: NOBODY }, (f, v) => eventPage(f, v, 'MEMBERS_ONLY'));

// The event panel (slide-over): 'event', the 'membersOnly' notice (and whether it offers to contact the team), or none.
type Panel = 'none' | 'event' | 'membersOnly' | 'membersOnly-nocontact';
const eventPanel = async (f: Fixture, v: Viewer, vis: 'PUBLIC' | 'MEMBERS_ONLY'): Promise<Panel> => {
    const p = await EventService.getEventPanel(f.eventSlug[vis], f.slug, f.l1Slug, 'lv', cast.id(v));
    if (!p) return 'none';
    return p.kind === 'event' ? 'event' : p.group.canContact ? 'membersOnly' : 'membersOnly-nocontact';
};
const PANEL_PUBLIC = same<Panel>('event');
const PANEL_MEMBERS: Record<Viewer, Panel> = row<Panel>('membersOnly', { pending: 'membersOnly-nocontact', member: 'event', admin: 'event', owner: 'event', siteAdmin: 'event' });
each<Panel>('event panel, public event', { public: PANEL_PUBLIC, private: PANEL_PUBLIC, hidden: same<Panel>('none') }, (f, v) => eventPanel(f, v, 'PUBLIC'));
each<Panel>('event panel, members-only event', { public: PANEL_MEMBERS, private: PANEL_MEMBERS, hidden: same<Panel>('none') }, (f, v) => eventPanel(f, v, 'MEMBERS_ONLY'));

// The members-only notice on the event page: shown to exactly those who cannot open the event.
const GATE = row<boolean>(true, { member: false, admin: false, owner: false, siteAdmin: false });
each<boolean>('members-only gate', { public: GATE, private: GATE, hidden: same(false) }, async (f, v) => !!(await EventService.getMembersOnlyGate(f.eventSlug.MEMBERS_ONLY, f.slug, cast.id(v), f.l1Slug)));
