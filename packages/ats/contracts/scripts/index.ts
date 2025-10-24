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
 * // Import our domain logic
 * import {
 *   FACTORY_SUITE_CONFIG_ID,
 *   getFacetDefinition,
 *   ROLES,
 *   createFactorySuiteConfiguration
 * } from '@scripts'
 *
 * // Import our workflows
 * import { deployFactorySuiteSystem } from '@scripts'
 *
 * // Import ATS infrastructure directly
 * import {
 *   deployFacets,
 *   registerFacets,
 *   createBlrConfiguration
 * } from '@hashgraph/asset-tokenization-contracts/scripts'
 * ```
 */

// Domain layer (our business logic and registry)
export * from "@scripts/domain";

// Workflow orchestration
export * from "./workflows";

// Internal utilities
export * from "./utils";

// Proxy deployment utilities
export * from "./proxy/deployProxy";

// Note: Infrastructure utilities (including atsRegistry) are imported from ATS:
// import { atsRegistry, combineRegistries, ... } from '@hashgraph/asset-tokenization-contracts/scripts'
