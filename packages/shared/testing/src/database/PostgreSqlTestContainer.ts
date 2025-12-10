// SPDX-License-Identifier: Apache-2.0

import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DEFAULT_PASSWORD, DEFAULT_PORT, DEFAULT_USER, DB_PREFIX } from "../constants";
import { TestContainerOptions } from "./types";

/**
 * PostgreSQL test container utility for Jest integration tests.
 * Uses global setup/teardown for single container shared across workers.
 */
export class PostgreSqlTestContainer {
  /**
   * Get TypeORM configuration for worker-specific database.
   * Uses global container from jest.globalSetup.ts.
   *
   * @param options - Optional configuration for migrations
   * @returns TypeORM module options for current Jest worker
   */
  static getWorkerConfig(options?: TestContainerOptions): TypeOrmModuleOptions {
    const workerId = process.env.JEST_WORKER_ID || "1";
    const host = process.env.POSTGRES_CONTAINER_HOST || "localhost";
    const port = parseInt(process.env.POSTGRES_CONTAINER_PORT || DEFAULT_PORT.toString());
    const dbPrefix = process.env.JEST_DB_PREFIX || DB_PREFIX;

    return {
      type: "postgres",
      host,
      port,
      username: DEFAULT_USER,
      password: DEFAULT_PASSWORD,
      database: `${dbPrefix}_worker_${workerId}`,
      synchronize: !options?.migrationsRun,
      migrations: options?.migrations,
      migrationsRun: options?.migrationsRun || false,
      logging: false,
      dropSchema: false,
    };
  }
}
