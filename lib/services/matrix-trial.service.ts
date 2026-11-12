import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { pickTitle } from '@/lib/utils/localized-title';
import { enc, errcodeOf, isRecord, matrixFetch } from './matrix-client';
import { MatrixService } from './matrix.service';

/** The K4 trial: one real topic x city hub as two Spaces and a room under both, plus the F1..F7 checks (admin page only). */

export interface TrialRooms {
    topicSpace: string; citySpace: string; room: string;
    aliases: { topic: string; city: string; room: string };
    titles: { topic: string; city: string; room: string };
}
export interface TrialCheck { id: string; ok: boolean; detail: string }

const V3 = '/_matrix/client/v3';

async function trialHub() {
    const hub = await prisma.hubCity.findFirst({
        where: { status: 'OPEN' },
        orderBy: { openedAt: 'asc' },
        select: {
            categoryId: true, cityId: true,
            category: { select: { slug: true, titles: { select: { lang: true, title: true } } } },
            city: { select: { nameLv: true } },
        },
    });
    if (!hub) throw new ActionError('NOT_FOUND');
    const topic = pickTitle(hub.category.titles, 'lv', hub.category.slug);
    return { hub, topic, city: hub.city.nameLv };
}

export const MatrixTrialService = {
    /** The trial rooms if they exist, else null (nothing is created). */
    async find(): Promise<TrialRooms | null> {
        const { hub, topic, city } = await trialHub();
        const aliases = { topic: `ejk_hub_${hub.categoryId}`, city: `ejk_city_${hub.cityId}`, room: `ejk_room_${hub.categoryId}_${hub.cityId}` };
        const [topicSpace, citySpace, room] = await Promise.all(Object.values(aliases).map((a) => MatrixService.resolveAlias(MatrixService.alias(a))));
        if (!topicSpace || !citySpace || !room) return null;
        return { topicSpace, citySpace, room, aliases, titles: { topic, city, room: `${topic} · ${city}` } };
    },

    /** Creates what is missing (idempotent: a second run finds everything by alias). */
    async setup(): Promise<TrialRooms> {
        const { hub, topic, city } = await trialHub();
        const aliases = { topic: `ejk_hub_${hub.categoryId}`, city: `ejk_city_${hub.cityId}`, room: `ejk_room_${hub.categoryId}_${hub.cityId}` };
        const titles = { topic, city, room: `${topic} · ${city}` };
        const topicSpace = await MatrixService.ensureSpace(aliases.topic, titles.topic);
        const citySpace = await MatrixService.ensureSpace(aliases.city, titles.city);
        const room = await MatrixService.ensureRoom(aliases.room, titles.room, [topicSpace, citySpace]);
        for (const id of [topicSpace, citySpace, room]) await MatrixService.syncPowerLevels(id);
        return { topicSpace, citySpace, room, aliases, titles };
    },

    /** F1, F2, F3, F4 (the server half) and F7. F5 (live in the browser) is read off the page, F6 off `docker stats`. */
    async runChecks(adminId: string): Promise<TrialCheck[]> {
        const t = await this.find();
        if (!t) throw new ActionError('NOT_FOUND');
        const plain = await prisma.user.findFirst({ where: { role: 'USER' }, orderBy: { createdAt: 'asc' }, select: { id: true } });
        const other = await prisma.user.findFirst({ where: { role: 'USER', id: { not: plain?.id ?? '' } }, orderBy: { createdAt: 'asc' }, select: { id: true } });
        if (!plain || !other) throw new ActionError('NOT_FOUND');
        const checks: TrialCheck[] = [];
        const run = async (id: string, fn: () => Promise<string>) => {
            try {
                const detail = await fn();
                checks.push({ id, ok: !detail.startsWith('FAIL'), detail });
            } catch (e) {
                checks.push({ id, ok: false, detail: `FAIL threw ${e instanceof Error ? e.message : 'error'}` });
            }
        };
        const adminMx = MatrixService.userMxid(adminId);

        await run('F1', async () => {
            const a = await MatrixService.ensureUser(adminId);
            const b = await MatrixService.ensureUser(adminId);
            const s1 = await MatrixService.sessionFor(adminId, 'EJAM_CHECK');
            const who = await MatrixService.whoami(s1.accessToken);
            const s2 = await MatrixService.sessionFor(adminId, 'EJAM_CHECK');
            const old = await errcodeOf(() => MatrixService.whoami(s1.accessToken));
            const pw = await errcodeOf(() => matrixFetch('POST', `${V3}/login`, { type: 'm.login.password', identifier: { type: 'm.id.user', user: `u_${adminId}` }, password: 'x' }, 'anonymous'));
            const ok = a === b && who === adminMx && s2.accessToken !== s1.accessToken && old === 'M_UNKNOWN_TOKEN' && pw !== 'OK';
            return `${ok ? 'ok' : 'FAIL'} idempotent=${a === b} whoami=${who === adminMx} earlierTokenAfterRelogin=${old} passwordLogin=${pw}`;
        });

        await run('F2', async () => {
            const [h1, h2] = await Promise.all([MatrixService.hierarchy(t.topicSpace), MatrixService.hierarchy(t.citySpace)]);
            const state = await matrixFetch('GET', `${V3}/rooms/${enc(t.room)}/state`);
            const parents = (Array.isArray(state) ? state : []).filter(isRecord).filter((e) => e.type === 'm.space.parent' && isRecord(e.content) && Array.isArray(e.content.via));
            const canonical = parents.filter((e) => isRecord(e.content) && e.content.canonical === true).length;
            const ok = h1.includes(t.room) && h2.includes(t.room) && parents.length === 2 && canonical === 1;
            return `${ok ? 'ok' : 'FAIL'} inTopicSpace=${h1.includes(t.room)} inCitySpace=${h2.includes(t.room)} parentEvents=${parents.length} canonical=${canonical}`;
        });

        await run('F3', async () => {
            const [sa, sp, so] = await Promise.all([MatrixService.sessionFor(adminId, 'EJAM_CHECK'), MatrixService.sessionFor(plain.id, 'EJAM_CHECK'), MatrixService.sessionFor(other.id, 'EJAM_CHECK')]);
            await Promise.all([MatrixService.joinAs(adminId, t.room), MatrixService.joinAs(plain.id, t.room), MatrixService.joinAs(other.id, t.room)]);
            await MatrixService.syncPowerLevels(t.room);
            const send = async (token: string, body: string) => {
                const r = await matrixFetch('PUT', `${V3}/rooms/${enc(t.room)}/send/m.room.message/${Date.now()}${Math.random().toString(36).slice(2)}`, { msgtype: 'm.text', body }, { token });
                return isRecord(r) && typeof r.event_id === 'string' ? r.event_id : '';
            };
            const redact = (token: string, eventId: string) => matrixFetch('PUT', `${V3}/rooms/${enc(t.room)}/redact/${enc(eventId)}/${Date.now()}${Math.random().toString(36).slice(2)}`, {}, { token });
            const e1 = await send(so.accessToken, 'F3 line to be removed by an admin');
            const e2 = await send(so.accessToken, 'F3 line a plain user must not remove');
            const adminRedact = await errcodeOf(() => redact(sa.accessToken, e1));
            const plainRedact = await errcodeOf(() => redact(sp.accessToken, e2));
            const rename = await errcodeOf(() => matrixFetch('PUT', `${V3}/rooms/${enc(t.room)}/state/m.room.name`, { name: 'x' }, { token: sp.accessToken }));
            const plainMx = MatrixService.userMxid(plain.id);
            const added = (await MatrixService.syncPowerLevels(t.room, [plainMx]))[plainMx];
            const dropped = (await MatrixService.syncPowerLevels(t.room))[plainMx];
            const ok = adminRedact === 'OK' && plainRedact === 'M_FORBIDDEN' && rename === 'M_FORBIDDEN' && added === 50 && dropped === undefined;
            return `${ok ? 'ok' : 'FAIL'} adminRedact=${adminRedact} plainRedact=${plainRedact} plainRename=${rename} addedLevel=${added} afterResync=${dropped ?? 'none'}`;
        });

        await run('F4', async () => {
            const t0 = Date.now();
            const lines = await MatrixService.readPublic(t.room, 30);
            const serverMs = Date.now() - t0;
            const guest = await matrixFetch('POST', '/_matrix/client/v3/register?kind=guest', {}, 'anonymous');
            const gt = isRecord(guest) && typeof guest.access_token === 'string' ? guest.access_token : '';
            if (!gt) return 'FAIL guest registration refused';
            const t1 = Date.now();
            const peek = await matrixFetch('GET', `${V3}/rooms/${enc(t.room)}/messages?dir=b&limit=30`, undefined, { token: gt });
            const guestMs = Date.now() - t1;
            const peekLines = isRecord(peek) && Array.isArray(peek.chunk) ? peek.chunk.length : 0;
            const join = await errcodeOf(() => matrixFetch('POST', `${V3}/join/${enc(t.room)}`, {}, { token: gt }));
            const send = await errcodeOf(() => matrixFetch('PUT', `${V3}/rooms/${enc(t.room)}/send/m.room.message/g${Date.now()}`, { msgtype: 'm.text', body: 'guest' }, { token: gt }));
            const ok = join !== 'OK' && send !== 'OK' && peekLines > 0;
            return `${ok ? 'ok' : 'FAIL'} serverRead=${lines.length} lines ${serverMs} ms; guestRead=${peekLines} events ${guestMs} ms; guestJoin=${join}; guestSend=${send}`;
        });

        await run('F7', async () => {
            const p = await MatrixService.probePrivateRoom(plain.id, t.room, other.id);
            const ok = [p.createRoom, p.invite, p.alias].every((c) => c !== 'OK');
            return `${ok ? 'ok' : 'FAIL'} createRoom=${p.createRoom} invite=${p.invite} alias=${p.alias}`;
        });
        return checks;
    },
};
