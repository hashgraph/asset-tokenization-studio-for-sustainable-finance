// SPDX-License-Identifier: Apache-2.0

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  atsRegistry,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID, factorySuiteRegistry } from "@scripts";

const TREASURY_FACETS = ["AccessControlFacet", "MockTreasuryFacet"] as const;

/**
 * Create mock Treasury configuration in BLR for FactorySuite testing.
 *
 * Test helper that creates a minimal Treasury configuration with AccessControlFacet
 * and MockTreasuryFacet. In production, the Treasury domain manages its own configuration.
 *
 * Uses separate registry lookups for domain clarity:
 * - AccessControlFacet from atsRegistry
 * - MockTreasuryFacet from factorySuiteRegistry
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants
 * @returns Operation result with configuration data or error
 */
export async function createTreasuryConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  batchSize: number = DEFAULT_BATCH_SIZE,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  const facets = TREASURY_FACETS.map((facetName) => {
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
    configurationId: TREASURY_CONFIG_ID,
    facets,
    partialBatchDeploy: false,
    batchSize,
  });
}
