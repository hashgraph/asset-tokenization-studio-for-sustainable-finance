import type { Signer } from "ethers";
import {
  deployProxyAdmin,
  deployBlr,
  deployWithExistingBlr,
  info,
  success,
  error as logError,
  section,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import {
  deployFactorySuiteWithExistingInfra,
  type DeployFactorySuiteOutput,
} from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import type { DeploymentWithExistingBlrOutput } from "@hashgraph/asset-tokenization-contracts/scripts";

/** Deployment options for GBP infrastructure orchestration */
export interface DeploymentOptions {
  /** Enable time-travel mode for testing */
  useTimeTravel?: boolean;
  /** Network name (testnet, mainnet, etc.) */
  network?: string;
  /** Verbose logging output */
  verbose?: boolean;
}

/** Complete deployment result from GBP infrastructure orchestration */
export interface DeploymentResult {
  /** ProxyAdmin contract address */
  proxyAdmin: string;
  /** BusinessLogicResolver (BLR) proxy address */
  blr: string;
  /** BOND deployment result (includes facets, configurations, factory) */
  bondDeployment: DeploymentWithExistingBlrOutput;
  /** FactorySuite deployment result */
  factorySuiteDeployment: DeployFactorySuiteOutput;
}

/**
 * Deploy complete GBP infrastructure using high-level workflows.
 *
 * This orchestration combines proven ATS workflows to deploy the complete infrastructure:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver (BLR) with transparent proxy
 * 3. Deploy BOND configuration (uses `deployWithExistingBlr` from ATS)
 * 4. Deploy FactorySuite (uses `deployFactorySuiteWithExistingInfra` from GBP ATS)
 *
 * **What Each Step Does:**
 * - Step 3: Deploys ALL BOND facets, registers them, creates BOND configuration
 * - Step 4: Deploys FactorySuite facet, registers it, creates FactorySuite configuration
 *   (reuses AccessControl and Pause facets from Step 3)
 *
 * @param signer - Ethers signer for deploying contracts
 * @param options - Deployment options
 * @returns Complete deployment result with all addresses and deployment details
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import { deployGbpInfrastructure } from '@hashgraph/green-bonds-platform-shared-contracts/scripts'
 *
 * const signer = new ethers.Wallet(privateKey, provider)
 * const result = await deployGbpInfrastructure(signer, {
 *   useTimeTravel: false,
 *   network: 'testnet',
 *   verbose: true
 * })
 *
 * console.log('Infrastructure deployed:')
 * console.log('  ProxyAdmin:', result.proxyAdmin)
 * console.log('  BLR:', result.blr)
 * console.log('  BOND config version:', result.bondDeployment.configurations.bond.version)
 * console.log('  FactorySuite config version:', result.factorySuiteDeployment.configuration.version)
 * ```
 */
export async function deployGbpInfrastructure(
  signer: Signer,
  options: DeploymentOptions = {},
): Promise<DeploymentResult> {
  const { useTimeTravel = false, network = "testnet", verbose = false } = options;

  section("GBP Infrastructure Deployment - Phase 1");
  info("Orchestrating complete infrastructure deployment");
  info(`Network: ${network}`);
  info(`Time-travel mode: ${useTimeTravel ? "ENABLED" : "DISABLED"}`);

  try {
    // ========================================
    // Step 1: Deploy ProxyAdmin
    // ========================================
    section("Step 1: Deploy ProxyAdmin");
    const proxyAdmin = await deployProxyAdmin(signer);
    const proxyAdminAddress = proxyAdmin.address;
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

    const blrAddress = blrResult.blrAddress;
    success(`✓ BLR proxy deployed at: ${blrAddress}`);

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

    const bondResult = await deployWithExistingBlr(signer, network, blrAddress, {
      existingProxyAdminAddress: proxyAdminAddress,
      deployFacets: true,
      createConfigurations: true,
      deployFactory: true,
      useTimeTravel,
      saveOutput: false,
    });

    if (!bondResult.summary.success) {
      throw new Error("BOND deployment failed");
    }

    success(`✓ BOND deployment completed`);
    success(`  Total facets deployed: ${bondResult.summary.totalFacets}`);
    success(`  BOND config version: ${bondResult.configurations.bond.version}`);
    success(`  Factory deployed at: ${bondResult.infrastructure.factory.proxy}`);

    // ========================================
    // Step 4: Deploy FactorySuite (with Existing Infrastructure)
    // ========================================
    section("Step 4: Deploy FactorySuite");
    info("Using deployFactorySuiteWithExistingInfra workflow from GBP ATS");
    info("This will:");
    info("  - Deploy FactorySuite facet");
    info("  - Register facet in BLR");
    info("  - Create FactorySuite configuration (config ID: 30000)");
    info("  - Reuse AccessControl and Pause facets from BOND deployment");
    info("  - Deploy FactorySuite ResolverProxy");

    // Find shared facets from BOND deployment
    const accessControlFacet = bondResult.facets.find((f) => f.name === "AccessControlFacet");
    const pauseFacet = bondResult.facets.find((f) => f.name === "PauseFacet");

    if (!accessControlFacet || !pauseFacet) {
      throw new Error("Required shared facets not found in BOND deployment");
    }

    const factorySuiteResult = await deployFactorySuiteWithExistingInfra(
      signer,
      network,
      {
        blrAddress,
        proxyAdminAddress,
        facets: {
          accessControl: accessControlFacet.address,
          pause: pauseFacet.address,
        },
      },
      {
        useTimeTravel,
        saveOutput: false,
      },
    );

    if (!factorySuiteResult.summary.success) {
      throw new Error("FactorySuite deployment failed");
    }

    success(`✓ FactorySuite deployment completed`);
    success(`  FactorySuite config version: ${factorySuiteResult.configuration.version}`);
    success(`  FactorySuite proxy deployed at: ${factorySuiteResult.infrastructure.factorySuite.proxy}`);

    // ========================================
    // Deployment Summary
    // ========================================
    section("Deployment Summary");
    info("Infrastructure:");
    info(`  ProxyAdmin: ${proxyAdminAddress}`);
    info(`  BLR: ${blrAddress}`);
    info(`  ATS Factory: ${bondResult.infrastructure.factory.proxy}`);
    info(`  FactorySuite Proxy: ${factorySuiteResult.infrastructure.factorySuite.proxy}`);
    info("");
    info("Configurations:");
    info(`  BOND: config ID=2, version=${bondResult.configurations.bond.version}`);
    info(`  FactorySuite: config ID=30000, version=${factorySuiteResult.configuration.version}`);
    info("");
    info("Facets:");
    info(`  BOND facets: ${bondResult.summary.totalFacets}`);
    info(`  FactorySuite facets: ${factorySuiteResult.summary.totalFacets}`);
    info(`  Shared facets reused: AccessControlFacet, PauseFacet`);

    success("✓ GBP Infrastructure deployment completed successfully!");

    return {
      proxyAdmin: proxyAdminAddress,
      blr: blrAddress,
      bondDeployment: bondResult,
      factorySuiteDeployment: factorySuiteResult,
    };
  } catch (err) {
    logError("Deployment failed with error:");
    logError(err instanceof Error ? err.message : String(err));
    throw err;
  }
}
