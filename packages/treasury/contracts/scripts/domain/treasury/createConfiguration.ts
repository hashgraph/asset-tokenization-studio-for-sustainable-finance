// SPDX-License-Identifier: Apache-2.0

/**
 * Treasury configuration module.
 *
 * Creates Treasury configuration in BusinessLogicResolver by calling
 * the generic infrastructure operation with Treasury-specific facet list
 * and config ID (30'000).
 *
 * Thin wrapper around createBatchConfiguration() from ATS infrastructure.
 *
 * @module domain/treasury/createConfiguration
 */

import { Contract } from 'ethers'
import {
    createBatchConfiguration,
    ConfigurationData,
    ConfigurationError,
    OperationResult,
} from '@hashgraph/asset-tokenization-contracts/scripts'
import { TREASURY_CONFIG_ID } from '@scripts/domain'
import type { RegistryProvider } from '@hashgraph/asset-tokenization-contracts/scripts'

/**
 * Treasury facets: 2 ATS facets + 3 custom Treasury facets.
 * Note: ATS infrastructure warns about custom facets but configures them correctly.
 */
const TREASURY_FACETS = [
    'AccessControlFacet',
    'PauseFacet',
    'LifeCycleCashFlowFacet',
    'PortfolioFacet',
    'ProceedsManagementFacet',
] as const

/**
 * Create Treasury configuration in BusinessLogicResolver.
 *
 * Thin wrapper that calls the generic createBatchConfiguration() with Treasury data:
 * - Configuration ID: TREASURY_CONFIG_ID (20'000)
 * - Facet list: TREASURY_FACETS (5 facets)
 *
 * All implementation logic handled by ATS createBatchConfiguration() operation.
 *
 * @param blrContract - BusinessLogicResolver contract instance
 * @param facetAddresses - Map of facet names to their deployed addresses
 * @param useTimeTravel - Whether to use TimeTravel variants (default: false)
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * import { BusinessLogicResolver__factory } from '@typechain'
 *
 * const blr = BusinessLogicResolver__factory.connect('0x1234...', signer)
 *
 * const result = await createTreasuryConfiguration(
 *     blr,
 *     {
 *         'AccessControlFacet': '0xabc...',
 *         'PauseFacet': '0xdef...',
 *         'LifeCycleCashFlowFacet': '0x123...',
 *         'PortfolioFacet': '0x456...',
 *         'ProceedsManagementFacet': '0x789...',
 *     },
 *     false
 * )
 *
 * if (result.success) {
 *   console.log(`Config version: ${result.data.version}`)
 *   console.log(`Registered ${result.data.facetKeys.length} facets`)
 * }
 * ```
 */
export async function createTreasuryConfiguration(
    blrContract: Contract,
    facetAddresses: Record<string, string>,
    useTimeTravel: boolean = false,
    treasuryRegistry: RegistryProvider
): Promise<OperationResult<ConfigurationData, ConfigurationError>> {
    return createBatchConfiguration(blrContract, {
        configurationId: TREASURY_CONFIG_ID,
        facetNames: TREASURY_FACETS,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy: false,
        batchSize: 2,
        gasLimit: 15_000_000,
        registry: treasuryRegistry,
    })
}
