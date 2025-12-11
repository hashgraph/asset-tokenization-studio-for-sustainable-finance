// SPDX-License-Identifier: Apache-2.0

import Docker from "dockerode";

/**
 * Global teardown for Jest test suite.
 * Stops and removes the PostgreSQL container.
 */
export async function globalTeardown() {
  console.log("🧹 Cleaning up global PostgreSQL container...");

  const containerId = process.env.POSTGRES_CONTAINER_ID;

  if (containerId) {
    try {
      const docker = new Docker();
      const container = docker.getContainer(containerId);
      await container.stop();
      await container.remove();
      console.log("✅ Container stopped and removed");
    } catch (error) {
      console.error("⚠️  Error cleaning up container:", error);
    }
  } else {
    console.log("⚠️  No container ID found, skipping cleanup");
  }
}

// Export as default for Jest globalTeardown
export default globalTeardown;
