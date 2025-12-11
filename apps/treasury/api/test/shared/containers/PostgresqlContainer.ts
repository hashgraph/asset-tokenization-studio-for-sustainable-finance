// SPDX-License-Identifier: Apache-2.0

import { PostgreSqlTestContainer } from "@hashgraph/green-bonds-shared-testing"
import { TypeOrmModuleOptions } from "@nestjs/typeorm"

/**
 * PostgreSQL container wrapper for Treasury API tests.
 * Uses shared testing infrastructure for optimal performance.
 */
export class PostgreSqlContainer {
  /**
   * Get TypeORM configuration for worker-specific database.
   * Uses global container from jest.globalSetup.ts.
   */
  static getWorkerConfig(): TypeOrmModuleOptions {
    return PostgreSqlTestContainer.getWorkerConfig()
  }

  /**
   * @deprecated Use getWorkerConfig() with Jest global setup instead.
   * Kept for backwards compatibility only.
   */
  static async create(): Promise<PostgreSqlContainer> {
    console.warn(
      "⚠️  PostgreSqlContainer.create() is deprecated. Use getWorkerConfig() with Jest global setup for better performance.",
    )
    return new PostgreSqlContainer()
  }

  /**
   * Get TypeORM configuration.
   * @deprecated Use static getWorkerConfig() instead.
   */
  public getConfig(): TypeOrmModuleOptions {
    return PostgreSqlContainer.getWorkerConfig()
  }

  async stop(): Promise<void> {
    // Container is managed by global teardown - nothing to do here
  }
}
