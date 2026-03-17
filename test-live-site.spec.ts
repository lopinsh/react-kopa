import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

function generateRandomUser() {
  const suffix = randomBytes(4).toString('hex');
  return {
    email: `test_user_${suffix}@example.com`,
    password: `TestPassword123!_${suffix}`,
    name: `Test User ${suffix}`,
    username: `testuser${suffix}`
  };
}

const userA = generateRandomUser();

test.describe('Ejam Kopā Live Verification', () => {
  test.describe.configure({ mode: 'serial' });

  let pageA: any;
  let consoleErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const contextA = await browser.newContext();
    pageA = await contextA.newPage();

    // Listen for console errors
    pageA.on('pageerror', (exception: any) => {
        console.error(`Uncaught exception: "${exception}"`);
        consoleErrors.push(exception.toString());
    });
    pageA.on('console', (msg: any) => {
        if (msg.type() === 'error') {
            console.error(`Console error: "${msg.text()}"`);
            consoleErrors.push(msg.text());
        }
    });
  });

  test('User A can register and onboard', async () => {
    console.log(`Registering User A: ${userA.email}`);
    await pageA.goto('https://ejam.lumm.eu/lv/auth/register');

    const nameInput = pageA.getByLabel(/Vārds/i).first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(userA.name);

    const emailInput = pageA.getByLabel(/E-pasts/i).first();
    await emailInput.fill(userA.email);

    const passwordInput = pageA.getByLabel(/Parole/i).first();
    await passwordInput.fill(userA.password);

    const submitButton = pageA.getByRole('button', { name: /Sign Up|Reģistrēties/i }).first();
    await submitButton.click();

    await pageA.waitForURL('**/onboarding/username');
    const usernameInput = pageA.getByRole('textbox').first();
    await usernameInput.fill(userA.username);

    await pageA.waitForSelector('text=onboarding.username.available', { state: 'visible', timeout: 5000 }).catch(() => {});

    const usernameSubmit = pageA.getByRole('button', { name: 'onboarding.username.submit' }).first();
    await usernameSubmit.click();

    await pageA.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});

    expect(pageA.url()).not.toContain('auth');
    expect(pageA.url()).not.toContain('onboarding');

    const cookieBtn = pageA.getByRole('button', { name: /Skaidrs|Clear/i }).first();
    if (await cookieBtn.isVisible()) await cookieBtn.click();
  });

  test('User A can create a group and log errors', async () => {
    console.log(`User A creating group...`);
    // Clear errors from registration phase
    consoleErrors = [];

    await pageA.goto('https://ejam.lumm.eu/lv/create');

    // Give it a moment to crash
    await pageA.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
        throw new Error(`Client-side exception caught: \n${consoleErrors.join('\n')}`);
    }

    const nameInput = pageA.getByLabel(/Grupas nosaukums/i).first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  });

});
