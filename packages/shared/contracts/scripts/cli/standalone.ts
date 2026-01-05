#!/usr/bin/env node
import { deployGbpInfrastructure, type DeploymentResult } from "@scripts/workflows";
import { createSignerForNetwork, getNetworkConfig, getDeploymentOptionsFromEnv } from "@scripts/infrastructure";
import {
  info,
  success,
  error as logError,
  section,
  isHederaNetwork,
  saveDeploymentOutput,
  generateTimestamp,
} from "@hashgraph/asset-tokenization-contracts/scripts";
import type { GbpInfrastructureOutput } from "@scripts/types/workflows";

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
        description: "Business Logic Resolver (BLR) - Shared diamond pattern resolver for all GBP contracts",
        address: result.blr,
        contractId: result.bondDeployment?.infrastructure?.blr?.proxyContractId,
        proxyType: "TransparentUpgradeableProxy",
        implementation: {
          address: result.blrImplementationAddress,
          contractId: result.treasuryDeployment?.infrastructure?.blr?.implementationContractId,
        },
      },
      atsFactory: {
        description: "ATS Factory - Deploy bond and equity tokens",
        address: result.bondDeployment?.infrastructure?.factory?.proxy,
        contractId: result.bondDeployment?.infrastructure?.factory?.proxyContractId,
        proxyType: "TransparentUpgradeableProxy",
        implementation: {
          address: result.bondDeployment?.infrastructure?.factory?.implementation,
          contractId: result.bondDeployment?.infrastructure?.factory?.implementationContractId,
        },
      },
      ...(result.factorySuiteDeployment && {
        factorySuite: {
          description: "Factory Suite - Atomic deployment of Bond + Treasury + KPI contracts",
          address: result.factorySuiteDeployment.infrastructure?.factorySuite?.proxy,
          contractId: result.factorySuiteDeployment.infrastructure?.factorySuite?.proxyContractId,
          proxyType: "ResolverProxy",
          resolver: {
            address: result.blr,
            contractId: result.bondDeployment?.infrastructure?.blr?.proxyContractId,
          },
        },
      }),
      ...(result.primaryMarketDeployment && {
        primaryMarketFactory: {
          description: "Primary Market Factory - Deploy primary market instances for offerings",
          address: result.primaryMarketDeployment.infrastructure?.factoryPrimaryMarket?.proxy,
          contractId: result.primaryMarketDeployment.infrastructure?.factoryPrimaryMarket?.proxyContractId,
          proxyType: "ResolverProxy",
          resolver: {
            address: result.blr,
            contractId: result.bondDeployment?.infrastructure?.blr?.proxyContractId,
          },
        },
      }),
    },

    result,
  };

  // Validate all callable contracts have contractIds on Hedera networks
  if (isHederaNetwork(network)) {
    const missingContractIds: string[] = [];

    Object.entries(output.callableContracts).forEach(([name, contract]: [string, any]) => {
      if (!contract.contractId) {
        missingContractIds.push(name);
      }
    });

    if (missingContractIds.length > 0) {
      logError(`⚠️  Warning: Missing contractIds for: ${missingContractIds.join(", ")}`);
    }
  }

  // Generate custom filepath in our deployments directory
  const formattedTimestamp = generateTimestamp();
  const filename = `gbpInfrastructure-${formattedTimestamp}.json`;
  const customPath = `./deployments/${network}/${filename}`;

  const saveResult = await saveDeploymentOutput({
    network,
    workflow: "gbpInfrastructure",
    data: output,
    customPath,
  });

  if (saveResult.success) {
    info(`✓ Deployment result saved to: ${saveResult.filepath}`);
  } else {
    logError(`⚠️  Failed to save deployment: ${saveResult.error}`);
  }
}

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
    await saveDeploymentResult(result, network);

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

main();
