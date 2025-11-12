// SPDX-License-Identifier: Apache-2.0

/**
 * PrimaryMarket configuration module.
 *
 * Creates PrimaryMarket configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with PrimaryMarket-specific facet list
 * and config ID (10'001).
 *
 * Thin wrapper around createBatchConfiguration() from ATS infrastructure.
 *
 * @module domain/primaryMarket/createConfiguration
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";

/**
 * PrimaryMarket facets: 2 ATS facets + 1 custom PrimaryMarket facet.
 * Note: ATS infrastructure warns about custom facets but configures them correctly.
 */
const PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "PrimaryMarketFacet"] as const;

/**
 * Create PrimaryMarket configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic createBatchConfiguration() with PrimaryMarket data:
 * - Configuration ID: PRIMARY_MARKET_CONFIG_ID (10'001)
 * - Facet list: PRIMARY_MARKET_FACETS (3 facets)
 *
 * All implementation logic handled by ATS createBatchConfiguration() operation.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @param primaryMarketRegistry - Registry provider for facet definitions
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createPrimaryMarketConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'PauseFacet': '0xdef...',
 *         'PrimaryMarketFacet': '0x123...',
 *     },
 *     false,
 *     factoryPrimaryMarketRegistry
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * }
 * ```
 */
export async function createPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  primaryMarketRegistry: RegistryProvider,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: PRIMARY_MARKET_CONFIG_ID,
    facetNames: PRIMARY_MARKET_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    gasLimit: 15_000_000,
    registry: primaryMarketRegistry,
  });
}
