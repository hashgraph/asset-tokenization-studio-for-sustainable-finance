// SPDX-License-Identifier: Apache-2.0

/**
 * Green Bonds Platform Treasury deployment scripts.
 *
 * Exports Treasury-specific functionality for deployment, configuration,
 * and registry management.
 *
 * @module scripts
 *
 * @example
 * ```typescript
 * // Import configuration IDs (domain constants)
 * import { TREASURY_CONFIG_ID } from '@scripts'
 *
 * // Import registry data and helpers (auto-generated from contracts)
 * import { ROLES, getFacetDefinition, treasuryRegistry } from '@scripts'
 *
 * // Access roles from registry
 * const payoutRole = ROLES.PAYOUT_ROLE
 * const portfolioManagerRole = ROLES.PORTFOLIO_MANAGER_ROLE
 *
 * // Import configuration and workflow functions
 * import { createTreasuryConfiguration, deployTreasury } from '@scripts'
 * ```
 */

// Domain layer (our business logic and registry)
export * from "@scripts/domain";

// Workflow orchestration
export * from "./workflows";

// Internal utilities
export * from "./utils";
