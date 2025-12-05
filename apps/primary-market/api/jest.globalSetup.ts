import { GenericContainer, StartedTestContainer } from "testcontainers"
import { Client } from "pg"

const MAX_WORKERS = 8 // Configure based on CI/local needs

/**
 * Global setup for Jest test suite.
 * Creates a single PostgreSQL container shared across all test workers.
 * Each worker gets its own database for isolation.
 */
export default async function globalSetup() {
  console.log("🚀 Starting global PostgreSQL container for test suite...")

  const container: StartedTestContainer = await new GenericContainer("postgres:17")
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: "test",
      POSTGRES_USER: "test",
      POSTGRES_PASSWORD: "test",
    })
    .start()

  const host = container.getHost()
  const port = container.getMappedPort(5432)

  // Store connection info in environment variables for workers
  process.env.POSTGRES_CONTAINER_HOST = host
  process.env.POSTGRES_CONTAINER_PORT = port.toString()

  // Store container ID for teardown
  process.env.POSTGRES_CONTAINER_ID = container.getId()

  // Wait for PostgreSQL to be ready
  console.log("⏳ Waiting for PostgreSQL to be ready...")

  const client = new Client({
    host,
    port,
    user: "test",
    password: "test",
    database: "test",
  })

  // Retry connection with exponential backoff
  let connected = false
  let retries = 0
  const maxRetries = 10

  while (!connected && retries < maxRetries) {
    try {
      await client.connect()
      connected = true
      console.log("✅ PostgreSQL is ready!")
    } catch (error) {
      retries++
      if (retries >= maxRetries) {
        console.error("❌ Failed to connect to PostgreSQL after", maxRetries, "retries")
        throw error
      }
      const waitTime = Math.min(1000 * Math.pow(2, retries), 5000) // Cap at 5 seconds
      console.log(`⏳ PostgreSQL not ready yet, retrying in ${waitTime}ms... (${retries}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  // Create database per worker for isolation
  console.log(`📦 Creating ${MAX_WORKERS} worker databases...`)

  for (let workerId = 1; workerId <= MAX_WORKERS; workerId++) {
    const dbName = `test_worker_${workerId}`
    await client.query(`DROP DATABASE IF EXISTS ${dbName}`)
    await client.query(`CREATE DATABASE ${dbName}`)
    console.log(`✅ Created database: ${dbName}`)
  }

  await client.end()

  console.log("✨ Global setup complete!")
}
