// SPDX-License-Identifier: Apache-2.0

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
  configureLogger,
  LogLevel,
  getDeploymentConfig,
  isInstantMiningNetwork,
  DEFAULT_BATCH_SIZE,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { BusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { Signer, ContractFactory } from "ethers";
import {
  createFactoryPrimaryMarketConfiguration,
  createPrimaryMarketConfiguration,
  primaryMarketRegistry,
} from "@scripts/domain";

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
      implementation?: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
    factoryPrimaryMarket: {
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

  /** PrimaryMarket configuration (config ID 10001) */
  primaryMarketConfiguration: {
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
 * Options for complete FactoryPrimaryMarket deployment.
 */
export interface DeployFactoryPrimaryMarketSystemOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

export async function deployFactoryPrimaryMarketSystem(
  signer: Signer,
  network: string,
  options: DeployFactoryPrimaryMarketSystemOptions = {},
): Promise<DeployFactoryPrimaryMarketOutput> {
  configureLogger({ level: LogLevel.SILENT });
  const { useTimeTravel = false, saveOutput: _saveOutput = false, outputPath: _outputPath } = options;

  const startTime = Date.now();
  const deployer = await signer.getAddress();

  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);
  const confirmations = networkConfig.confirmations;
  const enableRetry = networkConfig.retryOptions.maxRetries > 0;
  const verifyDeployment = networkConfig.verifyDeployment;
  const retryOptions = networkConfig.retryOptions;

  section("FactoryPrimaryMarket Deployment");
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

    info(`✅ ProxyAdmin: ${proxyAdmin.address}`);

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

    const facetFactories: Record<string, ContractFactory> = {};
    for (const facetName of facetNames) {
      const facetDef = primaryMarketRegistry.getFacetDefinition(facetName) || atsRegistry.getFacetDefinition(facetName);

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
      const primaryMarketFacet = primaryMarketRegistry.getFacetDefinition(name);
      if (primaryMarketFacet?.resolverKey?.value) {
        return { name, address, resolverKey: primaryMarketFacet.resolverKey.value };
      }

      const atsFacet = atsRegistry.getFacetDefinition(name);
      if (atsFacet?.resolverKey?.value) {
        return { name, address, resolverKey: atsFacet.resolverKey.value };
      }

      throw new Error(`Facet ${name} not found in PrimaryMarket or ATS registries`);
    });

    const registerResult = await registerFacets(blrContract, {
      facets: facetsWithKeys,
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

    info("\n💼 Step 5/6: Creating FactoryPrimaryMarket configuration...");

    const factoryPrimaryMarketConfig = await createFactoryPrimaryMarketConfiguration(
      blrContract,
      facetAddresses,
      DEFAULT_BATCH_SIZE,
      confirmations,
    );

    if (!factoryPrimaryMarketConfig.success) {
      throw new Error("FactoryPrimaryMarket config failed");
    }

    info(`✅ FactoryPrimaryMarket Config ID: ${factoryPrimaryMarketConfig.data.configurationId}`);
    info(`✅ Config Version: ${factoryPrimaryMarketConfig.data.version}`);
    info(`✅ Facets: ${factoryPrimaryMarketConfig.data.facetKeys.length}`);

    info("\n💼 Step 6/7: Creating PrimaryMarket configuration...");

    const primaryMarketConfig = await createPrimaryMarketConfiguration(
      blrContract,
      facetAddresses,
      DEFAULT_BATCH_SIZE,
      confirmations,
    );

    if (!primaryMarketConfig.success) {
      throw new Error("PrimaryMarket config failed");
    }

    info(`✅ PrimaryMarket Config ID: ${primaryMarketConfig.data.configurationId}`);
    info(`✅ Config Version: ${primaryMarketConfig.data.version}`);
    info(`✅ Facets: ${primaryMarketConfig.data.facetKeys.length}`);

    info("\n🏭 Step 7/7: Deploying FactoryPrimaryMarket ResolverProxy...");

    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const factoryPrimaryMarketProxyResult = await deployResolverProxy(signer, {
      blrAddress: blrResult.blrAddress,
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

    const endTime = Date.now();

    const output: DeployFactoryPrimaryMarketOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      infrastructure: {
        proxyAdmin: {
          address: proxyAdmin.address,
        },
        blr: {
          implementation: blrResult.implementationAddress,
          proxy: blrResult.blrAddress,
        },
        factoryPrimaryMarket: {
          proxy: factoryPrimaryMarketAddress,
        },
      },

      facets: Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        const facetAddress = deploymentResult.address!;
        const configFacet = factoryPrimaryMarketConfig.data.facetKeys.find((f) => f.address === facetAddress);

        return {
          name: facetName,
          address: facetAddress,
          key: configFacet?.key || "",
        };
      }),

      configuration: {
        configId: factoryPrimaryMarketConfig.data.configurationId,
        version: factoryPrimaryMarketConfig.data.version,
        facetCount: factoryPrimaryMarketConfig.data.facetKeys.length,
        facets: factoryPrimaryMarketConfig.data.facetKeys,
      },

      primaryMarketConfiguration: {
        configId: primaryMarketConfig.data.configurationId,
        version: primaryMarketConfig.data.version,
        facetCount: primaryMarketConfig.data.facetKeys.length,
        facets: primaryMarketConfig.data.facetKeys,
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

    success("FactoryPrimaryMarket deployed successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Deployment failed:", errorMessage);

    throw error;
  }
}
