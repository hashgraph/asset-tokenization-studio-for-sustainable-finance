// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform FactoryPrimaryMarket.
 *
 * These constants are specific to FactoryPrimaryMarket business logic and should not
 * be moved to infrastructure.
 *
 * @module domain/constants
 */

// Configuration IDs

/** FactoryPrimaryMarket configuration ID - bytes32(uint256(10000)) */
export const FACTORY_PRIMARY_MARKET_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000002710";

/** PrimaryMarket configuration ID - bytes32(uint256(10001)) */
export const PRIMARY_MARKET_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000002711";

// Access Control Roles

/** FactoryPrimaryMarket role identifiers (keccak256 hashes) */
export const FACTORY_PRIMARY_MARKET_ROLES = {
  /** keccak256('green.bonds.platform.role.primary.market.deployer') */
  PM_DEPLOYER_ROLE: "0x6317a0a54c6810764ed949f1fdb7c29121cbad7545dec2b713233501ad614b22",
} as const;

// Resolver Keys

/** FactoryPrimaryMarket facet registration key - keccak256('green.bonds.platform.factoryprimarymarket.resolverKey'); */
export const FACTORY_PRIMARY_MARKET_RESOLVER_KEY = "0x98c9d1e17a94f8342c5219f2e037b33ad4a5f9cd3c6dada43d647da671418de5";
