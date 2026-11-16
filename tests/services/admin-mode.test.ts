// Simulated group modes for site admins (A-2): a site admin in owner / member / visitor mode is resolved as that standing in any group,
// with no membership row. A non-admin with the cookie set gets nothing. The mode is set with the test-only `setAdminModeForTest`.
import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { GroupService } from '@/lib/services/group.service';
import { EventService } from '@/lib/services/event.service';
import { PostService } from '@/lib/services/post.service';
import { getViewerAccess } from '@/lib/services/access';
import { setAdminModeForTest } from '@/lib/services/admin-mode';
import type { AdminMode } from '@/lib/constants';
import { eventForm, makeCast, makeGroup, outcome, type Cast, type GroupKind } from './helpers';

let cast: Cast;
before(async () => { cast = await makeCast(); });
afterEach(() => setAdminModeForTest(undefined));
after(() => prisma.$disconnect());

const KINDS: GroupKind[] = ['public', 'private', 'hidden'];
const MODES: AdminMode[] = ['owner', 'member', 'visitor'];
const admin = () => cast.id('siteAdmin')!;

describe('mode off or unusable', () => {
    it('no cookie: the site admin keeps site powers and no role', async () => {
        const f = await makeGroup(cast, 'public');
        const a = await getViewerAccess(f.groupId, admin());
        assert.deepEqual([a.role, a.isSiteAdmin, a.simulated], [null, true, null]);
    });
    for (const v of ['outsider', 'member', 'owner'] as const) {
        it(`a non-admin (${v}) with the cookie set is unchanged`, async () => {
            const f = await makeGroup(cast, 'public');
            const before = await getViewerAccess(f.groupId, cast.id(v)!);
            for (const m of MODES) {
                setAdminModeForTest(m);
                assert.deepEqual(await getViewerAccess(f.groupId, cast.id(v)!), before);
            }
        });
    }
    it('a non-admin cannot act through the cookie', async () => {
        const f = await makeGroup(cast, 'public');
        setAdminModeForTest('owner');
        assert.equal(await outcome(() => EventService.createEvent(f.groupId, eventForm('x'), cast.id('outsider')!)), 'FORBIDDEN');
    });
});

// Expected standing of the site admin per mode: [role, isMember, isTeam, isSiteAdmin].
const STANDING: Record<AdminMode, [string | null, boolean, boolean, boolean]> = {
    owner: ['OWNER', true, true, true],
    member: ['MEMBER', true, false, false],
    visitor: [null, false, false, false],
};

for (const kind of KINDS) {
    for (const mode of MODES) {
        describe(`${mode} mode, ${kind} group`, () => {
            it('resolver', async () => {
                const f = await makeGroup(cast, kind);
                setAdminModeForTest(mode);
                const a = await getViewerAccess(f.groupId, admin());
                assert.deepEqual([a.role, a.isMember, a.isTeam, a.isSiteAdmin, a.simulated], [...STANDING[mode], mode]);
            });

            it('group page context', async () => {
                const f = await makeGroup(cast, kind);
                setAdminModeForTest(mode);
                const c = await GroupService.getGroupWithContext(f.slug, 'lv', f.l1Slug, admin());
                // A hidden group is a 404 for a member or a visitor, as for the real thing; owner mode (site powers kept) opens it.
                if (kind === 'hidden' && mode !== 'owner') return assert.equal(c, null);
                assert.ok(c);
                assert.deepEqual([c.user.role, c.user.isMember, c.user.isAdmin, c.moderation.isSiteAdmin, c.moderation.canSwitchMode, c.moderation.mode], [STANDING[mode][0], STANDING[mode][1], STANDING[mode][2], STANDING[mode][3], true, mode]);
            });

            it('team actions: createEvent, createAnnouncement, deleteGroup', async () => {
                const f = await makeGroup(cast, kind);
                setAdminModeForTest(mode);
                const team = mode === 'owner';
                assert.equal(await outcome(() => EventService.createEvent(f.groupId, eventForm('Simulated'), admin())), team ? 'ok' : 'FORBIDDEN');
                assert.equal(await outcome(() => PostService.createAnnouncement({ groupId: f.groupId, authorId: admin(), title: 'T', content: 'C', visibility: 'PUBLIC' })), team ? 'ok' : 'FORBIDDEN');
                // Never deletes, not even as the simulated owner.
                assert.equal(await outcome(() => GroupService.deleteGroup(f.groupId, admin())), 'FORBIDDEN');
                assert.ok(await prisma.group.findUnique({ where: { id: f.groupId } }));
            });

            it('event page and members-only event', async () => {
                const f = await makeGroup(cast, kind);
                setAdminModeForTest(mode);
                const hiddenShut = kind === 'hidden' && mode !== 'owner';
                const pub = await EventService.getEventPage(f.eventSlug.PUBLIC, f.slug, 'lv', admin(), f.l1Slug);
                const members = await EventService.getEventPage(f.eventSlug.MEMBERS_ONLY, f.slug, 'lv', admin(), f.l1Slug);
                assert.equal(!!pub, !hiddenShut);
                // Members-only: seen by a member and (site powers) an owner-mode admin; a visitor is shut out.
                assert.equal(!!members, !hiddenShut && mode !== 'visitor');
            });

            it('no membership row is created', async () => {
                const f = await makeGroup(cast, kind);
                setAdminModeForTest(mode);
                await getViewerAccess(f.groupId, admin());
                await GroupService.getGroupWithContext(f.slug, 'lv', f.l1Slug, admin());
                assert.equal(await prisma.membership.count({ where: { groupId: f.groupId, userId: admin() } }), 0);
            });
        });
    }
}

describe('owner mode writes are logged', () => {
    it('createEvent and createAnnouncement log GROUP_EDIT', async () => {
        const f = await makeGroup(cast, 'public');
        const count = () => prisma.adminAction.count({ where: { adminId: admin(), targetId: f.groupId, action: 'GROUP_EDIT' } });
        setAdminModeForTest('owner');
        await EventService.createEvent(f.groupId, eventForm('Logged'), admin());
        assert.equal(await count(), 1);
        await PostService.createAnnouncement({ groupId: f.groupId, authorId: admin(), title: 'T', content: 'C', visibility: 'PUBLIC' });
        assert.equal(await count(), 2);
    });
    it('member mode writes nothing and logs nothing', async () => {
        const f = await makeGroup(cast, 'public');
        setAdminModeForTest('member');
        await outcome(() => EventService.createEvent(f.groupId, eventForm('Nope'), admin()));
        assert.equal(await prisma.adminAction.count({ where: { adminId: admin(), targetId: f.groupId } }), 0);
    });
});
