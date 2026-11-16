// Characterization tests (F-2): who may change what, as the services decide it TODAY (role x action -> 'ok' or the ActionError code).
// Every case runs on a fresh group, so cases never depend on each other. Rows marked `OPEN: owner decision` look inconsistent but are pinned as they are.
// Never edit a service to make a row pass.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { GroupService } from '@/lib/services/group.service';
import { EventService } from '@/lib/services/event.service';
import { ModerationService } from '@/lib/services/moderation.service';
import { PostService } from '@/lib/services/post.service';
import { VIEWERS, eventForm, makeCast, makeGroup, outcome, type Cast, type Fixture, type GroupKind, type Viewer } from './helpers';

let cast: Cast;
before(async () => { cast = await makeCast(); });
after(() => prisma.$disconnect());

const KINDS: GroupKind[] = ['public', 'private', 'hidden'];
type Table = Record<GroupKind, Partial<Record<Viewer, string>>>;
const same = (v: string): Record<Viewer, string> => ({ signedOut: v, outsider: v, pending: v, member: v, admin: v, owner: v, siteAdmin: v });
const row = (base: string, over: Partial<Record<Viewer, string>>): Record<Viewer, string> => ({ ...same(base), ...over });

/** One case per group kind and viewer; `act` gets a fresh group and the acting user's id. A viewer missing from the table is not tried. */
function each(name: string, table: Table, act: (f: Fixture, actor: string, viewer: Viewer) => Promise<unknown>, viewers: readonly Viewer[] = VIEWERS.filter((v) => v !== 'signedOut')) {
    describe(name, () => {
        for (const kind of KINDS) {
            for (const viewer of viewers) {
                const expected = table[kind][viewer];
                if (expected === undefined) continue;
                it(`${kind} group, ${viewer}`, async () => {
                    const f = await makeGroup(cast, kind);
                    assert.equal(await outcome(() => act(f, cast.id(viewer)!, viewer)), expected);
                });
            }
        }
    });
}

// A service never runs for a signed-out visitor: the action stops them first (UNAUTHORIZED). Only signed-in viewers are tried below.
const TEAM_ONLY = row('FORBIDDEN', { admin: 'ok', owner: 'ok' });
// OPEN: owner decision. Nothing here looks at a group's hidden state: the team of a hidden group still creates and edits events,
// while nobody can open those events' pages.
each('createEvent', { public: TEAM_ONLY, private: TEAM_ONLY, hidden: TEAM_ONLY }, (f, actor) => EventService.createEvent(f.groupId, eventForm('A new event'), actor));

// Update: the event's creator or a group admin. A site admin who is not in the group may not.
const EDIT = row('FORBIDDEN', { admin: 'ok', owner: 'ok' });
// OPEN: owner decision. In a hidden group nobody edits an event (the owner included: EVENT_NOT_FOUND), yet the team can still create one.
// A-1: a site admin gets past the hidden check but is no organiser (FORBIDDEN), as in any group.
each('updateEvent', { public: EDIT, private: EDIT, hidden: row('EVENT_NOT_FOUND', { siteAdmin: 'FORBIDDEN' }) }, (f, actor) => EventService.updateEvent(f.eventId.PUBLIC, eventForm('Changed title'), actor));

describe('updateEvent, creator no longer in the group', () => {
    // OPEN: owner decision. The check is "creator or admin", so a creator who left (or was removed) keeps editing their event.
    it('a creator who is not a member can still edit', async () => {
        const f = await makeGroup(cast, 'public');
        await prisma.event.update({ where: { id: f.eventId.PUBLIC }, data: { creatorId: cast.ids.outsider } });
        assert.equal(await outcome(() => EventService.updateEvent(f.eventId.PUBLIC, eventForm('Changed title'), cast.ids.outsider)), 'ok');
    });
    it('a plain member who is not the creator cannot', async () => {
        const f = await makeGroup(cast, 'public');
        assert.equal(await outcome(() => EventService.updateEvent(f.eventId.PUBLIC, eventForm('Changed title'), cast.ids.member)), 'FORBIDDEN');
    });
});

// A-1 + owner 16 Nov: a site admin may RSVP to a public event in a hidden group (admin mode off). Others get the hidden 404 for the event.
describe('setAttendance, public event in a hidden group', () => {
    it('a site admin may RSVP (GOING)', async () => {
        const f = await makeGroup(cast, 'hidden');
        assert.equal(await outcome(() => EventService.setAttendance(f.eventId.PUBLIC, cast.ids.siteAdmin, 'GOING')), 'ok');
    });
    // OPEN: owner decision. The owner is not a site admin, so the hidden check gives EVENT_NOT_FOUND here too.
    it('the group owner gets EVENT_NOT_FOUND', async () => {
        const f = await makeGroup(cast, 'hidden');
        assert.equal(await outcome(() => EventService.setAttendance(f.eventId.PUBLIC, cast.ids.owner, 'GOING')), 'EVENT_NOT_FOUND');
    });
    // OPEN: owner decision. A plain member of a hidden group is shut out of its events the same way.
    it('a plain member gets EVENT_NOT_FOUND', async () => {
        const f = await makeGroup(cast, 'hidden');
        assert.equal(await outcome(() => EventService.setAttendance(f.eventId.PUBLIC, cast.ids.member, 'GOING')), 'EVENT_NOT_FOUND');
    });
});

// Announcements (PostService.createAnnouncement uses getRole): team only; in a hidden group the owner only.
const POST = (hiddenAdmin: string) => row('FORBIDDEN', { admin: hiddenAdmin, owner: 'ok' });
each('createAnnouncement', { public: POST('ok'), private: POST('ok'), hidden: POST('FORBIDDEN') },
    (f, actor) => PostService.createAnnouncement({ groupId: f.groupId, authorId: actor, title: 'Title', content: 'Text', visibility: 'PUBLIC' }));

// Join: only someone with no membership may ask; hidden groups do not exist for them.
// The request opens a chat with the team; Matrix is not configured in the tests, so that part is not reached by the 'ok' rows' result.
each('joinGroup (with a message)', {
    public: row('JOIN_FAILED', { pending: 'ALREADY_REQUESTED', outsider: 'ok', siteAdmin: 'ok' }),
    private: row('JOIN_FAILED', { pending: 'ALREADY_REQUESTED', outsider: 'ok', siteAdmin: 'ok' }),
    // A member or the pending applicant still gets the membership errors first: the hidden check comes after them.
    hidden: row('JOIN_FAILED', { pending: 'ALREADY_REQUESTED', outsider: 'NOT_FOUND', siteAdmin: 'NOT_FOUND' }),
}, (f, actor) => GroupService.joinGroup(f.groupId, actor, 'Hello, may I join?'));

each('joinGroup (blank message)', {
    public: row('JOIN_FAILED', { pending: 'ALREADY_REQUESTED', outsider: 'VALIDATION_FAILED', siteAdmin: 'VALIDATION_FAILED' }),
    private: {}, hidden: {},
}, (f, actor) => GroupService.joinGroup(f.groupId, actor, '  '));

// Leave: anyone with a membership, a pending applicant included; the owner must hand over first.
const LEAVE = row('ok', { outsider: 'NOT_FOUND', siteAdmin: 'NOT_FOUND', owner: 'OWNER_MUST_TRANSFER' });
each('leaveGroup', { public: LEAVE, private: LEAVE, hidden: LEAVE }, (f, actor) => GroupService.leaveGroup(f.groupId, actor));

// Approve / decline a join request: the team only. A site admin outside the group may not.
each('manageMembership APPROVE', { public: TEAM_ONLY, private: TEAM_ONLY, hidden: TEAM_ONLY }, (f, actor) => GroupService.manageMembership(f.pendingMembershipId, 'APPROVE', actor));
each('manageMembership DECLINE', { public: TEAM_ONLY, private: {}, hidden: {} }, (f, actor) => GroupService.manageMembership(f.pendingMembershipId, 'DECLINE', actor));
describe('manageMembership, not a request', () => {
    it('approving an existing member is NOT_FOUND', async () => {
        const f = await makeGroup(cast, 'public');
        const m = await prisma.membership.findUniqueOrThrow({ where: { userId_groupId: { userId: cast.ids.member, groupId: f.groupId } } });
        assert.equal(await outcome(() => GroupService.manageMembership(m.id, 'APPROVE', cast.ids.owner)), 'NOT_FOUND');
    });
});

// Promote a member to moderator: the owner only.
const OWNER_ONLY = row('FORBIDDEN', { owner: 'ok' });
each('updateMemberRole (promote a member)', { public: OWNER_ONLY, private: OWNER_ONLY, hidden: OWNER_ONLY }, (f, actor) => GroupService.updateMemberRole(f.groupId, cast.ids.member, 'ADMIN', actor));
each('updateMemberRole (the owner on themselves / a pending applicant)', {
    public: { owner: 'VALIDATION_FAILED' }, private: {}, hidden: {},
}, (f, actor) => GroupService.updateMemberRole(f.groupId, actor, 'ADMIN', actor));
each('updateMemberRole (promote a pending applicant)', { public: { owner: 'FORBIDDEN' }, private: {}, hidden: {} }, (f, actor) => GroupService.updateMemberRole(f.groupId, cast.ids.pending, 'ADMIN', actor));
each('updateMemberRole (demote the moderator)', { public: OWNER_ONLY, private: {}, hidden: {} }, (f, actor) => GroupService.updateMemberRole(f.groupId, cast.ids.admin, 'MEMBER', actor));

// Remove a member: the team; a moderator cannot remove another moderator or the owner.
each('removeMember (a member)', { public: TEAM_ONLY, private: TEAM_ONLY, hidden: TEAM_ONLY }, (f, actor) => GroupService.removeMember(f.groupId, cast.ids.member, actor));
each('removeMember (a pending applicant)', { public: TEAM_ONLY, private: {}, hidden: {} }, (f, actor) => GroupService.removeMember(f.groupId, cast.ids.pending, actor));
// The self check runs first, so the moderator trying to remove the moderator (themselves) gets VALIDATION_FAILED, not FORBIDDEN.
each('removeMember (the moderator)', { public: row('FORBIDDEN', { admin: 'VALIDATION_FAILED', owner: 'ok' }), private: {}, hidden: {} }, (f, actor) => GroupService.removeMember(f.groupId, cast.ids.admin, actor));
each('removeMember (the owner)', { public: row('FORBIDDEN', { owner: 'VALIDATION_FAILED' }), private: {}, hidden: {} }, (f, actor) => GroupService.removeMember(f.groupId, cast.ids.owner, actor));
each('removeMember (oneself)', { public: { admin: 'VALIDATION_FAILED', owner: 'VALIDATION_FAILED' }, private: {}, hidden: {} }, (f, actor) => GroupService.removeMember(f.groupId, actor, actor));

// Moderation: site admins only; the group's own owner and moderators have no say.
const SITE = row('FORBIDDEN', { siteAdmin: 'ok' });
each('hideGroup', { public: SITE, private: SITE, hidden: SITE }, (f, actor) => ModerationService.hideGroup(f.groupId, actor, 'Breaks the rules'));
each('restoreGroup', { public: SITE, private: SITE, hidden: SITE }, (f, actor) => ModerationService.restoreGroup(f.groupId, actor));

describe('moderation edge cases', () => {
    it('hide needs a reason', async () => {
        const f = await makeGroup(cast, 'public');
        assert.equal(await outcome(() => ModerationService.hideGroup(f.groupId, cast.ids.siteAdmin, '')), 'VALIDATION_FAILED');
    });
    it('hide of a missing group is NOT_FOUND', async () => {
        assert.equal(await outcome(() => ModerationService.hideGroup('missing', cast.ids.siteAdmin, 'Breaks the rules')), 'NOT_FOUND');
    });
    it('hide sets, restore clears the hidden state', async () => {
        const f = await makeGroup(cast, 'public');
        await ModerationService.hideGroup(f.groupId, cast.ids.siteAdmin, 'Breaks the rules');
        assert.ok((await prisma.group.findUniqueOrThrow({ where: { id: f.groupId } })).hiddenAt);
        await ModerationService.restoreGroup(f.groupId, cast.ids.siteAdmin);
        assert.equal((await prisma.group.findUniqueOrThrow({ where: { id: f.groupId } })).hiddenAt, null);
    });
    // OPEN: owner decision. Restoring a group that is not hidden succeeds silently (and logs a GROUP_RESTORE).
    it('restore of a visible group is ok', async () => {
        const f = await makeGroup(cast, 'public');
        assert.equal(await outcome(() => ModerationService.restoreGroup(f.groupId, cast.ids.siteAdmin)), 'ok');
    });
    // OPEN: owner decision. Hiding an already hidden group succeeds again and overwrites the reason.
    it('hide of a hidden group is ok', async () => {
        const f = await makeGroup(cast, 'hidden');
        assert.equal(await outcome(() => ModerationService.hideGroup(f.groupId, cast.ids.siteAdmin, 'Second reason')), 'ok');
        assert.equal((await prisma.group.findUniqueOrThrow({ where: { id: f.groupId } })).hiddenReason, 'Second reason');
    });
});
