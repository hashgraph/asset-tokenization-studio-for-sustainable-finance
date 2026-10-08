# GBP Contract Deployment Testing Guide

This guide provides step-by-step procedures for testing contract deployments on different local networks.

## Table of Contents

- [Hardhat Local Testing](#hardhat-local-testing)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Procedure](#step-by-step-procedure)
  - [Expected Results](#expected-results)
  - [Validation Steps](#validation-steps)
  - [Known Issues](#known-issues)
  - [Success Criteria](#success-criteria)
- [Hedera Local Testing](#hedera-local-testing)
  - [Coming Soon](#coming-soon)

---

## Hardhat Local Testing

Test the complete GBP infrastructure deployment on Hardhat local network (Chain ID 31337).

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Dependencies installed: `npm ci` (from monorepo root)

### Step-by-Step Procedure

#### Terminal 1: Start Hardhat Node

```bash
cd packages/shared/contracts
npm run local:hardhat
```

**Expected Output:**

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
... (18 more accounts)

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Chain ID: 0x7a69 (31337 in decimal)
```

**Verification:**

```bash
# In another terminal, verify connectivity
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected response: {"jsonrpc":"2.0","id":1,"result":"0x7a69"}
```

#### Terminal 2: Deploy Infrastructure

**From `packages/shared/contracts` directory:**

```bash
npm run deploy:local
```

**Or from monorepo root:**

```bash
npm run shared:contracts:deploy:local
```

**What Happens:**

1. Builds TypeScript source: `npm run build`
2. Executes standalone deployment CLI
3. Runs 6-step orchestration workflow:
   - Step 1: Deploy ProxyAdmin
   - Step 2: Deploy Business Logic Resolver (BLR) with TransparentUpgradeableProxy
   - Step 3: Deploy BOND domain (48 facets, config ID 2)
   - Step 4: Deploy Treasury domain (3 facets, config ID 20000)
   - Step 5: Deploy FactorySuite (1 facet, config ID 30000)
   - Step 6: Deploy PrimaryMarket (2 facets, config IDs 10000 & 10001)
4. Saves output JSON file

**Deployment Duration:** Approximately 30 seconds

### Expected Results

#### Console Output Summary

```
[INFO] Starting GBP infrastructure deployment...
[INFO] Network: local (chainId: 31337)
[INFO] Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

[SUCCESS] ✅ ProxyAdmin deployed
[SUCCESS] ✅ BLR deployed with TransparentUpgradeableProxy
[SUCCESS] ✅ BOND deployment completed (48 facets)
[SUCCESS] ✅ Treasury deployment completed (3 facets)
[SUCCESS] ✅ FactorySuite deployment completed (1 facet)
[SUCCESS] ✅ PrimaryMarket deployment completed (2 facets)

[INFO] Infrastructure:
  ProxyAdmin: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  BLR: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  ATS Factory: 0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc
  FactorySuite Proxy: 0x4C4a2f8c81640e47606d3fd77B353E87Ba015584
  FactoryPrimaryMarket Proxy: 0x36b58F5C1969B7b6591D752ea6F5486D069010AB

[INFO] Configurations:
  BOND: config ID=2, version=1
  TREASURY: config ID=20000, version=1
  FactorySuite: config ID=30000, version=1
  FactoryPrimaryMarket: config ID=10000, version=1
  PrimaryMarket: config ID=10001, version=1

[SUCCESS] ✅ GBP infrastructure deployment completed!
```

#### Output File

**⚠️ CRITICAL ISSUE:** Currently saves to `node_modules/` path (see Known Issues below)

**Expected Location:** `deployments/local/local-gbp-{timestamp}.json`
**Actual Location:** `node_modules/@hashgraph/asset-tokenization-contracts/build/deployments/local/gbpInfrastructure-{timestamp}.json`

**File Statistics:**

- Size: ~44KB (44,139 bytes)
- Lines: ~1,029 lines
- Format: Structured JSON with deployment metadata

**Structure:**

```json
{
  "timestamp": "2025-12-31T13:22:06.265Z",
  "network": "local",
  "callableContracts": {
    "proxyAdmin": { "description": "...", "address": "0x..." },
    "businessLogicResolver": { "description": "...", "address": "0x...", "proxyType": "TransparentUpgradeableProxy", "implementation": {...} },
    "atsFactory": { "description": "...", "address": "0x...", "proxyType": "TransparentUpgradeableProxy", "implementation": {...} },
    "factorySuite": { "description": "...", "address": "0x...", "proxyType": "ResolverProxy", "resolver": {...} },
    "primaryMarketFactory": { "description": "...", "address": "0x...", "proxyType": "ResolverProxy", "resolver": {...} }
  },
  "result": {
    "proxyAdmin": "0x...",
    "blr": "0x...",
    "blrImplementationAddress": "0x...",
    "bondDeployment": { /* 48 facets */ },
    "treasuryDeployment": { /* 3 facets */ },
    "factorySuiteDeployment": { /* 1 facet */ },
    "primaryMarketDeployment": { /* 2 facets */ }
  }
}
```

### Validation Steps

Use these commands to validate the deployment output manually.

#### 1. Locate Output File

**Due to current issue, find file in node_modules:**

```bash
find node_modules -name "gbpInfrastructure-*.json" -type f 2>/dev/null | head -1
```

**Set variable for convenience:**

```bash
export DEPLOYMENT_FILE=$(find node_modules -name "gbpInfrastructure-*.json" -type f 2>/dev/null | head -1)
echo "Using deployment file: $DEPLOYMENT_FILE"
```

#### 2. Verify File Exists and Size

```bash
ls -lh "$DEPLOYMENT_FILE"
# Expected: File size > 40KB (indicates successful deployment)
```

#### 3. Validate JSON Structure

```bash
# Check top-level keys
jq 'keys' "$DEPLOYMENT_FILE"
# Expected: ["callableContracts", "network", "result", "timestamp"]

# Verify all callable contracts present
jq '.callableContracts | keys' "$DEPLOYMENT_FILE"
# Expected: ["atsFactory", "businessLogicResolver", "factorySuite", "primaryMarketFactory", "proxyAdmin"]
```

#### 4. Check All Addresses Present

```bash
# List all contract addresses
jq '.callableContracts | to_entries | .[] | "\(.key): \(.value.address)"' "$DEPLOYMENT_FILE"

# Verify valid Ethereum addresses (0x followed by 40 hex chars)
jq '.callableContracts | to_entries | .[] | .value.address' "$DEPLOYMENT_FILE" | grep -E '^"0x[a-fA-F0-9]{40}"$'
# Expected: 5 addresses (one per contract)
```

#### 5. Verify Configuration IDs

```bash
# Check all configuration IDs match expected values
jq '.result | {
  bond: .bondDeployment.configurations.bond.configId,
  treasury: .treasuryDeployment.configuration.configId,
  factorySuite: .factorySuiteDeployment.configuration.configId,
  factoryPM: .primaryMarketDeployment.configuration.configId,
  pm: .primaryMarketDeployment.primaryMarketConfiguration.configId
}' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
{
  "bond": "0x0000000000000000000000000000000000000000000000000000000000000002",
  "treasury": "0x0000000000000000000000000000000000000000000000000000000000004e20",
  "factorySuite": "0x0000000000000000000000000000000000000000000000000000000000007530",
  "factoryPM": "0x0000000000000000000000000000000000000000000000000000000000002710",
  "pm": "0x0000000000000000000000000000000000000000000000000000000000002711"
}
```

**Decoded Configuration IDs:**

- BOND: `0x...0002` = 2
- Treasury: `0x...4e20` = 20000
- FactorySuite: `0x...7530` = 30000
- FactoryPrimaryMarket: `0x...2710` = 10000
- PrimaryMarket: `0x...2711` = 10001

#### 6. Verify Facet Counts

```bash
# Count facets deployed per domain
jq '.result | {
  bondFacets: (.bondDeployment.facets | length),
  treasuryFacets: (.treasuryDeployment.facets | length),
  factorySuiteFacets: (.factorySuiteDeployment.facets | length),
  primaryMarketFacets: (.primaryMarketDeployment.facets | length)
}' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
{
  "bondFacets": 48,
  "treasuryFacets": 5,
  "factorySuiteFacets": 3,
  "primaryMarketFacets": 4
}
```

#### 7. Verify Deployment Success Status

```bash
# Check all domains deployed successfully
jq '.result | {
  bond: .bondDeployment.summary.success,
  treasury: .treasuryDeployment.summary.success,
  factorySuite: .factorySuiteDeployment.summary.success,
  primaryMarket: .primaryMarketDeployment.summary.success
}' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
{
  "bond": true,
  "treasury": true,
  "factorySuite": true,
  "primaryMarket": true
}
```

### Known Issues

#### Issue 1: Output File Saved to node_modules (CRITICAL)

**Problem:**
Deployment output is saved to `node_modules/@hashgraph/asset-tokenization-contracts/build/deployments/local/` instead of the expected `packages/shared/contracts/deployments/local/`.

**Impact:**

- Output files will be **deleted on `npm install` or `npm ci`**
- Breaks deployment history and archival
- Checkpoint recovery may fail after dependency reinstall

**Warning Shown During Deployment:**

```
[WARN] ⚠️  Checkpoint directory is inside node_modules and will be deleted on npm install/ci.
[WARN]    Recommended: Specify a persistent directory using the 'checkpointDir' option.
```

**Root Cause:**
Default checkpoint configuration uses a path relative to the ATS contracts package location, which resolves to `node_modules/` when imported as a dependency.

**Recommended Fix:**
Update deployment configuration in `scripts/cli/standalone.ts` to specify persistent checkpoint directory:

```typescript
const result = await deployGbpInfrastructure(signer, {
  checkpointDir: "./deployments/.checkpoints", // Persistent path
  outputDir: "./deployments/local", // Persistent output
  network: "local",
});
```

**Workaround (Until Fixed):**
After deployment, manually copy output file to persistent location:

```bash
mkdir -p deployments/local
cp node_modules/@hashgraph/asset-tokenization-contracts/build/deployments/local/gbpInfrastructure-*.json \
   deployments/local/
```

### Success Criteria

Use this checklist to verify deployment success:

- [x] **Hardhat node running:** Accessible at `http://127.0.0.1:8545`, Chain ID 31337
- [x] **Deployment completed:** No errors in console output
- [x] **Deployment duration:** < 5 minutes (actual: ~30 seconds for local)
- [x] **Output file created:** File exists with size > 40KB
- [x] **All callable contracts deployed:** 5 contracts (proxyAdmin, businessLogicResolver, atsFactory, factorySuite, primaryMarketFactory)
- [x] **All addresses valid:** Valid Ethereum addresses (0x + 40 hex chars)
- [x] **Configuration IDs correct:** BOND=2, Treasury=20000, FactorySuite=30000, FactoryPM=10000, PM=10001
- [x] **Facet counts correct:** BOND=48, Treasury=3, FactorySuite=1, PrimaryMarket=2
- [x] **All domains successful:** `summary.success = true` for all 4 domains
- [ ] **Output in persistent location:** ⚠️ ISSUE - Currently in node_modules/ (see Known Issues)

**Overall Result:** ✅ **DEPLOYMENT SUCCESSFUL** (with 1 known issue to fix)

---

## Configuration Upgrades (Hardhat Local)

Test the configuration upgrade workflow to update all domain configurations from v1 to v2.

### Prerequisites

- Successful deployment completed (see [Hardhat Local Testing](#hardhat-local-testing) above)
- Hardhat node still running from deployment test
- BLR address from deployment output

### Step-by-Step Upgrade Procedure

#### Step 1: Extract BLR Address

From the deployment output, get the BLR (Business Logic Resolver) address:

```bash
# Find deployment file
export DEPLOYMENT_FILE=$(find node_modules -name "gbpInfrastructure-*.json" -type f 2>/dev/null | head -1)

# Extract BLR address
export BLR_ADDRESS=$(jq -r '.callableContracts.businessLogicResolver.address' "$DEPLOYMENT_FILE")
echo "BLR Address: $BLR_ADDRESS"
```

**Expected Output:** `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` (or similar valid address)

#### Step 2: Run Upgrade Workflow

**From `packages/shared/contracts` directory:**

```bash
BLR_ADDRESS=$BLR_ADDRESS npm run upgrade:local
```

**Or from monorepo root:**

```bash
BLR_ADDRESS=$BLR_ADDRESS npm run shared:contracts:upgrade:local
```

**What Happens:**

1. Validates BLR at specified address
2. Upgrades 4 domains sequentially:
   - **FactorySuite** (1 facet deployed, 1 proxy updated)
   - **Treasury** (3 facets deployed, 0 proxies updated)
   - **FactoryPrimaryMarket** (1 facet deployed, 1 proxy updated)
   - **PrimaryMarket** (1 facet deployed, 0 proxies updated)
3. Creates new configuration version (v1 → v2) for each domain
4. Saves upgrade output to JSON file

**Expected Duration:** ~1-2 seconds for Hardhat local

### Expected Results

#### Console Output Summary

```
==============================
  GBP Configuration Upgrades
==============================

Network: local
BLR: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Domains: factorySuite, treasury, factoryPrimaryMarket, primaryMarket

=============================
  Upgrading factorySuite...
=============================
✅ Deployed 1 new facet(s)
✅ Registered 1 new facet(s)
✅ FactorySuite Config ID: 0x...7530
✅ Config Version: 2
✅ Updated 1 proxy(ies) successfully

=========================
  Upgrading treasury...
=========================
✅ Deployed 3 new facet(s)
✅ Registered 3 new facet(s)
✅ Treasury Config ID: 0x...4e20
✅ Config Version: 2
⏭️  Phase 4/4: Skipped (no proxies to update)

=====================================
  Upgrading factoryPrimaryMarket...
=====================================
✅ Deployed 1 new facet(s)
✅ Registered 1 new facet(s)
✅ FactoryPrimaryMarket Config ID: 0x...2710
✅ Config Version: 2
✅ Updated 1 proxy(ies) successfully

==============================
  Upgrading primaryMarket...
==============================
✅ Deployed 1 new facet(s)
✅ Registered 1 new facet(s)
✅ PrimaryMarket Config ID: 0x...2711
✅ Config Version: 2
⏭️  Phase 4/4: Skipped (no proxies to update)

========================================
  GBP Configuration Upgrades - Summary
========================================

✓ factorySuite         v2 - 1 facets, 1 proxies (0s)
✓ treasury             v2 - 3 facets, 0 proxies (0s)
✓ factoryPrimaryMarket v2 - 1 facets, 1 proxies (0s)
✓ primaryMarket        v2 - 1 facets, 0 proxies (0s)

Total domains:       4
Successful upgrades: 4
Failed upgrades:     0
Total facets:        6
Total proxies:       2 updated, 0 failed
Total time:          0m 1s

✅ All upgrades completed successfully!
```

#### Output File

**⚠️ Same path issue as deployment:** Output currently saves to `node_modules/` path.

**Expected Location:** `deployments/local/local-gbp-upgrade-{timestamp}.json`
**Actual Location:** `node_modules/@hashgraph/asset-tokenization-contracts/build/deployments/local/gbpUpgrade-{timestamp}.json`

**File Statistics:**

- Size: ~1.6KB (much smaller than deployment output)
- Format: Structured JSON with upgrade summary

**Structure:**

```json
{
  "network": "local",
  "timestamp": "2025-12-31T13:42:02.991Z",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "blr": {
    "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "isExternal": true
  },
  "domainResults": [
    {
      "domain": "factorySuite",
      "success": true,
      "version": 2,
      "configId": "0x...7530",
      "facetsDeployed": 1,
      "proxiesUpdated": 1,
      "proxiesFailed": 0,
      "upgradeTime": 410
    }
  ],
  "summary": {
    "totalDomains": 4,
    "successfulUpgrades": 4,
    "failedUpgrades": 0,
    "totalFacetsDeployed": 6,
    "totalProxiesUpdated": 2,
    "totalProxiesFailed": 0,
    "totalUpgradeTime": 1268,
    "allSuccess": true
  }
}
```

### Validation Steps

#### 1. Locate Upgrade Output File

```bash
# Find the upgrade file
export UPGRADE_FILE=$(find node_modules -name "gbpUpgrade-*.json" -type f 2>/dev/null | head -1)
echo "Upgrade file: $UPGRADE_FILE"

# Check file size
ls -lh "$UPGRADE_FILE"
```

**Expected:** File size ~1.6KB

#### 2. Verify All Domains Upgraded

```bash
# Check all domain successes
jq '.domainResults[] | "\(.domain): success=\(.success), version=\(.version)"' "$UPGRADE_FILE"
```

**Expected Output:**

```
"factorySuite: success=true, version=2"
"treasury: success=true, version=2"
"factoryPrimaryMarket: success=true, version=2"
"primaryMarket: success=true, version=2"
```

#### 3. Verify Configuration Versions Incremented

```bash
# Check configuration versions
jq '.domainResults[] | {domain, version, configId}' "$UPGRADE_FILE"
```

**Expected:** All versions should be `2` (upgraded from `1`)

#### 4. Check Facet Deployment Counts

```bash
# Count facets deployed per domain
jq '.domainResults[] | "\(.domain): \(.facetsDeployed) facets"' "$UPGRADE_FILE"
```

**Expected Output:**

```
"factorySuite: 1 facets"
"treasury: 3 facets"
"factoryPrimaryMarket: 1 facets"
"primaryMarket: 1 facets"
```

#### 5. Verify Proxy Updates

```bash
# Check proxy update counts
jq '.domainResults[] | "\(.domain): \(.proxiesUpdated) proxies updated, \(.proxiesFailed) failed"' "$UPGRADE_FILE"
```

**Expected:**

- FactorySuite: 1 proxy updated
- Treasury: 0 proxies (config-only, no factory proxy)
- FactoryPrimaryMarket: 1 proxy updated
- PrimaryMarket: 0 proxies (config-only, instances created on-demand)

#### 6. Verify Aggregate Summary

```bash
# Check overall summary
jq '.summary' "$UPGRADE_FILE"
```

**Expected:**

```json
{
  "totalDomains": 4,
  "successfulUpgrades": 4,
  "failedUpgrades": 0,
  "totalFacetsDeployed": 6,
  "totalProxiesUpdated": 2,
  "totalProxiesFailed": 0,
  "totalUpgradeTime": 1268,
  "allSuccess": true
}
```

### Understanding Upgrade Behavior

#### Facet Deployment Strategy

**IMPORTANT:** All facets are deployed unconditionally (no change detection).

**What happens during each domain upgrade:**

1. Deploys ALL domain-specific facets (even if code unchanged)
2. Registers all facets in BLR with overwrite enabled
3. Creates new configuration version for that domain
4. Updates existing proxies to new version (if proxies provided)

**Example from console output:**

```
⚠️  FactorySuiteFacet: Overwriting 0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d → 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7
```

This shows the facet was redeployed to a new address and registered in BLR, replacing the old address.

#### Why No Change Detection?

From the README.md:

- **Simplicity:** No complex bytecode comparison logic
- **Safety:** Each version is self-contained
- **Consistency:** Predictable behavior across all upgrades
- **Trade-off:** Higher gas cost for simplicity and reliability

#### Proxy Updates vs Template Configs

**Proxies Updated (Factory Contracts):**

- FactorySuite: Has deployed proxy → Updated to v2
- FactoryPrimaryMarket: Has deployed proxy → Updated to v2

**No Proxies (Template Configs Only):**

- Treasury: Config stored in BLR, instances created on-demand
- PrimaryMarket: Config stored in BLR, instances created by factory

### Success Criteria

- [ ] Upgrade completed without errors
- [ ] All 4 domains upgraded successfully (`summary.allSuccess = true`)
- [ ] All configuration versions incremented to 2
- [ ] Facet counts match expected: FactorySuite=1, Treasury=3, FactoryPM=1, PM=1
- [ ] Total facets deployed: 6
- [ ] Proxies updated: 2 (FactorySuite + FactoryPrimaryMarket)
- [ ] No proxy update failures (`totalProxiesFailed = 0`)
- [ ] Upgrade time < 5 seconds (local should be ~1 second)
- [ ] Output file created with valid JSON structure

**Overall Result:** ✅ **UPGRADE SUCCESSFUL** (all criteria met)

---

## Hedera Local Testing

### Coming Soon

Documentation for testing on Hedera local network (using Docker-based `hedera` CLI) will be added in Phase 3 of the testing plan.

**Prerequisites being validated:**

- Docker Desktop installed and running
- Global `hedera` CLI package: `npm install -g @hashgraph/hedera-local`
- Network startup: `hedera start -d`
- Mirror node API availability
- Contract ID verification procedures

**Stay tuned for:**

- Complete Docker setup guide
- Hedera-specific deployment procedure
- Contract ID validation (Hedera vs EVM addresses)
- Mirror node query examples
- Consensus finality considerations

---

## Hedera Testnet Testing

Test the complete GBP infrastructure deployment on Hedera Testnet network.

### Prerequisites

- **Hedera Testnet Account**: Must have test HBAR for deployment gas fees
- **Environment Configuration**: `HEDERA_TESTNET_PRIVATE_KEY_0` set in `.env` file
- **Pre-built Contracts**: `npm run contracts:build` from monorepo root
- **jq Installed**: For JSON validation commands

### Step-by-Step Testing Procedure

#### Step 1: Configure Environment

**From `packages/shared/contracts` directory:**

```bash
# 1. Ensure .env file exists
ls -la .env
# If missing, copy from template: cp .env.sample .env

# 2. Verify required environment variables
grep HEDERA_TESTNET_PRIVATE_KEY_0 .env
# Should show: HEDERA_TESTNET_PRIVATE_KEY_0=0x...

# 3. Verify network configuration (optional, defaults to testnet)
grep NETWORK .env
# Should show: NETWORK=hedera-testnet (or be unset, which defaults to testnet)

# 4. Verify you have test HBAR
# Check balance at: https://hashscan.io/testnet/address/<your-address>
```

#### Step 2: Deploy Infrastructure

**From `packages/shared/contracts` directory:**

```bash
npm run deploy:hedera:testnet
```

**Or from monorepo root:**

```bash
npm run shared:contracts:deploy:hedera:testnet
```

**What Happens:**

1. Builds TypeScript source (`npm run build`)
2. Executes deployment workflow with 6 orchestration steps:
   - **Step 1:** Deploy ProxyAdmin → Contract ID assigned
   - **Step 2:** Deploy BLR + TransparentUpgradeableProxy → Contract IDs assigned
   - **Step 3:** Deploy BOND domain (48 facets, config ID 2)
   - **Step 4:** Deploy Treasury domain (3 facets, config ID 20000)
   - **Step 5:** Deploy FactorySuite (1 facet, config ID 30000)
   - **Step 6:** Deploy PrimaryMarket (2 facets, config IDs 10000 & 10001)
3. Saves deployment output to `deployments/hedera-testnet/gbpInfrastructure-{timestamp}.json`

**Expected Duration:** 8-12 minutes for Hedera Testnet (network consensus time)

#### Step 3: Verify Deployment Success

**Console Output:**

Look for this final message:

```
[SUCCESS] ✅ GBP infrastructure deployment completed!
```

**Validate Output File:**

```bash
# 1. Find the latest deployment output file
ls -lth deployments/hedera-testnet/gbpInfrastructure-*.json | head -1

# 2. Verify file size (should be ~44 KB)
ls -lh $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)

# 3. Verify 5 callable contracts deployed
jq '.callableContracts | keys | length' \
  $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)
# Expected: 5

# 4. Verify all deployments succeeded
jq '.result.bondDeployment.summary.success,
    .result.treasuryDeployment.summary.success,
    .result.factorySuiteDeployment.summary.success,
    .result.primaryMarketDeployment.summary.success' \
  $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)
# Expected: true, true, true, true

# 5. Verify total facets deployed (should be 54)
jq '[.result.bondDeployment.summary.totalFacets,
     .result.treasuryDeployment.summary.totalFacets,
     .result.factorySuiteDeployment.summary.totalFacets,
     .result.primaryMarketDeployment.summary.totalFacets] | add' \
  $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)
# Expected: 54 (48 + 3 + 1 + 2)

# 6. Verify Hedera contract IDs are populated
jq '.callableContracts.businessLogicResolver.contractId' \
  $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)
# Expected: "0.0.XXXXX" (Hedera contract ID format)
```

**Verify on HashScan Explorer:**

```bash
# Extract BLR contract ID
export BLR_CONTRACT_ID=$(jq -r '.callableContracts.businessLogicResolver.contractId' \
  $(ls -t deployments/hedera-testnet/gbpInfrastructure-*.json | head -1))

# View on HashScan
echo "View BLR on HashScan: https://hashscan.io/testnet/contract/$BLR_CONTRACT_ID"
```

### Expected Results

#### Deployment Metrics

| Metric                 | Expected Value                                                       |
| ---------------------- | -------------------------------------------------------------------- |
| **Duration**           | 8-12 minutes                                                         |
| **Total Facets**       | 54 (48 BOND + 3 Treasury + 1 FactorySuite + 2 PrimaryMarket)         |
| **Callable Contracts** | 5 (ProxyAdmin, BLR, ATS Factory, FactorySuite, FactoryPrimaryMarket) |
| **Output File Size**   | ~44 KB                                                               |
| **Contract IDs**       | All populated in format "0.0.XXXXX"                                  |

#### Console Output Summary

```
[INFO] Starting GBP infrastructure deployment...
[INFO] Network: hedera-testnet (chainId: 296)
[INFO] Deployer: 0x...

[SUCCESS] ✅ ProxyAdmin deployed (Contract ID: 0.0.XXXXX)
[SUCCESS] ✅ BLR deployed with TransparentUpgradeableProxy (Contract ID: 0.0.XXXXX)
[SUCCESS] ✅ BOND deployment completed (48 facets)
[SUCCESS] ✅ Treasury deployment completed (3 facets)
[SUCCESS] ✅ FactorySuite deployment completed (1 facet)
[SUCCESS] ✅ PrimaryMarket deployment completed (2 facets)

[SUCCESS] ✅ GBP infrastructure deployment completed!
Deployment output saved to: deployments/hedera-testnet/gbpInfrastructure-YYYYMMDD-HHMMSS.json
```

### Validation Checklist

After deployment completes:

- [ ] Console shows final success message
- [ ] Output file exists in `deployments/hedera-testnet/`
- [ ] Output file size is approximately 44 KB
- [ ] 5 callable contracts present in output
- [ ] All 4 domain deployments report `success: true`
- [ ] Total facets deployed equals 54
- [ ] All contract IDs in format `"0.0.XXXXX"`
- [ ] Contracts visible on HashScan Testnet Explorer
- [ ] Deployment completed in 8-12 minutes

**If all checks pass:** ✅ **DEPLOYMENT SUCCESSFUL**

**If any check fails:** See main README [Troubleshooting](../README.md#troubleshooting) section for common issues.

### Advanced Validation

For comprehensive validation of deployment output structure and values, refer to:

- **[output-validation.md](./output-validation.md)** - 20+ jq validation commands
- **Expected configuration IDs**: BOND=2, Treasury=20000, FactorySuite=30000, FactoryPrimaryMarket=10000, PrimaryMarket=10001
- **Expected facet counts**: See validation checklist above

### Next Steps

After successful testnet deployment:

1. **Save the deployment output file** - Backup to secure location
2. **Document contract addresses** - Record for team reference
3. **Test contract interactions** - Use SDK to interact with deployed contracts
4. **Prepare for upgrades** - Extract BLR_ADDRESS for future upgrade operations

### Common Issues

**Issue: Deployment takes longer than 12 minutes**

- **Cause**: Network congestion on Hedera Testnet
- **Solution**: Wait for deployment to complete (can take up to 15 minutes in rare cases)

**Issue: "Insufficient HBAR balance" error**

- **Cause**: Test account doesn't have enough HBAR for gas fees
- **Solution**: Get test HBAR from Hedera Testnet faucet at https://portal.hedera.com

**Issue: "Invalid private key" error**

- **Cause**: Incorrect private key format in .env
- **Solution**: Ensure private key is 64 hex characters (0x prefix optional)

**Issue: Output file location**

- **Expected**: `packages/shared/contracts/deployments/hedera-testnet/`
- **Verification**: File should persist after `npm install` (not in node_modules)
