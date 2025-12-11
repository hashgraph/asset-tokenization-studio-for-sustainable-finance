// SPDX-License-Identifier: Apache-2.0

import * as os from "os";

/**
 * Calculate optimal maxWorkers based on available CPUs.
 * Strategy: Use 50% of available cores, clamped between 2-8.
 * - Minimum 2: Ensures parallelization benefit
 * - Maximum 8: Diminishing returns beyond this point
 * - 50%: Leaves headroom for database and system processes
 */
export function getOptimalMaxWorkers(): number {
  const cpuCount = os.cpus().length;
  const calculated = Math.floor(cpuCount * 0.5);
  return Math.max(2, Math.min(8, calculated));
}

/** Maximum number of Jest workers (databases) to create - adaptive by default */
export const MAX_WORKERS = parseInt(process.env.JEST_MAX_WORKERS || String(getOptimalMaxWorkers()));

/** Database name prefix for worker databases */
export const DB_PREFIX = process.env.JEST_DB_PREFIX || "test";

/** PostgreSQL version to use for test containers */
export const POSTGRES_VERSION = process.env.POSTGRES_VERSION || "17";

/** Default PostgreSQL port */
export const DEFAULT_PORT = 5432;

/** Default PostgreSQL user for tests */
export const DEFAULT_USER = "test";

/** Default PostgreSQL password for tests */
export const DEFAULT_PASSWORD = "test";

/** Default PostgreSQL database name */
export const DEFAULT_DATABASE = "test";
