// SPDX-License-Identifier: Apache-2.0

import type { DeploymentProvider } from "@hashgraph/asset-tokenization-contracts/scripts";
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
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { createFactoryPrimaryMarketConfiguration, createPrimaryMarketConfiguration } from "@scripts/domain";
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

export async function deployFactoryPrimaryMarketWithExistingInfra(
  provider: DeploymentProvider,
  network: string,
  existingInfra: ExistingInfrastructure,
  options: DeployWithExistingInfraOptions = {},
): Promise<DeployFactoryPrimaryMarketOutput> {
  configureLogger({ level: LogLevel.SILENT });
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

    // =====================================================================================
    // STEP 2: Deploy only FactoryPrimaryMarketFacet, PrimaryMarketFacet
    // =====================================================================================
    info("\n📦 Step 2/4: Deploying FactoryPrimaryMarketFacet, PrimaryMarketFacet...");

    const facetNames = useTimeTravel
      ? [
          "FactoryPrimaryMarketFacetTimeTravel",
          "PrimaryMarketFacetTimeTravel",
          "TimeTravelFacet",
          "PrecompiledMockFacetTimeTravel",
        ]
      : ["FactoryPrimaryMarketFacet", "PrimaryMarketFacet"];

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    const facetsResult = await deployFacets(provider, {
      facetNames,
      useTimeTravel,
      registries: [factoryPrimaryMarketRegistry],
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
    info("\n💼 Step 4/5: Creating FactoryPrimaryMarket configuration...");

    const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

    // Combine existing + new facets for configuration
    const facetNamesForConfig: Record<string, string> = useTimeTravel
      ? {
          AccessControlFacetTimeTravel: facets.accessControl,
          PauseFacetTimeTravel: facets.pause,
          FactoryPrimaryMarketFacetTimeTravel: newFacetAddresses.FactoryPrimaryMarketFacetTimeTravel,
          PrimaryMarketFacetTimeTravel: newFacetAddresses.PrimaryMarketFacetTimeTravel,
          TimeTravelFacet: newFacetAddresses.TimeTravelFacet,
          PrecompiledMockFacetTimeTravel: newFacetAddresses.PrecompiledMockFacetTimeTravel,
        }
      : {
          AccessControlFacet: facets.accessControl,
          PauseFacet: facets.pause,
          FactoryPrimaryMarketFacet: newFacetAddresses.FactoryPrimaryMarketFacet,
          PrimaryMarketFacet: newFacetAddresses.PrimaryMarketFacet,
        };

    const factoryPrimaryMarketConfig = await createFactoryPrimaryMarketConfiguration(
      blrContract,
      facetNamesForConfig,
      useTimeTravel,
      factoryPrimaryMarketRegistry,
    );

    if (!factoryPrimaryMarketConfig.success) {
      throw new Error(`FactoryPrimaryMarket config failed: ${factoryPrimaryMarketConfig}`);
    }

    info(`✅ FactoryPrimaryMarket Config ID: ${factoryPrimaryMarketConfig.data.configurationId}`);
    info(`✅ Config Version: ${factoryPrimaryMarketConfig.data.version}`);
    info(
      `✅ Total Facets: ${factoryPrimaryMarketConfig.data.facetKeys.length} (${Object.keys(newFacetAddresses).length} new + ${Object.keys(facets).length} existing)`,
    );

    // ========================================
    // STEP 5: Create PrimaryMarket configuration
    // ========================================
    info("\n💼 Step 5/6: Creating PrimaryMarket configuration...");

    const primaryMarketConfig = await createPrimaryMarketConfiguration(
      blrContract,
      facetNamesForConfig,
      useTimeTravel,
      useTimeTravel,
      factoryPrimaryMarketRegistry,
    );

    if (!primaryMarketConfig.success) {
      throw new Error(`PrimaryMarket config failed: ${primaryMarketConfig}`);
    }

    info(`✅ PrimaryMarket Config ID: ${primaryMarketConfig.data.configurationId}`);
    info(`✅ Config Version: ${primaryMarketConfig.data.version}`);
    info(
      `✅ Total Facets: ${primaryMarketConfig.data.facetKeys.length} (${Object.keys(newFacetAddresses).length} new + ${Object.keys(facets).length} existing)`,
    );

    // ========================================
    // STEP 6: Deploy FactoryPrimaryMarket ResolverProxy
    // ========================================
    info("\n🏭 Step 6/6: Deploying FactoryPrimaryMarket ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const factoryPrimaryMarketProxyResult = await deployResolverProxy(provider, {
      blrAddress,
      configurationId: factoryPrimaryMarketConfig.data.configurationId,
      version: factoryPrimaryMarketConfig.data.version,
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

    // @ts-expect-error - DeployFactoryPrimaryMarketOutput type may have mismatches
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
          key: factoryPrimaryMarketConfig.data.facetKeys.find((f) => f.address === facets.accessControl)?.key || "",
        },
        {
          name: useTimeTravel ? "PauseFacetTimeTravel" : "PauseFacet",
          address: facets.pause,
          key: factoryPrimaryMarketConfig.data.facetKeys.find((f) => f.address === facets.pause)?.key || "",
        },
        // New facets
        ...Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
          const facetAddress = deploymentResult.address!;
          const configFacet = factoryPrimaryMarketConfig.data.facetKeys.find((f) => f.address === facetAddress);

          return {
            name: facetName,
            address: facetAddress,
            key: configFacet?.key || "",
          };
        }),
      ],

      configuration: {
        configId: factoryPrimaryMarketConfig.data.configurationId,
        version: factoryPrimaryMarketConfig.data.version,
        facetCount: factoryPrimaryMarketConfig.data.facetKeys.length,
        facets: factoryPrimaryMarketConfig.data.facetKeys,
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
