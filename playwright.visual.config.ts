import { defineConfig } from '@playwright/test';

// Screenshot baseline (npm run test:visual): runs against a production build already started on :3000
// on the seeded visual database, with the frozen clock of tests/visual/freeze-time.cjs
// (see "Visual baseline" in AGENTS.md). Baselines are Linux renders; update them only through
// scripts/visual-docker.sh, never from a Windows or macOS machine.
export default defineConfig({
  testDir: './tests/visual',
  globalSetup: './tests/visual/global-setup.ts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  timeout: 60_000,
  workers: 2,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: process.env.VISUAL_URL ?? 'http://localhost:3000',
    locale: 'lv-LV',
    timezoneId: 'Europe/Riga',
  },
});
