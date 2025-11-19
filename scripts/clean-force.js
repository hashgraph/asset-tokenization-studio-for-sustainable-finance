#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Comprehensive cleanup script for the Green Bonds Platform monorepo
 * Removes all temporary files, build artifacts, and node_modules from all workspaces
 */

const rootDir = path.resolve(__dirname, '..');

// Directories to clean recursively (relative to root)
const workspaceDirs = [
  'apps/ats/api',
  'apps/oracle/api',
  'apps/primary-market/api',
  'apps/shared/gateway',
  'apps/shared/transaction-sender',
  'apps/treasury/api',
  'packages/ats/contracts',
  'packages/primary-market/contracts',
  'packages/shared/blockchain-listener',
  'packages/shared/contracts',
  'packages/shared/core',
  'packages/treasury/contracts',
  'scripts'
];

// Common temporary directories to remove from all workspaces
const commonTempDirs = [
  'node_modules',
  'dist',
  'build'
];

// Contract-specific temporary directories (for packages/*/contracts)
const contractTempDirs = [
  'artifacts',
  'cache',
  'typechain',
  'typechain-types',
  'coverage',
  'coverage.json',
  '.openzeppelin'
];

// Files to remove from root
// const rootFilesToRemove = [
//   'package-lock.json'
// ];

/**
 * Safely remove a file or directory
 */
function remove(filePath, isFile = false) {
  const fullPath = path.join(rootDir, filePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  try {
    if (isFile) {
      fs.unlinkSync(fullPath);
      console.log(`✓ Removed file: ${filePath}`);
    } else {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✓ Removed directory: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Failed to remove ${filePath}:`, error.message);
  }
}

/**
 * Check if path is a contract package
 */
function isContractPackage(workspaceDir) {
  return workspaceDir.includes('/contracts');
}

console.log('🧹 Starting comprehensive cleanup...\n');

// Clean all workspace directories
console.log('📦 Cleaning workspace directories...');
workspaceDirs.forEach(workspace => {
  const workspacePath = path.join(rootDir, workspace);

  if (!fs.existsSync(workspacePath)) {
    console.log(`⚠ Skipping non-existent workspace: ${workspace}`);
    return;
  }

  console.log(`\n  Cleaning ${workspace}:`);

  // Remove common temp directories
  commonTempDirs.forEach(dir => {
    remove(path.join(workspace, dir));
  });

  // Remove contract-specific directories if this is a contract package
  if (isContractPackage(workspace)) {
    contractTempDirs.forEach(dir => {
      remove(path.join(workspace, dir));
    });
  }
});

// Clean root directory
console.log('\n📁 Cleaning root directory...');
commonTempDirs.forEach(dir => {
  remove(dir);
});

// Commented out - not removing package-lock.json
// rootFilesToRemove.forEach(file => {
//   remove(file, true);
// });

// Clean npm cache
console.log('\n🗑️  Cleaning npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit', cwd: rootDir });
  console.log('✓ npm cache cleaned');
} catch (error) {
  console.error('✗ Failed to clean npm cache:', error.message);
}

console.log('\n✨ Cleanup complete!\n');
console.log('💡 Run "npm ci" to reinstall dependencies\n');
