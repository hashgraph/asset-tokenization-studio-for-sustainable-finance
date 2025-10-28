// SPDX-License-Identifier: Apache-2.0

/**
 * Complete Treasury deployment workflow.
 *
 * Orchestrates the deployment of the entire Treasury infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - Required facets (AccessControl, Pause, LifeCycleCashFlow, Portfolio, ProceedsManagement)
 * - Facet registration in BLR
 * - Treasury configuration (config ID 20'000)
 * - Treasury proxy
 *
 * Provides comprehensive deployment output including all addresses, keys, config IDs,
 * versions, and optional Hedera Contract IDs.
 *
 * @module workflows/deployTreasury
 */

import type { DeploymentProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import {
    deployProxyAdmin,
    deployBlr,
    deployFacets,
    registerFacets,
    deployResolverProxy,
    info,
    success,
    section,
    error as logError,
} from '@hashgraph/asset-tokenization-contracts/scripts'
import { BusinessLogicResolver__factory } from '@hashgraph/asset-tokenization-contracts'
import { createTreasuryConfiguration } from '@scripts/domain'
import { treasuryRegistry } from '@scripts/infrastructure/treasuryRegistry'

/**
 * Complete deployment output structure.
 */
export interface DeployTreasuryOutput {
    /** Network name (testnet, mainnet, hardhat, etc.) */
    network: string

    /** ISO timestamp of deployment */
    timestamp: string

    /** Deployer address */
    deployer: string

    /** Infrastructure contracts */
    infrastructure: {
        proxyAdmin: {
            address: string
            contractId?: string
        }
        blr: {
            implementation: string
            proxy: string
            contractId?: string
        }
        treasury: {
            implementation: string
            proxy: string
            contractId?: string
        }
    }

    /** Deployed facets */
    facets: Array<{
        name: string
        address: string
        contractId?: string
        key: string
    }>

    /** Treasury configuration */
    configuration: {
        configId: string
        version: number
        facetCount: number
        facets: Array<{
            facetName: string
            key: string
            address: string
        }>
    }

    /** Deployment summary */
    summary: {
        totalContracts: number
        totalFacets: number
        deploymentTime: number
        success: boolean
    }
}

/**
 * Options for complete Treasury deployment.
 */
export interface DeployTreasuryOptions {
    /** Whether to use TimeTravel variants for facets */
    useTimeTravel?: boolean

    /** Whether to save deployment output to file */
    saveOutput?: boolean

    /** Path to save deployment output */
    outputPath?: string
}

/**
 * Deploy complete Treasury.
 *
 * Executes the full deployment workflow:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver with proxy
 * 3. Deploy facets (AccessControl, Pause, LifeCycleCashFlow, Portfolio, ProceedsManagement)
 * 4. Register facets in BLR
 * 5. Create Treasury configuration (config ID 20'000)
 * 6. Deploy Treasury proxy
 *
 * Returns comprehensive deployment output with all addresses, keys, versions, and IDs.
 *
 * @param provider - Deployment provider (HardhatProvider or StandaloneProvider)
 * @param network - Network name (testnet, mainnet, hardhat, etc.)
 * @param options - Deployment options
 * @returns Promise resolving to complete deployment output
 *
 * @example
 * ```typescript
 * import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts/infrastructure'
 *
 * // Create provider
 * const provider = new HardhatProvider()
 *
 * // Deploy complete system to hardhat network
 * const output = await deployTreasury(provider, 'hardhat', {
 *     useTimeTravel: false,
 *     saveOutput: true
 * })
 *
 * info(`BLR Proxy: ${output.infrastructure.blr.proxy}`)
 * info(`Treasury Proxy: ${output.infrastructure.treasury.proxy}`)
 * info(`Config Version: ${output.configuration.version}`)
 * ```
 */
export async function deployTreasury(
    provider: DeploymentProvider,
    network: string,
    options: DeployTreasuryOptions = {}
): Promise<DeployTreasuryOutput> {
    const {
        useTimeTravel = false,
        saveOutput: _saveOutput = false,
        outputPath: _outputPath,
    } = options

    const startTime = Date.now()
    const signer = await provider.getSigner()
    const deployer = await signer.getAddress()

    section('Treasury Deployment')
    info('═'.repeat(60))
    info(`📡 Network: ${network}`)
    info(`👤 Deployer: ${deployer}`)
    info(`🔄 TimeTravel: ${useTimeTravel ? 'Enabled' : 'Disabled'}`)
    info('═'.repeat(60))

    try {
        info('\n📋 Step 1/6: Deploying ProxyAdmin...')
        const proxyAdminResult = await deployProxyAdmin(provider)

        if (!proxyAdminResult.success) {
            throw new Error(
                `ProxyAdmin deployment failed: ${proxyAdminResult.error}`
            )
        }

        info(`✅ ProxyAdmin: ${proxyAdminResult.proxyAdminAddress}`)

        info('\n🔷 Step 2/6: Deploying BusinessLogicResolver...')
        const blrResult = await deployBlr(provider, {
            proxyAdminAddress: proxyAdminResult.proxyAdminAddress,
        })

        if (!blrResult.success) {
            throw new Error(`BLR deployment failed: ${blrResult.error}`)
        }

        info(`✅ BLR Implementation: ${blrResult.implementationAddress}`)
        info(`✅ BLR Proxy: ${blrResult.blrAddress}`)

        info('\n📦 Step 3/6: Deploying facets...')

        const facetNames = useTimeTravel
            ? [
                  'AccessControlFacetTimeTravel',
                  'PauseFacetTimeTravel',
                  'LifeCycleCashFlowFacetTimeTravel',
                  'PortfolioFacetTimeTravel',
                  'ProceedsManagementFacetTimeTravel',
                  'TimeTravelFacet',
              ]
            : [
                  'AccessControlFacet',
                  'PauseFacet',
                  'LifeCycleCashFlowFacet',
                  'PortfolioFacet',
                  'ProceedsManagementFacet',
              ]

        info(`   Facets to deploy: ${facetNames.join(', ')}`)

        const facetsResult = await deployFacets(provider, {
            facetNames,
            useTimeTravel,
            registries: [treasuryRegistry],
        })

        if (!facetsResult.success) {
            throw new Error('Facet deployment had failures')
        }

        info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`)

        info('\n📝 Step 4/6: Registering facets in BLR...')

        const facetAddresses: Record<string, string> = {}
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
            if (deploymentResult.address) {
                facetAddresses[facetName] = deploymentResult.address
            }
        })

        const registerResult = await registerFacets(provider, {
            blrAddress: blrResult.blrAddress,
            facets: facetAddresses,
            registries: [treasuryRegistry],
        })

        if (!registerResult.success) {
            throw new Error(
                `Facet registration failed: ${registerResult.error}`
            )
        }

        info(`✅ Registered ${registerResult.registered.length} facets in BLR`)

        info('\n💼 Step 5/6: Creating Treasury configuration...')

        const blrContract = BusinessLogicResolver__factory.connect(
            blrResult.blrAddress,
            signer
        )

        const treasuryConfig = await createTreasuryConfiguration(
            blrContract,
            facetAddresses,
            useTimeTravel,
            treasuryRegistry
        )

        if (!treasuryConfig.success) {
            throw new Error('Treasury config failed')
        }

        info(`✅ Treasury Config ID: ${treasuryConfig.data.configurationId}`)
        info(`✅ Config Version: ${treasuryConfig.data.version}`)
        info(`✅ Facets: ${treasuryConfig.data.facetKeys.length}`)

        info('\n🏭 Step 6/6: Deploying Treasury ResolverProxy...')

        const DEFAULT_ADMIN_ROLE =
            '0x0000000000000000000000000000000000000000000000000000000000000000'

        const treasuryProxyResult = await deployResolverProxy(provider, {
            blrAddress: blrResult.blrAddress,
            configurationId: treasuryConfig.data.configurationId,
            version: treasuryConfig.data.version,
            rbac: [
                {
                    role: DEFAULT_ADMIN_ROLE,
                    members: [deployer],
                },
            ],
            network,
        })

        if (!treasuryProxyResult.success) {
            throw new Error(
                `Treasury ResolverProxy deployment failed: ${treasuryProxyResult.error}`
            )
        }

        const treasuryAddress = treasuryProxyResult.proxyAddress!

        info(`✅ Treasury ResolverProxy deployed successfully`)
        info(`   Address: ${treasuryAddress}`)
        if (treasuryProxyResult.contractId) {
            info(`   Contract ID: ${treasuryProxyResult.contractId}`)
        }

        const endTime = Date.now()

        const output: DeployTreasuryOutput = {
            network,
            timestamp: new Date().toISOString(),
            deployer,

            infrastructure: {
                proxyAdmin: {
                    address: proxyAdminResult.proxyAdminAddress,
                },
                blr: {
                    implementation: blrResult.implementationAddress,
                    proxy: blrResult.blrAddress,
                },
                treasury: {
                    implementation: blrResult.blrAddress,
                    proxy: treasuryAddress,
                },
            },

            facets: Array.from(facetsResult.deployed.entries()).map(
                ([facetName, deploymentResult]) => {
                    const facetAddress = deploymentResult.address!
                    const configFacet = treasuryConfig.data.facetKeys.find(
                        (f) => f.address === facetAddress
                    )

                    return {
                        name: facetName,
                        address: facetAddress,
                        key: configFacet?.key || '',
                    }
                }
            ),

            configuration: {
                configId: treasuryConfig.data.configurationId,
                version: treasuryConfig.data.version,
                facetCount: treasuryConfig.data.facetKeys.length,
                facets: treasuryConfig.data.facetKeys,
            },

            summary: {
                totalContracts: 5,
                totalFacets: facetsResult.deployed.size,
                deploymentTime: endTime - startTime,
                success: true,
            },
        }

        info('\n' + '═'.repeat(60))
        info('✨ DEPLOYMENT COMPLETE')
        info('═'.repeat(60))
        info(
            `⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`
        )
        info(`📦 Facets deployed: ${output.summary.totalFacets}`)
        info(`⚙️  Configuration version: ${output.configuration.version}`)
        info('═'.repeat(60))

        success('Treasury deployed successfully')

        return output
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        logError('\n❌ Deployment failed:', errorMessage)

        throw error
    }
}
