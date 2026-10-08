// SPDX-License-Identifier: Apache-2.0

/**
 * Treasury configuration module.
 *
 * Creates Treasury configuration in BusinessLogicResolver with multi-registry support.
 * Combines ATS standard facets (AccessControl, Pause) with custom Treasury facets.
 *
 * Configuration ID: 20'000
 * Facets: AccessControlFacet, PauseFacet, LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet (5 total)
 *
 * @module domain/treasury/createConfiguration
 */

import { BusinessLogicResolver } from "@hashgraph/asset-tokenization-contracts";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts/domain";
import { getFacetDefinitionFromRegistry } from "@scripts/domain/utils";

/**
 * Treasury facets: 3 ATS facets + 3 custom Treasury facets.
 * DiamondFacet provides ResolverProxy management (getConfigInfo, diamondCut).
 */
const TREASURY_FACETS = [
  "DiamondFacet",
  "AccessControlFacet",
  "PauseFacet",
  "LifeCycleCashFlowFacet",
  "PortfolioFacet",
  "ProceedsManagementFacet",
] as const;

/**
 * Create Treasury configuration in BusinessLogicResolver.
 *
 * Uses separate registry lookups for domain clarity:
 * - AccessControlFacet and PauseFacet from atsRegistry
 * - Treasury custom facets from treasuryRegistry
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param _useTimeTravel - Reserved for future use. Currently unused - TimeTravel facet
 *   detection is automatic based on facetAddresses content. If "TimeTravelFacet" key
 *   exists in facetAddresses map, the TimeTravel variant is used; otherwise standard
 *   facet is used. This parameter is kept for API compatibility and future enhancement.
 * @param batchSize - Size of batches for configuration operations (default: 50)
 * @param confirmations - Number of block confirmations to wait (default: 0)
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createTreasuryConfiguration(
 *   blr,
 *   {
 *     'AccessControlFacet': '0xabc...',
 *     'PauseFacet': '0xdef...',
 *     'LifeCycleCashFlowFacet': '0x123...',
 *     'PortfolioFacet': '0x456...',
 *     'ProceedsManagementFacet': '0x789...'
 *   },
 *   false
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 * }
 * ```
 */
export async function createTreasuryConfiguration(
  blrContract: BusinessLogicResolver,
  facetAddresses: Record<string, string>,
  _useTimeTravel: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Build facet list - include TimeTravelFacet if present in facetAddresses
  const facetNames: string[] = [...TREASURY_FACETS];
  if (facetAddresses["TimeTravelFacet"]) {
    facetNames.push("TimeTravelFacet");
  }

  const facets = facetNames.map((name) => {
    const address = facetAddresses[name];

    if (!address) {
      throw new Error(`Address not found for facet: ${name}`);
    }

    const { resolverKey } = getFacetDefinitionFromRegistry(name);
    return {
      facetName: name,
      address,
      resolverKey,
    };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: TREASURY_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
