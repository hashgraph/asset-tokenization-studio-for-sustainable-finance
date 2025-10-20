/**
 * Constants module for Green Bonds Platform.
 *
 * Re-exports common role constants from @hashgraph/asset-tokenization-contracts
 * and defines platform-specific constants.
 *
 * @module scripts/constants
 */

// Import ATS_ROLES object from @hashgraph/asset-tokenization-contracts
import { ATS_ROLES } from "@hashgraph/asset-tokenization-contracts/scripts";

// Re-export commonly used ATS roles
export const PAUSER_ROLE = ATS_ROLES.PAUSER;
export const DEFAULT_ADMIN_ROLE = ATS_ROLES.DEFAULT_ADMIN;

// Green Bonds Platform specific roles
export const DEPLOYER_ROLE = "0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283";

export const KPI_DATA_MANAGER_ROLE = "0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e";
