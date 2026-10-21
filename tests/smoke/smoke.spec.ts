import { test, expect } from '@playwright/test';

// Needs a migrated and seeded database. Each page must render without a 5xx or an uncaught browser error.
for (const locale of ['lv', 'en']) {
  test.describe(`smoke ${locale}`, () => {
    test(`home lists groups and a group page opens`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const res = await page.goto(`/${locale}`);
      expect(res?.status()).toBe(200);
      const group = page.locator('a[href*="/group/"]').first();
      await expect(group).toBeVisible();
      await group.click();
      await expect(page).toHaveURL(/\/group\//);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(errors).toEqual([]);
    });

    test(`sign-in page shows its form`, async ({ page }) => {
      const res = await page.goto(`/${locale}/auth/signin`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    });

    test(`create and admin send a signed-out visitor to sign in`, async ({ page }) => {
      for (const path of ['create', 'admin']) {
        const res = await page.goto(`/${locale}/${path}`);
        expect(res?.status() ?? 200).toBeLessThan(500);
        await expect(page).toHaveURL(/auth|signin|sign-in/);
      }
    });
  });
}

test('health endpoint answers', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
});
