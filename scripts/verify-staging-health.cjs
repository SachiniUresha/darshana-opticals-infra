#!/usr/bin/env node
"use strict";

const https = require("node:https");
const http = require("node:http");
const { URL } = require("node:url");

/**
 * Standard HTTP/HTTPS request helper returning { statusCode, headers, body }
 */
function defaultRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const req = client.request(
      urlStr,
      {
        method: options.method || "GET",
        headers: options.headers || {},
        timeout: options.timeout || 10000,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Request timed out after ${options.timeout || 10000}ms`));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Scans payload for sensitive credential leaks.
 */
function scanForCredentialLeaks(payloadStr) {
  const leaks = [];
  if (/mongodb(\+srv)?:\/\//i.test(payloadStr)) {
    leaks.push("MongoDB connection string pattern detected in response body");
  }
  if (/eyJ[a-zA-Z0-9_-]{10,}\.eyJ/i.test(payloadStr)) {
    leaks.push("Potential JWT token detected in response body");
  }
  if (/AKIA[0-9A-Z]{16}/i.test(payloadStr)) {
    leaks.push("AWS Access Key ID pattern detected in response body");
  }
  if (/["']?[a-zA-Z0-9_-]*(?:secret|password|key)["']?\s*[:=]\s*["'][^"']{6,}["']/i.test(payloadStr)) {
    leaks.push("Potential credential/secret key-value pair detected in response body");
  }
  return leaks;
}

/**
 * Verifies staging health endpoint and CORS policy compliance.
 */
async function verifyStagingHealth({
  targetUrl,
  frontendOrigin = "https://osms-frontend-staging.vercel.app",
  timeoutMs = 180000, // 3 mins
  intervalMs = 10000, // 10s
  requestFn = defaultRequest,
  sleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  logger = console,
}) {
  if (!targetUrl || typeof targetUrl !== "string") {
    throw new Error("Missing or invalid targetUrl. Staging service HTTPS URL is required.");
  }

  const normalizedBase = targetUrl.replace(/\/+$/, "");
  if (!normalizedBase.startsWith("https://")) {
    throw new Error(
      `Staging endpoint must use HTTPS protocol. Received: ${normalizedBase}`,
    );
  }

  const healthEndpoint = `${normalizedBase}/api/health`;
  logger.log(`Starting staging health verification for ${healthEndpoint}...`);
  logger.log(`Approved Frontend Origin: ${frontendOrigin}`);

  const startTime = Date.now();
  let lastError = null;

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Step 1: Probe GET /api/health
      logger.log(`Probing GET ${healthEndpoint}...`);
      const healthRes = await requestFn(healthEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "OSMS-Staging-HealthCheck/1.0",
        },
      });

      if (healthRes.statusCode !== 200) {
        throw new Error(
          `Health check responded with non-200 status code: ${healthRes.statusCode}`,
        );
      }

      // Step 2: Validate JSON body
      let parsedBody;
      try {
        parsedBody = JSON.parse(healthRes.body);
      } catch {
        throw new Error(`Health response is not valid JSON. Received: ${healthRes.body.slice(0, 100)}`);
      }

      if (parsedBody.status !== "ok") {
        throw new Error(`Expected health status 'ok', received: '${parsedBody.status}'`);
      }

      // Step 3: Check for sensitive data leaks
      const leaks = scanForCredentialLeaks(healthRes.body);
      if (leaks.length > 0) {
        throw new Error(
          `Security violation: Health endpoint leaked sensitive data: ${leaks.join(", ")}`,
        );
      }

      // Step 4: Verify CORS preflight for approved staging origin
      logger.log(`Verifying CORS preflight for approved origin: ${frontendOrigin}...`);
      const corsRes = await requestFn(healthEndpoint, {
        method: "OPTIONS",
        headers: {
          Origin: frontendOrigin,
          "Access-Control-Request-Method": "GET",
        },
      });

      const allowedOriginHeader = corsRes.headers["access-control-allow-origin"];
      if (allowedOriginHeader !== frontendOrigin) {
        throw new Error(
          `CORS policy violation: Expected Access-Control-Allow-Origin '${frontendOrigin}', got '${allowedOriginHeader}'`,
        );
      }

      // Step 5: Verify negative CORS (unauthorized origin must NOT be allowed or wildcarded)
      const unauthorizedOrigin = "https://unauthorized-origin.example";
      const negativeCorsRes = await requestFn(healthEndpoint, {
        method: "OPTIONS",
        headers: {
          Origin: unauthorizedOrigin,
          "Access-Control-Request-Method": "GET",
        },
      });

      const unauthAllowed = negativeCorsRes.headers["access-control-allow-origin"];
      if (unauthAllowed === "*" || unauthAllowed === unauthorizedOrigin) {
        throw new Error(
          `CORS security violation: Unauthorized origin '${unauthorizedOrigin}' was permitted with: '${unauthAllowed}'`,
        );
      }

      logger.log(`✅ Staging backend is healthy and fully operational!`);
      logger.log(`Service: ${parsedBody.service || "osms-backend"}`);
      logger.log(`Health Status: ${parsedBody.status} (200 OK)`);
      logger.log(`CORS Preflight: Verified for ${frontendOrigin}`);

      return {
        success: true,
        endpoint: healthEndpoint,
        service: parsedBody.service,
        status: parsedBody.status,
      };
    } catch (err) {
      lastError = err;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      logger.log(`[+${elapsed}s] Probe attempt failed: ${err.message}. Retrying...`);
      await sleepFn(intervalMs);
    }
  }

  throw new Error(
    `Staging health check timed out after ${Math.round(timeoutMs / 1000)}s. Last error: ${lastError?.message}`,
  );
}

// CLI entry point
async function main() {
  const targetUrl = process.env.STAGING_SERVICE_URL || process.argv[2];
  const frontendOrigin =
    process.env.FRONTEND_ORIGIN || "https://osms-frontend-staging.vercel.app";
  const timeoutMs = Number(process.env.HEALTH_CHECK_TIMEOUT_MS) || 180000;

  try {
    const result = await verifyStagingHealth({
      targetUrl,
      frontendOrigin,
      timeoutMs,
    });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Health Verification Failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  isValidUrl: (url) => typeof url === "string" && url.startsWith("https://"),
  scanForCredentialLeaks,
  verifyStagingHealth,
};
