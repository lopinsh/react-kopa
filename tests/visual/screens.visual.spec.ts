import { test, expect, type Page } from '@playwright/test';
import { AUTH_FILE, FROZEN_NOW } from './shared';

// Screenshot baseline: each screen at four widths, light and dark, in lv, against the seeded visual database.
// Baselines live in __screenshots__/ and are Linux renders (scripts/visual-docker.sh).

const WIDTHS = [360, 768, 1280, 1920] as const;
const THEMES = ['light', 'dark'] as const;

// 1x1 grey PNG and a grey disc: remote photos and avatars are random per seed run or need the network.
const GREY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const GREY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#9ca3af"/></svg>';

const GROUP = '/lv/games/group/galda-spelu-klubs-riga';

type Screen = { name: string; signedIn?: boolean; run: (page: Page, width: number) => Promise<void> };

const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  // A full-page capture does not scroll, so lazy images below the fold would never load: make them all eager, again on
  // every poll (hydration can put `lazy` back), and wait until every image is done.
  await page.waitForFunction(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => ((i as HTMLImageElement).loading = 'eager'));
    return [...document.images].every((i) => i.complete);
  }, undefined, { timeout: 15_000 });
  await page.waitForTimeout(400);
};

// The panel's shell mounts while its content still loads (a skeleton), so wait until the skeleton is gone and the title is real.
const waitForPanel = async (page: Page) => {
  const panel = page.locator('[data-ui="panel"]').first();
  await panel.waitFor();
  await expect(panel.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(panel.locator('h2').first()).toBeVisible();
};

const SCREENS: Screen[] = [
  { name: 'board-groups', run: async (p) => { await p.goto('/lv'); } },
  { name: 'board-events', run: async (p) => { await p.goto('/lv?tab=events'); } },
  {
    name: 'topic-chip-open',
    run: async (p) => {
      await p.goto('/lv');
      // From lg up the Tēma chip is replaced by the permanent topic list: nothing to open (the board screens cover it).
      test.skip((p.viewportSize()?.width ?? 0) >= 1024, 'no Tēma chip at this width');
      const chip = p.getByRole('button', { name: /^Tēma/ }).first();
      await chip.click();
      await expect(chip).toHaveAttribute('aria-expanded', 'true');
    },
  },
  {
    name: 'date-chip-open',
    run: async (p) => {
      await p.goto('/lv?tab=events');
      // Narrow: the Datums chip; wide: the date picker button beside the day strip.
      const chip = p.locator('button[aria-label^="Datums"]:visible, button[aria-label="Izvēlēties datumus"]:visible').first();
      await chip.click();
      await expect(chip).toHaveAttribute('aria-expanded', 'true');
    },
  },
  {
    name: 'header-search-open',
    run: async (p) => {
      await p.goto('/lv');
      // A search button replaces the field on narrow headers.
      const phone = p.getByRole('button', { name: 'Meklēt', exact: true });
      if (await phone.isVisible()) await phone.click();
      else await p.locator('header input[type="search"]').click();
      await p.getByRole('dialog', { name: 'Meklēšana' }).waitFor();
    },
  },
  { name: 'group-page', run: async (p) => { await p.goto(GROUP); } },
  {
    name: 'group-slide-over',
    run: async (p) => {
      await p.goto('/lv');
      await p.locator(`a[href="${GROUP}"]:visible`).first().click();
      await p.waitForURL(`**${GROUP}`);
      await waitForPanel(p);
    },
  },
  {
    name: 'event-slide-over',
    run: async (p) => {
      await p.goto('/lv?tab=events');
      await p.locator('a[href*="/events/"]').first().click();
      await p.waitForURL('**/events/**');
      await waitForPanel(p);
    },
  },
  { name: 'messages', signedIn: true, run: async (p) => { await p.goto('/lv/messages'); } },
  { name: 'my-groups', signedIn: true, run: async (p) => { await p.goto('/lv/profile/my-groups'); } },
  { name: 'profile', signedIn: true, run: async (p) => { await p.goto('/lv/profile'); } },
  { name: 'create-wizard-1', signedIn: true, run: async (p) => { await p.goto('/lv/create'); } },
];

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    test.describe(`${theme} ${width}`, () => {
      test.use({
        viewport: { width, height: 900 },
        colorScheme: theme,
      });

      for (const screen of SCREENS) {
        test(screen.name, async ({ browser, baseURL }) => {
          const context = await browser.newContext({
            baseURL,
            viewport: { width, height: 900 },
            locale: 'lv-LV',
            timezoneId: 'Europe/Riga',
            reducedMotion: 'reduce',
            colorScheme: theme,
            storageState: screen.signedIn ? AUTH_FILE : undefined,
          });
          const page = await context.newPage();
          await page.clock.setFixedTime(FROZEN_NOW);
          // The consent banner would cover the bottom of every screen; it has its own checks.
          await page.addInitScript(() => window.localStorage.setItem('cookie-consent', 'accepted'));
          // The site has no dark switch yet; its `html.dark` theme is the one a visitor will get.
          if (theme === 'dark') await page.addInitScript(() => document.documentElement.classList.add('dark'));
          await page.route('**/*', (route) => {
            const url = new URL(route.request().url());
            const local = url.origin === new URL(baseURL ?? 'http://localhost:3000').origin;
            if (local && !url.pathname.startsWith('/_next/image')) return route.continue();
            if (url.pathname.endsWith('.svg') || url.hostname.includes('dicebear')) return route.fulfill({ contentType: 'image/svg+xml', body: GREY_SVG });
            if (/\.(png|jpe?g|webp|avif)$/.test(url.pathname) || url.pathname.startsWith('/_next/image') || url.hostname.includes('picsum')) {
              return route.fulfill({ contentType: 'image/png', body: GREY_PNG });
            }
            return route.abort();
          });
          await screen.run(page, width);
          await settle(page);
          await expect(page).toHaveScreenshot(`${screen.name}-${width}-${theme}.png`, { fullPage: true });
          await context.close();
        });
      }
    });
  }
}
