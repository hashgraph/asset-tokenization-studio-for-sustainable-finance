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
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";
import { getFacetDefinitionFromRegistry } from "@scripts/domain/utils";

/**
 * PrimaryMarket facets: 3 ATS facets + 1 custom PrimaryMarket facet.
 * DiamondFacet provides ResolverProxy management (getConfigInfo, diamondCut).
 */
const PRIMARY_MARKET_FACETS = ["DiamondFacet", "AccessControlFacet", "PauseFacet", "PrimaryMarketFacet"] as const;

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
  // Build facet list - include TimeTravelFacet if present in facetAddresses
  const facetNames: string[] = [...PRIMARY_MARKET_FACETS];
  if (facetAddresses["TimeTravelFacet"]) {
    facetNames.push("TimeTravelFacet");
  }

  const facets = facetNames.map((facetName) => {
    const address = facetAddresses[facetName];
    if (!address) {
      throw new Error(`Address not found for facet: ${facetName}`);
    }

    const { resolverKey } = getFacetDefinitionFromRegistry(facetName);
    return {
      facetName,
      resolverKey,
      address,
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: PRIMARY_MARKET_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
