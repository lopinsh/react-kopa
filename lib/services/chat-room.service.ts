import { ActionError } from '@/types/actions';
import { enc, matrixConfig, matrixFetch } from './matrix-client';
import { aliasTaken, MatrixService, type PublicLine } from './matrix.service';
import { allRoomRefs, citySpaceAlias, l2SpaceAlias, roomAlias, roomRef, type ChatRoomRef } from './chat-room-refs';

/** Čats rooms and their Spaces (K5-01..K5-04): found by alias, never stored on the site (K-139). The site is always the sender. */

const V3 = '/_matrix/client/v3';

function resolve(alias: string): Promise<string | null> {
    return MatrixService.resolveAlias(MatrixService.alias(alias));
}

async function create(r: ChatRoomRef): Promise<string> {
    const parents = [await MatrixService.ensureSpace(l2SpaceAlias(r.l2Id), r.l2Name)];
    if (r.cityId) parents.push(await MatrixService.ensureSpace(citySpaceAlias(r.cityId), r.cityName ?? ''));
    const roomId = await MatrixService.ensureRoom(roomAlias(r), r.name, parents);
    await MatrixService.syncPowerLevels(roomId);
    return roomId;
}

export const ChatRoomService = {
    aliasFor: roomAlias,

    /** The room id, or null when it does not exist yet. Readers never create. */
    roomIdFor(r: Pick<ChatRoomRef, 'categoryId' | 'cityId'>): Promise<string | null> {
        return resolve(roomAlias(r));
    },

    /** The room's id; creates the Spaces and the room if missing. Two first visitors at once: the alias is taken (M_ROOM_IN_USE or 409), then resolve again. */
    async ensure(r: ChatRoomRef): Promise<string> {
        const found = await resolve(roomAlias(r));
        if (found) return found;
        try {
            return await create(r);
        } catch (e) {
            if (aliasTaken(e)) {
                // The winner is still setting the room up (Synapse names the alias before the room is ready): give it a moment, then use theirs.
                await new Promise((done) => setTimeout(done, 500));
                const again = await resolve(roomAlias(r));
                if (again) return again;
            }
            throw e;
        }
    },

    /** K-144: the alias goes, the room leaves both Spaces and is closed to joins; a reopen makes a fresh room under the same alias. */
    async close(r: ChatRoomRef): Promise<void> {
        const roomId = await resolve(roomAlias(r));
        if (!roomId) return;
        // The alias goes last, so a close that fails halfway can be run again (it finds the room by the alias).
        const spaces = [await resolve(l2SpaceAlias(r.l2Id)), r.cityId ? await resolve(citySpaceAlias(r.cityId)) : null];
        for (const space of spaces) {
            if (space) await matrixFetch('PUT', `${V3}/rooms/${enc(space)}/state/m.space.child/${enc(roomId)}`, {});
        }
        await matrixFetch('PUT', `${V3}/rooms/${enc(roomId)}/state/m.room.join_rules`, { join_rule: 'invite' });
        await matrixFetch('DELETE', `${V3}/directory/room/${enc(MatrixService.alias(roomAlias(r)))}`);
    },

    /** Site admins 50, nobody else, in every existing room of an OPEN hub or ACTIVE L2/L3 (K-38c). Returns how many rooms were synced. */
    async syncAllPowerLevels(): Promise<number> {
        let n = 0;
        for (const r of await allRoomRefs()) {
            const id = await resolve(roomAlias(r));
            if (!id) continue;
            await MatrixService.syncPowerLevels(id);
            n++;
        }
        return n;
    },

    /** `ensure` for every room that should exist (the backfill). */
    async ensureAll(): Promise<{ created: number; existing: number }> {
        const out = { created: 0, existing: 0 };
        for (const r of await allRoomRefs()) {
            if (await resolve(roomAlias(r))) { out.existing++; continue; }
            await this.ensure(r);
            out.created++;
        }
        return out;
    },

    /** The last lines for readers who are signed out (K-140: names from the site). `[]` when the room does not exist yet. */
    async readPublic(r: Pick<ChatRoomRef, 'categoryId' | 'cityId'>, limit = 50): Promise<PublicLine[]> {
        const roomId = await resolve(roomAlias(r));
        return roomId ? MatrixService.readPublic(roomId, limit) : [];
    },

    /** Fire and forget, for hooks after a commit: skipped when Matrix is unset, logged when it fails; never throws, never waits. */
    afterCommit(what: string, run: () => Promise<unknown>): void {
        if (!matrixConfig()) return;
        run().catch((e: unknown) => console.error(`[chat-room] ${what} failed:`, e instanceof ActionError ? e.code : e));
    },

    async ensureById(categoryId: string, cityId?: string): Promise<void> {
        const r = await roomRef(categoryId, cityId);
        if (r) await this.ensure(r);
    },

    async closeById(categoryId: string, cityId: string): Promise<void> {
        const r = await roomRef(categoryId, cityId);
        if (r) await this.close(r);
    },
};
