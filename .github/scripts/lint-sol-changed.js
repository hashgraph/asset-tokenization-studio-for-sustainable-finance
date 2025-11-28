#!/usr/bin/env node

/**
 * Lint only changed Solidity files using Solhint
 * Compares against origin/develop (or origin/main as fallback)
 * Usage:
 *   node .github/scripts/lint-sol-changed.js        # Lint changed Solidity files
 *   node .github/scripts/lint-sol-changed.js --fix  # Lint and auto-fix issues
 */

const { execSync } = require("child_process");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const autoFix = args.includes("--fix");

/**
 * Detect base branch (origin/develop or origin/main)
 */
function getBaseBranch() {
  try {
    execSync("git rev-parse --verify origin/develop", { stdio: "pipe" });
    return "origin/develop";
  } catch {
    try {
      execSync("git rev-parse --verify origin/main", { stdio: "pipe" });
      return "origin/main";
    } catch {
      console.error("Error: Neither origin/develop nor origin/main exists");
      process.exit(1);
    }
  }
}

/**
 * Get list of changed files compared to base branch
 */
function getChangedFiles(baseBranch) {
  try {
    const output = execSync(`git diff --name-only --diff-filter=ACMR ${baseBranch}...HEAD`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output
      .trim()
      .split("\n")
      .filter((file) => file.length > 0);
  } catch (error) {
    console.error(`Error getting changed files: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Filter files by .sol extension
 */
function filterSolidityFiles(files) {
  return files.filter((file) => path.extname(file) === ".sol");
}

/**
 * Run Solhint on files
 */
function runSolhint(files, fix = false) {
  if (files.length === 0) {
    console.log("✨ No changed Solidity files to lint");
    return;
  }

  const fixFlag = fix ? "--fix --noPrompt" : "";
  const fileList = files.join(" ");

  console.log(`${fix ? "Linting and fixing" : "Linting"} ${files.length} changed Solidity file(s)...`);
  console.log(`Base branch: ${getBaseBranch()}`);
  console.log(`Files: ${fileList}`);
  console.log("");

  try {
    execSync(`npx solhint ${fixFlag} ${fileList}`, {
      stdio: "inherit",
    });

    if (fix) {
      console.log("\n✅ All changed Solidity files have been linted and auto-fixed where possible");
    } else {
      console.log("\n✅ All changed Solidity files pass Solhint checks");
    }
  } catch (error) {
    if (fix) {
      console.error("\n❌ Some lint errors could not be auto-fixed. Please review and fix manually.");
    } else {
      console.error("\n❌ Solhint errors detected. Run: npm run lint:sol:changed:fix");
    }
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const baseBranch = getBaseBranch();
  const changedFiles = getChangedFiles(baseBranch);

  if (changedFiles.length === 0) {
    console.log("No changed files detected");
    return;
  }

  const solidityFiles = filterSolidityFiles(changedFiles);

  if (solidityFiles.length === 0) {
    console.log("No Solidity files in changes");
    return;
  }

  runSolhint(solidityFiles, autoFix);
}

// Execute
main();
