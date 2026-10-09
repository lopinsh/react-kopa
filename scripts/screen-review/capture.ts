/**
 * Screen review capture (read-only): screenshots every screen in the Screen map at
 * desktop (1440x900) and mobile (390x844), in /lv, as each role that can see it.
 * Also dumps the visible links, buttons, headings and text per shot to <name>.json.
 *
 * Run (dev server on :3000, local seed data):  npx tsx scripts/screen-review/capture.ts
 * Output: screen-review/<step>-<screen>-<role>-<width>.png  (git-ignored)
 */
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = path.resolve('screen-review');

type Role = 'anon' | 'user' | 'member' | 'owner' | 'admin';
const ACCOUNTS: Record<Exclude<Role, 'anon'>, { email: string; password: string }> = {
    user: { email: 'user@local', password: 'user' },
    member: { email: 'member@local', password: 'member' },
    owner: { email: 'owner@local', password: 'owner' },
    admin: { email: 'admin@local', password: 'admin' },
};
const SIZES = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } } as const;
type Size = keyof typeof SIZES;

const G = '/lv/religion/group/jelgavas-lugsanu-loks';
const EV_REQ = `${G}/events/choir-rehearsal-request`;
const EV_MEM = `${G}/events/test-rehearsal-members`;

interface Shot {
    name: string; // <step>-<screen>
    roles: Role[];
    url: string;
    sizes?: Size[];
    /** Open state to reach before the shot; return false to skip. */
    act?: (page: Page, size: Size) => Promise<void | false>;
    tag?: string; // suffix for open states, e.g. "modal"
}

// tsx wraps functions with __name(); stub it so page.evaluate callbacks run in the browser.
const INIT = "window.__name = (f) => f; if (!sessionStorage.getItem('fresh')) localStorage.setItem('cookie-consent', 'accepted');";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function clickFirst(page: Page, ...candidates: (string | RegExp)[]) {
    for (const c of candidates) {
        const loc = typeof c === 'string' ? page.locator(c).first() : page.getByRole('button', { name: c }).first();
        if (await loc.count()) {
            await loc.click({ timeout: 3000 });
            await sleep(500);
            return;
        }
        if (typeof c !== 'string') {
            const link = page.getByRole('link', { name: c }).first();
            if (await link.count()) {
                await link.click({ timeout: 3000 });
                await sleep(500);
                return;
            }
        }
    }
    throw new Error(`nothing to click: ${candidates.join(' | ')}`);
}

const SHOTS: Shot[] = [
    // Find
    { name: 'find-discovery-groups', roles: ['anon', 'member'], url: '/lv' },
    { name: 'find-discovery-groups-cookie', roles: ['anon'], url: '/lv', tag: 'fresh', act: async (p) => { await p.evaluate(() => { sessionStorage.setItem('fresh', '1'); localStorage.removeItem('cookie-consent'); }); await p.reload(); await sleep(800); } },
    { name: 'find-discovery-events', roles: ['anon', 'member'], url: '/lv?tab=events' },
    { name: 'find-discovery-filter-sheet', roles: ['anon'], url: '/lv', sizes: ['mobile'], act: async (p) => clickFirst(p, /filtri/i) },
    { name: 'find-search-dropdown', roles: ['anon'], url: '/lv', act: async (p) => { const i = p.locator('input[type="text"], input[type="search"]').first(); await i.fill('jog'); await sleep(1200); } },
    { name: 'find-search-modal-unused', roles: ['anon'], url: '/lv', act: async (p) => { await p.keyboard.press('Control+k'); await sleep(500); } },
    { name: 'find-discover-redirect', roles: ['anon'], url: '/lv/discover' },
    { name: 'find-groups-orphan', roles: ['member'], url: '/lv/groups' },
    // Create
    { name: 'create-wizard-step1', roles: ['member'], url: '/lv/create' },
    { name: 'create-wizard-step2', roles: ['member'], url: '/lv/create', act: wizardNext(1) },
    { name: 'create-wizard-step3', roles: ['member'], url: '/lv/create', act: wizardNext(2) },
    { name: 'create-wizard-step4', roles: ['member'], url: '/lv/create', act: wizardNext(3) },
    { name: 'create-wizard-loggedout', roles: ['anon'], url: '/lv/create' },
    // Join
    { name: 'join-group-about', roles: ['anon', 'user', 'member', 'owner'], url: G },
    { name: 'join-group-about-drawer', roles: ['anon'], url: G, sizes: ['mobile'], act: async (p) => clickFirst(p, /informācij|info/i) },
    { name: 'join-apply-modal', roles: ['user'], url: G, act: async (p) => clickFirst(p, /pieteikties|pievienoties/i) },
    { name: 'join-authgate-modal', roles: ['anon'], url: G, act: async (p) => clickFirst(p, /pieteikties|pievienoties/i) },
    { name: 'join-signin', roles: ['anon'], url: '/lv/auth/signin' },
    { name: 'join-register', roles: ['anon'], url: '/lv/auth/register' },
    { name: 'join-onboarding-username', roles: ['anon'], url: '/lv/onboarding/username' },
    { name: 'join-signin-eventlink', roles: ['anon'], url: EV_REQ },
    // Talk
    { name: 'talk-discussions', roles: ['anon', 'member', 'owner'], url: `${G}/discussions` },
    { name: 'talk-message-member-modal', roles: ['member'], url: `${G}/members`, act: async (p) => { await p.getByRole('button', { name: /sūtīt ziņu/i }).first().click({ timeout: 3000 }); await sleep(600); } },
    { name: 'talk-messages', roles: ['member'], url: '/lv/messages' },
    { name: 'talk-messages-anon', roles: ['anon'], url: '/lv/messages' },
    { name: 'talk-group-messages-orphan', roles: ['member'], url: '/lv/religion/messages' },
    { name: 'talk-notifications-open', roles: ['owner', 'member'], url: '/lv', act: async (p, s) => { await p.locator('button[aria-label]').filter({ hasText: '' }).first(); await p.getByLabel(/paziņojum/i).first().click(); await sleep(600); } },
    // Group life
    { name: 'group-members', roles: ['anon', 'member', 'owner'], url: `${G}/members` },
    { name: 'group-events-tab', roles: ['anon', 'member', 'owner'], url: `${G}/events` },
    { name: 'group-event-request', roles: ['anon', 'user', 'member', 'owner'], url: EV_REQ },
    { name: 'group-event-members-only', roles: ['anon', 'member'], url: EV_MEM },
    { name: 'group-create-event-page', roles: ['owner'], url: `${G}/create-event` },
    { name: 'group-create-event-modal', roles: ['owner'], url: `${G}/events`, act: async (p) => clickFirst(p, /izveidot pasākumu/i) },
    ...['profile', 'social', 'sections', 'categorization', 'privacy', 'danger'].map<Shot>((t) => ({
        name: `group-settings-${t}`, roles: ['owner'], url: `${G}/settings?tab=${t}`,
    })),
    { name: 'group-settings-member-redirect', roles: ['member'], url: `${G}/settings` },
    { name: 'group-sections-editor-open', roles: ['owner'], url: `${G}/settings?tab=sections`, act: async (p) => { const b = p.locator('button').filter({ has: p.locator('svg') }); await clickFirst(p, /rediģ|edit|labot/i); await sleep(300); void b; } },
    { name: 'group-report-modal', roles: ['member'], url: G, act: async (p) => { await openGroupMenu(p); await clickFirst(p, /ziņot|report/i); await sleep(800); } },
    { name: 'group-hide-modal', roles: ['admin'], url: '/lv/sports/group/rigas-skrejeji', act: async (p) => { await openGroupMenu(p); await clickFirst(p, /slēpt|hide/i); } },
    { name: 'group-organiser-panel', roles: ['owner'], url: EV_REQ },
    // Me
    { name: 'me-profile', roles: ['member'], url: '/lv/profile' },
    { name: 'me-profile-public', roles: ['anon', 'member'], url: '/lv/profile/group_owner' },
    { name: 'me-profile-edit', roles: ['member'], url: '/lv/profile/edit' },
    { name: 'me-my-groups', roles: ['member', 'owner'], url: '/lv/profile/my-groups' },
    // Shell
    { name: 'shell-user-menu', roles: ['member', 'admin'], url: '/lv', act: async (p) => { await p.locator('header button').last().click(); await sleep(400); } },
    { name: 'shell-group-sidebar', roles: ['member', 'owner'], url: G, sizes: ['desktop'] },
    { name: 'shell-mobile-nav', roles: ['anon', 'member'], url: '/lv', sizes: ['mobile'] },
    { name: 'shell-footer', roles: ['anon'], url: '/lv', act: async (p) => { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(500); } },
    { name: 'shell-404', roles: ['anon'], url: '/lv/religion/group/nonexistent' },
    // Static
    { name: 'static-about', roles: ['anon'], url: '/lv/about' },
    { name: 'static-privacy', roles: ['anon'], url: '/lv/privacy' },
    // Admin
    { name: 'admin-dashboard', roles: ['admin'], url: '/lv/admin' },
    { name: 'admin-dashboard-reports-tab', roles: ['admin'], url: '/lv/admin?tab=reports' },
    { name: 'admin-dashboard-moderation-tab', roles: ['admin'], url: '/lv/admin?tab=moderation' },
    { name: 'admin-reports', roles: ['admin'], url: '/lv/admin/reports' },
    { name: 'admin-taxonomy', roles: ['admin'], url: '/lv/admin/taxonomy' },
    { name: 'admin-categorization', roles: ['admin'], url: `/lv/admin/groups/jelgavas-lugsanu-loks/categorization` },
    { name: 'admin-as-member', roles: ['member'], url: '/lv/admin' },
];

function wizardNext(clicks: number) {
    return async (p: Page) => {
        for (let i = 0; i < clicks; i++) {
            // Fill whatever the current step needs so "next" succeeds; ignore what isn't there.
            const cat = p.getByRole('button', { name: /Reliģija un garīgums/ }).first();
            if (i === 0 && (await cat.count())) await cat.click({ timeout: 2000 }).catch(() => undefined);
            if (i === 0) {
                await p.locator('input[placeholder^="Meklēt tēmas"]').first().click({ timeout: 2000 }).catch(() => undefined);
                await sleep(500);
                await p.getByText(/Lūgšanu grupas/).first().click({ timeout: 2000 }).catch(() => undefined);
                await sleep(300);
            }
            await p.locator('input[name="name"]').first().fill('Testa grupa', { timeout: 1500 }).catch(() => undefined);
            await p.locator('textarea[name="description"]').first().fill('Apraksts testam.', { timeout: 1500 }).catch(() => undefined);
            const city = p.locator('select[name="city"]').first();
            if (await city.count()) await city.selectOption({ index: 1 }, { timeout: 1500 }).catch(() => undefined);
            await clickFirst(p, /tālāk|next|turpināt/i).catch(() => undefined);
            await sleep(700);
        }
    };
}

async function openGroupMenu(p: Page) {
    await p.locator('button:visible:has(svg[class*="ellipsis"], svg[class*="more-horizontal"])').first().click({ timeout: 3000 });
    await sleep(300);
}

async function login(browser: Browser, role: Exclude<Role, 'anon'>, size: Size): Promise<BrowserContext> {
    const ctx = await browser.newContext({ viewport: SIZES[size], isMobile: size === 'mobile', locale: 'lv-LV' });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/lv/auth/signin`);
    await page.fill('#email', ACCOUNTS[role].email);
    await page.fill('#password', ACCOUNTS[role].password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.includes('/auth/signin'), { timeout: 20000 });
    await page.close();
    return ctx;
}

async function dump(page: Page) {
    return page.evaluate(() => {
        const vis = (el: Element) => {
            const r = (el as HTMLElement).getBoundingClientRect();
            return r.width > 0 && r.height > 0;
        };
        const txt = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
        return {
            title: document.title,
            url: location.pathname + location.search,
            headings: [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(txt),
            links: [...document.querySelectorAll('a[href]')].filter(vis).map((a) => `${txt(a) || (a.getAttribute('aria-label') ?? '(icon)')} -> ${a.getAttribute('href')}`),
            buttons: [...document.querySelectorAll('button,[role=button]')].filter(vis).map((b) => txt(b) || b.getAttribute('aria-label') || '(icon)'),
            inputs: [...document.querySelectorAll('input,textarea,select')].filter(vis).map((i) => `${i.getAttribute('name') ?? i.id ?? ''}:${i.getAttribute('type') ?? i.tagName.toLowerCase()}:${i.getAttribute('placeholder') ?? ''}`),
            text: (document.body.innerText ?? '').replace(/\n{2,}/g, '\n').slice(0, 4000),
            hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
    });
}

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const only = process.argv[2];
    // CHROME_PATH lets the script reuse an already-installed Chromium instead of the version Playwright expects.
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    const log: string[] = [];
    const ctxCache = new Map<string, BrowserContext>();

    for (const size of ['desktop', 'mobile'] as Size[]) {
        for (const role of ['anon', 'user', 'member', 'owner', 'admin'] as Role[]) {
            const shots = SHOTS.filter((s) => s.roles.includes(role) && (s.sizes ?? ['desktop', 'mobile']).includes(size) && (!only || s.name.includes(only)));
            if (!shots.length) continue;
            const key = `${role}-${size}`;
            let ctx = ctxCache.get(key);
            if (!ctx) {
                if (role === 'anon') {
                    ctx = await browser.newContext({ viewport: SIZES[size], isMobile: size === 'mobile', locale: 'lv-LV' });
                    await ctx.addInitScript(INIT);
                } else {
                    try { ctx = await login(browser, role, size); } catch (e) { log.push(`LOGIN FAIL ${key}: ${(e as Error).message}`); continue; }
                }
                ctxCache.set(key, ctx);
            }
            for (const s of shots) {
                const base = `${s.name}-${role}-${SIZES[size].width}`;
                const page = await ctx.newPage();
                try {
                    const res = await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(BASE + s.url));
                    await sleep(700);
                    const status = res?.status() ?? 0;
                    const finalPath = new URL(page.url()).pathname;
                    let acted = '';
                    if (s.act) {
                        try { const r = await s.act(page, size); if (r === false) { await page.close(); continue; } }
                        catch (e) { acted = `ACT FAIL: ${(e as Error).message.split('\n')[0]}`; }
                    }
                    await page.screenshot({ path: path.join(OUT, `${base}.png`), fullPage: !s.act });
                    const d = await dump(page);
                    fs.writeFileSync(path.join(OUT, `${base}.json`), JSON.stringify({ requested: s.url, status, finalPath, acted, ...d }, null, 1));
                    log.push(`ok ${base} status=${status} final=${finalPath}${finalPath !== s.url.split('?')[0] ? ' (REDIRECT)' : ''} ${acted}`);
                } catch (e) {
                    log.push(`FAIL ${base}: ${(e as Error).message.split('\n')[0]}`);
                } finally {
                    await page.close().catch(() => undefined);
                }
            }
        }
    }
    fs.writeFileSync(path.join(OUT, '_log.txt'), log.join('\n'));
    console.log(log.join('\n'));
    await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
