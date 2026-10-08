// SPDX-License-Identifier: Apache-2.0

/**
 * Complete FactorySuite system deployment workflow.
 *
 * Orchestrates deployment of the entire FactorySuite infrastructure with multi-registry support:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - Required facets (Diamond, AccessControl, Pause, FactorySuite) from multiple registries
 * - Facet registration in BLR using combined ATS and FactorySuite registries
 * - FactorySuite configuration (config ID 30'000)
 * - FactorySuite proxy
 *
 * Uses ATS standard facets (AccessControl, Pause) and custom FactorySuite facets
 * by passing arrays of registries to ATS infrastructure operations.
 *
 * @module workflows/deployFactorySuiteSystem
 */

import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts/typechain-types";
import { Signer, ContractFactory } from "ethers";
import {
  deployProxyAdmin,
  deployBlr,
  deployFacets,
  registerFacets,
  deployResolverProxy,
  atsRegistry,
  info,
  success,
  section,
  error as logError,
  getDeploymentConfig,
  isInstantMiningNetwork,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { createFactorySuiteConfiguration, factorySuiteRegistry } from "@scripts/domain";

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
      implementation?: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
    factorySuite: {
      proxy: string;
      proxyContractId?: string;
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

  /** Override transaction confirmations (useful for testing on instant networks) */
  confirmations?: number;
}

/**
 * Deploy complete FactorySuite system: ProxyAdmin, BLR, facets, configuration, and proxy.
 * Six-phase workflow with comprehensive deployment output.
 */
export async function deployFactorySuiteSystem(
  signer: Signer,
  network: string,
  options: DeployFactorySuiteSystemOptions = {},
): Promise<DeployFactorySuiteOutput> {
  const {
    useTimeTravel = false,
    saveOutput: _saveOutput = false,
    outputPath: _outputPath,
    confirmations: optionsConfirmations,
  } = options;

  const startTime = Date.now();
  const deployer = await signer.getAddress();

  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);
  const confirmations = optionsConfirmations !== undefined ? optionsConfirmations : networkConfig.confirmations;
  const enableRetry = networkConfig.retryOptions.maxRetries > 0;
  const verifyDeployment = networkConfig.verifyDeployment;
  const retryOptions = networkConfig.retryOptions;

  section("FactorySuite System Deployment");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`🌐 Type: ${isInstantMiningNetwork(network) ? "Local" : "Remote"}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`⏱️  Confirmations: ${confirmations}`);
  info(`🔁 Retry: ${enableRetry ? `Enabled (max ${retryOptions.maxRetries})` : "Disabled"}`);
  info(`✅ Verification: ${verifyDeployment ? "Enabled" : "Disabled"}`);
  info("═".repeat(60));

  try {
    info("\n📋 Step 1/6: Deploying ProxyAdmin...");
    const proxyAdmin = await deployProxyAdmin(signer);
    const proxyAdminAddress = await proxyAdmin.getAddress();

    info(`✅ ProxyAdmin: ${proxyAdminAddress}`);

    info("\n🔷 Step 2/6: Deploying BusinessLogicResolver...");
    const blrResult = await deployBlr(signer, {
      existingProxyAdmin: proxyAdmin,
    });

    if (!blrResult.success) {
      throw new Error(`BLR deployment failed: ${blrResult.error}`);
    }

    info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
    info(`✅ BLR Proxy: ${blrResult.blrAddress}`);

    info("\n📦 Step 3/6: Deploying facets...");

    // Use base facet names for registry lookup (registry entries use dynamic factories)
    const facetNames = ["DiamondFacet", "AccessControlFacet", "PauseFacet", "FactorySuiteFacet"];

    // Add TimeTravelFacet separately (only needed in TimeTravel mode)
    if (useTimeTravel) {
      facetNames.push("TimeTravelFacet");
    }

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    // Create TypeChain factories from registry
    const facetFactories: Record<string, ContractFactory> = {};
    for (const facetName of facetNames) {
      const facetDef = factorySuiteRegistry.getFacetDefinition(facetName) || atsRegistry.getFacetDefinition(facetName);

      if (!facetDef?.factory) {
        throw new Error(`No factory found for facet: ${facetName}`);
      }

      // Registry factory returns TimeTravel variant when useTimeTravel: true
      facetFactories[facetName] = facetDef.factory(signer, useTimeTravel);
    }

    const facetsResult = await deployFacets(facetFactories, {
      confirmations,
      enableRetry,
      verifyDeployment,
      retryOptions,
    });

    if (!facetsResult.success) {
      throw new Error("Facet deployment had failures");
    }

    info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`);

    info("\n📝 Step 4/6: Registering facets in BLR...");

    const facetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        facetAddresses[facetName] = deploymentResult.address;
      }
    });

    const blrContract = BusinessLogicResolver__factory.connect(blrResult.blrAddress, signer);

    const facetsWithKeys = Object.entries(facetAddresses).map(([name, address]) => {
      const factorySuiteFacet = factorySuiteRegistry.getFacetDefinition(name);
      if (factorySuiteFacet?.resolverKey?.value) {
        return { name, address, resolverKey: factorySuiteFacet.resolverKey.value };
      }

      const atsFacet = atsRegistry.getFacetDefinition(name);
      if (atsFacet?.resolverKey?.value) {
        return { name, address, resolverKey: atsFacet.resolverKey.value };
      }

      throw new Error(`Facet ${name} not found in FactorySuite or ATS registries`);
    });

    const registerResult = await registerFacets(blrContract, {
      facets: facetsWithKeys,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

    info("\n💼 Step 5/6: Creating FactorySuite configuration...");

    const fsConfig = await createFactorySuiteConfiguration(
      blrContract,
      facetAddresses,
      DEFAULT_BATCH_SIZE,
      confirmations,
    );

    if (!fsConfig.success) {
      throw new Error(`FactorySuite config failed: ${fsConfig.error} - ${fsConfig.message}`);
    }

    info(`✅ FactorySuite Config ID: ${fsConfig.data.configurationId}`);
    info(`✅ Config Version: ${fsConfig.data.version}`);
    info(`✅ Facets: ${fsConfig.data.facetKeys.length}`);

    info("\n🏭 Step 6/6: Deploying FactorySuite ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const factorySuiteProxyResult = await deployResolverProxy(signer, {
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
      confirmations,
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

    const endTime = Date.now();

    const output: DeployFactorySuiteOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      infrastructure: {
        proxyAdmin: {
          address: proxyAdminAddress,
        },
        blr: {
          implementation: blrResult.implementationAddress,
          proxy: blrResult.blrAddress,
        },
        factorySuite: {
          proxy: factorySuiteAddress,
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

    success("FactorySuite system deployed successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
