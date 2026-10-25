const required = [
  "E2E_BASE_URL",
  "E2E_CUSTOMER_EMAIL",
  "E2E_CUSTOMER_PASSWORD",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
  "E2E_MANAGER_EMAIL",
  "E2E_MANAGER_PASSWORD",
  "E2E_ASSISTANT_EMAIL",
  "E2E_ASSISTANT_PASSWORD",
  "E2E_OPTOMETRIST_EMAIL",
  "E2E_OPTOMETRIST_PASSWORD",
  "E2E_PRODUCT_ID",
  "E2E_APPOINTMENT_DATE",
  "E2E_APPOINTMENT_START",
  "E2E_APPOINTMENT_END",
];

const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(
    `Release E2E verification blocked: missing ${missing.join(", ")}`,
  );
  process.exit(1);
}

console.log("Release E2E configuration validated.");
