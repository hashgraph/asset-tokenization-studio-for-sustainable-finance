// SPDX-License-Identifier: Apache-2.0

/**
 * FactorySuite configuration module.
 *
 * Creates FactorySuite configuration in BusinessLogicResolver with multi-registry support.
 * Combines ATS standard facets (AccessControl, Pause) with custom FactorySuite facets.
 *
 * Configuration ID: 30'000
 * Facets: DiamondFacet, AccessControlFacet, PauseFacet, FactorySuiteFacet (4 total)
 *
 * @module domain/factorySuite/createConfiguration
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_SUITE_CONFIG_ID, getFacetDefinitionFromRegistry } from "@scripts/domain";

/** FactorySuite facets: 3 ATS standard + 1 custom FactorySuiteFacet */
const FACTORY_SUITE_FACETS = ["DiamondFacet", "AccessControlFacet", "PauseFacet", "FactorySuiteFacet"] as const;

/**
 * Create FactorySuite configuration (ID 30'000) with 4 facets in BusinessLogicResolver.
 * Queries facet definitions from factorySuiteRegistry and atsRegistry.
 */
export async function createFactorySuiteConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  batchSize: number = DEFAULT_BATCH_SIZE,
  confirmations: number = 0,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facets = FACTORY_SUITE_FACETS.map((facetName) => {
    const address = facetAddresses[facetName];
    if (!address) {
      throw new Error(`Address not found for facet: ${facetName}`);
    }

    const { resolverKey } = getFacetDefinitionFromRegistry(facetName);
    return { facetName, resolverKey, address };
  });

  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_SUITE_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
    confirmations,
  });
}
