// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform FactorySuite.
 *
 * Contains only configuration IDs and re-exported convenience constants.
 * For roles and resolver keys, use the auto-generated registry data.
 *
 * @module domain/constants
 *
 * @example
 * ```typescript
 * // Configuration IDs (from this module)
 * import { FACTORY_SUITE_CONFIG_ID } from '@scripts/domain'
 *
 * // Roles and resolver keys (from auto-generated registry)
 * import { ROLES, getFacetDefinition } from '@scripts/domain'
 * const deployerRole = ROLES.DEPLOYER_ROLE
 * const resolverKey = getFacetDefinition('FactorySuiteFacet').resolverKey.value
 * ```
 */

// Import commonly used ATS roles from their domain registry
import { ROLES as ATS_ROLES } from "@hashgraph/asset-tokenization-contracts/scripts";

// Re-export commonly used ATS roles for convenience
export const PAUSER_ROLE = ATS_ROLES._PAUSER_ROLE;
export const DEFAULT_ADMIN_ROLE = ATS_ROLES._DEFAULT_ADMIN_ROLE;

// Configuration IDs

/** Treasury configuration ID - bytes32(uint256(20000)) */
export const TREASURY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000004e20";

/** FactorySuite configuration ID - bytes32(uint256(30000)) */
export const FACTORY_SUITE_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000007530";
