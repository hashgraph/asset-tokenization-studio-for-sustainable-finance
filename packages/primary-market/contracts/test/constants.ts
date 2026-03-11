// SPDX-License-Identifier: Apache-2.0

/**
 * Test constants module.
 *
 * Re-exports upstream ATS test constants and defines Primary Market-specific constants.
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

/** Mock contract names for ethers.getContractFactory() */
export const MOCK_ERC721_CONTRACT_NAME = "MockERC721";
export const MOCK_ERC20_CONTRACT_NAME = "MockERC20";
export const MOCK_ATS_FACTORY_CONTRACT_NAME = "MockAtsFactory";
export const MOCK_BOND_CONTRACT_NAME = "MockBond";
export const MOCK_BUSINESS_LOGIC_RESOLVER_CONTRACT_NAME = "MockBusinessLogicResolver";

/** Hedera-specific constants */
export const INT64_MAX = 9223372036854775807n;
export const HEDERA_PRECOMPILED_ADDRESS = "0x0000000000000000000000000000000000000167";

/** Gas limits for test assertions */
export const MAX_GAS_FOR_TREASURY_KPI_DEPLOYMENT = 10_000_000; // 10M gas

/** Treasury configuration defaults for tests */
export const TREASURY_CONFIG_VERSION = 1;

/** Test role names (for keccak256 hashing in tests) */
export const TEST_ROLE_1 = "ROLE_1";
export const TEST_ROLE_2 = "ROLE_2";
export const TEST_KPI_ROLE_1 = "KPI_ROLE_1";
export const TEST_KPI_ROLE_2 = "KPI_ROLE_2";
