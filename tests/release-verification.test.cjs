const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CHECKLIST_PATH = path.join(ROOT, "docs", "release", "release-checklist.md");
const MANIFEST_PATH = path.join(ROOT, "docs", "release", "release-manifest.md");
const ROLLBACK_PATH = path.join(ROOT, "docs", "release", "rollback.md");
const QUALITY_GATES_PATH = path.join(ROOT, "docs", "release", "quality-gates.md");
const RELEASE_NOTES_PATH = path.join(ROOT, "docs", "release", "release-notes.md");

test("release-artifacts: required release documentation files exist", () => {
  assert.ok(fs.existsSync(CHECKLIST_PATH), "release-checklist.md must exist");
  assert.ok(fs.existsSync(MANIFEST_PATH), "release-manifest.md must exist");
  assert.ok(fs.existsSync(ROLLBACK_PATH), "rollback.md must exist");
  assert.ok(fs.existsSync(QUALITY_GATES_PATH), "quality-gates.md must exist");
  assert.ok(fs.existsSync(RELEASE_NOTES_PATH), "release-notes.md must exist");
});

test("release-notes: documents changelog, smoke-test register, and sign-off declaration", () => {
  const content = fs.readFileSync(RELEASE_NOTES_PATH, "utf8");
  assert.ok(content.includes("v1.0.0"), "Must state version v1.0.0");
  assert.ok(content.includes("Comprehensive Module Changelog"), "Must have module changelog");
  assert.ok(content.includes("Final Staging Smoke-Test Register"), "Must have smoke-test register");
  assert.ok(content.includes("READY FOR RELEASE"), "Must declare READY FOR RELEASE sign-off");
  assert.ok(content.includes("https://osms-backend-staging.onrender.com"), "Must list Render backend URL");
  assert.ok(content.includes("https://osms-frontend-staging.vercel.app"), "Must list Vercel frontend URL");
});

test("release-checklist: covers all 24 Acceptance Criteria (AC1 to AC24)", () => {
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

test("release-manifest: documents all 4 repositories, SemVer v1.0.0, and cloud runtimes", () => {
  const content = fs.readFileSync(MANIFEST_PATH, "utf8");
  assert.ok(content.includes("darshana-opticals-osms/backend"), "Must list backend repo");
  assert.ok(content.includes("darshana-opticals-osms/frontend"), "Must list frontend repo");
  assert.ok(content.includes("darshana-opticals-osms/infra"), "Must list infra repo");
  assert.ok(content.includes("darshana-opticals-osms/documents"), "Must list documents repo");
  assert.ok(content.includes("v1.0.0"), "Must declare version v1.0.0");
  assert.ok(content.includes("Render.com"), "Must document Render.com backend runtime");
  assert.ok(content.includes("Vercel"), "Must document Vercel frontend runtime");
  assert.ok(content.includes("osms-staging"), "Must document staging database");
  assert.ok(content.includes("develop"), "Must identify develop as source branch");
  assert.ok(content.includes("main"), "Must identify main as target branch");
});

test("rollback: documents non-destructive policies and component rollback procedures", () => {
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

test("quality-gates: documents all 6 required quality gates and evidence", () => {
  const content = fs.readFileSync(QUALITY_GATES_PATH, "utf8");
  assert.ok(content.includes("Backend Continuous Integration Gate"), "Gate 1 must be Backend CI");
  assert.ok(content.includes("Frontend Continuous Integration Gate"), "Gate 2 must be Frontend CI");
  assert.ok(content.includes("Critical Integration & E2E Workflows Gate"), "Gate 3 must be E2E Workflows");
  assert.ok(content.includes("OWASP Security Release Gate"), "Gate 4 must be OWASP Security");
  assert.ok(content.includes("Performance & Reliability Gate"), "Gate 5 must be Performance & Reliability");
  assert.ok(content.includes("Final Documentation Package Gate"), "Gate 6 must be Documentation Package");
  assert.ok(content.includes("v1.0.0"), "Must reference release version v1.0.0");
});

test("security-audit: zero sensitive credentials or private keys in release documentation", () => {
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
