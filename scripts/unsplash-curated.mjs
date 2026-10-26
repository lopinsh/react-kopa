// Builds lib/constants/unsplash-curated.ts (R26). Dev only; reads UNSPLASH_ACCESS_KEY from .env.
// Per category: 2 pages x 30 search results (30 requests in all, demo limit is 50/h). Keeps the draft photos that
// show up in the results, fills up to 8 from the top results. Raw responses are cached in scripts/.unsplash-cache/
// (git-ignored), so a re-run only spends requests on slugs whose cache is missing: delete a slug's files to refresh it.
// To swap photos, edit the draft list below (or its query) and run `node scripts/unsplash-curated.mjs` again.
import fs from 'node:fs';
import path from 'node:path';

const PER_CATEGORY = 8;
const MIN_REMAINING = 10;
const CACHE = 'scripts/.unsplash-cache';
const OUT = 'lib/constants/unsplash-curated.ts';

const CATEGORIES = {
    travel: { query: 'hiking trail friends', draft: [
        '1501785888041-af3ef285b470',
        '1469474968028-56623f02e42e',
        '1476514525535-07fb3b4ae5f1',
        '1488646953014-85cb44e25828',
        '1500530855697-b586d89ba3ee',
        '1469854523086-cc02fe5d8800',
        '1503220317375-aaad61436b1b',
        '1464822759023-fed622ff2c3b',
    ] },
    dancing: { query: 'dance class', draft: [
        '1504609813442-a8924e83f76e',
        '1508700929628-666bc8bd84ea',
        '1547153760-18fc86324498',
        '1518834107812-67b0b7c58434',
        '1508807526345-15e9b5f4eaff',
        '1535131749006-b7f58c99034b',
        '1504609773096-104ff2c73ba4',
        '1545959570-a94084071b5d',
    ] },
    hobbies: { query: 'crafts workshop', draft: [
        '1452587925148-ce544e77e70d',
        '1516035069371-29a1b244cc32',
        '1452860606245-08befc0ff44b',
        '1513364776144-60967b0f800f',
        '1416879595882-3373a0480b5b',
        '1502082553048-f009c37129b9',
        '1485955900006-10f4d324d411',
        '1517694712202-14dd9538aa97',
    ] },
    community: { query: 'volunteers community', draft: [
        '1559027615-cd4628902d4a',
        '1488521787991-ed7bbaae773c',
        '1469571486292-0ba58a3f068b',
        '1593113598332-cd288d649433',
        '1532629345422-7515f3d16bb6',
        '1509099836639-18ba1795216d',
        '1540575467063-178a50c2df87',
        '1475721027785-f74eccf877e2',
    ] },
    politics: { query: 'town hall discussion', draft: [
        '1529070538774-1843cb3265df',
        '1541872703-74c5e44368f9',
        '1555848962-6e79363ec58f',
        '1520452112805-c6692c840af0',
        '1529390079861-591de354faf5',
        '1575320181282-9afab399332c',
        '1541872705-1f73c6400ec9',
        '1494172961521-33799ddd43a5',
    ] },
    pets: { query: 'dog walk', draft: [
        '1543466835-00a7907e9de1',
        '1517849845537-4d257902454a',
        '1514888286974-6c03e2ca1dba',
        '1548199973-03cce0bbc87b',
        '1450778869180-41d0601e046e',
        '1574158622682-e40e69881006',
        '1587825140708-dfaf72ae4b04',
        '1583511655857-d19b40a7a54e',
    ] },
    art: { query: 'painting studio', draft: [
        '1460661419201-fd4cecdf8a8b',
        '1541701494587-cb58502866ab',
        '1579783902614-a3fb3927b6a5',
        '1547891654-e66ed7ebb968',
        '1536924940846-227afb31e2a5',
        '1515405295579-ba7b45403062',
        '1578301978693-85fa9c0320b9',
        '1561214115-f2f134cc4912',
    ] },
    music: { query: 'band rehearsal', draft: [
        '1511671782779-c97d3d27a1d4',
        '1493225457124-a3eb161ffa5f',
        '1514525253161-7a46d19cd819',
        '1501386761578-eac5c94b800a',
        '1510915361894-db8b60106cb1',
        '1507838153414-b4b713384a76',
        '1470225620780-dba8ba36b745',
        '1459749411175-04bf5292ceea',
    ] },
    religion: { query: 'chapel candles', draft: [
        '1507692049790-de58290a4334',
        '1438232992991-995b7058bbb3',
        '1504052434569-70ad5836ab65',
        '1548625149-fc4a29cf7092',
        '1519491050282-cf00c82424b4',
        '1473177104440-ffee2f376098',
        '1445445290350-18a3b86e0b5a',
        '1490730141103-6cac27aaab94',
    ] },
    social: { query: 'friends dinner', draft: [
        '1517457373958-b7bdd4587205',
        '1528605248644-14dd04022da1',
        '1530103862676-de8c9debad1d',
        '1515187029135-18ee286d815b',
        '1414235077428-338989a2e8c0',
        '1490645935967-10de6ba17061',
        '1504754524776-8f4f37790ca0',
        '1511795409834-ef04bbd61622',
    ] },
    games: { query: 'board games friends', draft: [
        '1511512578047-dfb367046420',
        '1542751371-adc38448a05e',
        '1610890716171-6b1bb98ffd09',
        '1606167668584-78701c57f13d',
        '1632501641765-e568d28b0015',
        '1585504198199-20277593b94f',
        '1529699211952-734e80c4d42b',
        '1528819622765-d6bcf132f793',
    ] },
    sports: { query: 'running group', draft: [
        '1552674605-db6ffd4facb5',
        '1517836357463-d25dfeac3438',
        '1571019613454-1cb2f99b2d8b',
        '1461896836934-ffe607ba8211',
        '1574629810360-7efbbe195018',
        '1546519638-68e109498ffc',
        '1517649763962-0c623066013b',
        '1485965120184-e220f721d03e',
    ] },
    family: { query: 'family picnic', draft: [
        '1511632765486-a01980e01a18',
        '1503454537195-1dcabb73ffb9',
        '1476703993599-0035a21b17a9',
        '1609220136736-443140cffec6',
        '1475503572774-15a45e5d60b9',
        '1484665754804-74b091211472',
        '1536640712-4d4c36ff0e4e',
        '1543342384-1f1350e27861',
    ] },
    wellbeing: { query: 'yoga outdoors', draft: [
        '1544367567-0f2fcb009e0b',
        '1545205597-3d9d02c29597',
        '1506126613408-eca07ce68773',
        '1441974231531-c6227db76b6e',
        '1473448912268-2022ce9509d8',
        '1518611012118-696072aa579a',
        '1510894347713-fc3ed6fdf539',
        '1499209974431-9dddcece7f88',
    ] },
    education: { query: 'study group', draft: [
        '1503676260728-1c00da094a0b',
        '1522202176988-66273c2fd55f',
        '1524178232363-1fb2b075b655',
        '1523240795612-9a054b0db644',
        '1497486751825-1233686d5d80',
        '1481627834876-b7833e8f5570',
        '1456513080510-7bf3a84b82f8',
        '1434030216411-0b793f4b4173',
    ] },
};

const envText = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const key = process.env.UNSPLASH_ACCESS_KEY || envText.match(/^UNSPLASH_ACCESS_KEY=["']?([^"'\r\n]+)/m)?.[1];
if (!key) {
    console.error('UNSPLASH_ACCESS_KEY is not set (.env). Nothing written.');
    process.exit(1);
}
fs.mkdirSync(CACHE, { recursive: true });

let spent = 0;
async function page(slug, query, n) {
    const file = path.join(CACHE, `${slug}-${n}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${n}&per_page=30&orientation=landscape&content_filter=high`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
    spent++;
    const remaining = Number(res.headers.get('x-ratelimit-remaining'));
    if (!res.ok) {
        console.error(`${slug} page ${n}: HTTP ${res.status}, remaining ${remaining}. Nothing written; wait for the hourly reset and re-run (cached pages are kept).`);
        process.exit(1);
    }
    const body = await res.json();
    fs.writeFileSync(file, JSON.stringify(body));
    if (remaining < MIN_REMAINING) {
        console.error(`Remaining requests ${remaining} < ${MIN_REMAINING} after ${slug} page ${n}. Nothing written; wait up to an hour and re-run (cached pages are kept).`);
        process.exit(1);
    }
    return body;
}

const pathOf = (raw) => raw.match(/\/(photo-[^?]+)/)?.[1];
const slugs = Object.keys(CATEGORIES).sort();
const result = {};
const stats = {};
for (const slug of slugs) {
    const { query, draft } = CATEGORIES[slug];
    const hits = [];
    for (const n of [1, 2]) hits.push(...(await page(slug, query, n)).results);
    const usable = hits
        .filter((p) => !p.premium && !p.plus && p.urls?.raw?.startsWith('https://images.unsplash.com/') && pathOf(p.urls.raw))
        .map((p) => ({ id: p.id, path: pathOf(p.urls.raw), name: p.user.name, username: p.user.username }));
    const matched = draft.map((d) => usable.find((u) => u.path === `photo-${d}`)).filter(Boolean);
    const chosen = [...matched];
    for (const u of usable) {
        if (chosen.length >= PER_CATEGORY) break;
        if (!chosen.some((c) => c.path === u.path)) chosen.push(u);
    }
    result[slug] = chosen.slice(0, PER_CATEGORY);
    stats[slug] = `${matched.length} draft matched, ${Math.max(0, result[slug].length - matched.length)} filled`;
}

const seen = new Set();
for (const slug of slugs) result[slug] = result[slug].filter((p) => !seen.has(p.path) && seen.add(p.path));

const q = (s) => JSON.stringify(s);
let ts = `// Generated by scripts/unsplash-curated.mjs (R26). Do not edit by hand: change the draft list there and re-run.
import type { CategoryToneSlug } from '@/lib/constants/theme';

/** \`path\` is the \`photo-...\` part of an images.unsplash.com URL; \`id\` is the photo id for download tracking. */
export interface CuratedPhoto {
    id: string;
    path: string;
    name: string;
    username: string;
}

export const UNSPLASH_CURATED: Record<CategoryToneSlug, readonly CuratedPhoto[]> = {
`;
for (const slug of slugs) {
    ts += `    ${slug}: [\n` + result[slug].map((p) => `        { id: ${q(p.id)}, path: ${q(p.path)}, name: ${q(p.name)}, username: ${q(p.username)} },\n`).join('') + '    ],\n';
}
ts += '};\n';
fs.writeFileSync(OUT, ts);
console.log(stats);
console.log(`Wrote ${OUT}. Requests spent this run: ${spent}.`);
