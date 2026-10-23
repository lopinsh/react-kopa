import { chromium, type FullConfig } from '@playwright/test';
import { AUTH_FILE } from './shared';

// Signs the seeded user oskars_b (has a username, so no onboarding redirect) in once; every signed-in screen reuses the saved cookies.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  await page.goto('/lv/auth/signin');
  await page.locator('input[type="email"]').fill('oskars@local');
  await page.locator('input[type="password"]').fill('oskars');
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForURL((url) => !url.pathname.includes('/auth/'));
  // Opening Manas grupas stores "seen" on the user, which clears the avatar's new-dot. Do it once here so every screen starts from that
  // state, whatever order the workers run in (otherwise the first signed-in screens render the dot and later ones do not).
  await page.goto('/lv/profile/my-groups');
  await page.waitForLoadState('networkidle');
  const state = await page.context().storageState();
  // The server's clock is frozen in 2026, so cookie expiry dates may already be past for the real browser: make them session cookies.
  for (const c of state.cookies) c.expires = -1;
  const fs = await import('node:fs');
  fs.writeFileSync(AUTH_FILE, JSON.stringify(state));
  await browser.close();
}
