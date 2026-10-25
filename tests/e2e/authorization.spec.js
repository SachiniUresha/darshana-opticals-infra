const { test, expect } = require('@playwright/test');

const credentials = {
  customer: {
    email: process.env.E2E_CUSTOMER_EMAIL,
    password: process.env.E2E_CUSTOMER_PASSWORD,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL,
    password: process.env.E2E_MANAGER_PASSWORD,
  },
  assistant: {
    email: process.env.E2E_ASSISTANT_EMAIL,
    password: process.env.E2E_ASSISTANT_PASSWORD,
  },
  optometrist: {
    email: process.env.E2E_OPTOMETRIST_EMAIL,
    password: process.env.E2E_OPTOMETRIST_PASSWORD,
  },
};

async function login(page, account) {
  await page.goto('/login');

  await page.getByLabel(/email address/i).fill(account.email);
  await page.getByLabel(/^password$/i).fill(account.password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('E2E-AUTHZ-01 - Role isolation', () => {
  test('Customer cannot access System Admin routes', async ({ page }) => {
    const account = credentials.customer;

    test.skip(
      !account.email || !account.password,
      'E2E Customer credentials are required.',
    );

    await login(page, account);

    await expect(page).toHaveURL(/\/$/);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/$/);
  });

  test('System Admin cannot access Customer-only routes', async ({ page }) => {
    const account = credentials.admin;

    test.skip(
      !account.email || !account.password,
      'E2E System Admin credentials are required.',
    );

    await login(page, account);

    await expect(page).toHaveURL(/\/admin$/);

    await page.goto('/profile');

    await expect(page).toHaveURL(/\/$/);
  });

  test('Branch Manager cannot create Doctor Sessions', async ({ page }) => {
    const account = credentials.manager;

    test.skip(
      !account.email || !account.password,
      'E2E Branch Manager credentials are required.',
    );

    await login(page, account);

    await expect(page).toHaveURL(/\/staff\/orders$/);

    await page.goto('/staff/appointments/sessions/new');

    await expect(page).toHaveURL(/\/$/);
  });

  test('Branch Assistant cannot access manager-only Inventory', async ({
    page,
  }) => {
    const account = credentials.assistant;

    test.skip(
      !account.email || !account.password,
      'E2E Branch Assistant credentials are required.',
    );

    await login(page, account);

    await expect(page).toHaveURL(/\/staff\/orders$/);

    await page.goto('/staff/inventory');

    await expect(page).toHaveURL(/\/$/);
  });

  test('Optometrist cannot access System Admin routes', async ({ page }) => {
    const account = credentials.optometrist;

    test.skip(
      !account.email || !account.password,
      'E2E Optometrist credentials are required.',
    );

    await login(page, account);

    await expect(page).toHaveURL(/\/clinical\/prescriptions\/new$/);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/$/);
  });
});
