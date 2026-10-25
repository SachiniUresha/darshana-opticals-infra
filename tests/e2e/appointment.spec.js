const { test, expect } = require("@playwright/test");

const assistantEmail = process.env.E2E_ASSISTANT_EMAIL;
const assistantPassword = process.env.E2E_ASSISTANT_PASSWORD;
const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

const sessionDate = process.env.E2E_APPOINTMENT_DATE;
const sessionStart = process.env.E2E_APPOINTMENT_START;
const sessionEnd = process.env.E2E_APPOINTMENT_END;
const sessionCapacity = process.env.E2E_APPOINTMENT_CAPACITY || "2";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appointmentDateLabel(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

async function login(page, email, password) {
  await page.goto("/login");

  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("E2E-APPOINTMENT-01 - Doctor Session and Customer booking", () => {
  test("Branch Assistant creates a Doctor Session and Customer books it", async ({
    page,
  }) => {
    test.skip(
      !assistantEmail ||
        !assistantPassword ||
        !customerEmail ||
        !customerPassword ||
        !sessionDate ||
        !sessionStart ||
        !sessionEnd,
      "E2E staff/customer credentials and a dedicated future appointment slot are required.",
    );

    /*
     * The configured session must be a dedicated future staging slot,
     * outside the 24-hour booking restriction and free from overlaps.
     */

    await login(page, assistantEmail, assistantPassword);

    await expect(page).toHaveURL(/\/staff\/orders$/);

    await page.goto("/staff/appointments/sessions/new");

    await expect(
      page.getByRole("heading", { name: /create doctor session/i }).first(),
    ).toBeVisible();

    const doctorSelect = page.getByLabel("Doctor *");

    await expect(doctorSelect).toBeEnabled();

    const selectedDoctorLabel = await doctorSelect
      .locator("option:checked")
      .innerText();

    const doctorName = selectedDoctorLabel.split(" — ")[0].trim();

    expect(doctorName).not.toBe("");

    await page.getByLabel("Date *").fill(sessionDate);
    await page.getByLabel("Start Time *").fill(sessionStart);
    await page.getByLabel("End Time *").fill(sessionEnd);
    await page.getByLabel("Capacity *").fill(sessionCapacity);

    await page.getByRole("button", { name: /^create session$/i }).click();

    await expect(page).toHaveURL(
      /\/staff\/appointments\/sessions\/[a-f\d]{24}$/i,
    );

    const sessionId = page
      .url()
      .match(/\/staff\/appointments\/sessions\/([a-f\d]{24})$/i)?.[1];

    expect(sessionId).toMatch(/^[a-f\d]{24}$/i);

    await expect(
      page.getByRole("heading", { name: /doctor session details/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);

    await login(page, customerEmail, customerPassword);

    await expect(page).toHaveURL(/\/$/);

    await page.goto("/appointments/book");

    await expect(
      page.getByRole("heading", { name: /book your eye test/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /^continue/i }).click();

    await expect(
      page.getByRole("heading", { name: /choose your doctor/i }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: new RegExp(escapeRegex(doctorName), "i"),
      })
      .click();

    await page.getByRole("button", { name: /^continue/i }).click();

    await expect(
      page.getByRole("heading", { name: /pick a date & time/i }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: appointmentDateLabel(sessionDate),
      })
      .click();

    const sessionRadio = page.locator(
      `input[name="doctor-session"][value="${sessionId}"]`,
    );

    await expect(sessionRadio).toBeVisible();

    await sessionRadio.evaluate((radio) => {
      radio.closest("label")?.click();
    });

    await expect(sessionRadio).toBeChecked();

    await page.getByRole("button", { name: /^continue/i }).click();

    await expect(
      page.getByRole("heading", { name: /review & confirm/i }),
    ).toBeVisible();

    await expect(page.getByText(doctorName, { exact: false })).toBeVisible();

    await page.getByRole("button", { name: /confirm booking/i }).click();

    await expect(
      page.getByRole("heading", { name: /appointment booked!/i }),
    ).toBeVisible();
  });
});
