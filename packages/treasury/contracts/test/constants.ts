// SPDX-License-Identifier: Apache-2.0

/**
 * Test constants module.
 *
 * Re-exports upstream ATS test constants and defines Treasury-specific constants.
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
 * - EnvironmentalAssetFactory__factory
 * - PaymentTokenFactory__factory
 * - AssetMock__factory
 * - ITreasury__factory
 */
export const MOCK_ENVIRONMENTAL_ASSET_FACTORY_CONTRACT_NAME = "EnvironmentalAssetFactory";
export const MOCK_PAYMENT_TOKEN_FACTORY_CONTRACT_NAME = "PaymentTokenFactory";
export const MOCK_ASSET_CONTRACT_NAME = "AssetMock";
export const MOCK_TREASURY_CONTRACT_NAME = "ITreasury";
export const HEDERA_PRECOMPILED_ADDRESS = "0x0000000000000000000000000000000000000167";

/** Gas limits for test assertions */
export const MAX_GAS_FOR_TREASURY_DEPLOYMENT = 10_000_000; // 10M gas

/** Treasury configuration defaults for tests */
export const TREASURY_CONFIG_VERSION = 1;

/** Test role names (for keccak256 hashing in tests) */
export const TEST_ROLE_1 = "ROLE_1";
export const TEST_ROLE_2 = "ROLE_2";
export const TEST_PORTFOLIO_ROLE_1 = "PORTFOLIO_ROLE_1";
export const TEST_PORTFOLIO_ROLE_2 = "PORTFOLIO_ROLE_2";
