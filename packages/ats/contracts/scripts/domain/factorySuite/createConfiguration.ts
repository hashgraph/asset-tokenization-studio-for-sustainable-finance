// SPDX-License-Identifier: Apache-2.0

/**
 * FactorySuite configuration module.
 *
 * Creates FactorySuite configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with FactorySuite-specific facet list
 * and config ID (30'000).
 *
 * Thin wrapper around createBatchConfiguration() from ATS infrastructure.
 *
 * @module domain/factorySuite/createConfiguration
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_SUITE_CONFIG_ID } from "@scripts/domain";

/**
 * FactorySuite facets: 2 ATS facets + 1 custom FactorySuiteFacet.
 * Note: ATS infrastructure warns about custom facets but configures them correctly.
 */
const FACTORY_SUITE_FACETS = ["AccessControlFacet", "PauseFacet", "FactorySuiteFacet"] as const;

/**
 * Create FactorySuite configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic createBatchConfiguration() with FactorySuite data:
 * - Configuration ID: FACTORY_SUITE_CONFIG_ID (30'000)
 * - Facet list: FACTORY_SUITE_FACETS (3 facets)
 *
 * All implementation logic handled by ATS createBatchConfiguration() operation.
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
 * const result = await createFactorySuiteConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'PauseFacet': '0xdef...',
 *         'FactorySuiteFacet': '0x123...',
 *     },
 *     false
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * }
 * ```
 */
export async function createFactorySuiteConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_SUITE_CONFIG_ID,
    facetNames: FACTORY_SUITE_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
  });
}
