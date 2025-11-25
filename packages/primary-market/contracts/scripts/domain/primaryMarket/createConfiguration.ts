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
  atsRegistry,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { PRIMARY_MARKET_CONFIG_ID, primaryMarketRegistry } from "@scripts/domain";

/**
 * PrimaryMarket facets: 2 ATS facets + 1 custom PrimaryMarket facet.
 */
const PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "PrimaryMarketFacet"] as const;

/**
 * Create PrimaryMarket configuration in BusinessLogicResolver.
 *
 * Uses separate registry lookups for domain clarity:
 * - AccessControlFacet and PauseFacet from atsRegistry
 * - PrimaryMarketFacet from primaryMarketRegistry
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
 * const result = await createPrimaryMarketConfiguration(
 *   blr,
 *   {
 *     'AccessControlFacet': '0xabc...',
 *     'PauseFacet': '0xdef...',
 *     'PrimaryMarketFacet': '0x123...'
 *   }
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 * }
 * ```
 */
export async function createPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facets = PRIMARY_MARKET_FACETS.map((facetName) => {
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
    configurationId: PRIMARY_MARKET_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
