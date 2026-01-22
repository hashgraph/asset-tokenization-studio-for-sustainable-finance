// SPDX-License-Identifier: Apache-2.0

/**
 * Domain module exports for Green Bonds Platform Primary Market.
 *
 * Provides Primary Market-specific configuration, registry, and deployment logic.
 *
 * @module domain
 *
 * @example
 * ```typescript
 * // Import configuration IDs (from constants.ts)
 * import { FACTORY_PRIMARY_MARKET_CONFIG_ID, PRIMARY_MARKET_CONFIG_ID } from '@scripts/domain'
 *
 * // Import registry data and helpers (from auto-generated registry)
 * import { ROLES, getFacetDefinition, getAllFacets } from '@scripts/domain'
 *
 * // Access roles from registry
 * const deployerRole = ROLES.PM_DEPLOYER_ROLE
 * const creatorRole = ROLES.OFFERING_CREATOR_ROLE
 *
 * // Import configuration creation
 * import { createFactoryPrimaryMarketConfiguration } from '@scripts/domain'
 * ```
 */

// Auto-generated registry data FIRST (others depend on it)
export * from "./primaryMarketRegistry.data";

// Domain constants (may use ROLES from registry data)
export * from "./constants";

// Domain registry helpers (uses factory pattern)
export * from "./primaryMarketRegistry";

// Utility helpers
export * from "./utils";

// FactoryPrimaryMarket configuration
export * from "./factoryPrimaryMarket/createConfiguration";

// PrimaryMarket configuration
export * from "./primaryMarket/createConfiguration";
