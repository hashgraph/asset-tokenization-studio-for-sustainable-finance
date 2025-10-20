// SPDX-License-Identifier: Apache-2.0

/**
 * Main entry point for Green Bonds Platform deployment scripts.
 *
 * Exports only Green Bonds Platform-specific functionality.
 * ATS infrastructure must be imported directly from
 * '@hashgraph/asset-tokenization-contracts/scripts/*'
 *
 * @module scripts
 *
 * @example
 * ```typescript
 * // Import ATS infrastructure directly (explicit imports required)
 * import {
 *   deployBlr,
 *   deployFacets,
 *   HardhatProvider
 * } from '@hashgraph/asset-tokenization-contracts/scripts/infrastructure'
 *
 * // Import FactorySuite domain from this package
 * import {
 *   FACTORY_SUITE_CONFIG_ID,
 *   createFactorySuiteConfiguration,
 *   deployFactorySuiteSystem
 * } from '@scripts'
 * ```
 */

// ========================================
// Constants
// ========================================
export * from "./constants";

// ========================================
// Green Bonds Platform Domain (FactorySuite-Specific)
// ========================================
export * from "./domain";

// ========================================
// Infrastructure
// ========================================
export { factorySuiteRegistry } from "./infrastructure/factorySuiteRegistry";

// ========================================
// Workflows
// ========================================
export * from "./workflows/deployFactorySuiteSystem";
