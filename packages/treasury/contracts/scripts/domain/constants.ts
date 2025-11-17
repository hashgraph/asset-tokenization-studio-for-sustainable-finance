// SPDX-License-Identifier: Apache-2.0

/**
 * Domain-specific constants for Green Bonds Platform FactorySuite.
 *
 * These constants are specific to FactorySuite business logic and should not
 * be moved to infrastructure.
 *
 * @module domain/constants
 */

// Configuration IDs

/** Treasury configuration ID - bytes32(uint256(20000)) */
export const TREASURY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000004e20";

// Access Control Roles

/** FactorySuite role identifiers (keccak256 hashes) */
export const TREASURY_ROLES = {
  /**  keccak256('green.bonds.platform.treasury.role.portfolio.manager') */
  PORTFOLIO_MANAGER_ROLE: "0xf8f1da56e510d0db422582238e75a932b72ae6165ad31a4c2eb993e0c9196a06",

  /**  keccak256('green.bonds.platform.treasury.role.funds.manager') */
  FUNDS_MANAGER_ROLE: "0x6b2cde3f3e0fdc0dee8b8dc6466157b675ab2b8465c45b8b9c4cf0049a93344d",

  /**  keccak256('green.bonds.platform.treasury.role.proceeds.full.manager') */
  PROCEEDS_FULL_MANAGER_ROLE: "0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5",

  /**  keccak256('green.bonds.platform.treasury.role.payout') */
  PAYOUT_ROLE: "0x096259e60fc84b10645035350be6adc907cf0cd20b1a7866e1ea9c7502a8265e",

  /**  keccak256('green.bonds.platform.treasury.role.redemption') */
  REDEMPTION_ROLE: "0x75e1cb791887e8c7a9a1aafbb8997773bd21a9f3c83f4a70066ba5ebf7bd8ef9",
} as const;

// Resolver Keys

/** Treasury facet registration key - keccak256('green.bonds.platform.treasury.resolverKey') */
export const TREASURY_RESOLVER_KEY = "0xbd0a699ba2f61a424c62af9491501d66e9fc5de76680cb3689be785b4491d525";

/** LifeCycleCashFlow facet registration key - keccak256('green.bonds.platform.treasury.life.cycle.cash.flow.resolverKey') */
export const LIFE_CYCLE_CASH_FLOW_RESOLVER_KEY = "0x736f8e61e6c72487b02f45e6c78b61696830b34980c34650cf1ee7ff1317aa3b";

/** Portfolio facet registration key - keccak256('green.bonds.platform.treasury.portfolio.resolverKey') */
export const PORTFOLIO_RESOLVER_KEY = "0xb359d020e9b3bd3669a9c566ea4239dca8073296acfdce3081b36dbe0c26dc08";

/** ProceedsManagement facet registration key - keccak256('green.bonds.platform.treasury.proceeds.management.resolverKey') */
export const PROCEEDS_MANAGEMENT_RESOLVER_KEY = "0x35281f2a9d51aaa8039b43628c449883ae75ac5127919961f04bc253a99e0237";
