// SPDX-License-Identifier: Apache-2.0

/**
 * FactoryPrimaryMarket deployment workflow with existing infrastructure.
 *
 * Designed for multi-module orchestration scenarios where BusinessLogicResolver
 * and common facets (AccessControl, Pause) are already deployed and shared
 * across multiple domains (e.g., ATS, Treasury, FactoryPrimaryMarket).
 *
 * This workflow only deploys FactoryPrimaryMarket-specific components:
 * - FactoryPrimaryMarketFacet (and TimeTravel variant if needed)
 * - FactoryPrimaryMarket configuration in existing BLR (config ID 30'000)
 * - FactoryPrimaryMarket ResolverProxy
 *
 * Reuses existing infrastructure:
 * - Shared BLR proxy
 * - Shared ProxyAdmin
 * - Shared AccessControlFacet and PauseFacet
 *
 * @module workflows/deployFactoryPrimaryMarketWithExistingInfra
 */

import type { DeploymentProvider } from "@hashgraph/asset-tokenization-contracts/scripts";
import {
  deployFacets,
  registerAdditionalFacets,
  deployResolverProxy,
  info,
  success,
  section,
  error as logError,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { BusinessLogicResolver__factory } from "@contracts";
import { createFactoryPrimaryMarketConfiguration } from "@scripts/domain";
import { factoryPrimaryMarketRegistry } from "@scripts/infrastructure/factoryPrimaryMarketRegistry";
import type { DeployFactoryPrimaryMarketOutput } from "./deployFactoryPrimaryMarketSystem";

/**
 * Existing infrastructure addresses.
 */
export interface ExistingInfrastructure {
  /** Existing BLR proxy address (shared across modules) */
  blrAddress: string;

  /** Existing ProxyAdmin address */
  proxyAdminAddress: string;

  /** Existing shared facets */
  facets: {
    /** AccessControlFacet address (must be registered in BLR) */
    accessControl: string;

    /** PauseFacet address (must be registered in BLR) */
    pause: string;
  };
}

/**
 * Options for deployment with existing infrastructure.
 */
export interface DeployWithExistingInfraOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

/**
 * Deploy FactoryPrimaryMarket with existing infrastructure.
 *
 * Use case: Multi-module orchestration where BLR and common facets
 * are already deployed (e.g., shared infrastructure across ATS, Treasury, FactoryPrimaryMarket).
 *
 * Deployment steps:
 * 1. Validate existing infrastructure addresses
 * 2. Deploy only FactoryPrimaryMarketFacet (and TimeTravel variant if needed)
 * 3. Register new facets in existing BLR
 * 4. Create FactoryPrimaryMarket configuration using existing + new facets
 * 5. Deploy FactoryPrimaryMarket ResolverProxy
 *
 * Returns comprehensive deployment output with all addresses, keys, versions, and IDs.
 *
 * @param provider - Deployment provider (HardhatProvider or StandaloneProvider)
 * @param network - Network name (testnet, mainnet, hardhat, etc.)
 * @param existingInfra - Existing infrastructure addresses
 * @param options - Deployment options
 * @returns Promise resolving to complete deployment output
 *
 * @example
 * ```typescript
 * import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts/infrastructure'
 *
 * // First, deploy shared ATS infrastructure
 * const atsInfra = await deployAtsSystem(provider, 'testnet')
 *
 * // Then deploy FactoryPrimaryMarket using existing infrastructure
 * const factoryPrimaryMarket = await deployFactoryPrimaryMarketWithExistingInfra(
 *   provider,
 *   'testnet',
 *   {
 *     blrAddress: atsInfra.blr.proxy,
 *     proxyAdminAddress: atsInfra.proxyAdmin.address,
 *     facets: {
 *       accessControl: atsInfra.facets.find(f => f.name === 'AccessControlFacet').address,
 *       pause: atsInfra.facets.find(f => f.name === 'PauseFacet').address,
 *     }
 *   },
 *   { useTimeTravel: false }
 * )
 *
 * info(`FactoryPrimaryMarket Proxy: ${factoryPrimaryMarket.infrastructure.factoryPrimaryMarket.proxy}`)
 * info(`Uses BLR: ${factoryPrimaryMarket.infrastructure.blr.proxy}`)
 * ```
 */
export async function deployFactoryPrimaryMarketWithExistingInfra(
  provider: DeploymentProvider,
  network: string,
  existingInfra: ExistingInfrastructure,
  options: DeployWithExistingInfraOptions = {},
): Promise<DeployFactoryPrimaryMarketOutput> {
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath } = options;

  const startTime = Date.now();
  const signer = await provider.getSigner();
  const deployer = await signer.getAddress();

  section("FactoryPrimaryMarket Deployment (Existing Infrastructure)");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`🏗️  Mode: Using existing BLR and common facets`);
  info("═".repeat(60));

  try {
    // ========================================
    // STEP 1: Validate existing infrastructure
    // ========================================
    info("\n🔍 Step 1/4: Validating existing infrastructure...");

    const { blrAddress, proxyAdminAddress, facets } = existingInfra;

    if (!blrAddress || blrAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid BLR address");
    }
    if (!proxyAdminAddress || proxyAdminAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid ProxyAdmin address");
    }
    if (!facets.accessControl || facets.accessControl === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid AccessControlFacet address");
    }
    if (!facets.pause || facets.pause === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid PauseFacet address");
    }

    info(`✅ BLR Proxy: ${blrAddress}`);
    info(`✅ ProxyAdmin: ${proxyAdminAddress}`);
    info(`✅ AccessControlFacet: ${facets.accessControl}`);
    info(`✅ PauseFacet: ${facets.pause}`);

    // ========================================
    // STEP 2: Deploy only FactoryPrimaryMarketFacet
    // ========================================
    info("\n📦 Step 2/4: Deploying FactoryPrimaryMarketFacet...");

    const facetNames = useTimeTravel
      ? ["FactoryPrimaryMarketFacetTimeTravel", "TimeTravelFacet"]
      : ["FactoryPrimaryMarketFacet"];

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    const facetsResult = await deployFacets(provider, {
      facetNames,
      useTimeTravel,
      registry: factoryPrimaryMarketRegistry,
    });

    if (!facetsResult.success) {
      throw new Error("FactoryPrimaryMarketFacet deployment failed");
    }

    info(`✅ Deployed ${facetsResult.deployed.size} new facet(s)`);

    // ========================================
    // STEP 3: Register new facets in existing BLR
    // ========================================
    info("\n📝 Step 3/4: Registering new facets in BLR...");

    const newFacetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        newFacetAddresses[facetName] = deploymentResult.address;
      }
    });

    const registerResult = await registerAdditionalFacets(provider, {
      blrAddress,
      newFacets: newFacetAddresses,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${Object.keys(newFacetAddresses).length} new facet(s)`);

    // ========================================
    // STEP 4: Create FactoryPrimaryMarket configuration
    // ========================================
    info("\n💼 Step 4/4: Creating FactoryPrimaryMarket configuration...");

    const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

    // Combine existing + new facets for configuration
    const facetNamesForConfig: Record<string, string> = useTimeTravel
      ? {
          AccessControlFacetTimeTravel: facets.accessControl,
          PauseFacetTimeTravel: facets.pause,
          FactoryPrimaryMarketFacetTimeTravel: newFacetAddresses.FactoryPrimaryMarketFacetTimeTravel,
          TimeTravelFacet: newFacetAddresses.TimeTravelFacet,
        }
      : {
          AccessControlFacet: facets.accessControl,
          PauseFacet: facets.pause,
          FactoryPrimaryMarketFacet: newFacetAddresses.FactoryPrimaryMarketFacet,
        };

    const fsConfig = await createFactoryPrimaryMarketConfiguration(blrContract, facetNamesForConfig, useTimeTravel);

    if (!fsConfig.success) {
      throw new Error(`FactoryPrimaryMarket config failed: ${fsConfig.error} - ${fsConfig.message}`);
    }

    info(`✅ FactoryPrimaryMarket Config ID: ${fsConfig.data.configurationId}`);
    info(`✅ Config Version: ${fsConfig.data.version}`);
    info(
      `✅ Total Facets: ${fsConfig.data.facetKeys.length} (${Object.keys(newFacetAddresses).length} new + ${Object.keys(facets).length} existing)`,
    );

    // ========================================
    // STEP 5: Deploy FactoryPrimaryMarket ResolverProxy
    // ========================================
    info("\n🏭 Step 5/5: Deploying FactoryPrimaryMarket ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const factoryPrimaryMarketProxyResult = await deployResolverProxy(provider, {
      blrAddress,
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

    // ========================================
    // Build comprehensive output
    // ========================================
    const endTime = Date.now();

    const output: DeployFactoryPrimaryMarketOutput = {
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
        factoryPrimaryMarket: {
          implementation: blrAddress, // ResolverProxy uses BLR
          proxy: factoryPrimaryMarketAddress,
        },
      },

      facets: [
        // Existing facets
        {
          name: useTimeTravel ? "AccessControlFacetTimeTravel" : "AccessControlFacet",
          address: facets.accessControl,
          key: fsConfig.data.facetKeys.find((f) => f.address === facets.accessControl)?.key || "",
        },
        {
          name: useTimeTravel ? "PauseFacetTimeTravel" : "PauseFacet",
          address: facets.pause,
          key: fsConfig.data.facetKeys.find((f) => f.address === facets.pause)?.key || "",
        },
        // New facets
        ...Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
          const facetAddress = deploymentResult.address!;
          const configFacet = fsConfig.data.facetKeys.find((f) => f.address === facetAddress);

          return {
            name: facetName,
            address: facetAddress,
            key: configFacet?.key || "",
          };
        }),
      ],

      configuration: {
        configId: fsConfig.data.configurationId,
        version: fsConfig.data.version,
        facetCount: fsConfig.data.facetKeys.length,
        facets: fsConfig.data.facetKeys,
      },

      summary: {
        totalContracts: 1, // Only FactoryPrimaryMarket proxy deployed
        totalFacets: facetsResult.deployed.size, // Only new facets
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
    info(`📦 New facets deployed: ${output.summary.totalFacets}`);
    info(`🔗 Reused existing facets: ${Object.keys(facets).length}`);
    info(`⚙️  Configuration version: ${output.configuration.version}`);
    info("═".repeat(60));

    success("FactoryPrimaryMarket deployed successfully with existing infrastructure");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
