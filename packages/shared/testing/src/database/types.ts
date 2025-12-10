// SPDX-License-Identifier: Apache-2.0

/** Optional configuration for PostgreSQL test container */
export interface TestContainerOptions {
  /** Array of migration files to run */
  migrations?: string[];

  /** Whether to run migrations on startup */
  migrationsRun?: boolean;
}
