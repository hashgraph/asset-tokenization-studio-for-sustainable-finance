// SPDX-License-Identifier: Apache-2.0

/**
 * Test constants module.
 *
 * Re-exports upstream ATS test constants and defines GBP FactorySuite-specific constants.
 *
 * @module test/constants
 */

// Re-export upstream ATS test constants
export {
  TEST_SIZES,
  BLR_VERSIONS,
  TEST_ADDRESSES,
  TEST_CONFIG_IDS,
  TEST_BYTES32,
  TEST_TOKEN_METADATA,
  TEST_NOMINAL_VALUES,
  TEST_REGULATION,
  TEST_GAS_LIMITS,
  TEST_OPTIONS,
} from "@hashgraph/asset-tokenization-contracts/test";

/**
 * Mock contract names (legacy - prefer TypeChain factories)
 *
 * @deprecated Use TypeChain factories from @contract-types instead:
 * - MockERC721__factory
 * - MockERC20__factory
 * - MockAtsFactory__factory
 * - MockBond__factory
 * - MockBusinessLogicResolver__factory
 */
export const MOCK_ERC721_CONTRACT_NAME = "MockERC721";
export const MOCK_ERC20_CONTRACT_NAME = "MockERC20";
export const MOCK_ATS_FACTORY_CONTRACT_NAME = "MockAtsFactory";
export const MOCK_BOND_CONTRACT_NAME = "MockBond";
export const MOCK_BUSINESS_LOGIC_RESOLVER_CONTRACT_NAME = "MockBusinessLogicResolver";

/** Gas limits for test assertions */
export const MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT = 10_000_000; // 10M gas

/** Treasury configuration defaults for tests */
export const TREASURY_CONFIG_VERSION = 1;

/** Test role names (for keccak256 hashing in tests) */
export const TEST_ROLE_1 = "ROLE_1";
export const TEST_ROLE_2 = "ROLE_2";
export const TEST_KPI_ROLE_1 = "KPI_ROLE_1";
export const TEST_KPI_ROLE_2 = "KPI_ROLE_2";
