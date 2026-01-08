# GBP Deployment Output Validation Guide

This guide provides manual validation procedures for GBP infrastructure deployment outputs using `jq` commands.

## Table of Contents

- [Output Schema Overview](#output-schema-overview)
- [Validation Checklist](#validation-checklist)
- [Manual Validation Commands](#manual-validation-commands)
  - [Basic Structure Validation](#basic-structure-validation)
  - [Address Validation](#address-validation)
  - [Configuration ID Validation](#configuration-id-validation)
  - [Facet Deployment Validation](#facet-deployment-validation)
  - [Network-Specific Validation](#network-specific-validation)
  - [Deployment Health Checks](#deployment-health-checks)
- [Expected Values Reference](#expected-values-reference)
- [Common Validation Scenarios](#common-validation-scenarios)

---

## Output Schema Overview

### Top-Level Structure

```typescript
interface GbpInfrastructureOutput {
  timestamp: string; // ISO 8601 format (e.g., "2025-12-31T13:22:06.265Z")
  network: string; // "local", "hedera-local", "hedera-testnet", "hedera-mainnet"
  callableContracts: {
    // User-facing contract addresses and metadata
    proxyAdmin: CallableContract;
    businessLogicResolver: CallableContract;
    atsFactory: CallableContract;
    factorySuite?: CallableContract;
    primaryMarketFactory?: CallableContract;
  };
  result: {
    // Detailed per-domain deployment data
    proxyAdmin: string;
    blr: string;
    blrImplementationAddress: string;
    bondDeployment: DeploymentWithExistingBlrOutput;
    treasuryDeployment: DeployTreasuryOutput;
    factorySuiteDeployment: DeployFactorySuiteOutput;
    primaryMarketDeployment: DeployFactoryPrimaryMarketOutput;
  };
}

interface CallableContract {
  description: string;
  address: string;
  contractId?: string; // Hedera networks only
  proxyType?: string; // "TransparentUpgradeableProxy" or "ResolverProxy"
  implementation?: {
    // For TransparentUpgradeableProxy
    address: string;
    contractId?: string;
  };
  resolver?: {
    // For ResolverProxy (Diamond pattern)
    address: string;
    contractId?: string;
  };
}
```

---

## Validation Checklist

Use this checklist to verify deployment output completeness and correctness.

### Mandatory Fields (All Networks)

- [ ] `timestamp` - Valid ISO 8601 format
- [ ] `network` - Matches deployment target network
- [ ] `callableContracts.proxyAdmin.address` - Valid EVM address
- [ ] `callableContracts.businessLogicResolver.address` - Valid EVM address
- [ ] `callableContracts.atsFactory.address` - Valid EVM address
- [ ] `callableContracts.factorySuite.address` - Valid EVM address
- [ ] `callableContracts.primaryMarketFactory.address` - Valid EVM address

### Configuration IDs (Critical)

- [ ] BOND configuration: `0x0000...0002` (config ID 2)
- [ ] Treasury configuration: `0x0000...4e20` (config ID 20000)
- [ ] FactorySuite configuration: `0x0000...7530` (config ID 30000)
- [ ] FactoryPrimaryMarket configuration: `0x0000...2710` (config ID 10000)
- [ ] PrimaryMarket configuration: `0x0000...2711` (config ID 10001)

### Hedera-Specific Fields (Hedera Networks Only)

- [ ] All contracts have `contractId` field in format "0.0.XXXXX"
- [ ] Contract IDs are sequential (increasing by 1-10 between contracts)
- [ ] Mirror node can query all contract IDs successfully

### Deployment Health

- [ ] All domain `summary.success` fields are `true`
- [ ] Facet counts match expected values (BOND=48, Treasury=3, FactorySuite=1, PrimaryMarket=2)
- [ ] No error messages in deployment logs
- [ ] Total deployment time is reasonable (< 5 min local, < 10 min testnet)

---

## Manual Validation Commands

All commands assume `$DEPLOYMENT_FILE` environment variable is set:

```bash
# Set deployment file path
export DEPLOYMENT_FILE="path/to/gbpInfrastructure-TIMESTAMP.json"

# Or use find to locate latest
export DEPLOYMENT_FILE=$(find deployments -name "gbpInfrastructure-*.json" -type f | sort | tail -1)
```

### Basic Structure Validation

#### Verify Top-Level Keys

```bash
jq 'keys | sort' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
["callableContracts", "network", "result", "timestamp"]
```

#### Check Network Identifier

```bash
jq '.network' "$DEPLOYMENT_FILE"
```

**Expected Values:** `"local"`, `"hedera-local"`, `"hedera-testnet"`, `"hedera-preview"`, or `"hedera-mainnet"`

#### Validate Timestamp Format

```bash
jq '.timestamp' "$DEPLOYMENT_FILE"
```

**Expected Format:** ISO 8601 (e.g., `"2025-12-31T13:22:06.265Z"`)

### Address Validation

#### List All Callable Contracts

```bash
jq '.callableContracts | keys | sort' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
["atsFactory", "businessLogicResolver", "factorySuite", "primaryMarketFactory", "proxyAdmin"]
```

#### Display All Contract Addresses

```bash
jq '.callableContracts | to_entries | .[] | "\(.key): \(.value.address)"' "$DEPLOYMENT_FILE"
```

**Expected Format:** Each address should be `0x` followed by 40 hexadecimal characters.

#### Verify All Addresses Are Valid Ethereum Addresses

```bash
# Check address format (0x + 40 hex chars)
jq '.callableContracts | to_entries | .[] | .value.address' "$DEPLOYMENT_FILE" | \
  grep -E '^"0x[a-fA-F0-9]{40}"$' | wc -l
```

**Expected Output:** `5` (number of callable contracts)

#### Extract Addresses in Easy-to-Read Format

```bash
jq -r '.callableContracts | to_entries | .[] | "\(.key):\n  Address: \(.value.address)\n  Type: \(.value.proxyType // "N/A")\n"' "$DEPLOYMENT_FILE"
```

### Configuration ID Validation

#### Check All Configuration IDs

```bash
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

#### Verify Configuration ID Decimal Values

```bash
# Convert hex config IDs to decimal for verification
jq '.result | {
  bond: (.bondDeployment.configurations.bond.configId | ltrimstr("0x") | tonumber),
  treasury: (.treasuryDeployment.configuration.configId | ltrimstr("0x") | tonumber),
  factorySuite: (.factorySuiteDeployment.configuration.configId | ltrimstr("0x") | tonumber),
  factoryPM: (.primaryMarketDeployment.configuration.configId | ltrimstr("0x") | tonumber),
  pm: (.primaryMarketDeployment.primaryMarketConfiguration.configId | ltrimstr("0x") | tonumber)
}' "$DEPLOYMENT_FILE"
```

**Expected Output:**

```json
{
  "bond": 2,
  "treasury": 20000,
  "factorySuite": 30000,
  "factoryPM": 10000,
  "pm": 10001
}
```

### Facet Deployment Validation

#### Count Facets Per Domain

```bash
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

#### List All Facet Names by Domain

**BOND Facets:**

```bash
jq -r '.result.bondDeployment.facets | .[] | .name' "$DEPLOYMENT_FILE" | sort
```

**Treasury Facets:**

```bash
jq -r '.result.treasuryDeployment.facets | .[] | .name' "$DEPLOYMENT_FILE" | sort
```

**FactorySuite Facets:**

```bash
jq -r '.result.factorySuiteDeployment.facets | .[] | .name' "$DEPLOYMENT_FILE" | sort
```

**PrimaryMarket Facets:**

```bash
jq -r '.result.primaryMarketDeployment.facets | .[] | .name' "$DEPLOYMENT_FILE" | sort
```

#### Identify Shared Facets

```bash
# Facets appearing in multiple domains
jq -r '
  [
    .result.bondDeployment.facets[].name,
    .result.treasuryDeployment.facets[].name,
    .result.factorySuiteDeployment.facets[].name,
    .result.primaryMarketDeployment.facets[].name
  ] | group_by(.) | map({name: .[0], count: length}) | .[] | select(.count > 1)
' "$DEPLOYMENT_FILE"
```

**Expected Shared Facets:** `AccessControlFacet`, `PauseFacet` (deployed once, referenced by all domains)

### Network-Specific Validation

#### Hedera Networks: Verify Contract IDs Present

```bash
# Only run on Hedera networks (network starts with "hedera-")
jq 'if .network | startswith("hedera-") then
  .callableContracts | to_entries | map({
    contract: .key,
    address: .value.address,
    contractId: .value.contractId
  })
else
  "Not a Hedera network - contract IDs not applicable"
end' "$DEPLOYMENT_FILE"
```

**Expected Output (Hedera networks):**
Each contract should have a `contractId` field in format `"0.0.XXXXX"`

#### Hedera Networks: Check Contract ID Sequence

```bash
# Verify contract IDs are sequential
jq '[.callableContracts | to_entries | .[] | .value.contractId | select(. != null) | split(".")[2] | tonumber] | sort' "$DEPLOYMENT_FILE"
```

**Expected:** Array of increasing numbers with gaps of 1-10 between contracts

#### Local Networks: Verify No Contract IDs

```bash
# Contract IDs should be null or absent on local networks
jq 'if (.network == "local" or .network == "hedera-local") then
  [.callableContracts | to_entries | .[] | .value.contractId | select(. != null)] | length
else
  "Not a local network"
end' "$DEPLOYMENT_FILE"
```

**Expected Output:** `0` (no contract IDs on Hardhat local)

### Deployment Health Checks

#### Verify All Domains Deployed Successfully

```bash
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

#### Check Configuration Versions

```bash
jq '.result | {
  bond: .bondDeployment.configurations.bond.version,
  treasury: .treasuryDeployment.configuration.version,
  factorySuite: .factorySuiteDeployment.configuration.version,
  factoryPM: .primaryMarketDeployment.configuration.version,
  pm: .primaryMarketDeployment.primaryMarketConfiguration.version
}' "$DEPLOYMENT_FILE"
```

**Expected Output (Initial Deployment):**

```json
{
  "bond": 1,
  "treasury": 1,
  "factorySuite": 1,
  "factoryPM": 1,
  "pm": 1
}
```

#### Extract Deployment Summary Statistics

```bash
jq '{
  network: .network,
  timestamp: .timestamp,
  totalContracts: (.callableContracts | length),
  totalFacets: (
    (.result.bondDeployment.facets | length) +
    (.result.treasuryDeployment.facets | length) +
    (.result.factorySuiteDeployment.facets | length) +
    (.result.primaryMarketDeployment.facets | length)
  ),
  allDomainsSuccessful: (
    .result.bondDeployment.summary.success and
    .result.treasuryDeployment.summary.success and
    .result.factorySuiteDeployment.summary.success and
    .result.primaryMarketDeployment.summary.success
  )
}' "$DEPLOYMENT_FILE"
```

---

## Expected Values Reference

### Configuration ID Ranges

| Domain        | Configuration | Config ID (Hex) | Config ID (Decimal) | Version |
| ------------- | ------------- | --------------- | ------------------- | ------- |
| BOND          | Main          | `0x...0002`     | 2                   | 1       |
| Treasury      | Main          | `0x...4e20`     | 20000               | 1       |
| FactorySuite  | Main          | `0x...7530`     | 30000               | 1       |
| PrimaryMarket | Factory       | `0x...2710`     | 10000               | 1       |
| PrimaryMarket | Instance      | `0x...2711`     | 10001               | 1       |

### Facet Counts

| Domain        | Domain Facets | Shared Facets Reused          |
| ------------- | ------------- | ----------------------------- |
| BOND          | 48            | N/A (provides shared facets)  |
| Treasury      | 3             | AccessControl, Pause, Diamond |
| FactorySuite  | 1             | AccessControl, Pause, Diamond |
| PrimaryMarket | 2             | AccessControl, Pause          |

### Proxy Types

| Contract                      | Proxy Pattern               | Notes                          |
| ----------------------------- | --------------------------- | ------------------------------ |
| ProxyAdmin                    | None                        | Non-upgradeable admin contract |
| Business Logic Resolver (BLR) | TransparentUpgradeableProxy | Upgradeable via ProxyAdmin     |
| ATS Factory                   | TransparentUpgradeableProxy | Upgradeable via ProxyAdmin     |
| FactorySuite                  | ResolverProxy               | Diamond pattern, facet-based   |
| PrimaryMarket Factory         | ResolverProxy               | Diamond pattern, facet-based   |

### Network Identifiers

| Network Type   | Network Value    | Chain ID | Contract IDs |
| -------------- | ---------------- | -------- | ------------ |
| Hardhat Local  | `local`          | 31337    | No           |
| Hedera Local   | `hedera-local`   | N/A      | Yes          |
| Hedera Preview | `hedera-preview` | N/A      | Yes          |
| Hedera Testnet | `hedera-testnet` | N/A      | Yes          |
| Hedera Mainnet | `hedera-mainnet` | N/A      | Yes          |

---

## Common Validation Scenarios

### Scenario 1: Quick Health Check

**Goal:** Verify deployment succeeded without errors.

```bash
# One-liner health check
jq '{
  network: .network,
  allSuccess: (
    .result.bondDeployment.summary.success and
    .result.treasuryDeployment.summary.success and
    .result.factorySuiteDeployment.summary.success and
    .result.primaryMarketDeployment.summary.success
  ),
  contractCount: (.callableContracts | length),
  facetCount: (
    (.result.bondDeployment.facets | length) +
    (.result.treasuryDeployment.facets | length) +
    (.result.factorySuiteDeployment.facets | length) +
    (.result.primaryMarketDeployment.facets | length)
  )
}' "$DEPLOYMENT_FILE"
```

**Expected:**

```json
{
  "network": "local",
  "allSuccess": true,
  "contractCount": 5,
  "facetCount": 60
}
```

### Scenario 2: Compare Two Deployments

**Goal:** Identify differences between two deployment outputs (e.g., before/after upgrade).

```bash
# Set file paths
export OLD_DEPLOYMENT="path/to/old-deployment.json"
export NEW_DEPLOYMENT="path/to/new-deployment.json"

# Compare configuration versions
diff <(jq '.result | {
  bond: .bondDeployment.configurations.bond.version,
  treasury: .treasuryDeployment.configuration.version,
  factorySuite: .factorySuiteDeployment.configuration.version
}' "$OLD_DEPLOYMENT") \
<(jq '.result | {
  bond: .bondDeployment.configurations.bond.version,
  treasury: .treasuryDeployment.configuration.version,
  factorySuite: .factorySuiteDeployment.configuration.version
}' "$NEW_DEPLOYMENT")
```

### Scenario 3: Extract Application Integration Data

**Goal:** Get addresses needed to integrate with deployed contracts from applications.

```bash
# Generate .env format output
jq -r '.callableContracts | to_entries | .[] |
  "GBP_\(.key | ascii_upcase)_ADDRESS=\(.value.address)"
' "$DEPLOYMENT_FILE"
```

**Output Example:**

```
GBP_PROXYADMIN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
GBP_BUSINESSLOGICRESOLVER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
GBP_ATSFACTORY_ADDRESS=0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc
GBP_FACTORYSUITE_ADDRESS=0x4C4a2f8c81640e47606d3fd77B353E87Ba015584
GBP_PRIMARYMARKETFACTORY_ADDRESS=0x36b58F5C1969B7b6591D752ea6F5486D069010AB
```

### Scenario 4: Validate Upgrade Output

**Goal:** Verify upgrade deployment modified correct domains.

**Note:** See upgrade-specific validation section below.

---

## Upgrade Output Validation

Configuration upgrade outputs have a different, simpler structure than deployment outputs.

### Upgrade Output Schema

```typescript
interface GbpUpgradeOutput {
  network: string; // "local", "hedera-testnet", etc.
  timestamp: string; // ISO 8601
  deployer: string; // Deployer address
  blr: {
    address: string;
    isExternal: boolean;
  };
  domainResults: Array<{
    domain: string; // "factorySuite", "treasury", etc.
    success: boolean;
    version: number; // New version number
    configId: string; // Config ID (hex)
    facetsDeployed: number;
    proxiesUpdated: number;
    proxiesFailed: number;
    upgradeTime: number; // Milliseconds
    error?: string; // Only present if success=false
  }>;
  summary: {
    totalDomains: number;
    successfulUpgrades: number;
    failedUpgrades: number;
    totalFacetsDeployed: number;
    totalProxiesUpdated: number;
    totalProxiesFailed: number;
    totalUpgradeTime: number;
    allSuccess: boolean;
  };
}
```

### Upgrade Validation Commands

Set upgrade file path:

```bash
# Find latest upgrade file
export UPGRADE_FILE=$(find deployments -name "*gbpUpgrade-*.json" -type f | sort | tail -1)

# Or find in node_modules (current issue)
export UPGRADE_FILE=$(find node_modules -name "gbpUpgrade-*.json" -type f 2>/dev/null | head -1)
```

#### Quick Health Check

```bash
# One-liner upgrade health check
jq '{
  network: .network,
  allSuccess: .summary.allSuccess,
  successfulDomains: .summary.successfulUpgrades,
  failedDomains: .summary.failedUpgrades,
  totalFacets: .summary.totalFacetsDeployed,
  totalProxies: .summary.totalProxiesUpdated
}' "$UPGRADE_FILE"
```

**Expected Output (successful upgrade):**

```json
{
  "network": "local",
  "allSuccess": true,
  "successfulDomains": 4,
  "failedDomains": 0,
  "totalFacets": 6,
  "totalProxies": 2
}
```

#### Verify All Domains Upgraded

```bash
# Check success status for each domain
jq '.domainResults[] | "\(.domain): success=\(.success), version=\(.version)"' "$UPGRADE_FILE"
```

**Expected Output:**

```
"factorySuite: success=true, version=2"
"treasury: success=true, version=2"
"factoryPrimaryMarket: success=true, version=2"
"primaryMarket: success=true, version=2"
```

#### Check Configuration Versions

```bash
# Extract domain versions
jq '.domainResults[] | {domain, version, configId}' "$UPGRADE_FILE"
```

**Expected Output:**

```json
{
  "domain": "factorySuite",
  "version": 2,
  "configId": "0x0000000000000000000000000000000000000000000000000000000000007530"
}
{
  "domain": "treasury",
  "version": 2,
  "configId": "0x0000000000000000000000000000000000000000000000000000000000004e20"
}
...
```

#### Verify Facet Deployment Counts

```bash
# Count facets deployed per domain
jq '.domainResults[] | "\(.domain): \(.facetsDeployed) facets deployed"' "$UPGRADE_FILE"
```

**Expected Output:**

```
"factorySuite: 1 facets deployed"
"treasury: 3 facets deployed"
"factoryPrimaryMarket: 1 facets deployed"
"primaryMarket: 1 facets deployed"
```

#### Check Proxy Update Success

```bash
# Verify proxy updates per domain
jq '.domainResults[] | "\(.domain): \(.proxiesUpdated) updated, \(.proxiesFailed) failed"' "$UPGRADE_FILE"
```

**Expected Output:**

```
"factorySuite: 1 updated, 0 failed"
"treasury: 0 updated, 0 failed"
"factoryPrimaryMarket: 1 updated, 0 failed"
"primaryMarket: 0 updated, 0 failed"
```

#### Verify No Failed Upgrades

```bash
# Check for any failures
jq '.domainResults[] | select(.success == false)' "$UPGRADE_FILE"
```

**Expected Output:** Empty (no output if all succeeded)

#### Check Upgrade Timing

```bash
# Extract upgrade times per domain
jq '.domainResults[] | "\(.domain): \(.upgradeTime)ms"' "$UPGRADE_FILE"
```

**Example Output (local network):**

```
"factorySuite: 410ms"
"treasury: 312ms"
"factoryPrimaryMarket: 277ms"
"primaryMarket: 247ms"
```

#### Verify BLR Address Matches

```bash
# Compare BLR address in upgrade with original deployment
DEPLOY_BLR=$(jq -r '.callableContracts.businessLogicResolver.address' "$DEPLOYMENT_FILE")
UPGRADE_BLR=$(jq -r '.blr.address' "$UPGRADE_FILE")

if [ "$DEPLOY_BLR" == "$UPGRADE_BLR" ]; then
  echo "✅ BLR addresses match: $DEPLOY_BLR"
else
  echo "❌ BLR address mismatch!"
  echo "  Deployment: $DEPLOY_BLR"
  echo "  Upgrade:    $UPGRADE_BLR"
fi
```

#### Aggregate Summary Validation

```bash
# Check overall upgrade summary
jq '.summary' "$UPGRADE_FILE"
```

**Expected Output (successful upgrade):**

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

### Upgrade Success Criteria

**All criteria must be met:**

- [ ] `summary.allSuccess == true`
- [ ] `summary.failedUpgrades == 0`
- [ ] `summary.successfulUpgrades == totalDomains`
- [ ] All `domainResults[].success == true`
- [ ] All configuration versions incremented (e.g., v1 → v2)
- [ ] Expected facet counts: FactorySuite=1, Treasury=3, FactoryPM=1, PM=1
- [ ] `summary.totalFacetsDeployed == 6`
- [ ] `summary.totalProxiesUpdated == 2` (FactorySuite + FactoryPM)
- [ ] `summary.totalProxiesFailed == 0`
- [ ] BLR address matches original deployment

### Compare Deployment vs Upgrade Outputs

```bash
# Compare configuration versions between deployment and upgrade
echo "Deployment versions:"
jq '.result | {
  factorySuite: .factorySuiteDeployment.configuration.version,
  treasury: .treasuryDeployment.configuration.version
}' "$DEPLOYMENT_FILE"

echo -e "\nUpgrade versions:"
jq '.domainResults | map({(.domain): .version}) | add' "$UPGRADE_FILE"
```

**Expected:** Upgrade versions should be 1 higher than deployment versions.

---

## Notes

- All validation commands use `jq` (JSON processor) - install via `brew install jq` (macOS) or `apt install jq` (Linux)
- Set `$DEPLOYMENT_FILE` and `$UPGRADE_FILE` environment variables before running commands for convenience
- For programmatic validation, consider wrapping these commands in a shell script or TypeScript validation utility
- Deployment outputs are ~44KB with 1000+ lines; upgrade outputs are ~1.6KB with minimal structure
- Expected values are based on initial deployment (v1) and first upgrade (v2); subsequent upgrades will have higher version numbers
