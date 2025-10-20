// SPDX-License-Identifier: Apache-2.0

/**
 * Complete FactorySuite system deployment workflow.
 *
 * Orchestrates the deployment of the entire FactorySuite infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - Required facets (AccessControl, Pause, FactorySuite)
 * - Facet registration in BLR
 * - FactorySuite configuration (config ID 30'000)
 * - FactorySuite proxy
 *
 * Provides comprehensive deployment output including all addresses, keys, config IDs,
 * versions, and optional Hedera Contract IDs.
 *
 * @module workflows/deployFactorySuiteSystem
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
import { BusinessLogicResolver__factory } from "@typechain";
import { createFactorySuiteConfiguration } from "@scripts/domain";
import { factorySuiteRegistry } from "@scripts/infrastructure/factorySuiteRegistry";

/**
 * Complete deployment output structure.
 */
export interface DeployFactorySuiteOutput {
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
    factorySuite: {
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

  /** FactorySuite configuration */
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
export interface DeployFactorySuiteSystemOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

/**
 * Deploy complete FactorySuite system.
 *
 * Executes the full deployment workflow:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver with proxy
 * 3. Deploy facets (AccessControl, Pause, FactorySuite)
 * 4. Register facets in BLR
 * 5. Create FactorySuite configuration (config ID 30'000)
 * 6. Deploy FactorySuite proxy
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
 * const output = await deployFactorySuiteSystem(provider, 'hardhat', {
 *     useTimeTravel: false,
 *     saveOutput: true
 * })
 *
 * info(`BLR Proxy: ${output.infrastructure.blr.proxy}`)
 * info(`FactorySuite Proxy: ${output.infrastructure.factorySuite.proxy}`)
 * info(`Config Version: ${output.configuration.version}`)
 * ```
 */
export async function deployFactorySuiteSystem(
  provider: DeploymentProvider,
  network: string,
  options: DeployFactorySuiteSystemOptions = {},
): Promise<DeployFactorySuiteOutput> {
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath } = options;

  const startTime = Date.now();
  const signer = await provider.getSigner();
  const deployer = await signer.getAddress();

  section("FactorySuite System Deployment");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info("═".repeat(60));

  try {
    // ========================================
    // STEP 1: Deploy ProxyAdmin
    // ========================================
    info("\n📋 Step 1/6: Deploying ProxyAdmin...");
    const proxyAdminResult = await deployProxyAdmin(provider);

    if (!proxyAdminResult.success) {
      throw new Error(`ProxyAdmin deployment failed: ${proxyAdminResult.error}`);
    }

    info(`✅ ProxyAdmin: ${proxyAdminResult.proxyAdminAddress}`);

    // ========================================
    // STEP 2: Deploy BusinessLogicResolver
    // ========================================
    info("\n🔷 Step 2/6: Deploying BusinessLogicResolver...");
    const blrResult = await deployBlr(provider, {
      proxyAdminAddress: proxyAdminResult.proxyAdminAddress,
    });

    if (!blrResult.success) {
      throw new Error(`BLR deployment failed: ${blrResult.error}`);
    }

    info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
    info(`✅ BLR Proxy: ${blrResult.blrAddress}`);

    // ========================================
    // STEP 3: Deploy facets
    // ========================================
    info("\n📦 Step 3/6: Deploying facets...");

    // Use TimeTravel variants when useTimeTravel is enabled
    const facetNames = useTimeTravel
      ? [
          "AccessControlFacetTimeTravel",
          "PauseFacetTimeTravel",
          "FactorySuiteFacetTimeTravel",
          "TimeTravelFacet", // Time control facet
        ]
      : ["AccessControlFacet", "PauseFacet", "FactorySuiteFacet"];

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    const facetsResult = await deployFacets(provider, {
      facetNames,
      useTimeTravel,
      registry: factorySuiteRegistry, // Use FactorySuite registry (clean dependency injection)
    });

    if (!facetsResult.success) {
      throw new Error("Facet deployment had failures");
    }

    info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`);

    // ========================================
    // STEP 4: Register facets in BLR
    // ========================================
    info("\n📝 Step 4/6: Registering facets in BLR...");

    const facetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        facetAddresses[facetName] = deploymentResult.address;
      }
    });

    const registerResult = await registerFacets(provider, {
      blrAddress: blrResult.blrAddress,
      facets: facetAddresses,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

    // ========================================
    // STEP 5: Create FactorySuite configuration
    // ========================================
    info("\n💼 Step 5/6: Creating FactorySuite configuration...");

    const blrContract = BusinessLogicResolver__factory.connect(blrResult.blrAddress, signer);

    const fsConfig = await createFactorySuiteConfiguration(blrContract, facetAddresses, useTimeTravel);

    if (!fsConfig.success) {
      throw new Error(`FactorySuite config failed: ${fsConfig.error} - ${fsConfig.message}`);
    }

    info(`✅ FactorySuite Config ID: ${fsConfig.data.configurationId}`);
    info(`✅ Config Version: ${fsConfig.data.version}`);
    info(`✅ Facets: ${fsConfig.data.facetKeys.length}`);

    // ========================================
    // STEP 6: Deploy FactorySuite ResolverProxy
    // ========================================
    info("\n🏭 Step 6/6: Deploying FactorySuite ResolverProxy...");

    // Use ATS infrastructure function to deploy ResolverProxy
    // IMPORTANT: Initialize with deployer as DEFAULT_ADMIN_ROLE so roles can be granted in tests
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"; // bytes32(0)

    const factorySuiteProxyResult = await deployResolverProxy(provider, {
      blrAddress: blrResult.blrAddress,
      configurationId: fsConfig.data.configurationId,
      version: fsConfig.data.version,
      rbac: [
        {
          role: DEFAULT_ADMIN_ROLE,
          members: [deployer], // Grant DEFAULT_ADMIN_ROLE to deployer
        },
      ],
      network,
    });

    if (!factorySuiteProxyResult.success) {
      throw new Error(`FactorySuite ResolverProxy deployment failed: ${factorySuiteProxyResult.error}`);
    }

    const factorySuiteAddress = factorySuiteProxyResult.proxyAddress!;

    info(`✅ FactorySuite ResolverProxy deployed successfully`);
    info(`   Address: ${factorySuiteAddress}`);
    if (factorySuiteProxyResult.contractId) {
      info(`   Contract ID: ${factorySuiteProxyResult.contractId}`);
    }

    // ========================================
    // Build comprehensive output
    // ========================================
    const endTime = Date.now();

    const output: DeployFactorySuiteOutput = {
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
        factorySuite: {
          implementation: blrResult.blrAddress, // ResolverProxy uses BLR
          proxy: factorySuiteAddress,
        },
      },

      facets: Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        const facetAddress = deploymentResult.address!;

        // Find matching key from config
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
        totalContracts: 3, // ProxyAdmin, BLR, FactorySuite
        totalFacets: facetsResult.deployed.size,
        deploymentTime: endTime - startTime,
        success: true,
      },
    };

    // ========================================
    // Print summary
    // ========================================
    info("\n" + "═".repeat(60));
    info("✨ DEPLOYMENT COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`📦 Facets deployed: ${output.summary.totalFacets}`);
    info(`⚙️  Configuration version: ${output.configuration.version}`);
    info("═".repeat(60));

    success("FactorySuite system deployed successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
