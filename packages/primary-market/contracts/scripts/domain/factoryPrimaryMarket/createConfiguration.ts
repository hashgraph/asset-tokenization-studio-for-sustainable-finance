// SPDX-License-Identifier: Apache-2.0

/**
 * FactoryPrimaryMarket configuration module.
 *
 * Creates FactoryPrimaryMarket configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with FactoryPrimaryMarket-specific facet list
 * and config ID (10'000).
 *
 * Thin wrapper around createBatchConfiguration() from ATS infrastructure.
 *
 * @module domain/factorySuite/createConfiguration
 */

import { Contract } from "ethers";
import {
  createBatchConfiguration,
  ConfigurationData,
  ConfigurationError,
  OperationResult,
  RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_PRIMARY_MARKET_CONFIG_ID } from "@scripts/domain";

const FACTORY_PRIMARY_MARKET_FACETS = ["AccessControlFacet", "PauseFacet", "FactoryPrimaryMarketFacet"] as const;

export async function createFactoryPrimaryMarketConfiguration(
  blrContract: Contract,
  facetAddresses: Record<string, string>,
  useTimeTravel: boolean = false,
  registry?: RegistryProvider,
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_PRIMARY_MARKET_CONFIG_ID,
    facetNames: FACTORY_PRIMARY_MARKET_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    registry,
  });
}
