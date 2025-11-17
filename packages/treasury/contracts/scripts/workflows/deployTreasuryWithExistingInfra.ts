// SPDX-License-Identifier: Apache-2.0

import {
  deployFacets,
  registerAdditionalFacets,
  info,
  success,
  section,
  error as logError,
  configureLogger,
  LogLevel,
  atsRegistry,
  getDeploymentConfig,
  isLocalNetwork,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { Signer, ContractFactory } from "ethers";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { createTreasuryConfiguration, FACET_REGISTRY } from "@scripts/domain";
import type { DeployTreasuryOutput } from "./deployTreasury";

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

  /** Enable verbose logging (debug level) */
  verbose?: boolean;
}

export async function deployTreasuryWithExistingInfra(
  signer: Signer,
  network: string,
  existingInfra: ExistingInfrastructure,
  options: DeployWithExistingInfraOptions = {},
): Promise<DeployTreasuryOutput> {
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath, verbose = false } = options;

  // Configure logger based on verbose flag
  configureLogger({
    level: verbose ? LogLevel.DEBUG : LogLevel.INFO,
  });

  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);
  const confirmations = networkConfig.confirmations;
  const enableRetry = networkConfig.retryOptions.maxRetries > 0;
  const verifyDeployment = networkConfig.verifyDeployment;
  const retryOptions = networkConfig.retryOptions;

  const startTime = Date.now();
  const deployer = await signer.getAddress();

  section("Treasury Deployment (Existing Infrastructure)");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`🌐 Type: ${isLocalNetwork(network) ? "Local" : "Remote"}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`🏗️  Mode: Using existing BLR and common facets`);
  info(`⏱️  Confirmations: ${confirmations}`);
  info(`🔁 Retry: ${enableRetry ? `Enabled (max ${retryOptions.maxRetries})` : "Disabled"}`);
  info(`✅ Verification: ${verifyDeployment ? "Enabled" : "Disabled"}`);
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
    // STEP 2: Deploy Treasury-specific facets
    // ========================================
    info("\n📦 Step 2/4: Deploying Treasury-specific facets...");

    const facetNames = useTimeTravel
      ? [
          "LifeCycleCashFlowFacetTimeTravel",
          "PortfolioFacetTimeTravel",
          "ProceedsManagementFacetTimeTravel",
          "TimeTravelFacet",
        ]
      : ["LifeCycleCashFlowFacet", "PortfolioFacet", "ProceedsManagementFacet"];

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    // Create TypeChain factories from registry
    const facetFactories: Record<string, ContractFactory> = {};
    for (const facetName of facetNames) {
      const facetDef = FACET_REGISTRY[facetName] || atsRegistry.getFacetDefinition(facetName);

      if (!facetDef?.factory) {
        throw new Error(`No factory found for facet: ${facetName}`);
      }

      facetFactories[facetName] = facetDef.factory(signer, useTimeTravel);
    }

    // Validate all factories were created successfully
    const factoryCount = Object.keys(facetFactories).length;
    const expectedCount = facetNames.length;

    if (factoryCount !== expectedCount) {
      const missingFactories = facetNames.filter((name) => !facetFactories[name]);
      throw new Error(
        `Factory creation incomplete: expected ${expectedCount} factories, got ${factoryCount}. ` +
          `Missing: ${missingFactories.join(", ")}`,
      );
    }

    info(`   ✅ Created ${factoryCount} facet factories`);

    const facetsResult = await deployFacets(facetFactories, {
      confirmations,
      enableRetry,
      verifyDeployment,
      retryOptions,
    });

    if (!facetsResult.success) {
      throw new Error("Treasury facet deployment failed");
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

    const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

    const facetsWithKeys = Object.entries(newFacetAddresses).map(([name, address]) => {
      const treasuryFacet = FACET_REGISTRY[name];
      if (treasuryFacet?.resolverKey?.value) {
        return { name, address, resolverKey: treasuryFacet.resolverKey.value };
      }

      const atsFacet = atsRegistry.getFacetDefinition(name);
      if (atsFacet?.resolverKey?.value) {
        return { name, address, resolverKey: atsFacet.resolverKey.value };
      }

      throw new Error(`Facet ${name} not found in Treasury or ATS registries`);
    });

    const registerResult = await registerAdditionalFacets(signer, {
      blrAddress,
      newFacets: facetsWithKeys,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${Object.keys(newFacetAddresses).length} new facet(s)`);

    // ========================================
    // STEP 4: Create Treasury configuration
    // ========================================
    info("\n💼 Step 4/4: Creating Treasury configuration...");

    // Merge existing shared facets with newly deployed facets for complete configuration
    const allFacetAddresses = {
      ...newFacetAddresses,
      AccessControlFacet: facets.accessControl,
      PauseFacet: facets.pause,
    };

    const treasuryConfig = await createTreasuryConfiguration(blrContract, allFacetAddresses, useTimeTravel);

    if (!treasuryConfig.success) {
      //throw new Error(`Treasury config failed: ${treasuryConfig.error} - ${treasuryConfig.message}`);
      throw new Error(`Treasury config failed: ${treasuryConfig}`);
    }

    info(`✅ Treasury Config ID: ${treasuryConfig.data.configurationId}`);
    info(`✅ Config Version: ${treasuryConfig.data.version}`);
    info(
      `✅ Total Facets: ${treasuryConfig.data.facetKeys.length} (${Object.keys(newFacetAddresses).length} new + ${Object.keys(facets).length} existing)`,
    );

    // ========================================
    // Build comprehensive output
    // ========================================
    const endTime = Date.now();

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
        // No treasury proxy - deployed via FactorySuite when creating bond suite
      },

      facets: [
        // Existing facets
        {
          name: useTimeTravel ? "AccessControlFacetTimeTravel" : "AccessControlFacet",
          address: facets.accessControl,
          key: treasuryConfig.data.facetKeys.find((f) => f.address === facets.accessControl)?.key || "",
        },
        {
          name: useTimeTravel ? "PauseFacetTimeTravel" : "PauseFacet",
          address: facets.pause,
          key: treasuryConfig.data.facetKeys.find((f) => f.address === facets.pause)?.key || "",
        },
        // New facets
        ...Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
          const facetAddress = deploymentResult.address!;
          const configFacet = treasuryConfig.data.facetKeys.find((f) => f.address === facetAddress);

          return {
            name: facetName,
            address: facetAddress,
            key: configFacet?.key || "",
          };
        }),
      ],

      configuration: {
        configId: treasuryConfig.data.configurationId,
        version: treasuryConfig.data.version,
        facetCount: treasuryConfig.data.facetKeys.length,
        facets: treasuryConfig.data.facetKeys,
      },

      summary: {
        totalContracts: 0, // No proxies deployed - only facets and configuration
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

    success("Treasury deployed successfully with existing infrastructure");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
