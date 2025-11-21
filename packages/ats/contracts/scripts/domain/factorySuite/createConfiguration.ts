// SPDX-License-Identifier: Apache-2.0

/**
 * FactorySuite configuration module.
 *
 * Creates FactorySuite configuration in BusinessLogicResolver with multi-registry support.
 * Combines ATS standard facets (AccessControl, Pause) with custom FactorySuite facets.
 *
 * Configuration ID: 30'000
 * Facets: AccessControlFacet, PauseFacet, FactorySuiteFacet (3 total)
 *
 * @module domain/factorySuite/createConfiguration
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
import { FACTORY_SUITE_CONFIG_ID, factorySuiteRegistry } from "@scripts/domain";

/** FactorySuite facets: 2 ATS standard + 1 custom FactorySuiteFacet */
const FACTORY_SUITE_FACETS = ["AccessControlFacet", "PauseFacet", "FactorySuiteFacet"] as const;

/**
 * Create FactorySuite configuration in BusinessLogicResolver.
 *
 * Uses separate registry lookups for domain clarity:
 * - AccessControlFacet and PauseFacet from atsRegistry
 * - FactorySuiteFacet from factorySuiteRegistry
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createFactorySuiteConfiguration(
 *   blr,
 *   {
 *     'AccessControlFacet': '0xabc...',
 *     'PauseFacet': '0xdef...',
 *     'FactorySuiteFacet': '0x123...'
 *   },
 *   false
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 * }
 * ```
 */
export async function createFactorySuiteConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  _useTimeTravel: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facets = FACTORY_SUITE_FACETS.map((facetName) => {
    const address = facetAddresses[facetName];
    if (!address) {
      throw new Error(`Address not found for facet: ${facetName}`);
    }

    const factorySuiteFacet = factorySuiteRegistry.getFacetDefinition(facetName);
    if (factorySuiteFacet?.resolverKey?.value) {
      return {
        facetName,
        resolverKey: factorySuiteFacet.resolverKey.value,
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

    throw new Error(`Facet ${facetName} not found in FactorySuite or ATS registries`);
  });

  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_SUITE_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
