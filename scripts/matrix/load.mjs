// K4 load trial: N seed users join the trial room, each sends 10 lines while all of them long-poll /sync for 2 minutes.
// Prints p50/p95 of send-to-sync latency. Usage: node scripts/matrix/load.mjs [users=20] (needs .env and the trial rooms from /admin/matrix).
import { PrismaClient } from '@prisma/client';

process.loadEnvFile('.env');
const { MATRIX_HOMESERVER_URL: base, MATRIX_SERVER_NAME: server, MATRIX_AS_TOKEN: as } = process.env;
if (!base || !server || !as) throw new Error('MATRIX_* not set');
const N = Number(process.argv[2] ?? 20);
let limited = 0; // 429 answers (M_LIMIT_EXCEEDED), retried after retry_after_ms
const V3 = `${base}/_matrix/client/v3`;
const call = async (method, path, body, token = as, query = '') => {
    const res = await fetch(`${V3}${path}${query}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json();
    if (res.status === 429) { limited++; await new Promise((r) => setTimeout(r, (json.retry_after_ms ?? 1000) + 50)); return call(method, path, body, token, query); }
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(json)}`);
    return json;
};

const prisma = new PrismaClient();
const hub = await prisma.hubCity.findFirst({ where: { status: 'OPEN' }, orderBy: { openedAt: 'asc' }, select: { categoryId: true, cityId: true } });
const users = await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { createdAt: 'asc' }, take: N, select: { id: true, name: true } });
await prisma.$disconnect();
const alias = `#ejk_room_${hub.categoryId}_${hub.cityId}:${server}`;
const { room_id: room } = await call('GET', `/directory/room/${encodeURIComponent(alias)}`);

const sessions = [];
for (const u of users) {
    await call('POST', '/register', { type: 'm.login.application_service', username: `u_${u.id}`, inhibit_login: true }).catch(() => {});
    const login = await call('POST', '/login', { type: 'm.login.application_service', identifier: { type: 'm.id.user', user: `u_${u.id}` }, device_id: 'EJAM_LOAD' });
    await call('POST', `/join/${encodeURIComponent(room)}`, {}, login.access_token);
    sessions.push({ id: u.id, token: login.access_token });
}
console.log(`${sessions.length} users joined ${room}`);

const latencies = [];
const stopAt = Date.now() + 120_000;
const poll = async (s) => {
    let since;
    while (Date.now() < stopAt) {
        const q = `?timeout=20000${since ? `&since=${since}` : ''}`;
        const r = await call('GET', '/sync', undefined, s.token, q).catch(() => null);
        if (!r) continue;
        since = r.next_batch;
        for (const ev of r.rooms?.join?.[room]?.timeline?.events ?? []) {
            const m = /^LOAD (\d+)/.exec(ev.content?.body ?? '');
            if (m && ev.sender !== `@u_${s.id}:${server}`) latencies.push(Date.now() - Number(m[1]));
        }
    }
};
const pollers = sessions.map(poll);
await new Promise((r) => setTimeout(r, 3000));
await Promise.all(sessions.map(async (s, i) => {
    for (let k = 0; k < 10; k++) {
        await call('PUT', `/rooms/${encodeURIComponent(room)}/send/m.room.message/load${Date.now()}${i}${k}`, { msgtype: 'm.text', body: `LOAD ${Date.now()} user ${i} line ${k}` }, s.token);
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));
    }
}));
await Promise.all(pollers);
latencies.sort((a, b) => a - b);
const pct = (p) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];
console.log(`deliveries ${latencies.length}; send-to-sync p50 ${pct(0.5)} ms, p95 ${pct(0.95)} ms, max ${latencies.at(-1)} ms; rate-limited answers retried: ${limited}`);
