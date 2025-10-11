// SPDX-License-Identifier: Apache-2.0

/**
 * Domain module exports for Green Bonds Platform FactorySuite.
 *
 * Provides FactorySuite-specific configuration and deployment logic.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import domain constants
 * import { FACTORY_SUITE_CONFIG_ID, FACTORY_SUITE_ROLES } from '@scripts/domain'
 *
 * // Import configuration creation
 * import { createFactorySuiteConfiguration } from '@scripts/domain'
 * ```
 */

// Domain constants
export * from "./constants";

// FactorySuite configuration
export * from "./factorySuite/createConfiguration";
