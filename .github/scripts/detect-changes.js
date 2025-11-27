#!/usr/bin/env node

/**
 * Change Detection Script for Green Bonds Platform Monorepo
 *
 * This script detects which modules have changed in a PR and outputs
 * the affected modules for GitHub Actions workflows to consume.
 *
 * Handles:
 * - File-to-module mapping
 * - Dependency graph traversal
 * - Special rules for shared modules
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Module path mappings
const MODULE_PATHS = {
  // Smart Contracts
  'ats-contracts': 'packages/ats/contracts',
  'treasury-contracts': 'packages/treasury/contracts',
  'primary-market-contracts': 'packages/primary-market/contracts',
  'shared-contracts': 'packages/shared/contracts',

  // Shared Libraries
  'shared-core': 'packages/shared/core',
  'blockchain-listener': 'packages/shared/blockchain-listener',

  // APIs
  'ats-api': 'apps/ats/api',
  'primary-market-api': 'apps/primary-market/api',
  'treasury-api': 'apps/treasury/api',

  // Shared Apps
  'gateway': 'apps/shared/gateway',
  'transaction-sender': 'apps/shared/transaction-sender',

  // Scripts
  'scripts': 'scripts'
};

// Dependency graph - if module X changes, also test these modules
const DEPENDENCIES = {
  // Treasury is foundation - if it changes, test everything that depends on it
  'treasury-contracts': ['ats-contracts', 'primary-market-contracts'],

  // ATS contracts are used by primary market
  'ats-contracts': ['primary-market-contracts'],

  // Primary market contracts don't have dependencies
  'primary-market-contracts': [],

  // Shared core is foundation - if it changes, test ALL modules
  'shared-core': [
    'blockchain-listener',
    'ats-api',
    'primary-market-api',
    'treasury-api',
    'gateway',
    'transaction-sender'
  ],

  // Blockchain listener is used by all APIs
  'blockchain-listener': [
    'ats-api',
    'primary-market-api',
    'treasury-api'
  ],

  // Contract changes trigger dependent API tests
  'ats-contracts': ['ats-api'],
  'primary-market-contracts': ['primary-market-api'],
  'treasury-contracts': ['treasury-api'],

  // APIs don't have dependencies
  'ats-api': [],
  'primary-market-api': [],
  'treasury-api': [],
  'gateway': [],
  'transaction-sender': []
};

/**
 * Get list of changed files from git
 */
function getChangedFiles() {
  try {
    // Check if we're in a GitHub Actions environment
    const githubRef = process.env.GITHUB_BASE_REF;

    if (githubRef) {
      // In GitHub Actions - compare against base branch
      const baseBranch = `origin/${githubRef}`;
      const command = `git diff --name-only ${baseBranch}...HEAD`;
      const output = execSync(command, { encoding: 'utf-8' });
      return output.trim().split('\n').filter(Boolean);
    } else {
      // Local development - compare against develop
      const command = 'git diff --name-only origin/develop...HEAD';
      try {
        const output = execSync(command, { encoding: 'utf-8' });
        return output.trim().split('\n').filter(Boolean);
      } catch (error) {
        // Fallback to uncommitted changes
        console.warn('Could not compare with origin/develop, using uncommitted changes');
        const output = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });
        return output.trim().split('\n').filter(Boolean);
      }
    }
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Map changed files to affected modules
 */
function mapFilesToModules(changedFiles) {
  const affectedModules = new Set();

  for (const file of changedFiles) {
    // Check each module path
    for (const [module, modulePath] of Object.entries(MODULE_PATHS)) {
      if (file.startsWith(modulePath + '/')) {
        affectedModules.add(module);
        break;
      }
    }

    // Special cases
    if (file.startsWith('.github/workflows/')) {
      // Workflow changes don't trigger tests, only quality checks
      continue;
    }

    if (file.match(/\.(eslintrc|prettierrc|eslint\.config|prettier\.config)/)) {
      // Root config changes trigger quality checks for all
      affectedModules.add('__quality__');
    }

    if (file === 'package.json' || file === 'package-lock.json') {
      // Root package changes might affect all modules
      affectedModules.add('__all__');
    }
  }

  return Array.from(affectedModules);
}

/**
 * Add dependent modules based on dependency graph
 */
function addDependentModules(modules) {
  const allModules = new Set(modules);
  const visited = new Set();

  function addDeps(module) {
    if (visited.has(module)) return;
    visited.add(module);

    const deps = DEPENDENCIES[module] || [];
    for (const dep of deps) {
      allModules.add(dep);
      addDeps(dep); // Recursive dependency resolution
    }
  }

  // If __all__ flag is set, return all modules
  if (allModules.has('__all__')) {
    return Object.keys(MODULE_PATHS).filter(m => m !== 'scripts');
  }

  // Add dependencies for each affected module
  for (const module of modules) {
    if (module !== '__quality__' && module !== '__all__') {
      addDeps(module);
    }
  }

  return Array.from(allModules);
}

/**
 * Categorize modules by type for GitHub Actions
 */
function categorizeModules(modules) {
  const contracts = [];
  const apis = [];
  const shared = [];

  for (const module of modules) {
    if (module === '__quality__' || module === '__all__') continue;

    if (module.endsWith('-contracts')) {
      // Extract domain name (e.g., 'ats' from 'ats-contracts')
      const domain = module.replace('-contracts', '');
      contracts.push(domain);
    } else if (module.endsWith('-api')) {
      // Extract domain name (e.g., 'primary-market' from 'primary-market-api')
      const domain = module.replace('-api', '');
      apis.push(domain);
    } else if (module.startsWith('shared-') || module === 'blockchain-listener') {
      // Shared libraries
      const name = module.replace('shared-', '');
      shared.push(name);
    } else if (module === 'gateway' || module === 'transaction-sender') {
      // Shared applications
      shared.push(module);
    }
  }

  return {
    contracts: [...new Set(contracts)],
    apis: [...new Set(apis)],
    shared: [...new Set(shared)]
  };
}

/**
 * Output results in GitHub Actions format
 */
function outputResults(results) {
  const githubOutput = process.env.GITHUB_OUTPUT;

  // Convert arrays to JSON strings for GitHub Actions
  const contractsJson = JSON.stringify(results.contracts);
  const apisJson = JSON.stringify(results.apis);
  const sharedJson = JSON.stringify(results.shared);
  const anyChanges = results.contracts.length > 0 || results.apis.length > 0 || results.shared.length > 0;

  if (githubOutput) {
    // Write to GITHUB_OUTPUT file
    fs.appendFileSync(githubOutput, `contracts=${contractsJson}\n`);
    fs.appendFileSync(githubOutput, `apis=${apisJson}\n`);
    fs.appendFileSync(githubOutput, `shared=${sharedJson}\n`);
    fs.appendFileSync(githubOutput, `any-changes=${anyChanges}\n`);
  } else {
    // Local development - print to console
    console.log('\n=== Change Detection Results ===');
    console.log(`Contracts: ${contractsJson}`);
    console.log(`APIs: ${apisJson}`);
    console.log(`Shared: ${sharedJson}`);
    console.log(`Any changes: ${anyChanges}`);
    console.log('\n=== GitHub Actions Output ===');
    console.log(`contracts=${contractsJson}`);
    console.log(`apis=${apisJson}`);
    console.log(`shared=${sharedJson}`);
    console.log(`any-changes=${anyChanges}`);
  }

  return results;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Detecting changed modules...\n');

  // Step 1: Get changed files
  const changedFiles = getChangedFiles();
  console.log(`Found ${changedFiles.length} changed files`);
  if (changedFiles.length > 0 && changedFiles.length <= 10) {
    console.log('Changed files:', changedFiles);
  }

  // Step 2: Map files to modules
  const affectedModules = mapFilesToModules(changedFiles);
  console.log(`\nDirectly affected modules: ${JSON.stringify(affectedModules)}`);

  // Step 3: Add dependent modules
  const allAffectedModules = addDependentModules(affectedModules);
  console.log(`All affected modules (with dependencies): ${JSON.stringify(allAffectedModules)}`);

  // Step 4: Categorize for GitHub Actions
  const results = categorizeModules(allAffectedModules);
  console.log(`\nCategorized results:`);
  console.log(`  - Contracts: ${results.contracts.join(', ') || 'none'}`);
  console.log(`  - APIs: ${results.apis.join(', ') || 'none'}`);
  console.log(`  - Shared: ${results.shared.join(', ') || 'none'}`);

  // Step 5: Output for GitHub Actions
  outputResults(results);

  console.log('\n✅ Change detection complete');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  getChangedFiles,
  mapFilesToModules,
  addDependentModules,
  categorizeModules,
  MODULE_PATHS,
  DEPENDENCIES
};
