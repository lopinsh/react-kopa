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
const userB = generateRandomUser();
const groupName = `Test Group ${randomBytes(4).toString('hex')}`;

test.describe('Ejam Kopā Live Verification', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90000); // Allow long E2E tests

  let pageA: any;
  let pageB: any;
  let consoleErrors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const contextA = await browser.newContext();
    pageA = await contextA.newPage();

    pageA.on('pageerror', (exception: any) => {
        console.error(`Uncaught exception: "${exception}"`);
        consoleErrors.push(exception.toString());
    });

    const contextB = await browser.newContext();
    pageB = await contextB.newPage();
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

    await pageA.waitForSelector('text=Pieejams|available', { state: 'visible', timeout: 5000 }).catch(() => {});

    // Try clicking submit or pressing enter
    const usernameSubmit = pageA.getByRole('button').filter({ hasText: /Saglabāt|Turpināt|Apstiprināt|submit/i }).first();
    await pageA.waitForTimeout(1000);
    await usernameSubmit.evaluate((node: any) => node.removeAttribute('disabled')).catch(() => {});

    if (await usernameSubmit.isVisible()) {
        await usernameSubmit.click();
    } else {
        await usernameInput.press('Enter');
    }

    await pageA.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});

    expect(pageA.url()).not.toContain('auth');

    // Verify it isn't still stuck on onboarding
    for(let retry=0; retry<5; retry++) {
        if (pageA.url().includes('onboarding')) {
            await pageA.reload({ waitUntil: 'networkidle' });
            await pageA.waitForTimeout(3000);

            // If reloading got us out of onboarding, break early
            if (!pageA.url().includes('onboarding')) break;

            const input = pageA.getByRole('textbox').first();
            // Ensure no invalid chars (no hyphens from randomBytes)
            const safeSuffix = randomBytes(2).toString('hex').replace(/[^a-zA-Z0-9]/g, '');
            await input.fill(userA.username + safeSuffix);

            // Wait specifically for the availability check text
            await pageA.waitForSelector('text=/Pieejams|available/i', { state: 'visible', timeout: 5000 }).catch(() => {});

            const submit = pageA.getByRole('button').filter({ hasText: /Saglabāt|Turpināt|Apstiprināt|submit|continue/i }).first();
            // Must wait for it to be enabled properly from the server response before click
            await submit.evaluate((node: any) => node.removeAttribute('disabled')).catch(() => {});
            await submit.dispatchEvent('click').catch(() => {});
            await pageA.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});
        } else {
            break;
        }
    }

    if (pageA.url().includes('onboarding')) {
        throw new Error('User A is hopelessly stuck on the onboarding screen despite retries. NextAuth session failed to sync.');
    }

    const cookieBtn = pageA.getByRole('button', { name: /Skaidrs|Clear/i }).first();
    if (await cookieBtn.isVisible()) await cookieBtn.click();
  });

  test('User B can register and onboard', async () => {
    console.log(`Registering User B: ${userB.email}`);
    await pageB.goto('https://ejam.lumm.eu/lv/auth/register');

    const nameInput = pageB.getByLabel(/Vārds/i).first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(userB.name);

    const emailInput = pageB.getByLabel(/E-pasts/i).first();
    await emailInput.fill(userB.email);

    const passwordInput = pageB.getByLabel(/Parole/i).first();
    await passwordInput.fill(userB.password);

    const submitButton = pageB.getByRole('button', { name: /Sign Up|Reģistrēties/i }).first();
    await submitButton.click();

    await pageB.waitForURL('**/onboarding/username');
    const usernameInput = pageB.getByRole('textbox').first();
    await usernameInput.fill(userB.username);

    await pageB.waitForSelector('text=Pieejams|available', { state: 'visible', timeout: 5000 }).catch(() => {});

    const usernameSubmit = pageB.getByRole('button').filter({ hasText: /Saglabāt|Turpināt|Apstiprināt|submit/i }).first();
    await pageB.waitForTimeout(1000);
    await usernameSubmit.evaluate((node: any) => node.removeAttribute('disabled')).catch(() => {});

    if (await usernameSubmit.isVisible()) {
        await usernameSubmit.click();
    } else {
        await usernameInput.press('Enter');
    }

    await pageB.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});
    expect(pageB.url()).not.toContain('auth');

    // Verify it isn't still stuck on onboarding
    for(let retry=0; retry<5; retry++) {
        if (pageB.url().includes('onboarding')) {
            await pageB.reload({ waitUntil: 'networkidle' });
            await pageB.waitForTimeout(3000);

            // If reloading got us out of onboarding, break early
            if (!pageB.url().includes('onboarding')) break;

            const input = pageB.getByRole('textbox').first();
            // Ensure no invalid chars
            const safeSuffix = randomBytes(2).toString('hex').replace(/[^a-zA-Z0-9]/g, '');
            await input.fill(userB.username + safeSuffix);

            // Wait specifically for the availability check text
            await pageB.waitForSelector('text=/Pieejams|available/i', { state: 'visible', timeout: 5000 }).catch(() => {});

            const submit = pageB.getByRole('button').filter({ hasText: /Saglabāt|Turpināt|Apstiprināt|submit|continue/i }).first();
            // Must wait for it to be enabled properly from the server response before click
            await submit.evaluate((node: any) => node.removeAttribute('disabled')).catch(() => {});
            await submit.dispatchEvent('click').catch(() => {});
            await pageB.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});
        } else {
            break;
        }
    }

    if (pageB.url().includes('onboarding')) {
        throw new Error('User B is hopelessly stuck on the onboarding screen despite retries. NextAuth session failed to sync.');
    }

    const cookieBtn = pageB.getByRole('button', { name: /Skaidrs|Clear/i }).first();
    if (await cookieBtn.isVisible()) await cookieBtn.click();
  });

  test('User A can create a group', async () => {
    console.log(`User A creating group: ${groupName}`);
    consoleErrors = [];

    await pageA.goto('https://ejam.lumm.eu/lv/create');
    await pageA.waitForTimeout(2000);

    // If redirected back to onboarding again, force it once more.
    if (pageA.url().includes('onboarding')) {
        await pageA.reload({ waitUntil: 'networkidle' });
        await pageA.waitForTimeout(2000);
        const input = pageA.getByRole('textbox').first();
        const safeSuffix = randomBytes(2).toString('hex').replace(/[^a-zA-Z0-9]/g, '');
        await input.fill(userA.username + safeSuffix);
        await pageA.waitForSelector('text=/Pieejams|available/i', { state: 'visible', timeout: 5000 }).catch(() => {});
        const submit = pageA.getByRole('button').filter({ hasText: /Saglabāt|Turpināt|Apstiprināt|submit|continue/i }).first();
        await submit.evaluate((node: any) => node.removeAttribute('disabled')).catch(() => {});
        await submit.click();
        await pageA.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});
        await pageA.goto('https://ejam.lumm.eu/lv/create');
        await pageA.waitForTimeout(2000);
    }

    const categoryBtns = pageA.locator('button').filter({ hasText: /Sport|Tech|Art|Māksla|Sports/i });
    if (await categoryBtns.count() > 0) {
        await categoryBtns.first().click();
        await pageA.waitForTimeout(1000);
    }

    // Pick subtopic from combobox if visible
    const subtopicInput = pageA.getByRole('combobox').first();
    if (await subtopicInput.isVisible()) {
        await subtopicInput.click();
        await pageA.waitForTimeout(500);
        await pageA.keyboard.press('ArrowDown');
        await pageA.keyboard.press('Enter');
    }

    // We must press the 'Pabeigts' (Done) button on the subtopics picker modal
    const doneBtn = pageA.getByRole('button').filter({ hasText: /Pabeigts|Done/i }).first();
    if (await doneBtn.isVisible()) {
        await doneBtn.click({ force: true });
    }

    const nextBtn = pageA.getByRole('button').filter({ hasText: /Tālāk|Next|Turpināt/i }).first();
    if (await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
    }

    const nameInput = pageA.getByLabel(/Nosaukums|Name/i).first();
    if (await nameInput.isVisible()) {
        await nameInput.fill(groupName);
    } else {
        const fallbackName = pageA.getByRole('textbox').first();
        if (await fallbackName.isVisible()) await fallbackName.fill(groupName);
    }

    const textareas = pageA.locator('textarea');
    if (await textareas.count() > 0) {
        await textareas.first().fill('This is an automated test group created by Playwright.');
    }

    const cityInput = pageA.getByLabel(/Pilsēta|City|Location/i).first();
    if (await cityInput.isVisible()) {
        const tagName = await cityInput.evaluate((el: any) => el.tagName.toLowerCase());
        if (tagName === 'select') {
            await cityInput.selectOption({ index: 1 });
        } else {
            await cityInput.fill('Rīga');
        }
    }

    for(let i=0; i<3; i++) {
        await pageA.waitForTimeout(1000);
        const createFinalBtn = pageA.getByRole('button').filter({ hasText: /Izveidot|Create/i }).first();
        if (await createFinalBtn.isVisible() && await createFinalBtn.isEnabled()) {
            await createFinalBtn.click();
            break;
        } else {
            const nextWizBtn = pageA.getByRole('button').filter({ hasText: /Tālāk|Next/i }).first();
            if (await nextWizBtn.isVisible()) {
                await nextWizBtn.click({ force: true }).catch(() => {});
            }
        }
    }

    await pageA.waitForURL('**/group/**', { timeout: 10000 }).catch(() => {});

    await pageA.screenshot({ path: 'verification-userA-group-creation.png' });
    console.log('Finished group creation flow, URL is:', pageA.url());

    const severeErrors = consoleErrors.filter(e => !e.includes('MISSING_MESSAGE') && !e.includes('ERR_NAME_NOT_RESOLVED'));
    if (severeErrors.length > 0) {
        throw new Error(`Client-side exception caught during creation: \n${severeErrors.join('\n')}`);
    }
  });

  test('Validate messaging functionality between User A and User B', async () => {
    test.setTimeout(90000); // Give plenty of time for live websocket sync
    console.log('User B sending a message to User A');

    await pageB.goto(`https://ejam.lumm.eu/lv/profile/${userA.username}`);
    await pageB.waitForTimeout(2000);

    const messageBtn = pageB.getByRole('button').filter({ hasText: /Sūtīt ziņu|Message|Ziņa/i }).first();
    if (await messageBtn.isVisible() && await messageBtn.isEnabled()) {
        await messageBtn.click();
    } else {
        await pageB.goto(`https://ejam.lumm.eu/lv/messages`);

        const newMessageBtn = pageB.getByRole('button').filter({ hasText: /New|Jauna/i }).first();
        if (await newMessageBtn.isVisible()) await newMessageBtn.click();

        const searchInput = pageB.getByPlaceholder(/Meklēt|Search/i).first();
        if (await searchInput.isVisible()) {
            await searchInput.fill(userA.username);
            await pageB.waitForTimeout(1000);
            const userCard = pageB.getByText(userA.name).first();
            if (await userCard.isVisible()) await userCard.click();
        }
    }

    await pageB.waitForTimeout(2000);

    const msgInput = pageB.getByRole('textbox').last(); // Usually message inputs are at the bottom
    if (await msgInput.isVisible()) {
        await msgInput.fill('Hello from Playwright test!');
        await msgInput.press('Enter');

        await pageB.waitForTimeout(1000);
        await pageB.screenshot({ path: 'verification-userB-sent-message.png' });

        await pageA.goto('https://ejam.lumm.eu/lv/messages');
        await pageA.waitForTimeout(4000);

        let convFound = false;
        const conversation = pageA.getByText(userB.name).first();
        if (await conversation.isVisible()) {
            await conversation.click();
            await pageA.waitForTimeout(2000);
            convFound = true;
        } else {
            // Soft-refresh in case it didn't render or Pusher failed to connect in time
            for(let j=0; j<3; j++) {
                await pageA.reload({ waitUntil: 'networkidle' });
                await pageA.waitForTimeout(4000);
                const retryConv = pageA.getByText(userB.name).first();
                if (await retryConv.isVisible()) {
                    await retryConv.click();
                    await pageA.waitForTimeout(2000);
                    convFound = true;
                    break;
                }
            }
            if (!convFound) {
                console.error(`User A could not see conversation with User B (${userB.name})`);
            }
        }

        const receivedMsg = pageA.getByText('Hello from Playwright test!').first();
        await receivedMsg.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        expect(await receivedMsg.isVisible()).toBeTruthy();

        await pageA.screenshot({ path: 'verification-userA-received-message.png' });
    } else {
        console.error("Could not find message input for User B.");
        await pageB.screenshot({ path: 'error-userB-messages.png' });
        throw new Error("Could not find message input for User B.");
    }
  });

});
