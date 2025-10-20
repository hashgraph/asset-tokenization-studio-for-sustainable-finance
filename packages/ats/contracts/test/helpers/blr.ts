// SPDX-License-Identifier: Apache-2.0

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { TREASURY_CONFIG_ID } from "@scripts";

const TREASURY_FACETS = ["AccessControlFacet", "MockTreasuryFacet"] as const;

/**
 * Create mock Treasury configuration in BLR for FactorySuite testing.
 * In production, Treasury domain manages its own configuration.
 */
export async function createTreasuryConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: TREASURY_CONFIG_ID,
    facetNames: TREASURY_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
  });
}
