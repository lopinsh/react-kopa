// UI guard (npm run ui:check; type:check is an alias).
// Type rule (strict): pages and components use the role utilities (text-display … text-tag), not raw sizes.
// Bans text-[Npx|rem|clamp|calc], text-xs…text-9xl, leading-*, tracking-*, font weights other than font-normal (a reset) under app/ and components/.
// Space rules (strict too): no spacing steps 2.5/3.5 (0.5 and 1.5 stay), no [Npx]/[Nrem] spacing, no max-w-[Npx|rem|ch|em]
// (use max-w-browse/page/focus/reading; max-w-[calc(...)] and viewport units stay, they size against the screen).
// Strict by default (fails on any raw class); --warn or TYPE_CHECK_STRICT=0 only reports.
import fs from 'node:fs';
import path from 'node:path';

const strict = process.env.TYPE_CHECK_STRICT !== '0' && !process.argv.includes('--warn');
const ROOTS = ['app', 'components'];
const BAN = /(?<![\w-])(text-\[(?:\d+(?:\.\d+)?(?:px|rem)|clamp\(|calc\(|length:)[^\]]*\]|text-(?:xs|sm|base|lg|xl|[2-9]xl)|leading-[\w./\[\]-]+|tracking-[\w./\[\]-]+|font-(?:thin|extralight|light|medium|semibold|bold|extrabold|black))(?![\w-])/g;

const SP = '(?:-?(?:p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|bottom|left|right|start|end))';
const SPACE_RULES = {
    'spacing step 2.5/3.5': new RegExp(String.raw`(?<![\w-])${SP}-(?:2\.5|3\.5)(?![\w.-])`, 'g'),
    'arbitrary [Npx]/[Nrem] spacing': new RegExp(String.raw`(?<![\w-])${SP}-\[-?\d+(?:\.\d+)?(?:px|rem)\](?![\w-])`, 'g'),
    'max-w-[Npx|rem|ch|em]': /(?<![\w-])max-w-\[\d+(?:\.\d+)?(?:px|rem|ch|em)\]/g,
};
const spaceCounts = Object.fromEntries(Object.keys(SPACE_RULES).map((k) => [k, new Map()]));
const counts = new Map();
const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx|ts)$/.test(e.name)) {
            const src = fs.readFileSync(p, 'utf8');
            const f = p.split(path.sep).join('/');
            const n = (src.match(BAN) ?? []).length;
            if (n) counts.set(f, n);
            for (const [k, re] of Object.entries(SPACE_RULES)) {
                const c = (src.match(re) ?? []).length;
                if (c) spaceCounts[k].set(f, c);
            }
        }
    }
};
ROOTS.forEach((r) => fs.existsSync(r) && walk(r));

const area = (f) => f.split('/').slice(0, f.startsWith('components/') ? 2 : 3).join('/');
const byArea = new Map();
let total = 0;
for (const [f, n] of counts) { total += n; byArea.set(area(f), (byArea.get(area(f)) ?? 0) + n); }
if (process.argv.includes('--files')) for (const [f, n] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${f}`);
console.log('ui:check type rule by area');
for (const [a, n] of [...byArea].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${a}`);
console.log(`${total} raw type classes in ${counts.size} files${strict ? '' : ' (--warn to report only)'}`);
for (const [k, m] of Object.entries(spaceCounts)) {
    const areas = new Map();
    let t = 0;
    for (const [f, n] of m) { t += n; areas.set(area(f), (areas.get(area(f)) ?? 0) + n); }
    console.log(`
${t ? 'FAIL' : 'ok'}: ${k}: ${t} in ${m.size} files`);
    for (const [a, n] of [...areas].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${a}`);
    if (process.argv.includes('--files')) for (const [f, n] of [...m].sort((a, b) => b[1] - a[1])) console.log(`      ${String(n).padStart(3)}  ${f}`);
}
const spaceTotal = Object.values(spaceCounts).reduce((a, m) => a + [...m.values()].reduce((x, y) => x + y, 0), 0);
if (strict && (total || spaceTotal)) process.exit(1);
