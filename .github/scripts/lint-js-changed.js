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
 * Detect base branch for comparison
 * Priority: GITHUB_BASE_REF (CI) > origin/develop > origin/main
 */
function getBaseBranch() {
  // In GitHub Actions PRs, use the base branch from the PR
  if (process.env.GITHUB_BASE_REF) {
    const baseBranch = `origin/${process.env.GITHUB_BASE_REF}`;
    console.log(`Using GitHub PR base branch: ${baseBranch}`);
    return baseBranch;
  }

  // Locally, compare against develop or main
  try {
    execSync("git rev-parse --verify origin/develop", { stdio: "pipe" });
    console.log("Using base branch: origin/develop");
    return "origin/develop";
  } catch {
    try {
      execSync("git rev-parse --verify origin/main", { stdio: "pipe" });
      console.log("Using base branch: origin/main");
      return "origin/main";
    } catch {
      console.error("Error: Neither origin/develop nor origin/main exists");
      console.error("Hint: Fetch remote branches with: git fetch origin");
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
 * Run ESLint on files in batches to reduce memory usage
 */
function runESLint(files, fix = false) {
  if (files.length === 0) {
    console.log("✨ No changed TypeScript/JavaScript files to lint");
    return;
  }

  const fixFlag = fix ? "--fix" : "";
  const BATCH_SIZE = 3; // Process 3 files at a time to minimize memory usage

  console.log(
    `${fix ? "Linting and fixing" : "Linting"} ${files.length} changed file(s) in batches of ${BATCH_SIZE}...`,
  );
  console.log(`Base branch: ${getBaseBranch()}`);
  console.log("");

  let hasErrors = false;

  // Process files in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const fileList = batch.join(" ");
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Processing ${batch.length} file(s)...`);

    try {
      execSync(`npx eslint ${fixFlag} ${fileList}`, {
        stdio: "inherit",
      });
    } catch (error) {
      hasErrors = true;
    }
  }

  console.log("");

  if (hasErrors) {
    if (fix) {
      console.error("❌ Some lint errors could not be auto-fixed. Please review and fix manually.");
    } else {
      console.error("❌ ESLint errors detected. Run: npm run lint:changed:fix");
    }
    process.exit(1);
  }

  if (fix) {
    console.log("✅ All changed files have been linted and auto-fixed where possible");
  } else {
    console.log("✅ All changed files pass ESLint checks");
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
