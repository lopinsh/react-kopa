import { defineConfig } from '@playwright/test';

// CI smoke test (npm run test:smoke): runs against a production build already started on :3000
// (CI starts it; locally `npm run build && npm start`). The live-site spec has its own run command.
export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.SMOKE_URL ?? 'http://localhost:3000',
    launchOptions: process.env.SMOKE_CHROME ? { executablePath: process.env.SMOKE_CHROME } : {},
  },
});
