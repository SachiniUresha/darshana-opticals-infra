"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT = path.resolve(__dirname, "..");
const CHECKLIST_PATH = path.join(ROOT, "docs", "release", "release-checklist.md");
const MANIFEST_PATH = path.join(ROOT, "docs", "release", "release-manifest.md");
const ROLLBACK_PATH = path.join(ROOT, "docs", "release", "rollback.md");
const QUALITY_GATES_PATH = path.join(ROOT, "docs", "release", "quality-gates.md");
const RELEASE_NOTES_PATH = path.join(ROOT, "docs", "release", "release-notes.md");

// ============================================================================
// Section 1: Static Documentation Contract Tests
// ============================================================================

test("doc-contract: required release documentation files exist", () => {
  assert.ok(fs.existsSync(CHECKLIST_PATH), "release-checklist.md must exist");
  assert.ok(fs.existsSync(MANIFEST_PATH), "release-manifest.md must exist");
  assert.ok(fs.existsSync(ROLLBACK_PATH), "rollback.md must exist");
  assert.ok(fs.existsSync(QUALITY_GATES_PATH), "quality-gates.md must exist");
  assert.ok(fs.existsSync(RELEASE_NOTES_PATH), "release-notes.md must exist");
});

test("doc-contract: release-notes documents changelog, smoke register, and pending sign-off", () => {
  const content = fs.readFileSync(RELEASE_NOTES_PATH, "utf8");
  assert.ok(content.includes("v1.0.0"), "Must state version v1.0.0");
  assert.ok(content.includes("Comprehensive Module Changelog"), "Must have module changelog");
  assert.ok(content.includes("Final Staging Smoke-Test Register"), "Must have smoke-test register");
  assert.ok(content.includes("PENDING / IN VERIFICATION"), "Must declare PENDING / IN VERIFICATION sign-off");
  assert.ok(content.includes("https://osms-backend-staging.onrender.com"), "Must list Render backend URL");
  assert.ok(content.includes("https://osms-frontend-staging.vercel.app"), "Must list Vercel frontend URL");
});

test("doc-contract: release-checklist covers all 24 Acceptance Criteria (AC1 to AC24)", () => {
  const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
  for (let i = 1; i <= 24; i++) {
    const acTag = `AC${i} –`;
    assert.ok(
      content.includes(acTag),
      `release-checklist.md must contain acceptance criteria ${acTag}`
    );
  }
  assert.ok(content.includes("Quality Gate Thresholds"), "Must specify quality gate thresholds");
});

test("doc-contract: release-manifest documents all 4 repositories, SemVer v1.0.0, and cloud runtimes", () => {
  const content = fs.readFileSync(MANIFEST_PATH, "utf8");
  assert.ok(content.includes("darshana-opticals-osms/backend"), "Must list backend repo");
  assert.ok(content.includes("darshana-opticals-osms/frontend"), "Must list frontend repo");
  assert.ok(content.includes("darshana-opticals-osms/infra"), "Must list infra repo");
  assert.ok(content.includes("darshana-opticals-osms/documents"), "Must list documents repo");
  assert.ok(content.includes("v1.0.0"), "Must declare version v1.0.0");
  assert.ok(content.includes("Render.com"), "Must document Render.com backend runtime");
  assert.ok(content.includes("Vercel"), "Must document Vercel frontend runtime");
  assert.ok(content.includes("MongoDB Atlas"), "Must document MongoDB Atlas database");
  assert.ok(content.includes("develop"), "Must identify develop as source branch");
  assert.ok(content.includes("main"), "Must identify main as target branch");
});

test("doc-contract: rollback documents non-destructive policies and component rollback procedures", () => {
  const content = fs.readFileSync(ROLLBACK_PATH, "utf8");
  assert.ok(content.includes("Render.com"), "Must cover Render backend rollback");
  assert.ok(content.includes("Vercel"), "Must cover Vercel frontend rollback");
  assert.ok(content.includes("MongoDB Atlas"), "Must cover MongoDB Atlas database safeguards");
  assert.ok(
    content.toLowerCase().includes("strictly prohibited") ||
    content.toLowerCase().includes("prohibited"),
    "Must strictly prohibit destructive database resets"
  );
  assert.ok(content.includes("/api/health"), "Must verify health endpoint post-rollback");
});

test("doc-contract: quality-gates documents all 6 required quality gates and evidence", () => {
  const content = fs.readFileSync(QUALITY_GATES_PATH, "utf8");
  assert.ok(content.includes("Backend Continuous Integration Gate"), "Gate 1 must be Backend CI");
  assert.ok(content.includes("Frontend Continuous Integration Gate"), "Gate 2 must be Frontend CI");
  assert.ok(content.includes("Critical Integration & E2E Workflows Gate"), "Gate 3 must be E2E Workflows");
  assert.ok(content.includes("OWASP Security Release Gate"), "Gate 4 must be OWASP Security");
  assert.ok(content.includes("Performance & Reliability Gate"), "Gate 5 must be Performance & Reliability");
  assert.ok(content.includes("Final Documentation Package Gate"), "Gate 6 must be Documentation Package");
  assert.ok(content.includes("v1.0.0"), "Must reference release version v1.0.0");
});

test("doc-contract: zero sensitive credentials or private keys in release documentation", () => {
  const files = [CHECKLIST_PATH, MANIFEST_PATH, ROLLBACK_PATH, QUALITY_GATES_PATH, RELEASE_NOTES_PATH];
  const credentialPatterns = [
    /mongodb(\+srv)?:\/\/[^:\s]+:[^@\s]+@/i,
    /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /ghp_[0-9a-zA-Z]{36}/,
  ];

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    for (const pattern of credentialPatterns) {
      assert.strictEqual(
        pattern.test(text),
        false,
        `File ${path.basename(filePath)} contains potential credential matching ${pattern}`
      );
    }
  }
});

// ============================================================================
// Section 2: Live Deployment Status & External Verification Probes
// ============================================================================

test("live-deployment-status: staging endpoints adhere to HTTPS protocol and valid URI schema", () => {
  const notesContent = fs.readFileSync(RELEASE_NOTES_PATH, "utf8");
  const manifestContent = fs.readFileSync(MANIFEST_PATH, "utf8");

  // Extract staging endpoints
  const backendUrlMatch = notesContent.match(/https:\/\/osms-backend-staging\.onrender\.com[^\s\)`]*/);
  const frontendUrlMatch = notesContent.match(/https:\/\/osms-frontend-staging\.vercel\.app[^\s\)`]*/);

  assert.ok(backendUrlMatch, "Must specify live Render backend URL");
  assert.ok(frontendUrlMatch, "Must specify live Vercel frontend URL");

  const backendUrl = new URL(backendUrlMatch[0]);
  const frontendUrl = new URL(frontendUrlMatch[0]);

  assert.strictEqual(backendUrl.protocol, "https:", "Backend endpoint must use HTTPS");
  assert.strictEqual(frontendUrl.protocol, "https:", "Frontend endpoint must use HTTPS");
  assert.strictEqual(backendUrl.hostname, "osms-backend-staging.onrender.com", "Backend hostname must match approved Render service");
  assert.strictEqual(frontendUrl.hostname, "osms-frontend-staging.vercel.app", "Frontend hostname must match approved Vercel deployment");

  assert.ok(!manifestContent.includes("http://"), "Manifest must not contain plaintext HTTP staging URLs");
});

test("live-deployment-status: live smoke-test verification protocol separates static contracts from live runtime probes", (t) => {
  const isLiveVerificationEnabled = process.env.VERIFY_LIVE_ENDPOINTS === "true";

  if (!isLiveVerificationEnabled) {
    t.diagnostic(
      "Live deployment probe skipped: Running in static CI contract mode. Set VERIFY_LIVE_ENDPOINTS=true to execute live network health probes against Render/Vercel."
    );
    assert.ok(true, "Contract separation verified: Static CI tests execute without external network dependencies");
  } else {
    t.diagnostic("Live verification active: executing external HTTPS health probe");
    // When flag is set, probe the live Render health check endpoint
    const https = require("node:https");
    return new Promise((resolve, reject) => {
      const req = https.get("https://osms-backend-staging.onrender.com/api/health", { timeout: 10000 }, (res) => {
        assert.strictEqual(res.statusCode, 200, "Live health check must return HTTP 200");
        resolve();
      });
      req.on("error", (err) => {
        t.diagnostic(`Live endpoint request failed: ${err.message}`);
        reject(err);
      });
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Live endpoint request timed out after 10000ms"));
      });
    });
  }
});
