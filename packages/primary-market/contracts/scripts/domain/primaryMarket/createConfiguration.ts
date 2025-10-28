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
  RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";

const PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "PrimaryMarketFacet"] as const;

export async function createPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  registry?: RegistryProvider,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: PRIMARY_MARKET_CONFIG_ID,
    facetNames: PRIMARY_MARKET_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    registry,
  });
}
