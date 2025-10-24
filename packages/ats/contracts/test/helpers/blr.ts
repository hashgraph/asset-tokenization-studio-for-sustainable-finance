// SPDX-License-Identifier: Apache-2.0

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  combineRegistries,
  type RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts";

const TREASURY_FACETS = ["AccessControlFacet", "MockTreasuryFacet"] as const;

/**
 * Create mock Treasury configuration in BLR for FactorySuite testing.
 *
 * Test helper that creates a minimal Treasury configuration with AccessControlFacet
 * and MockTreasuryFacet. In production, the Treasury domain manages its own configuration.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants
 * @param registries - Array of registries (e.g., [atsRegistry, mockTreasuryRegistry])
 * @returns Operation result with configuration data or error
 */
export async function createTreasuryConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  registries?: RegistryProvider[],
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: TREASURY_CONFIG_ID,
    facetNames: TREASURY_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    registry: registries ? combineRegistries(...registries) : undefined,
  });
}
