const { test, expect } = require("@playwright/test");

const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;
const productId = process.env.E2E_PRODUCT_ID;
const billingCity = process.env.E2E_BILLING_CITY || "Colombo";

test.describe("E2E-PURCHASE-01 - Customer purchase and payment handoff", () => {
  test("Customer can create an order and prepare PayHere payment", async ({
    page,
  }) => {
    test.skip(
      !customerEmail || !customerPassword || !productId,
      "E2E customer credentials and a designated staging product are required.",
    );

    await page.goto("/login");

    await page.getByLabel(/email address/i).fill(customerEmail);
    await page.getByLabel(/^password$/i).fill(customerPassword);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/$/);

    /*
     * Use a designated fictional staging inventory item instead of relying on
     * whichever product happens to appear first in the catalogue.
     */
    await page.goto(`/products/${encodeURIComponent(productId)}`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("button", { name: /add .* to cart/i }).click();

    await expect(page.getByRole("status")).toContainText(/added to cart/i);

    await page.goto("/cart");

    await expect(
      page.getByRole("heading", { name: /review your items/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /proceed to checkout/i }).click();

    await expect(page).toHaveURL(/\/checkout$/);

    await expect(
      page.getByRole("heading", { name: /review your order/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /place order/i }).click();

    await expect(
      page.getByRole("heading", { name: /order created/i }),
    ).toBeVisible();

    const orderDetails = page.getByLabel("Confirmed order details");
    const orderId = await orderDetails.locator("strong").first().innerText();

    expect(orderId).toMatch(/^[a-f\d]{24}$/i);

    await page.getByRole("link", { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(new RegExp(`/payments/${orderId}$`));

    await expect(
      page.getByRole("heading", { name: /payment details/i }),
    ).toBeVisible();

    await page.getByLabel(/billing city/i).fill(billingCity);

    await page.getByRole("button", { name: /review payment/i }).click();

    await expect(
      page.getByRole("heading", { name: /review payment/i }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /continue to payhere/i }),
    ).toBeVisible();

    /*
     * Provider submission is intentionally not performed here yet.
     * Full PayHere sandbox completion will be executed against the approved
     * staging environment and recorded as real DDP-084 evidence.
     */
  });
});
