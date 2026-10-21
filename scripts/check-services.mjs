// Service guard (npm run services:check, part of npm run check).
// Error style rule (strict, R16b): a service returns its value and throws `new ActionError('CODE')` on failure;
// result objects ({ success: true|false ... }) are an action's job (ActionResponse<T>), never a service's.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'lib/services';
const BAN = /\bsuccess\s*:\s*(?:true|false)\b/;
const failures = [];
for (const name of fs.readdirSync(DIR)) {
    if (!/\.ts$/.test(name)) continue;
    const file = path.join(DIR, name);
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
        if (BAN.test(line) && !line.includes('services-allow:')) failures.push(`${file}:${i + 1}: ${line.trim()}`);
    });
}
if (failures.length) {
    console.error(`services:check: ${failures.length} result object(s) in lib/services (return the value, throw ActionError instead):`);
    failures.forEach((f) => console.error('  ' + f));
    process.exit(1);
}
console.log('services:check: no result objects in lib/services');
