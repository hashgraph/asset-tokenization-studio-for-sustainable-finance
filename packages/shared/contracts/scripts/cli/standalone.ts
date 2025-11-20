#!/usr/bin/env node
import { deployGbpInfrastructure } from "../workflows/deployGbpInfrastructure";
import { createSignerForNetwork, getNetworkConfig, getDeploymentOptionsFromEnv } from "../infrastructure/config";
import { info, success, error as logError, section } from "@hashgraph/asset-tokenization-contracts/scripts";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Parse command line arguments.
 */
function parseArgs(): { network: string } {
  const args = process.argv.slice(2);

  // Check for --network flag
  const networkIndex = args.indexOf("--network");
  let network = process.env.NETWORK || "hedera-testnet";

  if (networkIndex !== -1 && args[networkIndex + 1]) {
    network = args[networkIndex + 1];
  }

  return { network };
}

/**
 * Save deployment result to JSON file.
 */
function saveDeploymentResult(result: any, network: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const deploymentsDir = join(process.cwd(), "deployments");
  const filename = `${network}_${timestamp}.json`;
  const filepath = join(deploymentsDir, filename);

  // Ensure deployments directory exists
  mkdirSync(deploymentsDir, { recursive: true });

  const output = {
    timestamp: new Date().toISOString(),
    network,
    result,
  };

  writeFileSync(filepath, JSON.stringify(output, null, 2));
  info(`✓ Deployment result saved to: deployments/${filename}`);
}

/**
 * Main deployment function.
 */
async function main(): Promise<void> {
  section("🚀 Green Bonds Platform - Infrastructure Deployment");

  try {
    // Parse arguments
    const { network } = parseArgs();
    info(`Target network: ${network}`);

    // Get network configuration
    const networkConfig = getNetworkConfig(network);
    info(`Chain ID: ${networkConfig.chainId}`);

    // Create signer
    section("Creating Signer");
    const signer = createSignerForNetwork(network);

    // Get deployment options
    const deploymentOptions = getDeploymentOptionsFromEnv();
    info(`Time-travel mode: ${deploymentOptions.useTimeTravel ? "ENABLED" : "DISABLED"}`);
    info(`Verbose logging: ${deploymentOptions.verbose ? "ENABLED" : "DISABLED"}`);

    // Deploy infrastructure
    section("Starting Deployment");
    const result = await deployGbpInfrastructure(signer, {
      ...deploymentOptions,
      network,
    });

    // Save result
    saveDeploymentResult(result, network);

    success("✅ Deployment completed successfully!");
    process.exit(0);
  } catch (err) {
    logError("❌ Deployment failed!");
    logError(err instanceof Error ? err.message : String(err));

    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }

    process.exit(1);
  }
}

// Run main function
main();
