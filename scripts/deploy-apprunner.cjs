#!/usr/bin/env node
"use strict";

const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs");

const execFileAsync = promisify(execFile);

/**
 * Validates service ARN structure for AWS App Runner.
 */
function isValidServiceArn(arn) {
  if (typeof arn !== "string") return false;
  const arnRegex = /^arn:aws:apprunner:[a-z0-9-]+:\d{12}:service\/[a-zA-Z0-9_-]+\/[a-z0-9]+$/;
  return arnRegex.test(arn.trim());
}

/**
 * Validates immutable staging image URI convention.
 */
function isValidImageUri(uri) {
  if (typeof uri !== "string") return false;
  // Format: <account>.dkr.ecr.<region>.amazonaws.com/<repo>:staging-<commit-sha>
  const ecrRegex = /^\d{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com\/[a-zA-Z0-9_-]+:staging-[a-f0-9]+$/;
  return ecrRegex.test(uri.trim());
}

/**
 * Default command runner wrapping the AWS CLI.
 */
async function defaultAwsExec(args) {
  try {
    const { stdout } = await execFileAsync("aws", args, {
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    });
    return JSON.parse(stdout.trim());
  } catch (error) {
    const cleanMessage = (error.stderr || error.message || "").replace(
      /[A-Za-z0-9+/]{40}/g,
      "[REDACTED]",
    );
    throw new Error(`AWS CLI execution failed: ${cleanMessage}`);
  }
}

/**
 * Core deployment logic for AWS App Runner.
 */
async function deployAppRunner({
  serviceArn,
  imageUri,
  region = "ap-southeast-1",
  port = "5000",
  timeoutMs = 900000, // 15 mins
  pollIntervalMs = 15000, // 15s
  execFn = defaultAwsExec,
  sleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  logger = console,
}) {
  if (!isValidServiceArn(serviceArn)) {
    throw new Error(
      "Invalid APP_RUNNER_SERVICE_ARN format. Expected arn:aws:apprunner:<region>:<account>:service/<name>/<id>",
    );
  }
  if (!isValidImageUri(imageUri)) {
    throw new Error(
      "Invalid IMAGE_URI format. Tag immutability requires format: <account>.dkr.ecr.<region>.amazonaws.com/<repo>:staging-<commit-sha>",
    );
  }

  logger.log(`Starting App Runner staging deployment...`);
  logger.log(`Target Service: ${serviceArn}`);
  logger.log(`Deploying Image: ${imageUri}`);
  logger.log(`Target Region: ${region}`);

  // Step 1: Pre-check service status
  logger.log(`Describing current App Runner service status...`);
  const initialDescribe = await execFn([
    "apprunner",
    "describe-service",
    "--service-arn",
    serviceArn,
    "--region",
    region,
    "--output",
    "json",
  ]);

  const currentStatus = initialDescribe?.Service?.Status;
  if (!currentStatus) {
    throw new Error("Failed to retrieve service status from App Runner response.");
  }

  if (currentStatus === "OPERATION_IN_PROGRESS") {
    throw new Error(
      "App Runner service is already busy (OPERATION_IN_PROGRESS). A concurrent deployment is running. Aborting.",
    );
  }

  if (["CREATE_FAILED", "DELETED"].includes(currentStatus)) {
    throw new Error(`App Runner service is in an unrecoverable state: ${currentStatus}`);
  }

  // Step 2: Update service with new immutable image URI
  logger.log(`Updating App Runner service with image ${imageUri}...`);
  const sourceConfigJson = JSON.stringify({
    ImageRepository: {
      ImageIdentifier: imageUri,
      ImageConfiguration: {
        Port: String(port),
      },
      ImageRepositoryType: "ECR",
    },
  });

  const updateResponse = await execFn([
    "apprunner",
    "update-service",
    "--service-arn",
    serviceArn,
    "--source-configuration",
    sourceConfigJson,
    "--region",
    region,
    "--output",
    "json",
  ]);

  const operationId = updateResponse?.OperationId || updateResponse?.Service?.OperationId;
  if (operationId) {
    logger.log(`Update operation initiated. Operation ID: ${operationId}`);
  }

  // Step 3: Poll service until status becomes RUNNING or timeout
  logger.log(`Polling App Runner rollout status (timeout: ${Math.round(timeoutMs / 1000)}s)...`);
  const startTime = Date.now();
  let latestDescribe = null;

  while (Date.now() - startTime < timeoutMs) {
    await sleepFn(pollIntervalMs);

    latestDescribe = await execFn([
      "apprunner",
      "describe-service",
      "--service-arn",
      serviceArn,
      "--region",
      region,
      "--output",
      "json",
    ]);

    const status = latestDescribe?.Service?.Status;
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    logger.log(`[+${elapsedSec}s] Current Service Status: ${status}`);

    if (status === "RUNNING") {
      let rawDomain = latestDescribe?.Service?.ServiceUrl;
      if (!rawDomain) {
        throw new Error("Deployment succeeded but App Runner ServiceUrl is missing.");
      }
      // Ensure https protocol
      const serviceUrl = rawDomain.startsWith("http") ? rawDomain : `https://${rawDomain}`;

      logger.log(`Deployment succeeded in ${elapsedSec}s!`);
      logger.log(`Staging Backend Service URL: ${serviceUrl}`);

      return {
        success: true,
        serviceArn,
        serviceUrl,
        status: "RUNNING",
        elapsedSeconds: elapsedSec,
      };
    }

    if (status !== "OPERATION_IN_PROGRESS") {
      throw new Error(
        `App Runner deployment failed with status: ${status}. Inspect CloudWatch / App Runner service logs.`,
      );
    }
  }

  throw new Error(
    `App Runner deployment timed out after ${Math.round(timeoutMs / 1000)} seconds. Service status remained OPERATION_IN_PROGRESS.`,
  );
}

// CLI entry point
async function main() {
  const serviceArn = process.env.APP_RUNNER_SERVICE_ARN || process.argv[2];
  const imageUri = process.env.IMAGE_URI || process.argv[3];
  const region = process.env.AWS_REGION || "ap-southeast-1";
  const port = process.env.PORT || "5000";

  try {
    const result = await deployAppRunner({
      serviceArn,
      imageUri,
      region,
      port,
    });

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `service_url=${result.serviceUrl}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `service_status=${result.status}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `deployment_time_sec=${result.elapsedSeconds}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Deployment Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  isValidServiceArn,
  isValidImageUri,
  deployAppRunner,
};
