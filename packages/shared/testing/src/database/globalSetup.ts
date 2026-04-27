// SPDX-License-Identifier: Apache-2.0

import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Client } from "pg";
import {
  MAX_WORKERS,
  POSTGRES_VERSION,
  DB_PREFIX,
  DEFAULT_USER,
  DEFAULT_PASSWORD,
  DEFAULT_DATABASE,
  DEFAULT_PORT,
} from "../constants";

/**
 * Global setup for Jest test suite.
 * Creates a single PostgreSQL container shared across all test workers.
 * Each worker gets its own database for isolation.
 */
export async function globalSetup() {
  // Configure testcontainers for CI environments
  // Disable ryuk in CI to avoid image pull issues
  if (process.env.CI === "true") {
    process.env.TESTCONTAINERS_RYUK_DISABLED = "true";
    console.log("🔧 CI environment detected - Ryuk disabled for testcontainers");
  }

  console.log(`🚀 Starting global PostgreSQL ${POSTGRES_VERSION} container for test suite...`);

  const container: StartedTestContainer = await new GenericContainer(`postgres:${POSTGRES_VERSION}`)
    .withExposedPorts(DEFAULT_PORT)
    .withEnvironment({
      POSTGRES_DB: DEFAULT_DATABASE,
      POSTGRES_USER: DEFAULT_USER,
      POSTGRES_PASSWORD: DEFAULT_PASSWORD,
    })
    .withStartupTimeout(120_000) // 2 minutes max
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(DEFAULT_PORT);

  // Store connection info in environment variables for workers
  process.env.POSTGRES_CONTAINER_HOST = host;
  process.env.POSTGRES_CONTAINER_PORT = port.toString();

  // Store container ID for teardown
  process.env.POSTGRES_CONTAINER_ID = container.getId();

  // Wait for PostgreSQL to be ready and create worker databases
  await waitForPostgresAndCreateDatabases(container);

  console.log("✨ Global setup complete!");
}

/**
 * Wait for PostgreSQL to be ready with exponential backoff retry logic,
 * then create worker-specific databases.
 */
async function waitForPostgresAndCreateDatabases(container: StartedTestContainer) {
  console.log("⏳ Waiting for PostgreSQL to be ready...");

  const connectionConfig = {
    host: container.getHost(),
    port: container.getMappedPort(DEFAULT_PORT),
    user: DEFAULT_USER,
    password: DEFAULT_PASSWORD,
    database: DEFAULT_DATABASE,
  };

  // Exponential backoff retry logic
  let client: Client | null = null;
  let retries = 0;
  const maxRetries = 10;

  while (client === null && retries < maxRetries) {
    try {
      const testClient = new Client(connectionConfig);
      await testClient.connect();
      client = testClient;
      console.log("✅ PostgreSQL is ready!");
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error("❌ Failed to connect to PostgreSQL after", maxRetries, "retries");
        throw error;
      }
      const waitTime = Math.min(1000 * Math.pow(2, retries), 5000); // Cap at 5 seconds
      console.log(`⏳ PostgreSQL not ready yet, retrying in ${waitTime}ms... (${retries}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  if (!client) {
    throw new Error("Failed to establish PostgreSQL connection");
  }

  // Create database per worker for isolation
  console.log(`📦 Creating ${MAX_WORKERS} worker databases...`);

  for (let workerId = 1; workerId <= MAX_WORKERS; workerId++) {
    const dbName = `${DB_PREFIX}_worker_${workerId}`;
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database: ${dbName}`);
  }

  await client.end();
}

// Export as default for Jest globalSetup
export default globalSetup;
