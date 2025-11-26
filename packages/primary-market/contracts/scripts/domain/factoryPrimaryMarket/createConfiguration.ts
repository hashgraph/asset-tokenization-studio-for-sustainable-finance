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
  atsRegistry,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_PRIMARY_MARKET_CONFIG_ID, primaryMarketRegistry } from "@scripts/domain";

/**
 * FactoryPrimaryMarket facets: 2 ATS facets + 1 custom FactoryPrimaryMarket facet.
 */
const FACTORY_PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "FactoryPrimaryMarketFacet"] as const;

/**
 * Create FactoryPrimaryMarket configuration in BusinessLogicResolver.
 *
 * Uses separate registry lookups for domain clarity:
 * - AccessControlFacet and PauseFacet from atsRegistry
 * - FactoryPrimaryMarketFacet from primaryMarketRegistry
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createFactoryPrimaryMarketConfiguration(
 *   blr,
 *   {
 *     'AccessControlFacet': '0xabc...',
 *     'PauseFacet': '0xdef...',
 *     'FactoryPrimaryMarketFacet': '0x123...'
 *   }
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 * }
 * ```
 */
export async function createFactoryPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Build facet list - include TimeTravelFacet if present in facetAddresses
  const facetNames: string[] = [...FACTORY_PRIMARY_MARKET_FACETS];
  if (facetAddresses["TimeTravelFacet"]) {
    facetNames.push("TimeTravelFacet");
  }

  const facets = facetNames.map((facetName) => {
    const address = facetAddresses[facetName];
    if (!address) {
      throw new Error(`Address not found for facet: ${facetName}`);
    }

    const primaryMarketFacet = primaryMarketRegistry.getFacetDefinition(facetName);
    if (primaryMarketFacet?.resolverKey?.value) {
      return {
        facetName,
        resolverKey: primaryMarketFacet.resolverKey.value,
        address,
      };
    }

    const atsFacet = atsRegistry.getFacetDefinition(facetName);
    if (atsFacet?.resolverKey?.value) {
      return {
        facetName,
        resolverKey: atsFacet.resolverKey.value,
        address,
      };
    }

    throw new Error(`Facet ${facetName} not found in PrimaryMarket or ATS registries`);
  });

  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_PRIMARY_MARKET_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
