// Checks docs/development/build-plan.md against the redesign's rule ids (scripts/redesign/gen.mjs):
// every AR-nn / AP-nn appears in the plan's coverage table exactly once with an owner release that has
// a card in the plan, each card's owned rules match the table, and the plan references no id the redesign doesn't define. Run: npm run plan:check
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const gen = readFileSync(join(root, 'scripts/redesign/gen.mjs'), 'utf8');
const plan = readFileSync(join(root, 'docs/development/build-plan.md'), 'utf8').replace(/\r/g, '');

// Ids are defined by the ledger line helper L('AR-nn', …) and the approval helper apv('AP-nn', …).
const known = new Set([
    ...[...gen.matchAll(/\bL\('(AR-\d+)'/g)].map((m) => m[1]),
    ...[...gen.matchAll(/\bapv\('(AP-\d+)'/g)].map((m) => m[1]),
]);
const errors = [];
if (known.size === 0) errors.push('no rule ids found in scripts/redesign/gen.mjs');

// Releases with a card: headings "### R1a · …".
const releases = new Set([...plan.matchAll(/^### (R\d+[a-z]?) · /gm)].map((m) => m[1]));
if (releases.size === 0) errors.push('no release cards ("### R# · …") found in the plan');

// Coverage table: rows of section "## 7." whose first cell is an id.
const section = plan.split(/^## /m).find((s) => s.startsWith('7.'));
if (!section) errors.push('section "## 7. Coverage" not found');
const owners = new Map();
for (const line of (section ?? '').split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (!/^A[RP]-\d+$/.test(cells[0] ?? '')) continue;
    const [id, , owner] = cells;
    if (owners.has(id)) errors.push(`${id} appears more than once in the coverage table`);
    owners.set(id, owner);
    if (!/^R\d+[a-z]?$/.test(owner ?? '')) errors.push(`${id}: owner "${owner ?? ''}" is not a release id`);
    else if (!releases.has(owner)) errors.push(`${id}: owner ${owner} has no release card`);
}
for (const id of known) if (!owners.has(id)) errors.push(`${id} has no owner in the coverage table`);

// Each card's "Rules (owner):" list (before "Also in") must agree with the coverage table.
for (const m of plan.matchAll(/^### (R\d+[a-z]?) · [^\n]*\n[\s\S]*?^- \*\*Rules \(owner\):\*\* ([^\n]*)/gm)) {
    const [release, rules] = [m[1], m[2].split('Also in')[0]];
    for (const id of rules.match(/\bA[RP]-\d+\b/g) ?? []) {
        if (owners.has(id) && owners.get(id) !== release) errors.push(`${id}: card ${release} claims it, the coverage table says ${owners.get(id)}`);
    }
}

// No unknown ids anywhere in the plan.
for (const m of plan.matchAll(/\bA[RP]-\d+\b/g)) {
    if (!known.has(m[0])) errors.push(`unknown id ${m[0]} referenced in the plan`);
}

const unique = [...new Set(errors)];
if (unique.length) {
    console.error(`plan:check failed (${unique.length}):\n- ${unique.join('\n- ')}`);
    process.exit(1);
}
console.log(`plan:check OK: ${known.size} ids (${[...known].filter((i) => i.startsWith('AR')).length} AR, ${[...known].filter((i) => i.startsWith('AP')).length} AP), each owned once across ${releases.size} releases.`);
