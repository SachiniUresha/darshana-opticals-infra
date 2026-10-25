const { test, expect } = require('@playwright/test');

const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

test.describe('E2E-AUTH-01 - Authentication and protected access', () => {
  test('redirects an unauthenticated Customer protected route to login', async ({
    page,
  }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
  });

  test('Customer can login, access a protected route, logout, and loses access', async ({
    page,
  }) => {
    test.skip(
      !customerEmail || !customerPassword,
      'E2E customer credentials are required for integrated authentication execution.',
    );

    await page.goto('/login');

    await page.getByLabel(/email address/i).fill(customerEmail);
    await page.getByLabel(/^password$/i).fill(customerPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/);

    await page.goto('/profile');

    await expect(page).toHaveURL(/\/profile$/);
    await expect(
      page.getByRole('heading', { name: /personal information/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
  });
});
