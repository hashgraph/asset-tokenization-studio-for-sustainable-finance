// SPDX-License-Identifier: Apache-2.0

/**
 * Domain module exports for Green Bonds Platform FactorySuite.
 *
 * Provides FactorySuite-specific configuration, registry, and deployment logic.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import configuration IDs (from constants.ts)
 * import { FACTORY_SUITE_CONFIG_ID, TREASURY_CONFIG_ID } from '@scripts/domain'
 *
 * // Import registry data and helpers (from auto-generated registry)
 * import { ROLES, getFacetDefinition, getAllFacets } from '@scripts/domain'
 *
 * // Access roles from registry
 * const deployerRole = ROLES.DEPLOYER_ROLE
 * const kpiRole = ROLES.KPI_DATA_MANAGER_ROLE
 *
 * // Import configuration creation
 * import { createFactorySuiteConfiguration } from '@scripts/domain'
 * ```
 */

// Auto-generated registry data FIRST (others depend on it)
export * from "./factorySuiteRegistry.data";

// Domain constants (may use ROLES from registry data)
export * from "./constants";

// Domain registry helpers (uses factory pattern)
export * from "./factorySuiteRegistry";

// FactorySuite configuration
export * from "./factorySuite/createConfiguration";

// KPI deployment and management
export * from "./kpi/kpiDeploy";
export * from "./kpi/upgradeKpi";

// Utility functions
export * from "./utils";
