// SPDX-License-Identifier: Apache-2.0

/**
 * Complete FactoryPrimaryMarket system deployment workflow.
 *
 * Orchestrates the deployment of the entire FactoryPrimaryMarket infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - Required facets (AccessControl, Pause, FactoryPrimaryMarket)
 * - Facet registration in BLR
 * - FactoryPrimaryMarket configuration (config ID 30'000)
 * - FactoryPrimaryMarket proxy
 *
 * Provides comprehensive deployment output including all addresses, keys, config IDs,
 * versions, and optional Hedera Contract IDs.
 *
 * @module workflows/deployFactoryPrimaryMarketSystem
 */

import type { DeploymentProvider } from "@hashgraph/asset-tokenization-contracts/scripts";
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
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { BusinessLogicResolver__factory } from "@contracts";
import { createFactoryPrimaryMarketConfiguration, createPrimaryMarketConfiguration } from "@scripts/domain";
import { factoryPrimaryMarketRegistry } from "@scripts/infrastructure/factoryPrimaryMarketRegistry";

/**
 * Complete deployment output structure.
 */
export interface DeployFactoryPrimaryMarketOutput {
  /** Network name (testnet, mainnet, hardhat, etc.) */
  network: string;

  /** ISO timestamp of deployment */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** Infrastructure contracts */
  infrastructure: {
    proxyAdmin: {
      address: string;
      contractId?: string;
    };
    blr: {
      implementation: string;
      proxy: string;
      contractId?: string;
    };
    factoryPrimaryMarket: {
      implementation: string;
      proxy: string;
      contractId?: string;
    };
  };

  /** Deployed facets */
  facets: Array<{
    name: string;
    address: string;
    contractId?: string;
    key: string;
  }>;

  /** FactoryPrimaryMarket configuration */
  configuration: {
    configId: string;
    version: number;
    facetCount: number;
    facets: Array<{
      facetName: string;
      key: string;
      address: string;
    }>;
  };

  /** Deployment summary */
  summary: {
    totalContracts: number;
    totalFacets: number;
    deploymentTime: number;
    success: boolean;
  };
}

/**
 * Options for complete system deployment.
 */
export interface DeployFactoryPrimaryMarketSystemOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

/**
 * Deploy complete FactoryPrimaryMarket system.
 *
 * Executes the full deployment workflow:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver with proxy
 * 3. Deploy facets (AccessControl, Pause, FactoryPrimaryMarket)
 * 4. Register facets in BLR
 * 5. Create FactoryPrimaryMarket configuration (config ID 30'000)
 * 6. Deploy FactoryPrimaryMarket proxy
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
 * const output = await deployFactoryPrimaryMarketSystem(provider, 'hardhat', {
 *     useTimeTravel: false,
 *     saveOutput: true
 * })
 *
 * info(`BLR Proxy: ${output.infrastructure.blr.proxy}`)
 * info(`FactoryPrimaryMarket Proxy: ${output.infrastructure.factoryPrimaryMarket.proxy}`)
 * info(`Config Version: ${output.configuration.version}`)
 * ```
 */
export async function deployFactoryPrimaryMarketSystem(
  provider: DeploymentProvider,
  network: string,
  options: DeployFactoryPrimaryMarketSystemOptions = {},
): Promise<DeployFactoryPrimaryMarketOutput> {
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath } = options;

  const startTime = Date.now();
  const signer = await provider.getSigner();
  const deployer = await signer.getAddress();

  section("FactoryPrimaryMarket System Deployment");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info("═".repeat(60));

  try {
    info("\n📋 Step 1/7: Deploying ProxyAdmin...");
    const proxyAdminResult = await deployProxyAdmin(provider);

    if (!proxyAdminResult.success) {
      throw new Error(`ProxyAdmin deployment failed: ${proxyAdminResult.error}`);
    }

    info(`✅ ProxyAdmin: ${proxyAdminResult.proxyAdminAddress}`);

    info("\n🔷 Step 2/7: Deploying BusinessLogicResolver...");
    const blrResult = await deployBlr(provider, {
      proxyAdminAddress: proxyAdminResult.proxyAdminAddress,
    });

    if (!blrResult.success) {
      throw new Error(`BLR deployment failed: ${blrResult.error}`);
    }

    info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
    info(`✅ BLR Proxy: ${blrResult.blrAddress}`);

    info("\n📦 Step 3/7: Deploying facets...");

    const facetNames = useTimeTravel
      ? [
          "AccessControlFacetTimeTravel",
          "PauseFacetTimeTravel",
          "FactoryPrimaryMarketFacetTimeTravel",
          "PrimaryMarketFacetTimeTravel",
          "TimeTravelFacet",
        ]
      : ["AccessControlFacet", "PauseFacet", "FactoryPrimaryMarketFacet", "PrimaryMarketFacet"];

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    const facetsResult = await deployFacets(provider, {
      facetNames,
      useTimeTravel,
      registry: factoryPrimaryMarketRegistry,
    });

    if (!facetsResult.success) {
      throw new Error("Facet deployment had failures");
    }

    info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`);

    info("\n📝 Step 4/7: Registering facets in BLR...");

    const facetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        facetAddresses[facetName] = deploymentResult.address;
      }
    });

    const registerResult = await registerFacets(provider, {
      blrAddress: blrResult.blrAddress,
      facets: facetAddresses,
      registries: [factoryPrimaryMarketRegistry],
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

    info("\n💼 Step 5/7: Creating FactoryPrimaryMarket configuration...");

    const blrContract = BusinessLogicResolver__factory.connect(blrResult.blrAddress, signer);

    const fsConfig = await createFactoryPrimaryMarketConfiguration(
      blrContract,
      facetAddresses,
      useTimeTravel,
      factoryPrimaryMarketRegistry,
    );

    if (!fsConfig.success) {
      throw new Error(`FactoryPrimaryMarket config failed: ${fsConfig.error} - ${fsConfig.message}`);
    }

    info(`✅ FactoryPrimaryMarket Config ID: ${fsConfig.data.configurationId}`);
    info(`✅ Config Version: ${fsConfig.data.version}`);
    info(`✅ Facets: ${fsConfig.data.facetKeys.length}`);

    info("\n💼 Step 6/7: Creating PrimaryMarket configuration...");

    const pmConfig = await createPrimaryMarketConfiguration(
      blrContract,
      facetAddresses,
      useTimeTravel,
      factoryPrimaryMarketRegistry,
    );

    if (!pmConfig.success) {
      throw new Error(`PrimaryMarket config failed: ${pmConfig.error} - ${pmConfig.message}`);
    }

    info(`✅ PrimaryMarket Config ID: ${pmConfig.data.configurationId}`);
    info(`✅ Config Version: ${pmConfig.data.version}`);
    info(`✅ Facets: ${pmConfig.data.facetKeys.length}`);

    info("\n🏭 Step 7/7: Deploying FactoryPrimaryMarket ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const factoryPrimaryMarketProxyResult = await deployResolverProxy(provider, {
      blrAddress: blrResult.blrAddress,
      configurationId: fsConfig.data.configurationId,
      version: fsConfig.data.version,
      rbac: [
        {
          role: DEFAULT_ADMIN_ROLE,
          members: [deployer],
        },
      ],
      network,
    });

    if (!factoryPrimaryMarketProxyResult.success) {
      throw new Error(`FactoryPrimaryMarket ResolverProxy deployment failed: ${factoryPrimaryMarketProxyResult.error}`);
    }

    const factoryPrimaryMarketAddress = factoryPrimaryMarketProxyResult.proxyAddress!;

    info(`✅ FactoryPrimaryMarket ResolverProxy deployed successfully`);
    info(`   Address: ${factoryPrimaryMarketAddress}`);
    if (factoryPrimaryMarketProxyResult.contractId) {
      info(`   Contract ID: ${factoryPrimaryMarketProxyResult.contractId}`);
    }

    const endTime = Date.now();

    const output: DeployFactoryPrimaryMarketOutput = {
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
        factoryPrimaryMarket: {
          implementation: blrResult.blrAddress,
          proxy: factoryPrimaryMarketAddress,
        },
      },

      facets: Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        const facetAddress = deploymentResult.address!;
        const configFacet = fsConfig.data.facetKeys.find((f) => f.address === facetAddress);

        return {
          name: facetName,
          address: facetAddress,
          key: configFacet?.key || "",
        };
      }),

      configuration: {
        configId: fsConfig.data.configurationId,
        version: fsConfig.data.version,
        facetCount: fsConfig.data.facetKeys.length,
        facets: fsConfig.data.facetKeys,
      },

      summary: {
        totalContracts: 3,
        totalFacets: facetsResult.deployed.size,
        deploymentTime: endTime - startTime,
        success: true,
      },
    };

    info("\n" + "═".repeat(60));
    info("✨ DEPLOYMENT COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`📦 Facets deployed: ${output.summary.totalFacets}`);
    info(`⚙️  Configuration version: ${output.configuration.version}`);
    info("═".repeat(60));

    success("FactoryPrimaryMarket system deployed successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
