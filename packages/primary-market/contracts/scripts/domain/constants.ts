// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform Primary Market.
 *
 * Provides namespaced access to roles, resolver keys, and configuration IDs.
 * Roles and resolver keys are sourced from auto-generated registry data.
 *
 * @module domain/constants
 *
 * @example
 * ```typescript
 * // Configuration IDs
 * import { FACTORY_PRIMARY_MARKET_CONFIG_ID, PRIMARY_MARKET_CONFIG_ID } from '@scripts/domain'
 *
 * // Namespaced roles
 * import { PM_ROLES } from '@scripts/domain'
 * const deployerRole = PM_ROLES.DEPLOYER_ROLE
 * const creatorRole = PM_ROLES.OFFERING_CREATOR_ROLE
 *
 * // Namespaced resolver keys
 * import { PM_RESOLVER_KEYS } from '@scripts/domain'
 * const factoryKey = PM_RESOLVER_KEYS.FACTORY_PRIMARY_MARKET
 * const primaryMarketKey = PM_RESOLVER_KEYS.PRIMARY_MARKET
 *
 * // ATS roles (re-exported)
 * import { ATS_ROLES } from '@scripts/domain'
 * const pauserRole = ATS_ROLES.PAUSER_ROLE
 * ```
 */

import { ROLES as GENERATED_ROLES, FACET_REGISTRY } from "./primaryMarketRegistry.data";
import { ROLES as ATS_GENERATED_ROLES } from "@hashgraph/asset-tokenization-contracts/scripts";

// Configuration IDs
/** FactoryPrimaryMarket configuration ID - bytes32(uint256(10000)) */
export const FACTORY_PRIMARY_MARKET_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000002710";

/** PrimaryMarket configuration ID - bytes32(uint256(10001)) */
export const PRIMARY_MARKET_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000002711";

/**
 * Primary Market role identifiers (namespaced).
 * @example
 * ```typescript
 * import { PM_ROLES } from '@scripts/domain';
 * const { DEPLOYER_ROLE, OFFERING_CREATOR_ROLE } = PM_ROLES;
 * ```
 */
export const PM_ROLES = {
  DEPLOYER_ROLE: GENERATED_ROLES.PM_DEPLOYER_ROLE,
  OFFERING_CREATOR_ROLE: GENERATED_ROLES.OFFERING_CREATOR_ROLE,
} as const;

/**
 * Primary Market resolver keys (namespaced).
 * @example
 * ```typescript
 * import { PM_RESOLVER_KEYS } from '@scripts/domain';
 * const { FACTORY_PRIMARY_MARKET, PRIMARY_MARKET } = PM_RESOLVER_KEYS;
 * ```
 */
export const PM_RESOLVER_KEYS = {
  FACTORY_PRIMARY_MARKET: FACET_REGISTRY.FactoryPrimaryMarketFacet!.resolverKey!.value,
  PRIMARY_MARKET: FACET_REGISTRY.PrimaryMarketFacet!.resolverKey!.value,
} as const;

/**
 * ATS roles re-exported (namespaced).
 * @example
 * ```typescript
 * import { ATS_ROLES } from '@scripts/domain';
 * const { PAUSER_ROLE, DEFAULT_ADMIN_ROLE } = ATS_ROLES;
 * ```
 */
export const ATS_ROLES = {
  PAUSER_ROLE: ATS_GENERATED_ROLES._PAUSER_ROLE,
  DEFAULT_ADMIN_ROLE: ATS_GENERATED_ROLES._DEFAULT_ADMIN_ROLE,
} as const;
