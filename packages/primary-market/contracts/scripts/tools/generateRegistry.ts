#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generation Tool for Green Bonds Platform - Primary Market
 *
 * Uses ATS generateRegistryPipeline for consistency and maintainability.
 * Scans contracts/ directory and generates comprehensive TypeScript registry
 * with metadata for all facets including methods, events, errors, roles, and
 * resolver keys.
 *
 * Usage:
 *   npm run generate:registry
 *   npm run generate:registry -- --dry-run
 *   npm run generate:registry -- --verbose
 *
 * @module tools/generateRegistry
 */

import * as path from "path";
import { generateRegistryPipeline } from "@hashgraph/asset-tokenization-contracts/scripts";

/**
 * CLI options.
 */
interface CliOptions {
  /** Dry run - don't write file */
  dryRun: boolean;

  /** Output file path */
  output: string;

  /** Verbose logging */
  verbose: boolean;
}

/**
 * Parse command line arguments.
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf("--output");
  const hasOutput = outputIndex !== -1 && outputIndex + 1 < args.length;

  return {
    dryRun: args.includes("--dry-run"),
    output: hasOutput ? args[outputIndex + 1] : "scripts/domain/primaryMarketRegistry.data.ts",
    verbose: args.includes("--verbose") || args.includes("-v"),
  };
}

/**
 * Main execution.
 *
 * Uses the ATS generateRegistryPipeline function for consistency and
 * maintainability with the upstream ATS package.
 */
async function main(): Promise<void> {
  const options = parseArgs();
  const logLevel = process.env.LOG_LEVEL || (options.verbose ? "DEBUG" : "INFO");

  // Use ATS pipeline with our custom paths
  const result = await generateRegistryPipeline(
    {
      contractsPath: path.join(__dirname, "../../contracts"),
      artifactPath: path.join(__dirname, "../../artifacts/contracts"),
      outputPath: options.output,
      logLevel: logLevel as any,

      // Customize paths for our contract structure
      resolverKeyPaths: ["**/constants/resolverKeys.sol"],
      rolesPaths: ["**/constants/roles.sol"],

      // IMPORTANT: Use ATS package name for type imports
      // The types (FacetDefinition, ContractDefinition, etc.) are defined in ATS,
      // not in our package, so we must import from ATS scripts
      moduleName: "@hashgraph/asset-tokenization-contracts/scripts",

      // Include storage wrappers if we have any
      includeStorageWrappers: true,

      // Include mock contracts in registry
      includeMocksInRegistry: true,
    },
    !options.dryRun, // Write file unless dry run
  );

  const durationSec = (result.stats.durationMs / 1000).toFixed(2);
  console.log(`\n✅ Registry generation completed successfully (${durationSec}s)`);

  // Show preview for dry runs
  if (options.dryRun && options.verbose) {
    console.log("\nGenerated code preview:");
    console.log("─".repeat(80));
    console.log(result.code.split("\n").slice(0, 50).join("\n"));
    console.log("...");
    console.log("─".repeat(80));
  }
}

// Execute
main().catch((error) => {
  console.error("❌ Error:", error.message);
  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.error(error.stack);
  }
  process.exit(1);
});
