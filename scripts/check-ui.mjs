// UI guard (npm run ui:check; type:check is an alias).
// Type rule (strict): pages and components use the role utilities (text-display … text-tag), not raw sizes.
// Bans text-[Npx|rem|clamp|calc], text-xs…text-9xl, leading-*, tracking-*, font weights other than font-normal (a reset) under app/ and components/.
// Space rules (strict too): no spacing steps 2.5/3.5 (0.5 and 1.5 stay), no [Npx]/[Nrem] spacing, no max-w-[Npx|rem|ch|em]
// (use max-w-browse/page/focus/reading; max-w-[calc(...)] and viewport units stay, they size against the screen).
// Look rules (strict, R14): a look (THEME_PRESETS + THEME_STYLES) must change every surface, so components carry no colour, corner or depth of their own:
// no hex/rgb()/hsl()/oklch() literals, no Tailwind palette colours (bg-red-500, text-white, bg-black/40 ...), no dark: variants (the look sets both modes),
// no bare rounded / rounded-sm / rounded-[..] (use rounded-md…4xl, rounded-pill, rounded-menu, rounded-item), no raw shadows (shadow-sm…2xl, shadow, shadow-[..]; use shadow-card/control/premium/dialog),
// and rounded-full only on circles (size-N, equal h-N w-N, aspect-square). A line may opt out with `ui-allow: <reason>` (comment or string), e.g. an OAuth brand colour.
// Field rule (strict, R15): a text control is Input/Select/Textarea from components/ui/Input; a raw <input|select|textarea> outside components/ui is a failure
// unless it is a native checkbox/radio/color/hidden/file/range, or the line (or one of the 3 above) says `ui-allow: <reason>`.
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
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const CPFX = '(?:bg|text|ring|ring-offset|border|shadow|fill|stroke|from|to|via|outline|divide|decoration|accent|caret|placeholder)';
const SIDE = '(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?';
const LOOK_RULES = {
    'hex/rgb/hsl/oklch colour literal': /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g,
    'Tailwind palette colour (use theme tokens)': new RegExp(String.raw`(?<![\w-])${CPFX}-(?:(?:${PALETTE})-\d{2,3}|white|black)(?![\w-])`, 'g'),
    'dark: variant (the look sets both modes)': /(?<![\w-])dark:[a-z!\[-]/g,
    'bare rounded / rounded-sm / rounded-[..] (use the radius scale)': new RegExp(String.raw`(?<![\w-])rounded${SIDE}(?:-sm)?(?![\w-])|(?<![\w-])rounded${SIDE}-\[(?!(?:calc\()?var\(--radius)`, 'g'),
    'raw shadow (use shadow-card/control/premium/dialog)': /(?<![\w-])shadow(?:-(?:xs|sm|md|lg|xl|2xl|inner))?(?![\w-])|(?<![\w-])shadow-\[(?![^\]]*var\(--)/g,
    'rounded-full on a non-circle (use rounded-pill)': /(?<![\w-])rounded-full(?![\w-])/g,
};
const CIRCLE = /(?<![\w-])size-(?:\d|\[)|(?<![\w-])aspect-square|(?<![\w-])h-(\d+(?:\.\d+)?)\s+w-\1(?![\w.])|(?<![\w-])w-(\d+(?:\.\d+)?)\s+h-\2(?![\w.])/;
const lookCounts = Object.fromEntries(Object.keys(LOOK_RULES).map((k) => [k, new Map()]));
const lookHits = [];
const spaceCounts = Object.fromEntries(Object.keys(SPACE_RULES).map((k) => [k, new Map()]));
const counts = new Map();
const NATIVE = /type=["'](?:checkbox|radio|color|hidden|file|range)["']/;
const fieldHits = [];
const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx|ts)$/.test(e.name)) {
            const src = fs.readFileSync(p, 'utf8');
            const f = p.split(path.sep).join('/');
            const n = (src.match(BAN) ?? []).length;
            if (n) counts.set(f, n);
            const lines = src.split(/\r?\n/);
            lines.forEach((line, i) => {
                if (line.includes('ui-allow') || lines.slice(Math.max(0, i - 3), i).some((l) => l.includes('ui-allow')) || /^\s*(?:\/\/|\*|\/\*)/.test(line)) return;
                for (const [k, re] of Object.entries(LOOK_RULES)) {
                    if (k.startsWith('rounded-full') && CIRCLE.test(line)) continue;
                    const c = (line.match(re) ?? []).length;
                    if (c) { lookCounts[k].set(f, (lookCounts[k].get(f) ?? 0) + c); lookHits.push(`${f}:${i + 1}  [${k.slice(0, 12)}]  ${line.trim().slice(0, 110)}`); }
                }
            });
            if (!f.startsWith('components/ui/')) {
                for (const m of src.matchAll(/<(?:input|select|textarea)\b/g)) {
                    const tag = src.slice(m.index, m.index + 700).split(/\/>/)[0];
                    const line = src.slice(0, m.index).split('\n').length - 1;
                    if (NATIVE.test(tag) || tag.includes('ui-allow') || lines.slice(Math.max(0, line - 3), line + 1).some((l) => l.includes('ui-allow'))) continue;
                    fieldHits.push(`${f}:${line + 1}  ${lines[line].trim().slice(0, 100)}`);
                }
            }
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
let lookTotal = 0;
for (const [k, m] of Object.entries(lookCounts)) {
    const t = [...m.values()].reduce((x, y) => x + y, 0);
    lookTotal += t;
    console.log(`
${t ? 'FAIL' : 'ok'}: ${k}: ${t} in ${m.size} files`);
}
console.log(`\n${fieldHits.length ? 'FAIL' : 'ok'}: raw <input|select|textarea> (use components/ui/Input): ${fieldHits.length}`);
for (const h of fieldHits) console.log(`      ${h}`);
if (process.argv.includes('--hits')) for (const h of lookHits) console.log(h);
const spaceTotal = Object.values(spaceCounts).reduce((a, m) => a + [...m.values()].reduce((x, y) => x + y, 0), 0);
if (strict && (total || spaceTotal || lookTotal || fieldHits.length)) process.exit(1);
