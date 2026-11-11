import { test, expect } from '@playwright/test';

// The seed's rows are shorter than live ones, so a hub grid whose column is not pinned (`grid-cols-[minmax(0,1fr)]`) still
// looks right in the screenshots. Here every box gets a 900 px child: a box wider than the phone means its grid track grew
// to its content (the live Pārskats clip). No screenshots.

const PAGES = ['/lv/games/boardgames', '/lv/games/boardgames/groups', '/lv/games/boardgames/events', '/lv/games/boardgames/messages', '/lv/games/boardgames/jelgava', '/lv/jelgava'];

test.use({ viewport: { width: 360, height: 800 }, locale: 'lv-LV' });

for (const path of PAGES) {
  test(`hub columns hold at 360: ${path}`, async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('cookie-consent', 'accepted'));
    await page.goto(path);
    const wide = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll<HTMLElement>('main .shadow-card')];
      boxes.forEach((b) => { const d = document.createElement('div'); d.style.width = '900px'; b.appendChild(d); });
      return boxes.filter((b) => b.getBoundingClientRect().width > window.innerWidth).length;
    });
    expect(wide, 'boxes wider than the phone').toBe(0);
  });
}
