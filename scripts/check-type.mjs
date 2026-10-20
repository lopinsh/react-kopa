// Type-role guard: pages and components use the role utilities (text-display … text-tag), not raw sizes.
// Bans text-[Npx], text-xs…text-4xl, leading-*, tracking-*, font-bold/medium/semibold under app/ and components/.
// Warn-only unless TYPE_CHECK_STRICT=1 or --strict is passed. globals.css is exempt (it defines the roles).
import fs from 'node:fs';
import path from 'node:path';

const strict = process.env.TYPE_CHECK_STRICT === '1' || process.argv.includes('--strict');
const ROOTS = ['app', 'components'];
const BAN = /(?<![\w-])(text-\[\d+(?:\.\d+)?(?:px|rem)\]|text-(?:xs|sm|base|lg|xl|[2-9]xl)|leading-[\w./\[\]-]+|tracking-[\w./\[\]-]+|font-(?:bold|medium|semibold))(?![\w-])/g;

const counts = new Map();
const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx|ts)$/.test(e.name)) {
            const n = (fs.readFileSync(p, 'utf8').match(BAN) ?? []).length;
            if (n) counts.set(p.split(path.sep).join('/'), n);
        }
    }
};
ROOTS.forEach((r) => fs.existsSync(r) && walk(r));

const area = (f) => f.split('/').slice(0, f.startsWith('components/') ? 2 : 3).join('/');
const byArea = new Map();
let total = 0;
for (const [f, n] of counts) { total += n; byArea.set(area(f), (byArea.get(area(f)) ?? 0) + n); }
if (process.argv.includes('--files')) for (const [f, n] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${f}`);
console.log('type:check by area');
for (const [a, n] of [...byArea].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${a}`);
console.log(`${total} raw type classes in ${counts.size} files${strict ? '' : ' (warn-only; --strict or TYPE_CHECK_STRICT=1 to fail)'}`);
if (strict && total) process.exit(1);
