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
  combineRegistries,
  type RegistryProvider,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { FACTORY_SUITE_CONFIG_ID } from "@scripts/domain";

/** FactorySuite facets: 2 ATS standard + 1 custom FactorySuiteFacet */
const FACTORY_SUITE_FACETS = ["AccessControlFacet", "PauseFacet", "FactorySuiteFacet"] as const;

/**
 * Create FactorySuite configuration in BusinessLogicResolver.
 *
 * Supports multi-registry configuration by accepting multiple registries to resolve
 * facet resolver keys. Pass atsRegistry for standard facets and factorySuiteRegistry
 * for custom facets. The function internally combines registries before configuration.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants
 * @param registries - Array of registry providers (e.g., [atsRegistry, factorySuiteRegistry])
 * @returns Operation result with configuration data or error
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 * import { atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts'
 * import { factorySuiteRegistry } from '@scripts/domain'
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
 *   false,
 *   [atsRegistry, factorySuiteRegistry]
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
  useTimeTravel: boolean = false,
  registries?: RegistryProvider[],
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
  return createBatchConfiguration(blrContract, {
    configurationId: FACTORY_SUITE_CONFIG_ID,
    facetNames: FACTORY_SUITE_FACETS,
    facetAddresses,
    useTimeTravel,
    partialBatchDeploy: false,
    batchSize: 2,
    registry: registries ? combineRegistries(...registries) : undefined,
  });
}
