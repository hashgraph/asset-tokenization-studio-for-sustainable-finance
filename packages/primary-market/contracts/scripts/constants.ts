/**
 * Constants module for Green Bonds Platform.
 *
 * Re-exports common role constants from @hashgraph/asset-tokenization-contracts
 * and defines platform-specific constants.
 *
 * @module scripts/constants
 */

// Import ROLES object from @hashgraph/asset-tokenization-contracts
import { ROLES } from "@hashgraph/asset-tokenization-contracts/scripts";

// Re-export commonly used ATS roles
export const PAUSER_ROLE = ROLES._PAUSER_ROLE;
export const DEFAULT_ADMIN_ROLE = ROLES._DEFAULT_ADMIN_ROLE;

// Green Bonds Platform specific roles
export const PM_DEPLOYER_ROLE = "0x6317a0a54c6810764ed949f1fdb7c29121cbad7545dec2b713233501ad614b22";
