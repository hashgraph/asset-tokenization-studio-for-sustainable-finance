import type { Signer } from "ethers";
import { join } from "path";
import {
  deployProxyAdmin,
  deployBlr,
  deploySystemWithExistingBlr,
  CheckpointManager,
  info,
  success,
  error as logError,
  section,
  configureLogger,
  LogLevel,
  saveDeploymentOutput,
  isHederaNetwork,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import type { DeploymentWithExistingBlrOutput } from "@hashgraph/asset-tokenization-contracts/scripts";
import {
  deployFactorySuiteWithExistingInfra,
  type DeployFactorySuiteOutput,
} from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import {
  deployTreasuryWithExistingInfra,
  type DeployTreasuryOutput,
} from "@hashgraph/green-bonds-platform-treasury-contracts/scripts";
import {
  deployFactoryPrimaryMarketWithExistingInfra,
  type DeployFactoryPrimaryMarketOutput,
} from "@hashgraph/green-bonds-platform-primarymarket-contracts/scripts";
import type { GbpInfrastructureOutput } from "@scripts/types/workflows";

/** Deployment options for GBP infrastructure orchestration */
export interface DeploymentOptions {
  /** Enable time-travel mode for testing */
  useTimeTravel?: boolean;
  /** Network name (testnet, mainnet, etc.) */
  network?: string;
  /** Verbose logging output */
  verbose?: boolean;
  /**
   * Custom checkpoint directory path for deployment state persistence.
   *
   * By default, checkpoints are saved in the project's deployments folder.
   * Checkpoints survive npm install/ci and enable resuming failed deployments.
   *
   * @default './deployments/.checkpoints' (relative to package root)
   * @example './deployments/.checkpoints'
   * @example '/tmp/gbp-deployments/.checkpoints'
   */
  checkpointDir?: string;
  /** Save deployment output to file */
  saveOutput?: boolean;
}

/** Complete deployment result from GBP infrastructure orchestration */
export interface DeploymentResult {
  /** ProxyAdmin contract address */
  proxyAdmin: string;
  /** BusinessLogicResolver (BLR) proxy address */
  blr: string;
  /** BLR implementation address */
  blrImplementationAddress: string;
  /** BOND deployment result (includes facets, configurations, factory) */
  bondDeployment: DeploymentWithExistingBlrOutput;
  /** TREASURY deployment result */
  treasuryDeployment: DeployTreasuryOutput;
  /** FactorySuite deployment result */
  factorySuiteDeployment: DeployFactorySuiteOutput;
  /** Primary Market deployment result */
  primaryMarketDeployment: DeployFactoryPrimaryMarketOutput;
}

/** Save deployment result with structured output format. */
async function saveDeploymentResult(result: DeploymentResult, network: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const output: GbpInfrastructureOutput = {
    timestamp,
    network,
    callableContracts: {
      proxyAdmin: {
        description: "ProxyAdmin - Manages upgrades for TransparentUpgradeableProxy contracts",
        address: result.proxyAdmin,
        contractId: result.bondDeployment?.infrastructure?.proxyAdmin?.contractId,
      },
      businessLogicResolver: {
        description: "Business Logic Resolver (BLR) - Shared diamond pattern resolver",
        address: result.blr,
        contractId: result.bondDeployment?.infrastructure?.blr?.proxyContractId,
        proxyType: "TransparentUpgradeableProxy",
        implementation: {
          address: result.blrImplementationAddress,
          contractId: result.bondDeployment?.infrastructure?.blr?.implementationContractId,
        },
      },
      atsFactory: {
        description: "ATS Factory - Creates Bond and Equity tokens",
        address: result.bondDeployment?.infrastructure?.factory?.proxy || "",
        contractId: result.bondDeployment?.infrastructure?.factory?.proxyContractId,
        proxyType: "TransparentUpgradeableProxy",
        implementation: {
          address: result.bondDeployment?.infrastructure?.factory?.implementation || "",
          contractId: result.bondDeployment?.infrastructure?.factory?.implementationContractId,
        },
      },
      factorySuite: result.factorySuiteDeployment?.infrastructure?.factorySuite
        ? {
            description: "FactorySuite - Atomic deployment of Bond + Treasury + KPI",
            address: result.factorySuiteDeployment.infrastructure.factorySuite.proxy,
            contractId: result.factorySuiteDeployment.infrastructure.factorySuite.proxyContractId,
            proxyType: "ResolverProxy (Diamond)",
            resolver: {
              address: result.factorySuiteDeployment.infrastructure.blr.proxy,
              contractId: result.factorySuiteDeployment.infrastructure.blr.proxyContractId,
            },
          }
        : undefined,
      primaryMarketFactory: result.primaryMarketDeployment?.infrastructure?.factoryPrimaryMarket
        ? {
            description: "Primary Market Factory - Deploys Primary Market instances",
            address: result.primaryMarketDeployment.infrastructure.factoryPrimaryMarket.proxy,
            contractId: result.primaryMarketDeployment.infrastructure.factoryPrimaryMarket.proxyContractId,
            proxyType: "ResolverProxy (Diamond)",
            resolver: {
              address: result.primaryMarketDeployment.infrastructure.blr.proxy,
              contractId: result.primaryMarketDeployment.infrastructure.blr.proxyContractId,
            },
          }
        : undefined,
    },
    result,
  };

  if (isHederaNetwork(network)) {
    const missingContractIds: string[] = [];
    Object.entries(output.callableContracts).forEach(([name, contract]) => {
      if (contract && !contract.contractId) {
        missingContractIds.push(name);
      }
    });
    if (missingContractIds.length > 0) {
      logError(`⚠️  Warning: Missing contractIds for: ${missingContractIds.join(", ")}`);
    }
  }

  // Generate custom filepath in our deployments directory
  const formattedTimestamp = timestamp.replace(/[:.]/g, "-").slice(0, -5);
  const filename = `gbpInfrastructure-${formattedTimestamp}.json`;
  const customPath = `./deployments/${network}/${filename}`;

  const saveResult = await saveDeploymentOutput({
    network,
    workflow: "gbpInfrastructure",
    data: output,
    customPath,
  });

  if (saveResult.success) {
    success(`💾 Deployment saved: ${saveResult.filepath}`);
  } else {
    logError(`⚠️  Failed to save: ${saveResult.error}`);
  }
}

/**
 * Deploy complete GBP infrastructure using high-level workflows.
 *
 * This orchestration combines proven ATS workflows to deploy the complete infrastructure:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver (BLR) with transparent proxy
 * 3. Deploy BOND configuration (uses `deployWithExistingBlr` from ATS)
 * 4. Deploy TREASURY configuration (uses `deployTreasuryWithExistingInfra` from GBP Treasury)
 * 5. Deploy FactorySuite (uses `deployFactorySuiteWithExistingInfra` from GBP ATS)
 * 6. Deploy Primary Market (uses `deployFactoryPrimaryMarketWithExistingInfra` from GBP Primary Market)
 *
 * **What Each Step Does:**
 * - Step 3: Deploys ALL BOND facets, registers them, creates BOND configuration
 * - Step 4: Deploys Treasury custom facets (reuses AccessControl and Pause from Step 3),
 *   registers them, creates Treasury configuration
 * - Step 5: Deploys FactorySuite facet, registers it, creates FactorySuite configuration
 *   (reuses AccessControl and Pause facets from Step 3)
 * - Step 6: Deploys Primary Market facets, registers them, creates Primary Market configuration
 *   (reuses AccessControl and Pause facets from Step 3)
 *
 * **Checkpoint System:**
 * - Automatically saves deployment state after each major step
 * - Checkpoints stored in `./deployments/.checkpoints/` (survives npm install)
 * - Failed deployments can be resumed by re-running the same command
 * - Skips already-deployed contracts to save gas and time
 *
 * @param signer - Ethers signer for deploying contracts
 * @param options - Deployment options
 * @returns Complete deployment result with all addresses and deployment details
 *
 * @example Basic deployment
 * ```typescript
 * import { ethers } from 'ethers'
 * import { deployGbpInfrastructure } from '@hashgraph/green-bonds-platform-shared-contracts/scripts'
 *
 * const signer = new ethers.Wallet(privateKey, provider)
 * const result = await deployGbpInfrastructure(signer, {
 *   useTimeTravel: false,
 *   network: 'hedera-testnet',
 *   verbose: true
 * })
 *
 * console.log('Infrastructure deployed:')
 * console.log('  ProxyAdmin:', result.proxyAdmin)
 * console.log('  BLR:', result.blr)
 * console.log('  BOND config version:', result.bondDeployment.configurations.bond.version)
 * console.log('  Treasury config version:', result.treasuryDeployment.configuration.version)
 * console.log('  FactorySuite config version:', result.factorySuiteDeployment.configuration.version)
 * console.log('  Primary Market config version:', result.primaryMarketDeployment.configuration.version)
 * ```
 *
 * @example Custom checkpoint directory
 * ```typescript
 * const result = await deployGbpInfrastructure(signer, {
 *   network: 'hedera-testnet',
 *   checkpointDir: '/tmp/my-deployments/.checkpoints'
 * })
 * ```
 *
 * @example Resuming failed deployment
 * ```typescript
 * // If previous deployment failed, simply re-run the same command:
 * const result = await deployGbpInfrastructure(signer, {
 *   network: 'hedera-testnet'
 * })
 * // Automatically detects and resumes from checkpoint
 * // Skips already-deployed contracts
 * ```
 */
export async function deployGbpInfrastructure(
  signer: Signer,
  options: DeploymentOptions = {},
): Promise<DeploymentResult> {
  const {
    useTimeTravel = false,
    network = "testnet",
    verbose = false,
    checkpointDir = join(__dirname, "../../deployments/.checkpoints"),
    saveOutput = false,
  } = options;

  // Configure global logger for entire orchestration
  configureLogger({
    level: verbose ? LogLevel.DEBUG : LogLevel.INFO,
  });

  section("GBP Infrastructure Deployment - Phase 1");
  info("Orchestrating complete infrastructure deployment");
  info(`Network: ${network}`);
  info(`Time-travel mode: ${useTimeTravel ? "ENABLED" : "DISABLED"}`);
  info(`Checkpoint directory: ${checkpointDir}`);

  // Log network deployment configuration
  const { getDeploymentConfig } = await import("@hashgraph/asset-tokenization-contracts/scripts");
  const networkConfig = getDeploymentConfig(network);
  info(`Network timeout: ${networkConfig.timeout}ms (${networkConfig.timeout / 1000}s)`);
  info(`Network confirmations: ${networkConfig.confirmations}`);
  info(`Max retries: ${networkConfig.retryOptions.maxRetries}`);

  // ========================================
  // Check for existing checkpoint
  // ========================================
  const checkpointManager = new CheckpointManager(checkpointDir);
  const incompleteCheckpoints = await checkpointManager.findCheckpoints(network, "in-progress");

  let proxyAdminAddress: string;
  let blrAddress: string;
  let blrImplementationAddress: string | undefined;

  if (incompleteCheckpoints.length > 0) {
    const checkpoint = incompleteCheckpoints[0];
    info(`\n🔍 Found incomplete deployment: ${checkpoint.checkpointId}`);
    info(`   Started: ${checkpoint.startTime}`);
    info(`   Last update: ${checkpoint.lastUpdate}`);
    info(`   Current step: ${checkpoint.currentStep}`);
    info(`\n⏯️  Resuming deployment from checkpoint...`);

    // Use addresses from checkpoint
    if (!checkpoint.steps.proxyAdmin || !checkpoint.steps.blr) {
      throw new Error("Checkpoint missing ProxyAdmin or BLR addresses");
    }

    proxyAdminAddress = checkpoint.steps.proxyAdmin.address;
    blrAddress = checkpoint.steps.blr.proxy;
    blrImplementationAddress = checkpoint.steps.blr.implementation;

    success(`✓ Reconnecting to ProxyAdmin: ${proxyAdminAddress}`);
    success(`✓ Reconnecting to BLR: ${blrAddress}`);
    if (blrImplementationAddress) {
      success(`✓ BLR Implementation: ${blrImplementationAddress}`);
    }
  } else {
    info("\n✨ Starting fresh deployment...\n");

    try {
      // ========================================
      // Step 1: Deploy ProxyAdmin
      // ========================================
      section("Step 1: Deploy ProxyAdmin");
      const proxyAdmin = await deployProxyAdmin(signer);
      proxyAdminAddress = proxyAdmin.address;
      success(`✓ ProxyAdmin deployed at: ${proxyAdminAddress}`);

      // ========================================
      // Step 2: Deploy BusinessLogicResolver with TUP
      // ========================================
      section("Step 2: Deploy BusinessLogicResolver with TUP");
      const blrResult = await deployBlr(signer, {
        existingProxyAdmin: proxyAdmin,
        initialize: true,
      });

      if (!blrResult.success) {
        throw new Error(`BLR deployment failed: ${blrResult.error}`);
      }

      blrAddress = blrResult.blrAddress;
      blrImplementationAddress = blrResult.implementationAddress;
      success(`✓ BLR proxy deployed at: ${blrAddress}`);
      success(`✓ BLR implementation deployed at: ${blrImplementationAddress}`);
    } catch (infraError) {
      logError("Infrastructure deployment failed:", infraError);
      throw infraError;
    }
  }

  try {
    // ========================================
    // Step 3: Deploy BOND Configuration (with Existing BLR)
    // ========================================
    section("Step 3: Deploy BOND Configuration");
    info("Using deployWithExistingBlr workflow from ATS");
    info("This will:");
    info("  - Deploy all BOND facets (including AccessControl, Pause)");
    info("  - Register facets in BLR");
    info("  - Create BOND configuration (config ID: 2)");
    info("  - Deploy ATS Factory");

    const bondResult = await deploySystemWithExistingBlr(signer, network, blrAddress, {
      existingProxyAdminAddress: proxyAdminAddress,
      deployFacets: true,
      createConfigurations: true,
      deployFactory: true,
      useTimeTravel,
      saveOutput: false,
      ignoreCheckpoint: false, // Enable checkpoint resume capability
      checkpointDir, // Use project-local checkpoint directory
    });

    if (!bondResult.summary.success) {
      throw new Error("BOND deployment failed");
    }

    success(`✓ BOND deployment completed`);
    success(`  Total facets deployed: ${bondResult.summary.totalFacets}`);
    success(`  BOND config version: ${bondResult.configurations.bond.version}`);
    success(`  Factory deployed at: ${bondResult.infrastructure.factory.proxy}`);

    // ========================================
    // Extract shared facets for reuse
    // ========================================
    const accessControlFacet = bondResult.facets.find((f) => f.name === "AccessControlFacet");
    const pauseFacet = bondResult.facets.find((f) => f.name === "PauseFacet");
    const diamondFacet = bondResult.facets.find((f) => f.name === "DiamondFacet");

    if (!accessControlFacet || !pauseFacet || !diamondFacet) {
      throw new Error("Required shared facets not found in BOND deployment");
    }

    // ========================================
    // Step 4: Deploy TREASURY (with Existing Infrastructure)
    // ========================================
    section("Step 4: Deploy TREASURY");
    info("Using deployTreasuryWithExistingInfra workflow from GBP Treasury");
    info("This will:");
    info("  - Deploy 3 Treasury facets (LifeCycleCashFlow, Portfolio, ProceedsManagement)");
    info("  - Register facets in BLR");
    info("  - Create TREASURY configuration (config ID: 20000)");
    info("  - Reuse AccessControl, Pause, and Diamond facets from BOND deployment");

    const treasuryResult = await deployTreasuryWithExistingInfra(
      signer,
      network,
      {
        blrAddress,
        blrImplementationAddress,
        proxyAdminAddress,
        facets: {
          accessControl: accessControlFacet.address,
          pause: pauseFacet.address,
          diamond: diamondFacet.address,
        },
      },
      {
        useTimeTravel,
        saveOutput: false,
        verbose,
      },
    );

    if (!treasuryResult.summary.success) {
      throw new Error("TREASURY deployment failed");
    }

    success(`✓ TREASURY deployment completed`);
    success(`  TREASURY config version: ${treasuryResult.configuration.version}`);
    success(`  TREASURY facets registered and configuration created`);

    // ========================================
    // Step 5: Deploy FactorySuite (with Existing Infrastructure)
    // ========================================
    section("Step 5: Deploy FactorySuite");
    info("Using deployFactorySuiteWithExistingInfra workflow from GBP ATS");
    info("This will:");
    info("  - Deploy FactorySuite facet");
    info("  - Register facet in BLR");
    info("  - Create FactorySuite configuration (config ID: 30000)");
    info("  - Reuse AccessControl, Pause, and Diamond facets from BOND deployment");
    info("  - Deploy FactorySuite ResolverProxy");

    const factorySuiteResult = await deployFactorySuiteWithExistingInfra(
      signer,
      network,
      {
        blrAddress,
        blrImplementationAddress,
        proxyAdminAddress,
        facets: {
          accessControl: accessControlFacet.address,
          pause: pauseFacet.address,
          diamond: diamondFacet.address,
        },
      },
      {
        useTimeTravel,
        saveOutput: false,
        verbose,
      },
    );

    if (!factorySuiteResult.summary.success) {
      throw new Error("FactorySuite deployment failed");
    }

    success(`✓ FactorySuite deployment completed`);
    success(`  FactorySuite config version: ${factorySuiteResult.configuration.version}`);
    success(`  FactorySuite proxy deployed at: ${factorySuiteResult.infrastructure.factorySuite.proxy}`);

    // ========================================
    // Step 6: Deploy Primary Market (with Existing Infrastructure)
    // ========================================
    section("Step 6: Deploy Primary Market");
    info("Using deployFactoryPrimaryMarketWithExistingInfra workflow from GBP Primary Market");
    info("This will:");
    info("  - Deploy FactoryPrimaryMarketFacet and PrimaryMarketFacet");
    info("  - Register facets in BLR");
    info("  - Create FactoryPrimaryMarket configuration (config ID: 10000)");
    info("  - Create PrimaryMarket configuration (config ID: 10001)");
    info("  - Deploy FactoryPrimaryMarket ResolverProxy");
    info("  - Reuse AccessControl, Pause, and Diamond facets from BOND deployment");

    const primaryMarketResult = await deployFactoryPrimaryMarketWithExistingInfra(
      signer,
      network,
      {
        blrAddress,
        blrImplementationAddress,
        proxyAdminAddress,
        facets: {
          accessControl: accessControlFacet.address,
          pause: pauseFacet.address,
          diamond: diamondFacet.address,
        },
      },
      {
        useTimeTravel,
        saveOutput: false,
        verbose,
      },
    );

    if (!primaryMarketResult.summary.success) {
      throw new Error("Primary Market deployment failed");
    }

    success(`✓ Primary Market deployment completed`);
    success(`  FactoryPrimaryMarket config version: ${primaryMarketResult.configuration.version}`);
    success(
      `  FactoryPrimaryMarket proxy deployed at: ${primaryMarketResult.infrastructure.factoryPrimaryMarket.proxy}`,
    );

    // ========================================
    // Deployment Summary
    // ========================================
    section("Deployment Summary");
    info("Infrastructure:");
    info(`  ProxyAdmin: ${proxyAdminAddress}`);
    info(`  BLR: ${blrAddress}`);
    info(`  ATS Factory: ${bondResult.infrastructure.factory.proxy}`);
    info(`  FactorySuite Proxy: ${factorySuiteResult.infrastructure.factorySuite.proxy}`);
    info(`  FactoryPrimaryMarket Proxy: ${primaryMarketResult.infrastructure.factoryPrimaryMarket.proxy}`);
    info("");
    info("Configurations:");
    info(`  BOND: config ID=2, version=${bondResult.configurations.bond.version}`);
    info(`  TREASURY: config ID=20000, version=${treasuryResult.configuration.version}`);
    info(`  FactorySuite: config ID=30000, version=${factorySuiteResult.configuration.version}`);
    info(`  FactoryPrimaryMarket: config ID=10000, version=${primaryMarketResult.configuration.version}`);
    info(`  PrimaryMarket: config ID=10001, version=${primaryMarketResult.primaryMarketConfiguration.version}`);
    info("");
    info("Facets:");
    info(`  BOND facets: ${bondResult.summary.totalFacets}`);
    info(`  TREASURY facets: ${treasuryResult.summary.totalFacets} (new) + 2 shared`);
    info(`  FactorySuite facets: ${factorySuiteResult.summary.totalFacets}`);
    info(`  PrimaryMarket facets: ${primaryMarketResult.summary.totalFacets} (new) + 2 shared`);
    info(`  Shared facets reused: AccessControlFacet, PauseFacet`);

    const deploymentResult = {
      proxyAdmin: proxyAdminAddress,
      blr: blrAddress,
      blrImplementationAddress,
      bondDeployment: bondResult,
      treasuryDeployment: treasuryResult,
      factorySuiteDeployment: factorySuiteResult,
      primaryMarketDeployment: primaryMarketResult,
    };

    if (saveOutput) {
      await saveDeploymentResult(deploymentResult, network);
    }

    success("✅ GBP infrastructure deployment completed!");

    return deploymentResult;
  } catch (err) {
    logError("Deployment failed with error:");
    logError(err instanceof Error ? err.message : String(err));
    throw err;
  }
}
