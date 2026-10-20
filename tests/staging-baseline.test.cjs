const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "environments", "staging.env.example");
const LOCAL_ENV_PATH = path.join(ROOT, ".env.example");
const STAGING_RUNBOOK_PATH = path.join(ROOT, "docs", "staging-environment.md");
const TTL_RUNBOOK_PATH = path.join(ROOT, "docs", "chatbot-usage-ttl.md");
const TTL_SCRIPT_PATH = path.join(ROOT, "scripts", "chatbot-usage-index.js");

// Verified against the backend process.env reads and frontend VITE_API_BASE_URL.
const APPLICATION_VARIABLES = new Set([
  "AUTH_RATE_LIMIT_MAX",
  "AUTH_RATE_LIMIT_WINDOW_MS",
  "CHATBOT_RATE_LIMIT_MAX",
  "CHATBOT_RATE_LIMIT_WINDOW_MS",
  "CHATBOT_TIMEOUT_MS",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "EMAIL_FROM",
  "FRONTEND_ORIGIN",
  "FRONTEND_URL",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "JWT_EXPIRES_IN",
  "JWT_SECRET",
  "MONGODB_URI",
  "NODE_ENV",
  "ONLINE_FULFILLMENT_BRANCH_CODE",
  "PAYHERE_API_APP_ID",
  "PAYHERE_API_APP_SECRET",
  "PAYHERE_CANCEL_URL",
  "PAYHERE_MERCHANT_ID",
  "PAYHERE_MERCHANT_SECRET",
  "PAYHERE_MODE",
  "PAYHERE_NOTIFY_RATE_LIMIT_MAX",
  "PAYHERE_NOTIFY_RATE_LIMIT_WINDOW_MS",
  "PAYHERE_NOTIFY_URL",
  "PAYHERE_RETRIEVAL_TIMEOUT_MS",
  "PAYHERE_RETURN_URL",
  "PAYMENT_CURRENCY",
  "PORT",
  "RATE_LIMIT_MAX",
  "RATE_LIMIT_WINDOW_MS",
  "REQUEST_BODY_LIMIT",
  "SES_FROM_EMAIL",
  "SMTP_HOST",
  "SMTP_PASS",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "STAGING_NOTIFICATION_RECIPIENT",
  "TRACKING_PORTAL_BASE_URL",
  "VITE_API_BASE_URL",
]);

const OPERATIONAL_TTL_VARIABLES = new Set([
  "OSMS_CHATBOT_INDEX_MODE",
  "OSMS_TARGET_DATABASE",
]);

const REQUIRED_EMPTY_SECRETS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "PAYHERE_MERCHANT_ID",
  "PAYHERE_MERCHANT_SECRET",
  "PAYHERE_API_APP_ID",
  "PAYHERE_API_APP_SECRET",
];

const DISABLED_NOTIFICATION_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "STAGING_NOTIFICATION_RECIPIENT",
];

const URL_VARIABLES = [
  "VITE_API_BASE_URL",
  "FRONTEND_ORIGIN",
  "FRONTEND_URL",
  "PAYHERE_RETURN_URL",
  "PAYHERE_CANCEL_URL",
  "PAYHERE_NOTIFY_URL",
  "TRACKING_PORTAL_BASE_URL",
];

function parseConfig(source) {
  const entries = new Map();
  const lines = source.split(/\r?\n/);

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = rawLine.indexOf("=");
    const key = separator > 0 ? rawLine.slice(0, separator).trim() : "";
    if (separator <= 0 || !/^[A-Z][A-Z0-9_]*$/.test(key)) {
      throw new Error(`Malformed configuration line ${index + 1}.`);
    }
    if (entries.has(key)) {
      throw new Error(`Duplicate configuration variable ${key}.`);
    }

    entries.set(key, rawLine.slice(separator + 1).trim());
  }

  return entries;
}

function loadTemplate() {
  return parseConfig(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function copyConfig(config, overrides = {}) {
  return new Map([...config, ...Object.entries(overrides)]);
}

function assertEmpty(config, key, message) {
  if (config.get(key) !== "") assert.fail(message);
}

function assertTextMatches(source, pattern, message) {
  if (!pattern.test(source)) assert.fail(message);
}

function captureError(callback) {
  try {
    callback();
  } catch (error) {
    return error;
  }
  assert.fail("Expected validation to reject the fixture.");
}

function validateMandatorySettings(config) {
  const expected = {
    NODE_ENV: "production",
    PAYHERE_MODE: "sandbox",
    PAYMENT_CURRENCY: "LKR",
    OSMS_TARGET_DATABASE: "osms-staging",
    OSMS_CHATBOT_INDEX_MODE: "verify",
  };
  for (const [key, value] of Object.entries(expected)) {
    if (config.get(key) !== value) {
      assert.fail(`${key} must use its approved staging value.`);
    }
  }
}

function validateNonDeployableMarker(source) {
  assertTextMatches(
    source,
    /NON-SECRET EXAMPLE ONLY/,
    "The staging example must identify itself as non-secret.",
  );
  assertTextMatches(
    source,
    /Do not load this file directly into any environment/,
    "The staging example must prohibit direct environment loading.",
  );
  assertTextMatches(
    source,
    /fictional and intentionally non-deployable/,
    "The staging example must identify its values as non-deployable.",
  );
}

function parseHttpsUrl(config, key) {
  let parsed;
  try {
    parsed = new URL(config.get(key));
  } catch {
    assert.fail(`${key} must be a valid absolute URL.`);
  }
  if (parsed.protocol !== "https:") assert.fail(`${key} must use HTTPS.`);
  if (parsed.username || parsed.password) {
    assert.fail(`${key} must not contain URL credentials.`);
  }
  if (!parsed.hostname.endsWith(".example")) {
    assert.fail(`${key} must use a reserved .example host.`);
  }
  if (parsed.hostname === "localhost") assert.fail(`${key} must not use localhost.`);
  if (/^(?:127\.|0\.0\.0\.0$|\[?::1\]?$)/.test(parsed.hostname)) {
    assert.fail(`${key} must not use loopback.`);
  }
  return parsed;
}

function validateHttpsAndCors(config) {
  const urls = Object.fromEntries(
    URL_VARIABLES.map((key) => [key, parseHttpsUrl(config, key)]),
  );

  if (config.get("FRONTEND_ORIGIN") === "*") {
    assert.fail("FRONTEND_ORIGIN must not be wildcard.");
  }
  if (config.get("FRONTEND_ORIGIN") !== urls.FRONTEND_ORIGIN.origin) {
    assert.fail("FRONTEND_ORIGIN must be an exact origin without a path, query or fragment.");
  }
  if (config.get("FRONTEND_URL") !== urls.FRONTEND_URL.origin) {
    assert.fail("FRONTEND_URL must be an exact origin without a path, query or fragment.");
  }
  if (urls.FRONTEND_ORIGIN.origin !== urls.FRONTEND_URL.origin) {
    assert.fail("FRONTEND_ORIGIN and FRONTEND_URL must match.");
  }
  if (urls.VITE_API_BASE_URL.pathname !== "/api") {
    assert.fail("VITE_API_BASE_URL must end at /api.");
  }
  if (urls.PAYHERE_RETURN_URL.pathname !== "/payments/return") {
    assert.fail("PAYHERE_RETURN_URL must use the approved return path.");
  }
  if (urls.PAYHERE_CANCEL_URL.pathname !== "/payments/cancel") {
    assert.fail("PAYHERE_CANCEL_URL must use the approved cancel path.");
  }
  if (urls.PAYHERE_NOTIFY_URL.pathname !== "/api/payments/notify") {
    assert.fail("PAYHERE_NOTIFY_URL must use the approved notification path.");
  }
  if (urls.PAYHERE_RETURN_URL.host !== urls.FRONTEND_ORIGIN.host) {
    assert.fail("PAYHERE_RETURN_URL must use the approved frontend host.");
  }
  if (urls.PAYHERE_CANCEL_URL.host !== urls.FRONTEND_ORIGIN.host) {
    assert.fail("PAYHERE_CANCEL_URL must use the approved frontend host.");
  }
  if (urls.TRACKING_PORTAL_BASE_URL.host !== urls.FRONTEND_ORIGIN.host) {
    assert.fail("TRACKING_PORTAL_BASE_URL must use the approved frontend host.");
  }
  if (urls.PAYHERE_NOTIFY_URL.host !== urls.VITE_API_BASE_URL.host) {
    assert.fail("PAYHERE_NOTIFY_URL must use the approved backend host.");
  }
}

function validateEnvironmentIsolation(config) {
  const database = config.get("OSMS_TARGET_DATABASE");
  if (database !== "osms-staging") {
    assert.fail("The example database must be osms-staging.");
  }
  if (/(?:^|[-_])(?:dev|development|prod|production)(?:$|[-_])/i.test(database)) {
    assert.fail("The example database must not select development or production.");
  }
  assertEmpty(
    config,
    "MONGODB_URI",
    "MONGODB_URI must remain empty until operator injection.",
  );

  const forbiddenResource = /(?:^arn:aws:|\.amazonaws\.com|\.vercel\.app|\.mongodb\.net|darshanaopticals\.)/i;
  for (const [key, value] of config) {
    if (forbiddenResource.test(value)) {
      assert.fail(`${key} must not contain a real cloud resource identifier.`);
    }
  }
}

function validateEmptySecrets(config) {
  for (const key of REQUIRED_EMPTY_SECRETS) {
    assertEmpty(config, key, `${key} must remain empty for platform injection.`);
  }
}

function validateNoObviousCredentials(config) {
  const patterns = [
    /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /mongodb(?:\+srv)?:\/\/[^\s:/]+:[^\s@/]+@/i,
    /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
    /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  ];

  for (const [key, value] of config) {
    if (patterns.some((pattern) => pattern.test(value))) {
      assert.fail(`Credential-like value detected in ${key}.`);
    }
  }
}

function validateNotificationsDisabled(config) {
  for (const key of DISABLED_NOTIFICATION_VARIABLES) {
    assertEmpty(config, key, `${key} must remain empty while delivery is disabled.`);
  }
}

test("structure: staging configuration file exists", () => {
  assert.equal(fs.existsSync(CONFIG_PATH), true);
});

test("structure: parser ignores comments and blanks and preserves values after the first equals", () => {
  const parsed = parseConfig("# comment\n\nFIRST=value=with=equals\nSECOND=two\n");
  assert.deepEqual([...parsed], [
    ["FIRST", "value=with=equals"],
    ["SECOND", "two"],
  ]);
});

test("structure: parser rejects malformed lines without echoing their contents", () => {
  const sensitiveFixture = "not-an-assignment-with-sensitive-material";
  const error = captureError(() => parseConfig(sensitiveFixture));
  assert.match(error.message, /Malformed configuration line 1/);
  assert.equal(error.message.includes(sensitiveFixture), false);
});

test("structure: parser rejects duplicate assignment names", () => {
  assert.throws(
    () => parseConfig("NODE_ENV=production\nNODE_ENV=test\n"),
    /Duplicate configuration variable NODE_ENV/,
  );
});

test("structure: all required application and TTL variables exist", () => {
  const config = loadTemplate();
  const required = new Set([...APPLICATION_VARIABLES, ...OPERATIONAL_TTL_VARIABLES]);
  const missing = [...required].filter((key) => !config.has(key));
  assert.equal(required.size, 45);
  assert.equal(config.size, 45);
  assert.deepEqual(missing, []);
});

test("structure: application variables match the source-verified allowlist", () => {
  const config = loadTemplate();
  const supported = new Set([...APPLICATION_VARIABLES, ...OPERATIONAL_TTL_VARIABLES]);
  const unsupported = [...config.keys()].filter((key) => !supported.has(key));
  assert.deepEqual(unsupported, []);
  assert.deepEqual(
    [...OPERATIONAL_TTL_VARIABLES].filter((key) => APPLICATION_VARIABLES.has(key)),
    [],
  );
});

test("mandatory: approved staging values are fixed", () => {
  validateMandatorySettings(loadTemplate());
});

test("mandatory: example is clearly marked non-deployable", () => {
  const source = fs.readFileSync(CONFIG_PATH, "utf8");
  validateNonDeployableMarker(source);

  const unsafeSource = "JWT_SECRET=fixture-sensitive-source";
  const error = captureError(() => validateNonDeployableMarker(unsafeSource));
  assert.equal(error.message.includes(unsafeSource), false);
  assert.equal(error.message.includes("fixture-sensitive-source"), false);
});

test("https: all endpoint hosts are reserved HTTPS examples without credentials or loopback", () => {
  const config = loadTemplate();
  for (const key of URL_VARIABLES) parseHttpsUrl(config, key);
});

test("https: CORS, API and PayHere callback origins and paths are consistent", () => {
  validateHttpsAndCors(loadTemplate());
});

test("isolation: only the staging database identifier is selected and real resources stay absent", () => {
  validateEnvironmentIsolation(loadTemplate());
});

test("secrets: platform-injected values remain empty and no obvious credential is committed", () => {
  const config = loadTemplate();
  validateEmptySecrets(config);
  validateNoObviousCredentials(config);
});

test("notifications: SMTP and the ineffective staging recipient redirect remain disabled", () => {
  const config = loadTemplate();
  const source = fs.readFileSync(CONFIG_PATH, "utf8");
  validateNotificationsDisabled(config);
  if (config.get("NODE_ENV") !== "production") {
    assert.fail("Notification safety requires the approved backend runtime mode.");
  }
  assertTextMatches(
    source,
    /Do not rely on this redirect/,
    "The staging example must document the recipient redirect limitation.",
  );
  assertTextMatches(
    source,
    /Real delivery requires separate authorization/,
    "The staging example must require authorization before notification delivery.",
  );
});

test("compatibility: local development and existing TTL operations remain separate", () => {
  const staging = loadTemplate();
  const local = parseConfig(fs.readFileSync(LOCAL_ENV_PATH, "utf8"));
  const stagingRunbook = fs.readFileSync(STAGING_RUNBOOK_PATH, "utf8");
  const ttlRunbook = fs.readFileSync(TTL_RUNBOOK_PATH, "utf8");
  const ttlScript = fs.readFileSync(TTL_SCRIPT_PATH, "utf8");

  if (local.get("NODE_ENV") !== "development") {
    assert.fail("The local environment contract must remain development-only.");
  }
  if (local.get("MONGODB_DATABASE") === staging.get("OSMS_TARGET_DATABASE")) {
    assert.fail("Local and staging database identifiers must remain separate.");
  }
  assertTextMatches(
    stagingRunbook,
    /NODE_ENV=production/,
    "The staging runbook must retain the approved runtime mode.",
  );
  assertTextMatches(
    stagingRunbook,
    /PAYHERE_MODE=sandbox/,
    "The staging runbook must retain PayHere sandbox mode.",
  );
  assertTextMatches(
    ttlRunbook,
    /OSMS_TARGET_DATABASE/,
    "The TTL runbook must retain the explicit target database requirement.",
  );
  assertTextMatches(
    ttlRunbook,
    /OSMS_CHATBOT_INDEX_MODE=apply/,
    "The TTL runbook must retain the reviewed apply mode.",
  );
  assertTextMatches(
    ttlScript,
    /process\.env\.OSMS_TARGET_DATABASE/,
    "The TTL script must retain the target database guard.",
  );
  assertTextMatches(
    ttlScript,
    /\["verify", "apply", "smoke"\]/,
    "The TTL script must retain its approved modes.",
  );
});

test("negative: live PayHere mode is rejected", () => {
  const unsafe = "live";
  const error = captureError(() =>
    validateMandatorySettings(copyConfig(loadTemplate(), { PAYHERE_MODE: unsafe })),
  );
  assert.match(error.message, /PAYHERE_MODE/);
  assert.equal(error.message.includes(unsafe), false);
});

test("negative: an HTTP staging endpoint is rejected", () => {
  const unsafe = "http://api.example/private?token=fixture-sensitive-url";
  const error = captureError(() =>
    validateHttpsAndCors(copyConfig(loadTemplate(), { VITE_API_BASE_URL: unsafe })),
  );
  assert.match(error.message, /VITE_API_BASE_URL must use HTTPS/);
  assert.equal(error.message.includes(unsafe), false);
  assert.equal(error.message.includes("fixture-sensitive-url"), false);
});

test("negative: wildcard CORS is rejected", () => {
  assert.throws(
    () => validateHttpsAndCors(copyConfig(loadTemplate(), { FRONTEND_ORIGIN: "*" })),
    /FRONTEND_ORIGIN/,
  );
});

test("negative: a CORS origin containing a path is rejected", () => {
  const unsafe = "https://osms-staging-frontend.example/private?token=fixture-sensitive-cors";
  const error = captureError(() =>
    validateHttpsAndCors(
      copyConfig(loadTemplate(), {
        FRONTEND_ORIGIN: unsafe,
      }),
    ),
  );
  assert.match(error.message, /FRONTEND_ORIGIN must be an exact origin/);
  assert.equal(error.message.includes(unsafe), false);
  assert.equal(error.message.includes("fixture-sensitive-cors"), false);
});

test("negative: a nonempty platform secret is rejected", () => {
  const unsafe = "fixture-value-not-a-real-secret";
  const error = captureError(() =>
    validateEmptySecrets(copyConfig(loadTemplate(), { JWT_SECRET: unsafe })),
  );
  assert.match(error.message, /JWT_SECRET/);
  assert.equal(error.message.includes(unsafe), false);
});

test("negative: credential-like values are rejected without disclosure", () => {
  const unsafe = `AKIA${"A".repeat(16)}`;
  const error = captureError(() =>
    validateNoObviousCredentials(
      copyConfig(loadTemplate(), { ONLINE_FULFILLMENT_BRANCH_CODE: unsafe }),
    ),
  );
  assert.match(error.message, /ONLINE_FULFILLMENT_BRANCH_CODE/);
  assert.equal(error.message.includes(unsafe), false);
});

test("negative: configured SMTP delivery is rejected", () => {
  assert.throws(
    () =>
      validateNotificationsDisabled(
        copyConfig(loadTemplate(), {
          SMTP_HOST: "smtp.notifications.example",
          SMTP_USER: "staging-sender",
          SMTP_PASS: "fixture-value",
        }),
      ),
    /SMTP_HOST/,
  );
});

test("negative: development and production database identifiers are rejected", () => {
  for (const database of ["osms-dev", "osms-production"]) {
    assert.throws(
      () =>
        validateEnvironmentIsolation(
          copyConfig(loadTemplate(), { OSMS_TARGET_DATABASE: database }),
        ),
      /osms-staging/,
    );
  }
});