// @ts-expect-error - dockerode types not available
import Docker from "dockerode"

/**
 * Global teardown for Jest test suite.
 * Stops and removes the shared PostgreSQL container.
 */
export default async function globalTeardown() {
  console.log("🧹 Cleaning up global PostgreSQL container...")

  const containerId = process.env.POSTGRES_CONTAINER_ID

  if (containerId) {
    try {
      // @ts-expect-error - dockerode types not available
      const docker = new Docker()
      const container = docker.getContainer(containerId)
      await container.stop()
      await container.remove()
      console.log("✅ Container stopped and removed")
    } catch (error) {
      console.error("⚠️  Error cleaning up container:", error)
    }
  } else {
    console.log("⚠️  No container ID found, skipping cleanup")
  }
}
