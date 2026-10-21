const { test, expect } = require('@playwright/test');

const optometristEmail = process.env.E2E_OPTOMETRIST_EMAIL;
const optometristPassword = process.env.E2E_OPTOMETRIST_PASSWORD;
const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

async function login(page, email, password) {
  await page.goto('/login');

  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('E2E-PRESCRIPTION-01 - Optometrist prescription and Customer history', () => {
  test('Optometrist records a prescription and Customer sees it in history', async ({
    page,
  }) => {
    test.skip(
      !optometristEmail ||
        !optometristPassword ||
        !customerEmail ||
        !customerPassword,
      'E2E Optometrist and Customer credentials are required.',
    );

    const prescriptionMarker = `DDP-084 E2E prescription ${Date.now()}`;

    /*
     * Record a new prescription using the authenticated Optometrist workflow.
     */
    await login(page, optometristEmail, optometristPassword);

    await expect(page).toHaveURL(/\/clinical\/prescriptions\/new$/);

    await expect(
      page.getByRole('heading', { name: /prescription handling/i }),
    ).toBeVisible();

    const searchBox = page.getByRole('searchbox', {
      name: /search by customer name, email or phone/i,
    });

    await searchBox.fill(customerEmail);

    await page.getByRole('button', { name: /^search$/i }).click();

    const customerResult = page
      .locator('.clinical-results')
      .getByRole('listitem')
      .filter({ hasText: customerEmail })
      .first();

    await expect(customerResult).toBeVisible();

    await customerResult
      .getByRole('button', { name: /^select /i })
      .click();

    await expect(
      page.getByRole('heading', { name: /new prescription/i }),
    ).toBeVisible();

    await page
      .getByRole('spinbutton', { name: /right eye sph/i })
      .fill('-1.25');

    await page
      .getByRole('spinbutton', { name: /left eye axis/i })
      .fill('90');

    await page.getByRole('textbox', { name: /remarks/i }).fill(
      prescriptionMarker,
    );

    await page
      .getByRole('button', { name: /record prescription/i })
      .click();

    await expect(
      page.getByText('Prescription recorded successfully.', {
        exact: true,
      }),
    ).toBeVisible();

    /*
     * Switch identity and verify the newly created historical record through
     * the real Customer prescription-history workflow.
     */
    await page.getByRole('button', { name: /log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);

    await login(page, customerEmail, customerPassword);

    await expect(page).toHaveURL(/\/$/);

    await page.goto('/profile/prescriptions');

    await expect(
      page.getByRole('heading', { name: /prescription history/i }),
    ).toBeVisible();

    const prescriptionCard = page
      .getByRole('article')
      .filter({ hasText: prescriptionMarker });

    await expect(prescriptionCard).toBeVisible();

    await expect(
      prescriptionCard.getByRole('region', { name: /right eye/i }),
    ).toContainText('-1.25');

    await expect(
      prescriptionCard.getByRole('region', { name: /left eye/i }),
    ).toContainText('90');

    await expect(prescriptionCard).toContainText(prescriptionMarker);
  });
});
