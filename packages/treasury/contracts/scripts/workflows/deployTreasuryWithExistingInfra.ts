// SPDX-License-Identifier: Apache-2.0

import type { DeploymentProvider } from '@hashgraph/asset-tokenization-contracts/scripts'
import {
    deployFacets,
    registerAdditionalFacets,
    deployResolverProxy,
    info,
    success,
    section,
    error as logError,
    configureLogger,
    LogLevel,
} from '@hashgraph/asset-tokenization-contracts/scripts'
import { BusinessLogicResolver__factory } from '@hashgraph/asset-tokenization-contracts'
import { createTreasuryConfiguration } from '@scripts/domain'
import { treasuryRegistry } from '@scripts/infrastructure/treasuryRegistry'
import type { DeployTreasuryOutput } from './deployTreasury'

/**
 * Existing infrastructure addresses.
 */
export interface ExistingInfrastructure {
    /** Existing BLR proxy address (shared across modules) */
    blrAddress: string

    /** Existing ProxyAdmin address */
    proxyAdminAddress: string

    /** Existing shared facets */
    facets: {
        /** AccessControlFacet address (must be registered in BLR) */
        accessControl: string

        /** PauseFacet address (must be registered in BLR) */
        pause: string
    }
}

/**
 * Options for deployment with existing infrastructure.
 */
export interface DeployWithExistingInfraOptions {
    /** Whether to use TimeTravel variants for facets */
    useTimeTravel?: boolean

    /** Whether to save deployment output to file */
    saveOutput?: boolean

    /** Path to save deployment output */
    outputPath?: string
}

export async function deployTreasuryWithExistingInfra(
    provider: DeploymentProvider,
    network: string,
    existingInfra: ExistingInfrastructure,
    options: DeployWithExistingInfraOptions = {}
): Promise<DeployTreasuryOutput> {
    configureLogger({ level: LogLevel.SILENT })
    const {
        useTimeTravel = false,
        saveOutput: _saveOutput = false,
        outputPath: _outputPath,
    } = options

    const startTime = Date.now()
    const signer = await provider.getSigner()
    const deployer = await signer.getAddress()

    section('Treasury Deployment (Existing Infrastructure)')
    info('═'.repeat(60))
    info(`📡 Network: ${network}`)
    info(`👤 Deployer: ${deployer}`)
    info(`🔄 TimeTravel: ${useTimeTravel ? 'Enabled' : 'Disabled'}`)
    info(`🏗️  Mode: Using existing BLR and common facets`)
    info('═'.repeat(60))

    try {
        // ========================================
        // STEP 1: Validate existing infrastructure
        // ========================================
        info('\n🔍 Step 1/4: Validating existing infrastructure...')

        const { blrAddress, proxyAdminAddress, facets } = existingInfra

        if (
            !blrAddress ||
            blrAddress === '0x0000000000000000000000000000000000000000'
        ) {
            throw new Error('Invalid BLR address')
        }
        if (
            !proxyAdminAddress ||
            proxyAdminAddress === '0x0000000000000000000000000000000000000000'
        ) {
            throw new Error('Invalid ProxyAdmin address')
        }
        if (
            !facets.accessControl ||
            facets.accessControl ===
                '0x0000000000000000000000000000000000000000'
        ) {
            throw new Error('Invalid AccessControlFacet address')
        }
        if (
            !facets.pause ||
            facets.pause === '0x0000000000000000000000000000000000000000'
        ) {
            throw new Error('Invalid PauseFacet address')
        }

        info(`✅ BLR Proxy: ${blrAddress}`)
        info(`✅ ProxyAdmin: ${proxyAdminAddress}`)
        info(`✅ AccessControlFacet: ${facets.accessControl}`)
        info(`✅ PauseFacet: ${facets.pause}`)

        // =====================================================================================
        // STEP 2: Deploy only LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet
        // =====================================================================================
        info(
            '\n📦 Step 2/4: Deploying LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet...'
        )

        const facetNames = useTimeTravel
            ? [
                  'LifeCycleCashFlowFacetTimeTravel',
                  'PortfolioFacetTimeTravel',
                  'ProceedsManagementFacetTimeTravel',
                  'TimeTravelFacet',
              ]
            : [
                  'LifeCycleCashFlowFacet, PortfolioFacet, ProceedsManagementFacet',
              ]

        info(`   Facets to deploy: ${facetNames.join(', ')}`)

        const facetsResult = await deployFacets(provider, {
            facetNames,
            useTimeTravel,
            registries: [treasuryRegistry],
        })

        if (!facetsResult.success) {
            throw new Error('TreasuryFacet deployment failed')
        }

        info(`✅ Deployed ${facetsResult.deployed.size} new facet(s)`)

        // ========================================
        // STEP 3: Register new facets in existing BLR
        // ========================================
        info('\n📝 Step 3/4: Registering new facets in BLR...')

        const newFacetAddresses: Record<string, string> = {}
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
            if (deploymentResult.address) {
                newFacetAddresses[facetName] = deploymentResult.address
            }
        })

        const registerResult = await registerAdditionalFacets(provider, {
            blrAddress,
            newFacets: newFacetAddresses,
        })

        if (!registerResult.success) {
            throw new Error(
                `Facet registration failed: ${registerResult.error}`
            )
        }

        info(
            `✅ Registered ${Object.keys(newFacetAddresses).length} new facet(s)`
        )

        // ========================================
        // STEP 4: Create Treasury configuration
        // ========================================
        info('\n💼 Step 4/4: Creating Treasury configuration...')

        const blrContract = BusinessLogicResolver__factory.connect(
            blrAddress,
            signer
        )

        const treasuryConfig = await createTreasuryConfiguration(
            blrContract,
            newFacetAddresses,
            useTimeTravel,
            treasuryRegistry
        )

        if (!treasuryConfig.success) {
            //throw new Error(`Treasury config failed: ${treasuryConfig.error} - ${treasuryConfig.message}`);
            throw new Error(`Treasury config failed: ${treasuryConfig}`)
        }

        info(`✅ Treasury Config ID: ${treasuryConfig.data.configurationId}`)
        info(`✅ Config Version: ${treasuryConfig.data.version}`)
        info(
            `✅ Total Facets: ${treasuryConfig.data.facetKeys.length} (${Object.keys(newFacetAddresses).length} new + ${Object.keys(facets).length} existing)`
        )

        // ========================================
        // STEP 5: Deploy Treasury ResolverProxy
        // ========================================
        info('\n🏭 Step 5/5: Deploying Treasury ResolverProxy...')

        const DEFAULT_ADMIN_ROLE =
            '0x0000000000000000000000000000000000000000000000000000000000000000'

        const treasuryProxyResult = await deployResolverProxy(provider, {
            blrAddress,
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

        // ========================================
        // Build comprehensive output
        // ========================================
        const endTime = Date.now()

        const output: DeployTreasuryOutput = {
            network,
            timestamp: new Date().toISOString(),
            deployer,

            infrastructure: {
                proxyAdmin: {
                    address: proxyAdminAddress,
                },
                blr: {
                    implementation: blrAddress, // We don't know the implementation address
                    proxy: blrAddress,
                },
                treasury: {
                    implementation: blrAddress, // ResolverProxy uses BLR
                    proxy: treasuryAddress,
                },
            },

            facets: [
                // Existing facets
                {
                    name: useTimeTravel
                        ? 'AccessControlFacetTimeTravel'
                        : 'AccessControlFacet',
                    address: facets.accessControl,
                    key:
                        treasuryConfig.data.facetKeys.find(
                            (f) => f.address === facets.accessControl
                        )?.key || '',
                },
                {
                    name: useTimeTravel ? 'PauseFacetTimeTravel' : 'PauseFacet',
                    address: facets.pause,
                    key:
                        treasuryConfig.data.facetKeys.find(
                            (f) => f.address === facets.pause
                        )?.key || '',
                },
                // New facets
                ...Array.from(facetsResult.deployed.entries()).map(
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
            ],

            configuration: {
                configId: treasuryConfig.data.configurationId,
                version: treasuryConfig.data.version,
                facetCount: treasuryConfig.data.facetKeys.length,
                facets: treasuryConfig.data.facetKeys,
            },

            summary: {
                totalContracts: 1, // Only Treasury proxy deployed
                totalFacets: facetsResult.deployed.size, // Only new facets
                deploymentTime: endTime - startTime,
                success: true,
            },
        }

        // ========================================
        // Print summary
        // ========================================
        info('\n' + '═'.repeat(60))
        info('✨ DEPLOYMENT COMPLETE')
        info('═'.repeat(60))
        info(
            `⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`
        )
        info(`📦 New facets deployed: ${output.summary.totalFacets}`)
        info(`🔗 Reused existing facets: ${Object.keys(facets).length}`)
        info(`⚙️  Configuration version: ${output.configuration.version}`)
        info('═'.repeat(60))

        success('Treasury deployed successfully with existing infrastructure')

        return output
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error)

        logError('\n❌ Deployment failed:', errorMessage)

        throw error
    }
}
