// SPDX-License-Identifier: Apache-2.0

/**
 * FactorySuite configuration upgrade workflow.
 *
 * Upgrades FactorySuite facets without redeploying BLR infrastructure.
 * Mirrors the @hashgraph/asset-tokenization-contracts upgradeConfigurations pattern.
 *
 * Five-Phase Execution:
 * 1. Validate - BLR exists, signer has permissions
 * 2. Deploy Facets - Deploy FactorySuiteFacet (and TimeTravel variant if needed)
 * 3. Register Facets - Register in existing BLR
 * 4. Create Configuration - Create new FactorySuite config version
 * 5. Update Proxies - Optional batch update of FactorySuite ResolverProxies
 *
 * @module workflows/upgradeFactorySuiteConfiguration
 */

import type { Signer, ContractFactory } from "ethers";
import {
  deployFacets,
  registerAdditionalFacets,
  updateResolverProxyVersion,
  atsRegistry,
  info,
  success,
  section,
  error as logError,
  getDeploymentConfig,
  isInstantMiningNetwork,
  configureLogger,
  LogLevel,
  DEFAULT_BATCH_SIZE,
  fetchHederaContractId,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { IBusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { createFactorySuiteConfiguration, factorySuiteRegistry, getFacetDefinitionFromRegistry } from "@scripts/domain";

/**
 * Upgrade options for FactorySuite configuration.
 */
export interface UpgradeFactorySuiteConfigurationOptions {
  /** Existing BLR proxy address (required) */
  blrAddress: string;

  /** Whether to use TimeTravel facet variants */
  useTimeTravel?: boolean;

  /** Optional FactorySuite proxy addresses to update to new version */
  proxyAddresses?: readonly string[];

  /** Transaction confirmations to wait for */
  confirmations?: number;

  /** Enable deployment retry on failure */
  enableRetry?: boolean;

  /** Verify deployed bytecode matches expected */
  verifyDeployment?: boolean;

  /** Save deployment output to file */
  saveOutput?: boolean;

  /** Custom output file path */
  outputPath?: string;

  /** Enable verbose (debug) logging */
  verbose?: boolean;
}

/**
 * Proxy update result for batch operations.
 */
export interface ProxyUpdateResult {
  /** Whether update succeeded */
  success: boolean;

  /** Proxy address being updated */
  proxyAddress: string;

  /** Previous configuration version */
  previousVersion?: number;

  /** New configuration version */
  newVersion?: number;

  /** Update transaction hash */
  transactionHash?: string;

  /** Error message if failed */
  error?: string;
}

/**
 * Complete upgrade workflow output.
 */
export interface UpgradeFactorySuiteConfigurationOutput {
  /** Network identifier */
  network: string;

  /** Upgrade timestamp (ISO 8601) */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** BLR information */
  blr: {
    /** BLR proxy address */
    address: string;

    /** Always true for upgrades (reuses existing BLR) */
    isExternal: true;
  };

  /** Deployed facets */
  facets: Array<{
    /** Facet contract name */
    name: string;

    /** Deployed facet address */
    address: string;

    /** Hedera contract ID (if applicable) */
    contractId?: string;

    /** BLR resolver key */
    key: string;
  }>;

  /** Created configuration */
  configuration: {
    /** Configuration ID (30'000) */
    configId: string;

    /** New version number */
    version: number;

    /** Total facets in configuration */
    facetCount: number;

    /** Facet keys and addresses */
    facetKeys: Array<{
      key: string;
      address: string;
    }>;
  };

  /** Proxy update results (if proxyAddresses provided) */
  proxyUpdates?: ProxyUpdateResult[];

  /** Upgrade summary */
  summary: {
    /** Number of new facets deployed */
    totalFacetsDeployed: number;

    /** Number of configurations created (always 1) */
    configurationsCreated: number;

    /** Number of proxies successfully updated */
    proxiesUpdated: number;

    /** Number of proxies that failed to update */
    proxiesFailed: number;

    /** Total upgrade time in milliseconds */
    deploymentTime: number;

    /** Whether upgrade completed successfully */
    success: boolean;
  };
}

/**
 * Upgrade FactorySuite configuration: deploy new facets, register in BLR, create new config version.
 * Optionally updates existing FactorySuite proxies. Reuses shared facets from ATS registry.
 */
export async function upgradeFactorySuiteConfiguration(
  signer: Signer,
  network: string,
  options: UpgradeFactorySuiteConfigurationOptions,
): Promise<UpgradeFactorySuiteConfigurationOutput> {
  const {
    blrAddress,
    useTimeTravel = false,
    proxyAddresses,
    confirmations: _confirmations,
    enableRetry: _enableRetry,
    verifyDeployment: _verifyDeployment,
    saveOutput: _saveOutput = false,
    outputPath: _outputPath,
    verbose = false,
  } = options;

  // Configure logger
  configureLogger({
    level: verbose ? LogLevel.DEBUG : LogLevel.INFO,
  });

  const startTime = Date.now();
  const deployer = await signer.getAddress();

  const getContractId = async (address: string) => {
    return network.toLowerCase().includes("hedera") ? await fetchHederaContractId(network, address) : undefined;
  };

  // Get network configuration
  const networkConfig = getDeploymentConfig(network);
  const confirmations = _confirmations ?? networkConfig.confirmations;
  const enableRetry = _enableRetry ?? networkConfig.retryOptions.maxRetries > 0;
  const verifyDeployment = _verifyDeployment ?? networkConfig.verifyDeployment;
  const retryOptions = networkConfig.retryOptions;

  section("FactorySuite Configuration Upgrade");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`🌐 Type: ${isInstantMiningNetwork(network) ? "Local" : "Remote"}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`🏗️  BLR: ${blrAddress}`);
  info(`⏱️  Confirmations: ${confirmations}`);
  info(`🔁 Retry: ${enableRetry ? `Enabled (max ${retryOptions.maxRetries})` : "Disabled"}`);
  info(`✅ Verification: ${verifyDeployment ? "Enabled" : "Disabled"}`);
  if (proxyAddresses && proxyAddresses.length > 0) {
    info(`🔗 Proxies to update: ${proxyAddresses.length}`);
  }
  info("═".repeat(60));

  try {
    // ========================================
    // PHASE 0: Validation
    // ========================================
    info("\n🔍 Phase 0/4: Validating inputs...");

    if (!blrAddress || blrAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("Invalid BLR address");
    }

    const blrContract = IBusinessLogicResolver__factory.connect(blrAddress, signer);

    // Validate BLR is accessible
    try {
      await blrContract.resolveLatestBusinessLogic(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      );
    } catch (error) {
      // Expected to fail for zero key, but should connect successfully
      if (error instanceof Error && error.message.includes("provider")) {
        throw new Error(`Cannot connect to BLR at ${blrAddress}: ${error.message}`);
      }
    }

    info(`✅ BLR validated: ${blrAddress}`);

    // ========================================
    // PHASE 1: Deploy Facets
    // ========================================
    info("\n📦 Phase 1/4: Deploying FactorySuite facets...");

    // Use base facet name for registry lookup (registry entry uses dynamic factory)
    const facetNames = ["FactorySuiteFacet"];

    // Add TimeTravelFacet separately (only needed in TimeTravel mode)
    if (useTimeTravel) {
      facetNames.push("TimeTravelFacet");
    }

    info(`   Facets to deploy: ${facetNames.join(", ")}`);

    // Create facet factories from registry
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
      throw new Error("FactorySuite facet deployment failed");
    }

    info(`✅ Deployed ${facetsResult.deployed.size} new facet(s)`);

    // Extract deployed facet addresses
    const newFacetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        newFacetAddresses[facetName] = deploymentResult.address;
      }
    });

    // ========================================
    // PHASE 2: Register Facets
    // ========================================
    info("\n📝 Phase 2/4: Registering new facets in BLR...");

    const newFacetsWithKeys = Object.entries(newFacetAddresses).map(([name, address]) => {
      const { resolverKey } = getFacetDefinitionFromRegistry(name);
      return { name, address, resolverKey };
    });

    const registerResult = await registerAdditionalFacets(signer, {
      blrAddress,
      newFacets: newFacetsWithKeys,
      allowOverwrite: true, // Allow upgrading existing facets
    });

    if (!registerResult.success) {
      throw new Error(`Facet registration failed: ${registerResult.error}`);
    }

    info(`✅ Registered ${Object.keys(newFacetAddresses).length} new facet(s)`);

    // ========================================
    // PHASE 3: Create Configuration
    // ========================================
    info("\n💼 Phase 3/4: Creating FactorySuite configuration...");

    // Query shared facet addresses from BLR (use base names for registry lookup)
    const { resolverKey: diamondKey } = getFacetDefinitionFromRegistry("DiamondFacet");
    const { resolverKey: accessControlKey } = getFacetDefinitionFromRegistry("AccessControlFacet");
    const { resolverKey: pauseKey } = getFacetDefinitionFromRegistry("PauseFacet");

    const diamondAddress = await blrContract.resolveLatestBusinessLogic(diamondKey);
    const accessControlAddress = await blrContract.resolveLatestBusinessLogic(accessControlKey);
    const pauseAddress = await blrContract.resolveLatestBusinessLogic(pauseKey);

    if (!diamondAddress || diamondAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("DiamondFacet not found in BLR");
    }

    if (!accessControlAddress || accessControlAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("AccessControlFacet not found in BLR");
    }

    if (!pauseAddress || pauseAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("PauseFacet not found in BLR");
    }

    // Combine shared + new facets (use base names for all facets)
    const facetNamesForConfig: Record<string, string> = useTimeTravel
      ? {
          DiamondFacet: diamondAddress,
          AccessControlFacet: accessControlAddress,
          PauseFacet: pauseAddress,
          FactorySuiteFacet: newFacetAddresses.FactorySuiteFacet,
          TimeTravelFacet: newFacetAddresses.TimeTravelFacet,
        }
      : {
          DiamondFacet: diamondAddress,
          AccessControlFacet: accessControlAddress,
          PauseFacet: pauseAddress,
          FactorySuiteFacet: newFacetAddresses.FactorySuiteFacet,
        };

    const fsConfig = await createFactorySuiteConfiguration(
      blrContract,
      facetNamesForConfig,
      DEFAULT_BATCH_SIZE,
      confirmations,
    );

    if (!fsConfig.success) {
      throw new Error(`FactorySuite config failed: ${fsConfig.error} - ${fsConfig.message}`);
    }

    info(`✅ FactorySuite Config ID: ${fsConfig.data.configurationId}`);
    info(`✅ Config Version: ${fsConfig.data.version}`);
    info(`✅ Total Facets: ${fsConfig.data.facetKeys.length}`);

    // ========================================
    // PHASE 4: Update Proxies (Optional)
    // ========================================
    const proxyUpdates: ProxyUpdateResult[] = [];

    if (proxyAddresses && proxyAddresses.length > 0) {
      info(`\n🔗 Phase 4/4: Updating ${proxyAddresses.length} proxy(ies)...`);

      for (const proxyAddress of proxyAddresses) {
        try {
          const result = await updateResolverProxyVersion(signer, proxyAddress, fsConfig.data.version, {
            confirmations,
          });

          proxyUpdates.push({
            success: result.success,
            proxyAddress,
            previousVersion: result.previousConfig?.version,
            newVersion: result.newConfig?.version,
            transactionHash: result.transactionHash,
            error: result.error,
          });

          if (result.success) {
            info(`   ✅ Updated proxy ${proxyAddress} to v${fsConfig.data.version}`);
          } else {
            info(`   ❌ Failed to update proxy ${proxyAddress}: ${result.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          proxyUpdates.push({
            success: false,
            proxyAddress,
            error: errorMessage,
          });
          info(`   ❌ Failed to update proxy ${proxyAddress}: ${errorMessage}`);
        }
      }

      const successCount = proxyUpdates.filter((r) => r.success).length;
      const failCount = proxyUpdates.filter((r) => !r.success).length;

      info(`✅ Updated ${successCount} proxy(ies) successfully`);
      if (failCount > 0) {
        info(`⚠️  ${failCount} proxy(ies) failed to update`);
      }
    } else {
      info("\n⏭️  Phase 4/4: Skipped (no proxies to update)");
    }

    // ========================================
    // Build Output
    // ========================================
    const endTime = Date.now();

    const output: UpgradeFactorySuiteConfigurationOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      blr: {
        address: blrAddress,
        isExternal: true,
      },

      facets: await Promise.all(
        Array.from(facetsResult.deployed.entries()).map(async ([facetName, deploymentResult]) => {
          const facetAddress = deploymentResult.address!;
          const { resolverKey } = getFacetDefinitionFromRegistry(facetName);

          return {
            name: facetName,
            address: facetAddress,
            contractId: await getContractId(facetAddress),
            key: resolverKey,
          };
        }),
      ),

      configuration: {
        configId: fsConfig.data.configurationId,
        version: fsConfig.data.version,
        facetCount: fsConfig.data.facetKeys.length,
        facetKeys: fsConfig.data.facetKeys,
      },

      proxyUpdates: proxyUpdates.length > 0 ? proxyUpdates : undefined,

      summary: {
        totalFacetsDeployed: facetsResult.deployed.size,
        configurationsCreated: 1,
        proxiesUpdated: proxyUpdates.filter((r) => r.success).length,
        proxiesFailed: proxyUpdates.filter((r) => !r.success).length,
        deploymentTime: endTime - startTime,
        success: true,
      },
    };

    // ========================================
    // Print Summary
    // ========================================
    info("\n" + "═".repeat(60));
    info("✨ UPGRADE COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`📦 New facets deployed: ${output.summary.totalFacetsDeployed}`);
    info(`⚙️  Configuration version: ${output.configuration.version}`);
    if (output.proxyUpdates) {
      info(`🔗 Proxies updated: ${output.summary.proxiesUpdated}/${proxyUpdates.length}`);
    }
    info("═".repeat(60));

    success("FactorySuite configuration upgraded successfully");

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError("\n❌ Upgrade failed:", errorMessage);

    throw error;
  }
}
