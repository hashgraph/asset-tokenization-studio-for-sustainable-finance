#!/usr/bin/env node

/**
 * Lint only changed TypeScript/JavaScript files using ESLint
 * Compares against origin/develop (or origin/main as fallback)
 * Usage:
 *   node .github/scripts/lint-changed.js        # Lint changed files (no changes)
 *   node .github/scripts/lint-changed.js --fix  # Lint and auto-fix issues
 */

const { execSync } = require("child_process");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const autoFix = args.includes("--fix");

// ESLint-supported file extensions
const ESLINT_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

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
 * Filter files by ESLint-supported extensions
 */
function filterESLintFiles(files) {
  return files.filter((file) => {
    const ext = path.extname(file);
    return ESLINT_EXTENSIONS.includes(ext);
  });
}

/**
 * Run ESLint on files
 */
function runESLint(files, fix = false) {
  if (files.length === 0) {
    console.log("✨ No changed TypeScript/JavaScript files to lint");
    return;
  }

  const fixFlag = fix ? "--fix" : "";
  const fileList = files.join(" ");

  console.log(`${fix ? "Linting and fixing" : "Linting"} ${files.length} changed file(s)...`);
  console.log(`Base branch: ${getBaseBranch()}`);
  console.log(`Files: ${fileList}`);
  console.log("");

  try {
    execSync(`npx eslint ${fixFlag} ${fileList}`, {
      stdio: "inherit",
    });

    if (fix) {
      console.log("\n✅ All changed files have been linted and auto-fixed where possible");
    } else {
      console.log("\n✅ All changed files pass ESLint checks");
    }
  } catch (error) {
    if (fix) {
      console.error("\n❌ Some lint errors could not be auto-fixed. Please review and fix manually.");
    } else {
      console.error("\n❌ ESLint errors detected. Run: npm run lint:changed:fix");
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

  const eslintFiles = filterESLintFiles(changedFiles);

  if (eslintFiles.length === 0) {
    console.log("No TypeScript/JavaScript files in changes");
    return;
  }

  runESLint(eslintFiles, autoFix);
}

// Execute
main();
