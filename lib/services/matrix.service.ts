import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { enc, errcodeOf, isRecord, matrixConfig, matrixFetch, MatrixRequestError, type MatrixConfig } from './matrix-client';

/** The Matrix side of the site (K4, K-30): site users are appservice users, the site owns rooms and power levels. */

export interface MatrixStatus { configured: boolean; reachable: boolean; serverName: string | null; publicUrl: string | null; version: string | null }
export interface MatrixSession { userId: string; accessToken: string; deviceId: string; homeserverUrl: string }
export interface ExpiringSession { accessToken: string; refreshToken: string; expiresInMs: number }
export interface PublicLine { body: string; ts: number; name: string | null }

const V3 = '/_matrix/client/v3';
const ID_RE = /^[a-z0-9]+$/;

function cfg(): MatrixConfig {
    const c = matrixConfig();
    if (!c) throw new ActionError('MATRIX_FAILED', 'not configured');
    return c;
}

/** createRoom lost a race for its alias: M_ROOM_IN_USE, or Synapse's 409 when both passed the alias check at once. */
export function aliasTaken(e: unknown): boolean {
    return e instanceof MatrixRequestError && (e.errcode === 'M_ROOM_IN_USE' || e.status === 409);
}

function readExpiring(res: unknown): ExpiringSession {
    const expiresInMs = isRecord(res) && typeof res.expires_in_ms === 'number' ? res.expires_in_ms : 0;
    return { accessToken: str(res, 'access_token'), refreshToken: str(res, 'refresh_token'), expiresInMs };
}

/** Content for `power_level_content_override` (K-33a: any member writes; K-38: the site owns structure). */
const POWER_OVERRIDE = {
    users_default: 0, events_default: 0, invite: 100, kick: 50, ban: 50, redact: 50, state_default: 100,
    events: { 'm.room.name': 100, 'm.room.power_levels': 100, 'm.space.child': 100, 'm.space.parent': 100, 'm.room.history_visibility': 100 },
};

function str(v: unknown, key: string): string {
    if (isRecord(v) && typeof v[key] === 'string') return v[key];
    throw new ActionError('MATRIX_FAILED', `missing ${key}`);
}

function siteUserId(sender: unknown): string | undefined {
    return typeof sender === 'string' ? /^@u_([a-z0-9]+):/.exec(sender)?.[1] : undefined;
}

export const MatrixService = {
    userMxid(userId: string): string {
        if (!ID_RE.test(userId)) throw new ActionError('MATRIX_FAILED', 'user id is not a valid localpart');
        return `@u_${userId}:${cfg().serverName}`;
    },
    senderMxid(): string { return `@ejam:${cfg().serverName}`; },
    alias(local: string): string { return `#${local}:${cfg().serverName}`; },

    async status(): Promise<MatrixStatus> {
        const c = matrixConfig();
        if (!c) return { configured: false, reachable: false, serverName: null, publicUrl: null, version: null };
        try {
            const v = await matrixFetch('GET', '/_matrix/client/versions', undefined, 'anonymous');
            await matrixFetch('GET', `${V3}/account/whoami`);
            const list = isRecord(v) && Array.isArray(v.versions) ? v.versions : [];
            return { configured: true, reachable: true, serverName: c.serverName, publicUrl: c.publicUrl, version: String(list[list.length - 1] ?? '') };
        } catch (e) {
            if (e instanceof ActionError && e.code === 'MATRIX_UNAVAILABLE') return { configured: true, reachable: false, serverName: c.serverName, publicUrl: c.publicUrl, version: null };
            throw e;
        }
    },

    /** Creates the Matrix user for a site user (idempotent) and sets its display name from the site. */
    async ensureUser(userId: string): Promise<string> {
        const mxid = this.userMxid(userId);
        try {
            await matrixFetch('POST', `${V3}/register`, { type: 'm.login.application_service', username: `u_${userId}`, inhibit_login: true });
        } catch (e) {
            if (!(e instanceof MatrixRequestError && e.errcode === 'M_USER_IN_USE')) throw e;
        }
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        if (user?.name) await matrixFetch('PUT', `${V3}/profile/${enc(mxid)}/displayname`, { displayname: user.name }, { asUser: mxid });
        return mxid;
    },

    /** A token for the user's browser. A new login on the same device replaces the earlier token (one live token per device). */
    async sessionFor(userId: string, deviceId = 'EJAM_WEB'): Promise<MatrixSession> {
        const mxid = await this.ensureUser(userId);
        const res = await matrixFetch('POST', `${V3}/login`, { type: 'm.login.application_service', identifier: { type: 'm.id.user', user: `u_${userId}` }, device_id: deviceId });
        return { userId: mxid, accessToken: str(res, 'access_token'), deviceId: str(res, 'device_id'), homeserverUrl: cfg().publicUrl };
    },

    /** F1b: a login that asks for a refresh token; the access token then expires (`refreshable_access_token_lifetime`). */
    async expiringSessionFor(userId: string, deviceId = 'EJAM_CHECK'): Promise<ExpiringSession> {
        await this.ensureUser(userId);
        const res = await matrixFetch('POST', `${V3}/login`, { type: 'm.login.application_service', identifier: { type: 'm.id.user', user: `u_${userId}` }, device_id: deviceId, refresh_token: true });
        return readExpiring(res);
    },

    /** Trades a refresh token for a new access token (no appservice token needed; the browser may call this itself). */
    async refreshSession(refreshToken: string): Promise<ExpiringSession> {
        return readExpiring(await matrixFetch('POST', `${V3}/refresh`, { refresh_token: refreshToken }, 'anonymous'));
    },

    async whoami(token: string): Promise<string> {
        return str(await matrixFetch('GET', `${V3}/account/whoami`, undefined, { token }), 'user_id');
    },

    /** The room id behind an alias, or null when it does not exist. */
    async resolveAlias(alias: string): Promise<string | null> {
        try {
            return str(await matrixFetch('GET', `${V3}/directory/room/${enc(alias)}`), 'room_id');
        } catch (e) {
            if (e instanceof MatrixRequestError && e.errcode === 'M_NOT_FOUND') return null;
            throw e;
        }
    },

    async createPublic(alias: string, name: string, isSpace: boolean, topic?: string): Promise<string> {
        const existing = await this.resolveAlias(this.alias(alias));
        if (existing) return existing;
        const res = await matrixFetch('POST', `${V3}/createRoom`, {
            room_alias_name: alias, name, topic, preset: 'public_chat', visibility: 'private',
            creation_content: isSpace ? { type: 'm.space' } : undefined,
            initial_state: [
                { type: 'm.room.history_visibility', state_key: '', content: { history_visibility: 'world_readable' } },
                { type: 'm.room.guest_access', state_key: '', content: { guest_access: 'forbidden' } },
            ],
            power_level_content_override: POWER_OVERRIDE,
        });
        return str(res, 'room_id');
    },

    ensureSpace(alias: string, name: string, topic?: string): Promise<string> { return this.createPublic(alias, name, true, topic); },

    /** A room under one or more Spaces (K-08): `m.space.child` in each Space, `m.space.parent` in the room, the first canonical. */
    async ensureRoom(alias: string, name: string, parents: string[]): Promise<string> {
        const roomId = await this.createPublic(alias, name, false);
        const via = [cfg().serverName];
        await Promise.all(parents.flatMap((space, i) => [
            matrixFetch('PUT', `${V3}/rooms/${enc(space)}/state/m.space.child/${enc(roomId)}`, { via, suggested: true }),
            matrixFetch('PUT', `${V3}/rooms/${enc(roomId)}/state/m.space.parent/${enc(space)}`, i === 0 ? { via, canonical: true } : { via }),
        ]));
        return roomId;
    },

    /** The site (room creator) is above 100, every site admin 50, nobody else (K-38, K-38c). `extra` adds users, for the checks. */
    async syncPowerLevels(roomId: string, extra: string[] = []): Promise<Record<string, number>> {
        const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'OWNER'] } }, select: { id: true } });
        const current = await matrixFetch('GET', `${V3}/rooms/${enc(roomId)}/state/m.room.power_levels`);
        // Room version 12: the creator (our sender) has unlimited power and must not be listed in `users`.
        const users: Record<string, number> = {};
        for (const a of admins) users[this.userMxid(a.id)] = 50;
        for (const x of extra) users[x] = 50;
        await matrixFetch('PUT', `${V3}/rooms/${enc(roomId)}/state/m.room.power_levels`, { ...(isRecord(current) ? current : {}), users });
        return users;
    },

    async joinAs(userId: string, roomId: string): Promise<void> {
        await matrixFetch('POST', `${V3}/join/${enc(roomId)}`, {}, { asUser: this.userMxid(userId) });
    },

    /** The last lines of a public room as the site reads them for signed-out visitors; names come from the site, not from Matrix. */
    async readPublic(roomId: string, limit = 30): Promise<PublicLine[]> {
        const res = await matrixFetch('GET', `${V3}/rooms/${enc(roomId)}/messages?dir=b&limit=${limit}`);
        const chunk = isRecord(res) && Array.isArray(res.chunk) ? res.chunk : [];
        const lines = chunk.filter(isRecord).filter((e) => e.type === 'm.room.message' && isRecord(e.content) && e.content.msgtype === 'm.text' && typeof e.content.body === 'string');
        const ids = lines.map((e) => siteUserId(e.sender)).filter((x): x is string => !!x);
        const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
        const names = new Map(users.map((u) => [u.id, u.name]));
        return lines.map((e) => {
            const id = siteUserId(e.sender);
            return { body: isRecord(e.content) ? String(e.content.body) : '', ts: typeof e.origin_server_ts === 'number' ? e.origin_server_ts : 0, name: id ? names.get(id) ?? null : null };
        }).reverse();
    },

    /** K-82: a user (with the user's own token: identity assertion skips the alias hook) tries a private room, an invite and two aliases. Expected: all refused. */
    async probePrivateRoom(token: string, roomId: string, inviteeUserId: string): Promise<{ createRoom: string; invite: string; alias: string; aliasOutside: string }> {
        const own = { token };
        const putAlias = (local: string) => errcodeOf(() => matrixFetch('PUT', `${V3}/directory/room/${enc(this.alias(local))}`, { room_id: roomId }, own));
        return {
            createRoom: await errcodeOf(() => matrixFetch('POST', `${V3}/createRoom`, { preset: 'private_chat', is_direct: true }, own)),
            invite: await errcodeOf(() => matrixFetch('POST', `${V3}/rooms/${enc(roomId)}/invite`, { user_id: this.userMxid(inviteeUserId) }, own)),
            alias: await putAlias('ejk_probe'),
            aliasOutside: await putAlias('probe_outside'),
        };
    },

    /** Child room ids of a Space. */
    async hierarchy(spaceId: string): Promise<string[]> {
        const res = await matrixFetch('GET', `/_matrix/client/v1/rooms/${enc(spaceId)}/hierarchy`);
        const rooms = isRecord(res) && Array.isArray(res.rooms) ? res.rooms : [];
        return rooms.filter(isRecord).map((r) => r.room_id).filter((x): x is string => typeof x === 'string');
    },
};
