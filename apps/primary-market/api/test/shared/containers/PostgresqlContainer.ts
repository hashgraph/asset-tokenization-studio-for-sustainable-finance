// SPDX-License-Identifier: Apache-2.0

import { GenericContainer, StartedTestContainer } from "testcontainers"
import process from "process"
import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export class PostgreSqlContainer {
  private static INTERNAL_PORT = 5432
  private static DATABASE = process.env.POSTGRESQL_DB || "test"
  private static USER = process.env.POSTGRESQL_USER || "test"
  private static PASSWORD = process.env.POSTGRESQL_PASSWORD || "test"
  private container: StartedTestContainer | null = null

  /**
   * Get TypeORM configuration for worker-specific database.
   * Uses global container from jest.globalSetup.ts and worker-specific database.
   * This is the recommended approach for optimal performance.
   */
  static getWorkerConfig(): TypeOrmModuleOptions {
    const workerId = process.env.JEST_WORKER_ID || "1"
    const host = process.env.POSTGRES_CONTAINER_HOST || "localhost"
    const port = parseInt(process.env.POSTGRES_CONTAINER_PORT || "5432")

    return {
      host,
      port,
      username: this.USER,
      password: this.PASSWORD,
      database: `test_worker_${workerId}`,
      synchronize: true,
      migrationsRun: false,
      logging: false,
    }
  }

  /**
   * @deprecated Use getWorkerConfig() with Jest global setup instead.
   * This method creates a new container per test file (inefficient).
   * Kept for backwards compatibility only.
   */
  static async create(): Promise<PostgreSqlContainer> {
    console.warn(
      "⚠️  PostgreSqlContainer.create() is deprecated. Use getWorkerConfig() with Jest global setup for better performance.",
    )

    const postgresqlContainer = new PostgreSqlContainer()

    postgresqlContainer.container = await new GenericContainer("postgres")
      .withExposedPorts(this.INTERNAL_PORT)
      .withEnvironment({
        POSTGRES_DB: this.DATABASE,
        POSTGRES_USER: this.USER,
        POSTGRES_PASSWORD: this.PASSWORD,
      })
      .start()

    return postgresqlContainer
  }

  /**
   * Get TypeORM configuration for this container instance.
   * @deprecated Use static getWorkerConfig() instead.
   */
  public getConfig(): TypeOrmModuleOptions {
    if (!this.container) {
      // If no container instance, fall back to worker config
      return PostgreSqlContainer.getWorkerConfig()
    }

    return {
      host: this.container.getHost(),
      port: this.container.getMappedPort(PostgreSqlContainer.INTERNAL_PORT),
      username: PostgreSqlContainer.USER,
      password: PostgreSqlContainer.PASSWORD,
      database: PostgreSqlContainer.DATABASE,
      synchronize: true,
      migrationsRun: false,
      logging: false,
    }
  }

  async stop(): Promise<void> {
    if (this.container) {
      await this.container.stop()
    }
    // If using global setup, container is managed by global teardown
  }
}
