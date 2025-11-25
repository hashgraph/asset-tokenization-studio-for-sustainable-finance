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

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  type FacetConfigurationData,
  atsRegistry,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID, FACET_REGISTRY } from "@scripts/domain";

/**
 * Treasury facets: 2 ATS facets + 3 custom Treasury facets.
 * Note: ATS infrastructure warns about custom facets but configures them correctly.
 */
const TREASURY_FACETS = [
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
 * - Treasury custom facets from FACET_REGISTRY
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
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
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  // Transform facet names and addresses into FacetConfigurationData array
  // Uses multi-registry pattern: checks Treasury registry first, then falls back to ATS registry
  const facets: FacetConfigurationData[] = TREASURY_FACETS.map((name) => {
    const facetName = useTimeTravel ? `${name}TimeTravel` : name;
    const address = facetAddresses[name];

    if (!address) {
      throw new Error(`Address not found for facet: ${name}`);
    }

    // Try Treasury registry first (custom Treasury facets)
    const treasuryFacet = FACET_REGISTRY[facetName];
    if (treasuryFacet?.resolverKey?.value) {
      return {
        facetName,
        address,
        resolverKey: treasuryFacet.resolverKey.value,
      };
    }

    // Fall back to ATS registry (standard facets: AccessControl, Pause)
    const atsFacet = atsRegistry.getFacetDefinition(facetName);
    if (atsFacet?.resolverKey?.value) {
      return {
        facetName,
        address,
        resolverKey: atsFacet.resolverKey.value,
      };
    }

    throw new Error(`Facet ${facetName} not found in Treasury or ATS registries`);
  });

  return createBatchConfiguration(blrContract, {
    configurationId: TREASURY_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
