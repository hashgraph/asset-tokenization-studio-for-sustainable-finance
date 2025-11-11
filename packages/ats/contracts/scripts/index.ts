// SPDX-License-Identifier: Apache-2.0

/**
 * Green Bonds Platform deployment scripts.
 *
 * Exports FactorySuite-specific functionality. ATS infrastructure must be
 * imported directly from '@hashgraph/asset-tokenization-contracts/scripts'.
 *
 * @module scripts
 *
 * @example
 * ```typescript
 * // Import configuration IDs (domain constants)
 * import { FACTORY_SUITE_CONFIG_ID, TREASURY_CONFIG_ID } from '@scripts'
 *
 * // Import registry data and helpers (auto-generated from contracts)
 * import { ROLES, getFacetDefinition, factorySuiteRegistry } from '@scripts'
 *
 * // Access roles from registry
 * const deployerRole = ROLES.DEPLOYER_ROLE
 * const kpiRole = ROLES.KPI_DATA_MANAGER_ROLE
 *
 * // Import configuration and workflow functions
 * import { createFactorySuiteConfiguration, deployFactorySuiteSystem } from '@scripts'
 *
 * // Import ATS infrastructure directly (includes deployProxyAdmin, deployProxy, etc.)
 * import {
 *   deployFacets,
 *   registerFacets,
 *   createBlrConfiguration,
 *   deployProxyAdmin,
 *   deployProxy
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 * ```
 */

// Domain layer (our business logic and registry)
export * from "@scripts/domain";

// Workflow orchestration
export * from "./workflows";

// Internal utilities
export * from "./utils";
