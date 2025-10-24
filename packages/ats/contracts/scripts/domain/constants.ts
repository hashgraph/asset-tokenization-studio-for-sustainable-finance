// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform FactorySuite.
 *
 * These constants are specific to FactorySuite business logic and should not
 * be moved to infrastructure.
 *
 * @module domain/constants
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

// Access Control Roles

/** FactorySuite role identifiers (keccak256 hashes) */
export const FACTORY_SUITE_ROLES = {
  /** keccak256('green.bonds.platform.role.deployer') */
  DEPLOYER: "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283",

  /** keccak256('green.bonds.platform.role.kpi_data_manager') */
  KPI_DATA_MANAGER: "0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e",
} as const;

// Convenience exports for direct role access
export const DEPLOYER_ROLE = FACTORY_SUITE_ROLES.DEPLOYER;
export const KPI_DATA_MANAGER_ROLE = FACTORY_SUITE_ROLES.KPI_DATA_MANAGER;

// Resolver Keys

/** FactorySuite facet registration key - keccak256('green.bonds.platform.factorysuite.resolverKey') */
export const FACTORY_SUITE_RESOLVER_KEY = "0xcf89d9e351b154ec73d93d535b6701c171db4dd978aa2e8967ef3aae7d45453f";
