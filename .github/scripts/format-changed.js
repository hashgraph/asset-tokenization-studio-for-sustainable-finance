#!/usr/bin/env node

/**
 * Format only changed files using Prettier
 * Compares against origin/develop (or origin/main as fallback)
 * Usage:
 *   node .github/scripts/format-changed.js          # Format changed files (--write)
 *   node .github/scripts/format-changed.js --check  # Check formatting only (no changes)
 */

const { execSync } = require("child_process");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");

// Prettier-supported file extensions
const PRETTIER_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".sol"];

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
 * Filter files by Prettier-supported extensions
 */
function filterPrettierFiles(files) {
  return files.filter((file) => {
    const ext = path.extname(file);
    return PRETTIER_EXTENSIONS.includes(ext);
  });
}

/**
 * Run prettier on files
 */
function runPrettier(files, check = false) {
  if (files.length === 0) {
    console.log("✨ No changed files to format");
    return;
  }

  const mode = check ? "--check" : "--write";
  const fileList = files.join(" ");

  console.log(`${check ? "Checking" : "Formatting"} ${files.length} changed file(s)...`);
  console.log(`Base branch: ${getBaseBranch()}`);
  console.log(`Files: ${fileList}`);
  console.log("");

  try {
    execSync(`npx prettier ${mode} ${fileList}`, {
      stdio: "inherit",
    });

    if (check) {
      console.log("\n✅ All changed files are properly formatted");
    } else {
      console.log("\n✅ All changed files have been formatted");
    }
  } catch (error) {
    if (check) {
      console.error("\n❌ Some changed files are not properly formatted. Run: npm run format:changed");
    } else {
      console.error("\n❌ Error formatting files");
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

  const prettierFiles = filterPrettierFiles(changedFiles);

  if (prettierFiles.length === 0) {
    console.log("No Prettier-supported files in changes");
    return;
  }

  runPrettier(prettierFiles, checkOnly);
}

// Execute
main();
