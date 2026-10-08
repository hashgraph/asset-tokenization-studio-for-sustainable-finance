// SPDX-License-Identifier: Apache-2.0

// Database testing utilities
export { PostgreSqlTestContainer } from "./database/PostgreSqlTestContainer";
export { globalSetup } from "./database/globalSetup";
export { globalTeardown } from "./database/globalTeardown";
export type { TestContainerOptions } from "./database/types";

// Constants and utilities
export {
  MAX_WORKERS,
  DB_PREFIX,
  POSTGRES_VERSION,
  DEFAULT_PORT,
  DEFAULT_USER,
  DEFAULT_PASSWORD,
  DEFAULT_DATABASE,
  getOptimalMaxWorkers,
} from "./constants";
