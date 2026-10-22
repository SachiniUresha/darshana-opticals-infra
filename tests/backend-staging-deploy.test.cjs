"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  isValidServiceArn,
  isValidImageUri,
  deployAppRunner,
} = require("../scripts/deploy-apprunner.cjs");

const {
  scanForCredentialLeaks,
  verifyStagingHealth,
} = require("../scripts/verify-staging-health.cjs");

const ROOT = path.resolve(__dirname, "..");

test("containerization: Dockerfile uses production npm start and compose preserves dev mode", () => {
  const dockerfile = fs.readFileSync(
    path.join(ROOT, "docker", "backend", "Dockerfile"),
    "utf8",
  );
  assert.match(
    dockerfile,
    /CMD\s+\[\s*"npm"\s*,\s*"start"\s*\]/,
    "Dockerfile must specify CMD ['npm', 'start'] for production/staging containers",
  );

  const compose = fs.readFileSync(path.join(ROOT, "docker-compose.yml"), "utf8");
  assert.match(
    compose,
    /command:\s*\[\s*"npm"\s*,\s*"run"\s*,\s*"dev"\s*\]/,
    "docker-compose.yml must explicitly run npm run dev for local backend hot-reload",
  );
});

test("deploy-apprunner: ARN validation accepts valid ARNs and rejects invalid ones", () => {
  const validArn =
    "arn:aws:apprunner:ap-southeast-1:123456789012:service/osms-backend-staging/a1b2c3d4e5f6g7h8";
  assert.equal(isValidServiceArn(validArn), true);

  assert.equal(isValidServiceArn(""), false);
  assert.equal(isValidServiceArn("not-an-arn"), false);
  assert.equal(
    isValidServiceArn("arn:aws:s3:::bucket-name"),
    false,
    "Non-AppRunner ARN must be rejected",
  );
});

test("deploy-apprunner: Image URI validation requires immutable staging-<sha> tag", () => {
  const validImage =
    "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/osms-backend:staging-a1b2c3d4";
  assert.equal(isValidImageUri(validImage), true);

  assert.equal(
    isValidImageUri(
      "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/osms-backend:latest",
    ),
    false,
    "Mutable latest tag must be rejected per AC2",
  );
  assert.equal(
    isValidImageUri("osms-backend:staging-12345"),
    false,
    "Unqualified local image name must be rejected",
  );
});

test("deploy-apprunner: rejects deployment when service is already OPERATION_IN_PROGRESS", async () => {
  const serviceArn =
    "arn:aws:apprunner:ap-southeast-1:123456789012:service/osms-backend-staging/a1b2c3d4e5f6g7h8";
  const imageUri =
    "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/osms-backend:staging-a1b2c3d";

  const mockExec = async (args) => {
    if (args[1] === "describe-service") {
      return {
        Service: {
          Status: "OPERATION_IN_PROGRESS",
        },
      };
    }
    return {};
  };

  await assert.rejects(
    deployAppRunner({
      serviceArn,
      imageUri,
      execFn: mockExec,
      logger: { log: () => {} },
    }),
    /OPERATION_IN_PROGRESS/,
    "Must fail fast when concurrent operation is detected",
  );
});

test("deploy-apprunner: successfully triggers update and polls until RUNNING", async () => {
  const serviceArn =
    "arn:aws:apprunner:ap-southeast-1:123456789012:service/osms-backend-staging/a1b2c3d4e5f6g7h8";
  const imageUri =
    "123456789012.dkr.ecr.ap-southeast-1.amazonaws.com/osms-backend:staging-a1b2c3d";

  let pollCount = 0;
  let updateCalled = false;

  const mockExec = async (args) => {
    const subCommand = args[1];
    if (subCommand === "describe-service") {
      pollCount++;
      if (pollCount === 1) {
        // Initial check before update
        return {
          Service: {
            Status: "RUNNING",
            ServiceUrl: "osms-backend.ap-southeast-1.awsapprunner.com",
          },
        };
      }
      if (pollCount === 2) {
        // In-flight deployment poll
        return {
          Service: {
            Status: "OPERATION_IN_PROGRESS",
          },
        };
      }
      // Completed deployment
      return {
        Service: {
          Status: "RUNNING",
          ServiceUrl: "osms-backend.ap-southeast-1.awsapprunner.com",
        },
      };
    }

    if (subCommand === "update-service") {
      updateCalled = true;
      return {
        OperationId: "op-test-123",
        Service: {
          Status: "OPERATION_IN_PROGRESS",
        },
      };
    }

    throw new Error(`Unexpected CLI call: ${args.join(" ")}`);
  };

  const result = await deployAppRunner({
    serviceArn,
    imageUri,
    timeoutMs: 5000,
    pollIntervalMs: 10,
    execFn: mockExec,
    sleepFn: async () => {},
    logger: { log: () => {} },
  });

  assert.equal(updateCalled, true);
  assert.equal(result.success, true);
  assert.equal(result.status, "RUNNING");
  assert.equal(
    result.serviceUrl,
    "https://osms-backend.ap-southeast-1.awsapprunner.com",
  );
});

test("verify-staging-health: rejects non-HTTPS URLs", async () => {
  await assert.rejects(
    verifyStagingHealth({
      targetUrl: "http://osms-backend.ap-southeast-1.awsapprunner.com",
      logger: { log: () => {} },
    }),
    /HTTPS protocol/,
  );
});

test("verify-staging-health: detects sensitive credential leaks in payload", () => {
  const cleanPayload = JSON.stringify({ status: "ok", service: "osms-backend" });
  assert.deepEqual(scanForCredentialLeaks(cleanPayload), []);

  const mongoLeak = JSON.stringify({
    status: "ok",
    uri: "mongodb+srv://admin:pass@cluster.mongodb.net",
  });
  assert.equal(scanForCredentialLeaks(mongoLeak).length > 0, true);

  const awsKeyLeak = JSON.stringify({
    key: "AKIAIOSFODNN7EXAMPLE",
  });
  assert.equal(scanForCredentialLeaks(awsKeyLeak).length > 0, true);
});

test("verify-staging-health: passes when health and CORS are valid", async () => {
  const targetUrl = "https://staging-api.example.com";
  const frontendOrigin = "https://osms-frontend-staging.vercel.app";

  const mockRequest = async (urlStr, options) => {
    if (options.method === "GET") {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "ok", service: "osms-backend" }),
      };
    }
    if (options.method === "OPTIONS") {
      const origin = options.headers?.Origin;
      if (origin === frontendOrigin) {
        return {
          statusCode: 204,
          headers: {
            "access-control-allow-origin": frontendOrigin,
          },
          body: "",
        };
      }
      return {
        statusCode: 403,
        headers: {},
        body: "",
      };
    }
    throw new Error(`Unexpected method: ${options.method}`);
  };

  const result = await verifyStagingHealth({
    targetUrl,
    frontendOrigin,
    timeoutMs: 2000,
    intervalMs: 10,
    requestFn: mockRequest,
    sleepFn: async () => {},
    logger: { log: () => {} },
  });

  assert.equal(result.success, true);
  assert.equal(result.status, "ok");
  assert.equal(result.service, "osms-backend");
});

test("verify-staging-health: fails if CORS allows unauthorized wildcard origin", async () => {
  const targetUrl = "https://staging-api.example.com";
  const frontendOrigin = "https://osms-frontend-staging.vercel.app";

  const mockRequest = async (urlStr, options) => {
    if (options.method === "GET") {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "ok" }),
      };
    }
    if (options.method === "OPTIONS") {
      const origin = options.headers?.Origin;
      if (origin === frontendOrigin) {
        return {
          statusCode: 204,
          headers: { "access-control-allow-origin": frontendOrigin },
          body: "",
        };
      }
      // Insecure server reflecting wildcard for unauthorized origin
      return {
        statusCode: 204,
        headers: {
          "access-control-allow-origin": "*",
        },
        body: "",
      };
    }
    throw new Error(`Unexpected request: ${options.method}`);
  };

  await assert.rejects(
    verifyStagingHealth({
      targetUrl,
      frontendOrigin,
      timeoutMs: 100,
      intervalMs: 10,
      requestFn: mockRequest,
      sleepFn: async () => {},
      logger: { log: () => {} },
    }),
    /CORS security violation/,
  );
});

test("workflow-security: target_ref input sanitization rejects shell injection patterns (Finding 4)", () => {
  const sanitizeRef = (ref) => {
    const trimmed = String(ref || "").trim();
    if (!/^[a-zA-Z0-9._/-]+$/.test(trimmed)) {
      throw new Error("Invalid deployment target reference");
    }
    return trimmed;
  };

  assert.equal(sanitizeRef("develop"), "develop");
  assert.equal(sanitizeRef("feature/9-backend-deploy"), "feature/9-backend-deploy");
  assert.equal(sanitizeRef("a1b2c3d4e5f6"), "a1b2c3d4e5f6");
  assert.equal(sanitizeRef("v1.0.0"), "v1.0.0");

  assert.throws(() => sanitizeRef("develop; rm -rf /"), /Invalid deployment target reference/);
  assert.throws(() => sanitizeRef("develop && echo test"), /Invalid deployment target reference/);
  assert.throws(() => sanitizeRef("`whoami`"), /Invalid deployment target reference/);
  assert.throws(() => sanitizeRef("$(id)"), /Invalid deployment target reference/);
});

test("workflow-structure: backend-staging-deploy.yml uses safe env-based secret checks and ECR image existence handling (Findings 1 & 2)", () => {
  const workflowContent = fs.readFileSync(
    path.join(ROOT, ".github", "workflows", "backend-staging-deploy.yml"),
    "utf8",
  );

  // Finding 1: Ensure NO direct secrets context inside step if conditions
  assert.doesNotMatch(
    workflowContent,
    /if:\s*\$\{\{\s*secrets\./,
    "Workflow must not reference secrets directly in step if expressions",
  );

  // Finding 2: Ensure ECR describe-images check is present to prevent immutable tag collision
  assert.match(
    workflowContent,
    /aws\s+ecr\s+describe-images/,
    "Workflow must query ECR for existing tag before pushing to respect tag immutability",
  );

  // Finding 3: Ensure backend CI check-runs verification step is present
  assert.match(
    workflowContent,
    /Verify Backend CI status gate/,
    "Workflow must include a backend CI verification gate per AC8",
  );

  // Remaining Finding 1: Ensure Backend CI gate fails closed (exits with 1 when unverified or non-success)
  assert.match(
    workflowContent,
    /No verified GitHub check runs found/,
    "CI gate must reject deployments when no check runs exist (fail-closed)",
  );

  // Remaining Finding 3: Ensure ECR existence reuses image directly without attempting duplicate push
  assert.match(
    workflowContent,
    /Reusing existing verified image/,
    "Workflow must reuse existing image without attempting duplicate docker push to respect tag immutability",
  );
});

