// SPDX-License-Identifier: Apache-2.0

/**
 * Treasury test helper module.
 *
 * Creates mock Treasury configuration in BusinessLogicResolver for FactorySuite testing.
 * This is test-only infrastructure to simulate a pre-existing Treasury configuration
 * without requiring actual Treasury contract implementations from the Treasury domain.
 *
 * @module test/helpers/treasuryTestHelper
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts/domain";

/**
 * Treasury facets list for testing (2 facets).
 *
 * Mock configuration for FactorySuite testing:
 * - AccessControlFacet (from ATS) - provides RBAC functionality
 * - MockTreasuryFacet (test mock) - minimal Treasury interface
 *
 * Note: In production, this would include real Treasury facets like
 * TreasuryLifecycleFacet, TreasuryPortfolioFacet, etc.
 */
const TREASURY_FACETS = ["AccessControlFacet", "MockTreasuryFacet"] as const;

/**
 * Create Treasury configuration in BusinessLogicResolver for testing.
 *
 * Creates a minimal Treasury configuration (ID 20000) that allows FactorySuite
 * to deploy Treasury ResolverProxy instances during bond suite deployment.
 *
 * Uses the same ATS createBatchConfiguration() helper as FactorySuite, ensuring
 * consistent configuration creation patterns.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createTreasuryConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',      // Reuse from FactorySuite
 *         'MockTreasuryFacet': '0x789...',        // Newly deployed mock
 *     },
 *     false
 * )
 *
 * if (result.success) {
 *   console.log(`Treasury config version: ${result.data.version}`)
 * }
 * ```
 */
export async function createTreasuryConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: TREASURY_CONFIG_ID,
    facetNames: TREASURY_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
  });
}
