// SPDX-License-Identifier: Apache-2.0

/**
 * FactoryPrimaryMarket configuration module.
 *
 * Creates FactoryPrimaryMarket configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with FactoryPrimaryMarket-specific facet list
 * and config ID (10'000).
 *
 * Thin wrapper around createBatchConfiguration() from ATS infrastructure.
 *
 * @module domain/factoryPrimaryMarket/createConfiguration
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";

/**
 * FactoryPrimaryMarket facets: 2 ATS facets + 1 custom FactoryPrimaryMarket facet.
 * Note: ATS infrastructure warns about custom facets but configures them correctly.
 */
const FACTORY_PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "FactoryPrimaryMarketFacet"] as const;

/**
 * Create FactoryPrimaryMarket configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic createBatchConfiguration() with FactoryPrimaryMarket data:
 * - Configuration ID: FACTORY_PRIMARY_MARKET_CONFIG_ID (10'000)
 * - Facet list: FACTORY_PRIMARY_MARKET_FACETS (3 facets)
 *
 * All implementation logic handled by ATS createBatchConfiguration() operation.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @param factoryPrimaryMarketRegistry - Registry provider for facet definitions
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createFactoryPrimaryMarketConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'PauseFacet': '0xdef...',
 *         'FactoryPrimaryMarketFacet': '0x123...',
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
export async function createFactoryPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  factoryPrimaryMarketRegistry: RegistryProvider,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_PRIMARY_MARKET_CONFIG_ID,
    facetNames: FACTORY_PRIMARY_MARKET_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    gasLimit: 15_000_000,
    registry: factoryPrimaryMarketRegistry,
  });
}
