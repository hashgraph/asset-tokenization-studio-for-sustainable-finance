#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generation Tool for Treasury Contracts
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
    output: hasOutput ? args[outputIndex + 1] : "scripts/domain/treasuryRegistry.data.ts",
    verbose: args.includes("--verbose") || args.includes("-v"),
  };
}

/**
 * Remove TimeTravel factory imports and simplify factory functions.
 */
function removeTimeTravelSupport(code: string): string {
  // Remove TimeTravel factory imports
  code = code.replace(/\s+\w+TimeTravel__factory,?\n/g, "\n");

  // Simplify factory functions to remove useTimeTravel parameter
  // Pattern: factory: (signer, useTimeTravel = false) => useTimeTravel ? new XTimeTravel__factory(signer) : new X__factory(signer)
  code = code.replace(
    /factory: \(signer,\s*useTimeTravel\s*=\s*false\)\s*=>\s*useTimeTravel\s*\?\s*new\s+(\w+)TimeTravel__factory\(signer\)\s*:\s*new\s+(\w+)__factory\(signer\)/g,
    "factory: (signer) => new $2__factory(signer)",
  );

  return code;
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

      // TypeChain path for factory validation (default is ./build/typechain-types)
      typechainPath: "./typechain-types",

      // Include storage wrappers if we have any
      includeStorageWrappers: true,

      // Include mock contracts in registry
      includeMocksInRegistry: true,
    },
    false, // Don't write yet, we'll post-process first
  );

  // Post-process: Remove TimeTravel support
  result.code = removeTimeTravelSupport(result.code);

  // Write the processed file if not dry run
  if (!options.dryRun) {
    const fs = await import("fs/promises");
    const outputPath = path.join(__dirname, "../..", options.output);
    await fs.writeFile(outputPath, result.code, "utf-8");
    console.log(`✅ Registry written to ${options.output}`);
  }

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
