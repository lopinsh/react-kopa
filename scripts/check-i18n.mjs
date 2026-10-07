#!/usr/bin/env node
// Verifies every locale in messages/ has the same key set as en.json.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'messages');
const base = 'en.json';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, path)
      : [path];
  });

const load = (file) => new Set(flatten(JSON.parse(readFileSync(join(dir, file), 'utf8'))));

const baseKeys = load(base);
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== base)) {
  const keys = load(file);
  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`\n${file} is out of parity with ${base}:`);
    missing.forEach((k) => console.error(`  missing: ${k}`));
    extra.forEach((k) => console.error(`  extra:   ${k}`));
  }
}

if (failed) process.exit(1);
console.log(`i18n parity OK (${baseKeys.size} keys)`);
