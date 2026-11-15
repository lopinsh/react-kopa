// npm run test:services: integration tests of the services against a real Postgres.
// Makes a throwaway database next to the dev one (same server, name `<db>_test`), migrates and seeds it, runs the
// node:test files in tests/services with tsx, then drops it. Pusher and Matrix are never reached: Matrix is left
// unconfigured (the services then throw or skip) and Pusher points at a closed port (failures are logged and swallowed).
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const base = process.env.DATABASE_URL ?? 'postgresql://kopa_user:kopa_password@localhost:5433/ejam_kopa?schema=public';
const url = new URL(base);
const adminDb = url.pathname.slice(1);
const testDb = `${adminDb.replace(/_test$/, '')}_test`;
const testUrl = new URL(base);
testUrl.pathname = `/${testDb}`;

const env = { ...process.env, DATABASE_URL: testUrl.toString(), NODE_ENV: 'test', PUSHER_APP_ID: 'app-id', PUSHER_SECRET: 'app-secret', PUSHER_KEY: 'app-key', PUSHER_HOST: '127.0.0.1', PUSHER_PORT: '9', NEXT_PUBLIC_PUSHER_KEY: 'app-key' };
for (const k of Object.keys(env)) if (k.startsWith('MATRIX_')) delete env[k];

const admin = new PrismaClient({ datasourceUrl: base, log: [] });
const run = (cmd, quiet) => {
  const r = spawnSync(cmd, { shell: true, env, encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit' });
  if (r.status !== 0) {
    if (quiet) process.stderr.write(`${r.stdout ?? ''}${r.stderr ?? ''}`);
    throw new Error(`failed: ${cmd}`);
  }
};

let code = 1;
try {
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${testDb}" WITH (FORCE)`);
  await admin.$executeRawUnsafe(`CREATE DATABASE "${testDb}"`);
  run('npx prisma migrate deploy', true);
  run('npx prisma db seed', true);
  const files = process.argv.slice(2).length ? process.argv.slice(2).join(' ') : 'tests/services/*.test.ts';
  const r = spawnSync(`node --require ./tests/services/stubs.cjs --import tsx --test --test-reporter=spec --test-concurrency=1 ${files}`, { shell: true, env, stdio: 'inherit' });
  code = r.status ?? 1;
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
} finally {
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${testDb}" WITH (FORCE)`).catch(() => {});
  await admin.$disconnect();
}
process.exit(code);
