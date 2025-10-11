// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform FactorySuite.
 *
 * These constants are specific to FactorySuite business logic and should not
 * be moved to infrastructure.
 *
 * @module domain/constants
 */

// ============================================================================
// Configuration IDs
// ============================================================================

/**
 * FactorySuite configuration ID.
 *
 * bytes32(uint256(30000)) = 0x00...7530
 * Used by BusinessLogicResolver to identify FactorySuite facet configuration.
 */
export const FACTORY_SUITE_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000007530";

// ============================================================================
// Access Control Roles (FactorySuite)
// ============================================================================

/**
 * Role identifiers (keccak256 hashes) for FactorySuite access control.
 *
 * These roles are specific to FactorySuite and its deployment operations.
 * Used for granting permissions to accounts.
 */
export const FACTORY_SUITE_ROLES = {
  /** keccak256('green.bonds.platform.role.deployer') */
  DEPLOYER: "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283",

  /** keccak256('green.bonds.platform.role.kpi_data_manager') */
  KPI_DATA_MANAGER: "0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e",
} as const;

// ============================================================================
// Resolver Keys (FactorySuite)
// ============================================================================

/**
 * Static resolver key for FactorySuite facet registration.
 *
 * keccak256('green.bonds.platform.factorysuite.resolverKey')
 */
export const FACTORY_SUITE_RESOLVER_KEY = "0xcf89d9e351b154ec73d93d535b6701c171db4dd978aa2e8967ef3aae7d45453f";
