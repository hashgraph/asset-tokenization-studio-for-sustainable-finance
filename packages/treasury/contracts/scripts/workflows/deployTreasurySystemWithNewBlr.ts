// SPDX-License-Identifier: Apache-2.0

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
  atsRegistry,
  getDeploymentConfig,
  isInstantMiningNetwork,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { Signer, ContractFactory } from "ethers";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { createTreasuryConfiguration, FACET_REGISTRY } from "@scripts/domain";

/**
 * Complete deployment output structure.
 */
export interface DeployTreasuryOutput {
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
    treasury?: {
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

  /** Treasury configuration */
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
 * Options for complete Treasury deployment.
 */
export interface DeployTreasuryOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

export async function deployTreasury(
  signer: Signer,
  network: string,
  options: DeployTreasuryOptions = {},
): Promise<DeployTreasuryOutput> {
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath } = options;

  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);
  const confirmations = networkConfig.confirmations;
  const enableRetry = networkConfig.retryOptions.maxRetries > 0;
  const verifyDeployment = networkConfig.verifyDeployment;
  const retryOptions = networkConfig.retryOptions;

  const startTime = Date.now();
  const deployer = await signer.getAddress();

  section("Treasury Deployment");
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
    const proxyAdminResult = {
      success: true,
      proxyAdminAddress,
    };

    info(`✅ ProxyAdmin: ${proxyAdminResult.proxyAdminAddress}`);

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
    const facetNames = [
      "DiamondFacet",
      "AccessControlFacet",
      "PauseFacet",
      "LifeCycleCashFlowFacet",
      "PortfolioFacet",
      "ProceedsManagementFacet",
    ];

    // Add TimeTravelFacet separately (only needed in TimeTravel mode)
    if (useTimeTravel) {
      facetNames.push("TimeTravelFacet");
    }

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

    const registerResult = await registerFacets(blrContract, {
      facets: facetsWithKeys,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

    info("\n💼 Step 5/6: Creating Treasury configuration...");

    const treasuryConfig = await createTreasuryConfiguration(
      blrContract,
      facetAddresses,
      useTimeTravel,
      DEFAULT_BATCH_SIZE,
      confirmations,
    );

    if (!treasuryConfig.success) {
      throw new Error("Treasury config failed");
    }

    info(`✅ Treasury Config ID: ${treasuryConfig.data.configurationId}`);
    info(`✅ Config Version: ${treasuryConfig.data.version}`);
    info(`✅ Facets: ${treasuryConfig.data.facetKeys.length}`);

    info("\n🏭 Step 6/6: Deploying Treasury ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const treasuryProxyResult = await deployResolverProxy(signer, {
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
    });

    if (!treasuryProxyResult.success) {
      throw new Error(`Treasury ResolverProxy deployment failed: ${treasuryProxyResult.error}`);
    }

    const treasuryAddress = treasuryProxyResult.proxyAddress!;

    info(`✅ Treasury ResolverProxy deployed successfully`);
    info(`   Address: ${treasuryAddress}`);
    if (treasuryProxyResult.contractId) {
      info(`   Contract ID: ${treasuryProxyResult.contractId}`);
    }

    const endTime = Date.now();

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

      facets: Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        const facetAddress = deploymentResult.address!;
        const configFacet = treasuryConfig.data.facetKeys.find((f) => f.address === facetAddress);

        return {
          name: facetName,
          address: facetAddress,
          key: configFacet?.key || "",
        };
      }),

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
    };

    info("\n" + "═".repeat(60));
    info("✨ DEPLOYMENT COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`📦 Facets deployed: ${output.summary.totalFacets}`);
    info(`⚙️  Configuration version: ${output.configuration.version}`);
    info("═".repeat(60));

    success("Treasury deployed successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
