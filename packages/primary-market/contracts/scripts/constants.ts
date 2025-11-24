/**
 * Constants module for Green Bonds Platform.
 *
 * Re-exports namespaced role and resolver key constants from domain module.
 *
 * @module scripts/constants
 *
 * @example
 * ```typescript
 * // Import namespaced role constants
 * import { PM_ROLES, ATS_ROLES } from '@scripts';
 *
 * // Use role constants
 * const { DEPLOYER_ROLE, OFFERING_CREATOR_ROLE } = PM_ROLES;
 * const { PAUSER_ROLE, DEFAULT_ADMIN_ROLE } = ATS_ROLES;
 * ```
 */

// Re-export namespaced constants from domain
export {
  PM_ROLES,
  PM_RESOLVER_KEYS,
  ATS_ROLES,
  FACTORY_PRIMARY_MARKET_CONFIG_ID,
  PRIMARY_MARKET_CONFIG_ID,
} from "./domain/constants";
