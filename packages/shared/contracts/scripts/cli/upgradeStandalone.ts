#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Standalone CLI for GBP configuration upgrades.
 *
 * Upgrades all GBP configurations (FactorySuite, Treasury, FactoryPrimaryMarket,
 * PrimaryMarket) without redeploying shared infrastructure.
 *
 * Usage:
 *   BLR_ADDRESS=0x123... npm run upgrade
 *   BLR_ADDRESS=0x123... npm run upgrade -- --domains=treasury,primaryMarket
 *   BLR_ADDRESS=0x123... npm run upgrade -- --time-travel --verbose
 *
 * Environment Variables:
 *   BLR_ADDRESS - BLR proxy address (required)
 *   NETWORK - Network identifier (default: hedera-testnet)
 *   USE_TIME_TRAVEL - Enable TimeTravel facets (default: false)
 *   VERBOSE - Enable verbose logging (default: false)
 *   FACTORYSUITE_PROXIES - Comma-separated proxy addresses
 *   TREASURY_PROXIES - Comma-separated proxy addresses
 *   FACTORYPRIMARYMARKET_PROXIES - Comma-separated proxy addresses
 *   PRIMARYMARKET_PROXIES - Comma-separated proxy addresses
 *
 * @module cli/upgradeStandalone
 */

import { upgradeGbpConfigurations, type DomainIdentifier } from "@scripts/workflows";
import { createSignerForNetwork } from "@scripts/infrastructure";
import { info, success, error as logError, section } from "@hashgraph/asset-tokenization-contracts/scripts";

/**
 * Parse command line arguments for upgrade configuration.
 */
function parseUpgradeArgs(): {
  blrAddress: string | undefined;
  network: string;
  domains: DomainIdentifier[] | undefined;
  proxyUpdates: {
    factorySuite?: readonly string[];
    treasury?: readonly string[];
    factoryPrimaryMarket?: readonly string[];
    primaryMarket?: readonly string[];
  };
  useTimeTravel: boolean;
  verbose: boolean;
} {
  const args = process.argv.slice(2);

  // Get BLR address from environment
  const blrAddress = process.env.BLR_ADDRESS;

  // Parse --network
  const networkIndex = args.findIndex((arg) => arg.startsWith("--network"));
  let network = process.env.NETWORK || "hedera-testnet";

  if (networkIndex !== -1) {
    const arg = args[networkIndex];
    if (arg.includes("=")) {
      network = arg.split("=")[1];
    } else if (args[networkIndex + 1]) {
      network = args[networkIndex + 1];
    }
  }

  // Parse --domains
  const domainsIndex = args.findIndex((arg) => arg.startsWith("--domains"));
  let domains: DomainIdentifier[] | undefined;

  if (domainsIndex !== -1) {
    const arg = args[domainsIndex];
    let domainsStr: string;

    if (arg.includes("=")) {
      domainsStr = arg.split("=")[1];
    } else if (args[domainsIndex + 1]) {
      domainsStr = args[domainsIndex + 1];
    } else {
      domainsStr = "";
    }

    if (domainsStr) {
      domains = domainsStr.split(",").map((d) => d.trim()) as DomainIdentifier[];
    }
  }

  // Parse proxy addresses per domain
  const parseProxyAddresses = (argName: string, envVar: string): readonly string[] | undefined => {
    const argIndex = args.findIndex((arg) => arg.startsWith(`--${argName}`));
    let proxiesStr: string | undefined;

    if (argIndex !== -1) {
      const arg = args[argIndex];
      if (arg.includes("=")) {
        proxiesStr = arg.split("=")[1];
      } else if (args[argIndex + 1]) {
        proxiesStr = args[argIndex + 1];
      }
    } else {
      proxiesStr = process.env[envVar];
    }

    if (!proxiesStr) {
      return undefined;
    }

    return proxiesStr.split(",").map((p) => p.trim());
  };

  const proxyUpdates = {
    factorySuite: parseProxyAddresses("factorysuite-proxies", "FACTORYSUITE_PROXIES"),
    treasury: parseProxyAddresses("treasury-proxies", "TREASURY_PROXIES"),
    factoryPrimaryMarket: parseProxyAddresses("factoryprimarymarket-proxies", "FACTORYPRIMARYMARKET_PROXIES"),
    primaryMarket: parseProxyAddresses("primarymarket-proxies", "PRIMARYMARKET_PROXIES"),
  };

  // Parse boolean flags
  const useTimeTravel = args.includes("--time-travel") || process.env.USE_TIME_TRAVEL?.toLowerCase() === "true";
  const verbose = args.includes("--verbose") || process.env.VERBOSE?.toLowerCase() === "true";

  return {
    blrAddress,
    network,
    domains,
    proxyUpdates,
    useTimeTravel,
    verbose,
  };
}

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
  section("GBP Configuration Upgrades");

  try {
    // Parse arguments
    const { blrAddress, network, domains, proxyUpdates, useTimeTravel, verbose } = parseUpgradeArgs();

    // Validate required arguments
    if (!blrAddress) {
      logError("❌ Error: BLR_ADDRESS environment variable is required");
      logError("");
      logError("Usage:");
      logError("  BLR_ADDRESS=0x123... npm run upgrade");
      logError("  BLR_ADDRESS=0x123... npm run upgrade -- --domains=treasury,primaryMarket");
      logError("  BLR_ADDRESS=0x123... npm run upgrade -- --time-travel --verbose");
      logError("");
      logError("Or set in .env file:");
      logError("  echo 'BLR_ADDRESS=0x123...' >> .env");
      logError("  npm run upgrade");
      logError("");
      logError("Environment Variables:");
      logError("  BLR_ADDRESS - BLR proxy address (required)");
      logError("  NETWORK - Network identifier (default: hedera-testnet)");
      logError("  USE_TIME_TRAVEL - Enable TimeTravel facets");
      logError("  VERBOSE - Enable verbose logging");
      logError("  FACTORYSUITE_PROXIES - Comma-separated proxy addresses");
      logError("  TREASURY_PROXIES - Comma-separated proxy addresses");
      logError("  FACTORYPRIMARYMARKET_PROXIES - Comma-separated proxy addresses");
      logError("  PRIMARYMARKET_PROXIES - Comma-separated proxy addresses");
      process.exit(1);
    }

    info(`Network: ${network}`);
    info(`BLR: ${blrAddress}`);

    if (domains) {
      info(`Domains: ${domains.join(", ")}`);
    } else {
      info("Domains: all");
    }

    info("");

    // Create signer
    const signer = createSignerForNetwork(network);

    // Execute upgrade
    await upgradeGbpConfigurations(signer, {
      blrAddress,
      network,
      domains,
      proxyUpdates,
      useTimeTravel,
      verbose,
      saveOutput: true, // Always save output in CLI mode
    });

    success("✅ All upgrades completed successfully!");
    process.exit(0);
  } catch (err) {
    logError("❌ Upgrade failed!");
    logError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// Execute main function
main().catch((err) => {
  logError("Unexpected error in upgrade CLI:");
  logError(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
