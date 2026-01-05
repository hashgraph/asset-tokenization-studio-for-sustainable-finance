// SPDX-License-Identifier: Apache-2.0

/** GBP configuration upgrade orchestrator - coordinates upgrades across all domains. */

import type { Signer } from "ethers";
import { constants } from "ethers";
import {
  info,
  success,
  warn,
  error as logError,
  section,
  configureLogger,
  LogLevel,
  saveDeploymentOutput,
  generateTimestamp,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import { IBusinessLogicResolver__factory } from "@hashgraph/asset-tokenization-contracts";
import { upgradeFactorySuiteConfiguration } from "@hashgraph/green-bonds-platform-ats-contracts/scripts";
import { upgradeTreasuryConfiguration } from "@hashgraph/green-bonds-platform-treasury-contracts/scripts";
import {
  upgradeFactoryPrimaryMarketConfiguration,
  upgradePrimaryMarketConfiguration,
} from "@hashgraph/green-bonds-platform-primarymarket-contracts/scripts";

/** Domain identifier for selective upgrades */
export type DomainIdentifier = "factorySuite" | "treasury" | "factoryPrimaryMarket" | "primaryMarket";

/** Maps each DomainIdentifier to its upgrade handler function. */
const DOMAIN_UPGRADE_HANDLERS = {
  factorySuite: upgradeFactorySuiteConfiguration,
  treasury: upgradeTreasuryConfiguration,
  factoryPrimaryMarket: upgradeFactoryPrimaryMarketConfiguration,
  primaryMarket: upgradePrimaryMarketConfiguration,
} as const;

/** Upgrade options for GBP configuration orchestration */
export interface UpgradeOptions {
  /** Existing BLR proxy address (required) */
  blrAddress: string;

  /** Whether to use TimeTravel facet variants */
  useTimeTravel?: boolean;

  /** Network name (testnet, mainnet, etc.) */
  network?: string;

  /** Enable verbose (debug) logging */
  verbose?: boolean;

  /** Domains to upgrade - if not specified, upgrades all */
  domains?: readonly DomainIdentifier[];

  /** Proxy addresses per domain for batch updates */
  proxyUpdates?: {
    factorySuite?: readonly string[];
    treasury?: readonly string[];
    factoryPrimaryMarket?: readonly string[];
    primaryMarket?: readonly string[];
  };

  /** Save upgrade output to file */
  saveOutput?: boolean;
}

/** Result from a single domain upgrade */
export interface DomainUpgradeResult {
  /** Domain name */
  domain: DomainIdentifier;

  /** Whether upgrade succeeded */
  success: boolean;

  /** New configuration version */
  version?: number;

  /** Configuration ID */
  configId?: string;

  /** Number of facets deployed */
  facetsDeployed?: number;

  /** Number of proxies updated */
  proxiesUpdated?: number;

  /** Number of proxies failed */
  proxiesFailed?: number;

  /** Upgrade time in milliseconds */
  upgradeTime?: number;

  /** Error message if failed */
  error?: string;
}

/** Complete upgrade result from GBP configuration orchestration */
export interface UpgradeGbpConfigurationsOutput {
  /** Network identifier */
  network: string;

  /** Upgrade timestamp (ISO 8601) */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** BLR information */
  blr: {
    address: string;
    isExternal: true;
  };

  /** Results per domain */
  domainResults: DomainUpgradeResult[];

  /** Aggregate summary */
  summary: {
    /** Total domains upgraded */
    totalDomains: number;

    /** Successful upgrades */
    successfulUpgrades: number;

    /** Failed upgrades */
    failedUpgrades: number;

    /** Total facets deployed across all domains */
    totalFacetsDeployed: number;

    /** Total proxies updated across all domains */
    totalProxiesUpdated: number;

    /** Total proxies failed across all domains */
    totalProxiesFailed: number;

    /** Total upgrade time in milliseconds */
    totalUpgradeTime: number;

    /** Whether all upgrades completed successfully */
    allSuccess: boolean;
  };
}

/**
 * Validate BLR address and accessibility.
 *
 * @param blrAddress - BLR proxy address to validate
 * @param signer - Ethers signer for contract interaction
 * @throws Error if BLR is not accessible or invalid
 */
async function validateBLR(blrAddress: string, signer: Signer): Promise<void> {
  section("Phase 1: Validation");

  // Validate address format
  if (!blrAddress || blrAddress === constants.AddressZero) {
    throw new Error("Invalid BLR address: address cannot be zero or empty");
  }

  info(`Validating BLR at: ${blrAddress}`);

  try {
    // Connect to BLR and test accessibility
    const blrContract = IBusinessLogicResolver__factory.connect(blrAddress, signer);

    // Test BLR accessibility by querying a resolver key
    await blrContract.resolveLatestBusinessLogic(constants.HashZero);

    success("✓ BLR validation successful");
  } catch (err) {
    throw new Error(`BLR validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Aggregate domain results into final output.
 *
 * @param network - Network identifier
 * @param deployer - Deployer address
 * @param blrAddress - BLR proxy address
 * @param domainResults - Results from all domain upgrades
 * @param totalUpgradeTime - Total time in milliseconds
 * @returns Complete upgrade output
 */
function aggregateResults(
  network: string,
  deployer: string,
  blrAddress: string,
  domainResults: DomainUpgradeResult[],
  totalUpgradeTime: number,
  timestamp?: string,
): UpgradeGbpConfigurationsOutput {
  // Calculate summary metrics
  const successfulUpgrades = domainResults.filter((r) => r.success).length;
  const failedUpgrades = domainResults.filter((r) => !r.success).length;
  const totalFacetsDeployed = domainResults.reduce((sum, r) => sum + (r.facetsDeployed || 0), 0);
  const totalProxiesUpdated = domainResults.reduce((sum, r) => sum + (r.proxiesUpdated || 0), 0);
  const totalProxiesFailed = domainResults.reduce((sum, r) => sum + (r.proxiesFailed || 0), 0);
  const allSuccess = failedUpgrades === 0;

  return {
    network,
    timestamp: timestamp || new Date().toISOString(),
    deployer,
    blr: {
      address: blrAddress,
      isExternal: true,
    },
    domainResults,
    summary: {
      totalDomains: domainResults.length,
      successfulUpgrades,
      failedUpgrades,
      totalFacetsDeployed,
      totalProxiesUpdated,
      totalProxiesFailed,
      totalUpgradeTime,
      allSuccess,
    },
  };
}

/**
 * Print upgrade summary to console.
 *
 * @param output - Complete upgrade output
 */
function printUpgradeSummary(output: UpgradeGbpConfigurationsOutput): void {
  section("GBP Configuration Upgrades - Summary");

  info(`Network: ${output.network}`);
  info(`BLR: ${output.blr.address}`);
  info(`Deployer: ${output.deployer}`);
  info("");

  section("Domain Results");

  for (const result of output.domainResults) {
    if (result.success) {
      const timeSeconds = ((result.upgradeTime || 0) / 1000).toFixed(0);
      success(
        `✓ ${result.domain.padEnd(20)} v${result.version} (${result.configId}) - ${result.facetsDeployed} facets, ${result.proxiesUpdated} proxies (${timeSeconds}s)`,
      );
    } else {
      const timeSeconds = ((result.upgradeTime || 0) / 1000).toFixed(0);
      logError(`✗ ${result.domain.padEnd(20)} - FAILED: ${result.error} (${timeSeconds}s)`);
    }
  }

  info("");
  section("Aggregate Summary");
  info(`Total domains:       ${output.summary.totalDomains}`);
  info(`Successful upgrades: ${output.summary.successfulUpgrades}`);
  info(`Failed upgrades:     ${output.summary.failedUpgrades}`);
  info(`Total facets:        ${output.summary.totalFacetsDeployed}`);
  info(
    `Total proxies:       ${output.summary.totalProxiesUpdated} updated, ${output.summary.totalProxiesFailed} failed`,
  );

  const totalMinutes = Math.floor(output.summary.totalUpgradeTime / 60000);
  const totalSeconds = Math.floor((output.summary.totalUpgradeTime % 60000) / 1000);
  info(`Total time:          ${totalMinutes}m ${totalSeconds}s`);
  info("");

  if (!output.summary.allSuccess) {
    warn("⚠️  Warning: Some domain(s) failed to upgrade");
    const failedDomains = output.domainResults.filter((r) => !r.success).map((r) => r.domain);
    warn(`To retry only failed domains, run:`);
    warn(`  npm run upgrade -- --blr-address=${output.blr.address} --domains=${failedDomains.join(",")}`);
    info("");
  } else {
    success("✅ All upgrades completed successfully!");
  }
}

/**
 * Upgrade all GBP configurations using domain-specific workflows.
 *
 * This orchestration coordinates upgrades across all four GBP domains:
 * 1. FactorySuite (config ID 30000)
 * 2. Treasury (config ID 20000)
 * 3. FactoryPrimaryMarket (config ID 10000)
 * 4. PrimaryMarket (config ID 10001)
 *
 * **Execution Strategy:**
 * - Sequential execution (one domain at a time)
 * - Fail-continue (one failed domain doesn't block others)
 * - Result aggregation and comprehensive summary
 *
 * **What Each Domain Does:**
 * - Deploys new facet implementations
 * - Registers facets in existing BLR
 * - Creates new configuration version
 * - Optionally batch-updates proxies
 *
 * @param signer - Ethers signer for deploying contracts
 * @param options - Upgrade options
 * @returns Complete upgrade result with all domain results and summary
 *
 * @example Basic upgrade (all domains)
 * ```typescript
 * import { ethers } from 'ethers'
 * import { upgradeGbpConfigurations } from '@hashgraph/green-bonds-platform-shared-contracts/scripts'
 *
 * const signer = new ethers.Wallet(privateKey, provider)
 * const result = await upgradeGbpConfigurations(signer, {
 *   blrAddress: '0x1234567890abcdef...',
 *   network: 'hedera-testnet',
 *   verbose: true
 * })
 *
 * console.log('Upgrade results:')
 * console.log('  Successful:', result.summary.successfulUpgrades)
 * console.log('  Failed:', result.summary.failedUpgrades)
 * console.log('  Total facets:', result.summary.totalFacetsDeployed)
 * ```
 *
 * @example Selective domain upgrade
 * ```typescript
 * const result = await upgradeGbpConfigurations(signer, {
 *   blrAddress: '0x1234567890abcdef...',
 *   domains: ['treasury', 'primaryMarket'],
 *   network: 'hedera-testnet'
 * })
 * ```
 *
 * @example With proxy updates
 * ```typescript
 * const result = await upgradeGbpConfigurations(signer, {
 *   blrAddress: '0x1234567890abcdef...',
 *   network: 'hedera-testnet',
 *   proxyUpdates: {
 *     factorySuite: ['0xabc...', '0xdef...'],
 *     treasury: ['0x111...', '0x222...']
 *   }
 * })
 * ```
 */
export async function upgradeGbpConfigurations(
  signer: Signer,
  options: UpgradeOptions,
): Promise<UpgradeGbpConfigurationsOutput> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const {
    blrAddress,
    useTimeTravel = false,
    network = "testnet",
    verbose = false,
    domains,
    proxyUpdates,
    saveOutput = false,
  } = options;

  // Configure logger
  configureLogger({
    level: verbose ? LogLevel.DEBUG : LogLevel.INFO,
  });

  const deployer = await signer.getAddress();
  const domainResults: DomainUpgradeResult[] = [];

  // Determine which domains to upgrade
  const domainsToUpgrade: readonly DomainIdentifier[] = domains || [
    "factorySuite",
    "treasury",
    "factoryPrimaryMarket",
    "primaryMarket",
  ];

  section("GBP Configuration Upgrades");
  info(`Network: ${network}`);
  info(`BLR: ${blrAddress}`);
  info(`Deployer: ${deployer}`);
  info(`Domains: ${domainsToUpgrade.join(", ")}`);
  info(`Time-travel mode: ${useTimeTravel ? "ENABLED" : "DISABLED"}`);
  info("");

  // Phase 1: Validation
  await validateBLR(blrAddress, signer);
  info("");

  // Phase 2-5: Upgrade each domain sequentially
  for (const domain of domainsToUpgrade) {
    const domainStartTime = Date.now();

    try {
      section(`Upgrading ${domain}...`);

      const handler = DOMAIN_UPGRADE_HANDLERS[domain];
      const result = await handler(signer, network, {
        blrAddress,
        useTimeTravel,
        proxyAddresses: proxyUpdates?.[domain],
        verbose,
      });

      // Extract result summary
      domainResults.push({
        domain,
        success: true,
        version: result.configuration.version,
        configId: result.configuration.configId,
        facetsDeployed: result.summary.totalFacetsDeployed,
        proxiesUpdated: result.summary.proxiesUpdated || 0,
        proxiesFailed: result.summary.proxiesFailed || 0,
        upgradeTime: Date.now() - domainStartTime,
      });

      success(`✓ ${domain} upgraded successfully to v${result.configuration.version}`);
    } catch (err) {
      // Log error but continue with other domains
      const errorMessage = err instanceof Error ? err.message : String(err);
      logError(`✗ ${domain} upgrade failed: ${errorMessage}`);

      domainResults.push({
        domain,
        success: false,
        error: errorMessage,
        upgradeTime: Date.now() - domainStartTime,
      });
    }

    info("");
  }

  // Phase 6: Aggregate Results
  const output = aggregateResults(network, deployer, blrAddress, domainResults, Date.now() - startTime, timestamp);

  // Print Summary
  printUpgradeSummary(output);

  // Save output
  if (saveOutput) {
    // Generate custom filepath
    const formattedTimestamp = generateTimestamp();
    const filename = `gbpUpgrade-${formattedTimestamp}.json`;
    const customPath = `./deployments/${network}/${filename}`;

    const saveResult = await saveDeploymentOutput({
      network,
      workflow: "gbpUpgrade",
      data: output,
      customPath,
    });

    if (saveResult.success) {
      success(`💾 Upgrade output saved: ${saveResult.filepath}`);
    } else {
      warn(`⚠️  Failed to save upgrade output: ${saveResult.error}`);
    }
  }

  // Throw if any upgrades failed
  if (!output.summary.allSuccess) {
    throw new Error(`${output.summary.failedUpgrades} domain(s) failed to upgrade`);
  }

  return output;
}
