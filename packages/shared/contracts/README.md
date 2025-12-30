# Green Bonds Platform - Shared Infrastructure Contracts

Multi-Module Infrastructure Orchestration for the Green Bonds Platform. This package provides a high-level workflow that orchestrates the deployment of complete GBP infrastructure using proven ATS deployment workflows.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [Complete Infrastructure Deployment](#complete-infrastructure-deployment)
  - [Standalone Deployment](#standalone-deployment)
  - [Local Network Deployment](#local-network-deployment)
- [Deployment Result](#deployment-result)
- [Upgrades](#upgrades)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites)
  - [Upgrade Commands](#upgrade-commands)
  - [Configuration](#configuration)
  - [Upgrade Result](#upgrade-result)
  - [Recovery from Failures](#recovery-from-failures)
  - [Troubleshooting](#troubleshooting)
- [Implementation Details](#implementation-details)
- [Development](#development)
- [Related Documentation](#related-documentation)

## Overview

This package implements **Phase 1** of the Multi-Module Infrastructure Orchestration, focusing on:

✅ **Step 1-2**: Deploy ProxyAdmin + BLR with TUP
✅ **Step 3**: Deploy BOND configuration (via ATS `deployWithExistingBlr` workflow)

- Deploys ALL BOND facets (including AccessControl, Pause)
- Registers facets in BLR
- Creates BOND configuration (config ID: 2)
- Deploys ATS Factory

✅ **Step 4**: Deploy FactorySuite (via GBP ATS `deployFactorySuiteWithExistingInfra` workflow)

- Deploys FactorySuite facet
- Registers facet in BLR
- Creates FactorySuite configuration (config ID: 30000)
- Reuses AccessControl and Pause facets from BOND deployment

## Architecture

### Workflow-Based Orchestration Strategy

This package follows a **workflow composition** approach:

1. Uses proven, battle-tested workflows from ATS packages
2. Delegates complexity to specialized workflows
3. Focuses orchestration on high-level coordination
4. Minimizes code duplication and maintenance burden

### Deployment Flow

```
┌──────────────────────────────────────────────┐
│ deployGbpInfrastructure()                    │
│ (Orchestration Layer)                        │
└──────────────┬───────────────────────────────┘
               │
               ├─► Step 1: deployProxyAdmin()
               │   (ATS Infrastructure)
               │
               ├─► Step 2: deployBlr()
               │   (ATS Infrastructure)
               │
               ├─► Step 3: deployWithExistingBlr()
               │   (ATS Workflow)
               │   ├─ Deploy BOND facets
               │   ├─ Register facets in BLR
               │   ├─ Create BOND configuration
               │   └─ Deploy ATS Factory
               │
               └─► Step 4: deployFactorySuiteWithExistingInfra()
                   (GBP ATS Workflow)
                   ├─ Deploy FactorySuite facet
                   ├─ Register facet in BLR
                   ├─ Create FactorySuite configuration
                   └─ Deploy FactorySuite ResolverProxy
```

### Configuration ID Allocation

| Domain         | Range         | Config IDs                     |
| -------------- | ------------- | ------------------------------ |
| ATS            | 1-9,999       | BOND (2), EQUITY (1)           |
| Primary Market | 10,000-19,999 | PM_FACTORY (10000), PM (10001) |
| Treasury       | 20,000-29,999 | TREASURY (20000)               |
| FactorySuite   | 30,000-39,999 | FACTORY_SUITE (30000)          |

## Installation

This package is part of the GBP monorepo and should be installed via the workspace:

```bash
npm ci  # Install all workspace dependencies
```

## Usage

### Complete Infrastructure Deployment

Deploy the complete GBP infrastructure with a single function call:

```typescript
import { ethers } from "ethers";
import { deployGbpInfrastructure } from "@hashgraph/green-bonds-platform-shared-contracts/scripts";

// Setup signer
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Deploy infrastructure
const result = await deployGbpInfrastructure(signer, {
  useTimeTravel: false,
  network: "testnet",
  verbose: true,
});

// Access deployment result
console.log("Infrastructure deployed:");
console.log("  ProxyAdmin:", result.proxyAdmin);
console.log("  BLR:", result.blr);
console.log("  BOND config version:", result.bondDeployment.configurations.bond.version);
console.log("  FactorySuite config version:", result.factorySuiteDeployment.configuration.version);
```

### Deployment Options

```typescript
interface DeploymentOptions {
  /** Enable time-travel mode for testing */
  useTimeTravel?: boolean;

  /** Network name (testnet, mainnet, etc.) */
  network?: string;

  /** Verbose logging output */
  verbose?: boolean;
}
```

### Standalone Deployment

Deploy the complete GBP infrastructure to Hedera networks without Hardhat:

#### Setup

1. **Copy environment template**:

   ```bash
   cp .env.sample .env
   ```

2. **Configure environment variables**:

   ```bash
   # .env
   NETWORK=hedera-testnet
   PRIVATE_KEY_HEDERA_TESTNET=0xYourPrivateKeyHere
   ```

3. **Build the package**:
   ```bash
   npm run build
   ```

#### Deploy

**Using npm script** (recommended):

```bash
npm run deploy
```

**Using ts-node directly**:

```bash
npx ts-node -r tsconfig-paths/register scripts/cli/standalone.ts --network hedera-testnet
```

**Direct execution** (after chmod +x):

```bash
./scripts/cli/standalone.ts --network hedera-testnet
```

#### Configuration

| Environment Variable         | Required | Default          | Description                    |
| ---------------------------- | -------- | ---------------- | ------------------------------ |
| `NETWORK`                    | No       | `hedera-testnet` | Target network                 |
| `PRIVATE_KEY_HEDERA_TESTNET` | Yes\*    | -                | Testnet private key            |
| `PRIVATE_KEY_HEDERA_MAINNET` | Yes\*    | -                | Mainnet private key            |
| `USE_TIME_TRAVEL`            | No       | `false`          | Enable time-travel for testing |
| `VERBOSE`                    | No       | `false`          | Enable verbose logging         |

\*Required for the corresponding network

#### Output

Deployment results are saved to `deployment-result-{network}-{timestamp}.json`:

```json
{
  "timestamp": "2025-01-05T10:30:00.000Z",
  "network": "hedera-testnet",
  "result": {
    "proxyAdmin": "0x...",
    "blr": "0x...",
    "bondDeployment": { ... },
    "factorySuiteDeployment": { ... }
  }
}
```

#### Troubleshooting

**Private key not found**:

```bash
# Ensure environment variable is set correctly
echo $PRIVATE_KEY_HEDERA_TESTNET

# Variable name format: PRIVATE_KEY_{NETWORK_UPPERCASE}
# Example: PRIVATE_KEY_HEDERA_TESTNET, PRIVATE_KEY_HEDERA_MAINNET
```

**Network not found**:
Check supported networks: `hedera-testnet`, `hedera-mainnet`

**Build errors**:

```bash
# Clean and rebuild
npm run clean:build
npm run build
```

### Local Network Deployment

Deploy to a local Ethereum node for fast local development and testing. Works with Hardhat, Anvil (Foundry), Ganache, or any local node running on `http://127.0.0.1:8545`.

#### Prerequisites

Choose your local node tool (Hardhat already included as devDependency):

```bash
npm ci  # Hardhat already installed
# OR
forge install  # If using Anvil/Foundry
```

#### Option 1: Manual (Recommended)

Run local node in one terminal, deploy in another:

**Terminal 1 - Start Local Node**:

Using Hardhat:

```bash
npm run local:hardhat
```

Or using Anvil:

```bash
anvil
```

This starts a local network with:

- 20 pre-funded accounts (10,000 ETH each)
- Instant mining
- Chain ID: 31337
- Detailed transaction logs

**Terminal 2 - Deploy**:

```bash
npm run deploy:local
```

#### Option 2: Automated

Single command that starts node, deploys, and cleans up:

```bash
npm run deploy:local:auto
```

**Note**: This runs the node in background and logs to `hardhat-node.log`. Less visible but convenient for quick tests.

#### Configuration

The local network uses default test account #0 (already configured in `.env.sample`):

```bash
# .env
LOCAL_PRIVATE_KEY_0=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Advantages

- **Fast**: Instant transaction mining
- **Free**: No gas fees or testnet faucets needed
- **Deterministic**: Same accounts and state every restart
- **Debug-Friendly**: Detailed error messages and stack traces
- **Isolated**: No external dependencies

#### Example Output

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...

🚀 Green Bonds Platform - Infrastructure Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target network: local
Chain ID: 31337

[Deployment proceeds...]
```

#### When to Use

- **Local Development**: Rapid iteration without testnet delays
- **Testing**: Test deployment scripts before running on testnet
- **CI/CD**: Automated deployment testing in pipelines
- **Debugging**: Investigate deployment issues with full visibility

#### Comparison

| Feature | Local      | Hedera Testnet   |
| ------- | ---------- | ---------------- |
| Speed   | Instant    | ~3-6 seconds/tx  |
| Cost    | Free       | Requires HBAR    |
| Setup   | Local only | Requires account |
| State   | Ephemeral  | Persistent       |
| Network | Isolated   | Public           |

## Deployment Result

The `deployGbpInfrastructure` function returns a comprehensive result object:

```typescript
interface DeploymentResult {
  /** ProxyAdmin contract address */
  proxyAdmin: string;

  /** BusinessLogicResolver (BLR) proxy address */
  blr: string;

  /** BOND deployment result (from ATS workflow) */
  bondDeployment: DeploymentWithExistingBlrOutput;

  /** FactorySuite deployment result (from GBP ATS workflow) */
  factorySuiteDeployment: DeployFactorySuiteOutput;
}
```

### bondDeployment Structure

From `deployWithExistingBlr` workflow:

```typescript
{
  infrastructure: {
    proxyAdmin: { address, contractId? }
    blr: { implementation, proxy, contractId?, isExternal }
    factory: { implementation, proxy, contractId? }
  },
  facets: [{ name, address, contractId?, key }],
  configurations: {
    equity: { configId, version, facetCount, facets },
    bond: { configId, version, facetCount, facets }
  },
  summary: { totalContracts, totalFacets, totalConfigurations, success }
}
```

### factorySuiteDeployment Structure

From `deployFactorySuiteWithExistingInfra` workflow:

```typescript
{
  infrastructure: {
    proxyAdmin: { address }
    blr: { implementation, proxy }
    factorySuite: { implementation, proxy }
  },
  facets: [{ name, address, key }],
  configuration: { configId, version, facetCount, facets },
  summary: { totalContracts, totalFacets, success }
}
```

## Understanding Deployment vs Instance Creation

### What Fresh Deployment Creates

When you run `deployGbpInfrastructure`, the system creates shared infrastructure and factory contracts, but **NOT** individual domain instances.

**Infrastructure (shared across all domains):**
- ✅ BusinessLogicResolver (BLR) proxy - Configuration registry
- ✅ ProxyAdmin - Upgrade management
- ✅ Shared facets - AccessControl, Pause, Diamond (reused by all domains)

**Configurations in BLR (metadata only, not deployed proxies):**
- ✅ FactorySuite configuration (Config ID 30000) - Template for FactorySuite proxies
- ✅ FactoryPrimaryMarket configuration (Config ID 10000) - Template for Factory proxies
- ✅ PrimaryMarket configuration (Config ID 10001) - Template for PM instances
- ✅ Treasury configuration (Config ID 20000) - Template for Treasury instances

**Factory Proxies (deployed and immediately usable):**
- ✅ FactorySuite ResolverProxy - Uses Config 30000, can deploy Bond+Treasury+KPI suites
- ✅ FactoryPrimaryMarket ResolverProxy - Uses Config 10000, can deploy PM instances

### What Fresh Deployment Does NOT Create

**Instance Proxies (created later on-demand):**
- ❌ **PrimaryMarket instance proxies** - Created by calling `FactoryPrimaryMarket.deployPrimaryMarket()`
- ❌ **Treasury instance proxies** - Created by calling `FactorySuite.deployBondSuite()` or similar deployment function
- ❌ **Bond instance proxies** - Created by calling `BondFactory.deployBond()` or `FactorySuite.deployBondSuite()`

### Why This Design?

**Separation of concerns:**
- **Factories** are deployed once and create instances on-demand
- **Instances** are created per business entity (one Treasury per bond, one PM per offering)
- This allows unlimited instances without redeploying infrastructure

**Configurations are templates:**
- Config ID 10001 (PrimaryMarket) defines which facets a PrimaryMarket instance will use
- Config ID 20000 (Treasury) defines which facets a Treasury instance will use
- BLR stores these templates, factories reference them when deploying instances

**Factory vs Instance:**
```
FactoryPrimaryMarket (Config 10000)   FactorySuite (Config 30000)
        ↓ deploys                              ↓ deploys
PrimaryMarket instances (Config 10001)   Bond + Treasury + KPI instances
   Instance #1                              Suite #1 (3 contracts)
   Instance #2                              Suite #2 (3 contracts)
   Instance #3                              Suite #3 (3 contracts)
   ...                                      ...
```

### Deployment Output Explained

**What you'll see in deployment JSON:**
```json
{
  "proxyAdmin": "0x...",              // Shared infrastructure
  "blr": "0x...",                     // Configuration registry

  "bondDeployment": {
    "infrastructure": {
      "factory": {
        "proxy": "0x..."              // Bond factory (deployed)
      }
    },
    "configurations": {
      "bond": {                       // Config metadata in BLR
        "configId": 2,
        "version": 1
      }
    }
  },

  "factorySuiteDeployment": {
    "infrastructure": {
      "factorySuite": {
        "proxy": "0x..."              // FactorySuite factory (deployed)
      }
    },
    "configuration": {                // Config metadata in BLR
      "configId": 30000,
      "version": 1
    }
  },

  "primaryMarketDeployment": {
    "infrastructure": {
      "factoryPrimaryMarket": {
        "proxy": "0x..."              // PM factory (deployed)
      }
    },
    "configurations": {
      "factoryPrimaryMarket": {       // Config 10000 (metadata)
        "configId": 10000,
        "version": 1
      },
      "primaryMarket": {              // Config 10001 (metadata)
        "configId": 10001,
        "version": 1
      }
    }
  },

  "treasuryDeployment": {
    "configurations": {
      "treasury": {                   // Config 20000 (metadata)
        "configId": 20000,
        "version": 1
      }
    }
  }
}
```

**What you WON'T see (and why):**
- ❌ No `primaryMarket.infrastructure.proxy` - PM instances created later by factory
- ❌ No `treasury.infrastructure.proxy` - Treasury instances created later by FactorySuite
- ❌ No `bond.infrastructure.proxy` entries - Bond instances created later by factory

### How to Create Instances After Deployment

**Create a PrimaryMarket instance:**
```typescript
// Connect to deployed factory
const factoryPM = FactoryPrimaryMarket__factory.connect(
  deploymentResult.primaryMarketDeployment.infrastructure.factoryPrimaryMarket.proxy,
  signer
);

// Deploy new PM instance using Config 10001
const tx = await factoryPM.deployPrimaryMarket(
  assetAddress,
  10001,  // Config ID for PrimaryMarket instances
  1       // Version
);

// New PrimaryMarket proxy created at tx.events.ProxyDeployed.proxyAddress
```

**Create a Bond+Treasury+KPI suite:**
```typescript
// Connect to deployed FactorySuite
const factorySuite = FactorySuiteFacet__factory.connect(
  deploymentResult.factorySuiteDeployment.infrastructure.factorySuite.proxy,
  signer
);

// Deploy complete suite (3 contracts atomically)
const tx = await factorySuite.deployBondSuite(
  bondData,
  regulationData,
  treasuryData,
  kpiData
);

// New Bond, Treasury, and KPI proxies created
```

### Architecture After Fresh Deployment

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  ├─ ProxyAdmin                   │
│  ├─ BLR Proxy ✅                 │
│  └─ Shared Facets ✅             │
└──────────────┬───────────────────┘
               │
               ├─► FactorySuite Proxy ✅ (Config 30000)
               │   └─ Can deploy: Bond + Treasury + KPI instances
               │
               ├─► FactoryPrimaryMarket Proxy ✅ (Config 10000)
               │   └─ Can deploy: PrimaryMarket instances
               │
               └─► BLR contains templates:
                   ├─ PrimaryMarket Config (10001) ✅
                   └─ Treasury Config (20000) ✅

❌ NO PrimaryMarket instances yet
❌ NO Treasury instances yet
❌ NO Bond instances yet
```

### Architecture After Creating Instances

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  (same as above)                 │
└──────────────┬───────────────────┘
               │
               ├─► FactorySuite Proxy ✅
               │   ├─ Bond #1 ✅
               │   ├─ Treasury #1 ✅ (for Bond #1)
               │   ├─ KPI #1 ✅ (for Bond #1)
               │   ├─ Bond #2 ✅
               │   ├─ Treasury #2 ✅ (for Bond #2)
               │   └─ KPI #2 ✅ (for Bond #2)
               │
               └─► FactoryPrimaryMarket Proxy ✅
                   ├─ PrimaryMarket #1 ✅ (for Bond #1 offering)
                   ├─ PrimaryMarket #2 ✅ (for Bond #2 offering)
                   └─ PrimaryMarket #3 ✅ (for Bond #1 secondary sale)
```

### Key Takeaways

1. **Deployment creates factories, not instances** - Factories are tools to create instances on-demand
2. **Configurations are templates** - Stored in BLR, referenced when creating instances
3. **Multiple instances share same config** - All PrimaryMarket instances use Config 10001, all Treasury instances use Config 20000
4. **Missing proxies in deployment output is correct** - Instance proxies created later via factory calls

## Upgrades

### Overview

The GBP infrastructure orchestrator provides a unified upgrade workflow that upgrades all four domain configurations in a single operation.

**What Gets Upgraded:**
- FactorySuite (Config ID 30000)
- Treasury (Config ID 20000)
- FactoryPrimaryMarket (Config ID 10000)
- PrimaryMarket (Config ID 10001)

**Execution Strategy:**
- Sequential execution (one domain at a time)
- Fail-continue (one failed domain doesn't block others)
- Optional selective upgrades (specific domains only)

### Upgrade Mechanics

**Important**: Each domain upgrade deploys ALL domain-specific facets unconditionally, regardless of whether code changed.

**What happens during each domain upgrade:**
1. Deploys complete set of domain facets (no change detection)
2. Registers all facets in BLR with overwrite enabled
3. Creates new configuration version for that domain
4. Does NOT optimize or skip unchanged facets

**Gas Cost**: Full facet deployment per domain every upgrade (no change detection optimization)

**Why this approach?**
- Simplicity: No complex bytecode comparison logic
- Safety: Each version is self-contained
- Consistency: Predictable behavior across all upgrades
- Trade-off: Higher gas cost for simplicity and reliability

### Multi-Domain Upgrade Behavior

**Sequential execution:**
- Domains upgrade one at a time (not parallel)
- Each domain deploys its complete facet set
- No cross-domain change detection
- Fail-continue error handling (one failure doesn't block others)

**Example - If only Treasury code changed:**
The orchestrated upgrade will:
1. Deploy FactorySuiteFacet (even though unchanged)
2. Deploy all 3 Treasury facets (including the changed one)
3. Deploy both Primary Market configurations (even though unchanged)
4. Create new versions for all 4 configurations

**Why no selective deployment?**
- Simplicity: No dependency analysis required
- Consistency: All configurations at same version number
- Safety: Avoids version mismatch issues
- Trade-off: Higher gas cost for operational simplicity

### Prerequisites

1. **Deployed infrastructure** - BLR proxy address from deployment
2. **Private key** - Configured for target network
3. **Domain packages built** - All contract packages must be built

### Upgrade Commands

#### All Domains

**Using npm scripts:**
```bash
cd packages/shared/contracts
npm run upgrade:hedera:testnet -- --blr-address=0x123...
```

**Note:** This deploys all facets for all 4 domains and creates new configuration versions, even if no code changed.

**From repository root:**
```bash
npm run shared:contracts:upgrade:hedera:testnet -- --blr-address=0x123...
```

#### Selective Domains

Upgrade only specific domains:
```bash
npm run upgrade -- --blr-address=0x123... --domains=treasury,primaryMarket
```

#### With Proxy Updates

Update proxies across multiple domains:
```bash
npm run upgrade -- --blr-address=0x123... \
  --factorysuite-proxies=0xabc,0xdef \
  --treasury-proxies=0x111,0x222
```

### Configuration

**Environment Variables:**
```bash
# .env
BLR_ADDRESS=0x1234567890abcdef...
NETWORK=hedera-testnet
USE_TIME_TRAVEL=false
VERBOSE=false

# Optional: Proxy addresses for batch updates
FACTORYSUITE_PROXIES=0xabc,0xdef
TREASURY_PROXIES=0x111,0x222
FACTORYPRIMARYMARKET_PROXIES=0x333
PRIMARYMARKET_PROXIES=0x444,0x555
```

### Upgrade Result

Upgrades save results to `deployments/{network}/{network}-gbp-upgrade-{timestamp}.json`:

```json
{
  "network": "hedera-testnet",
  "timestamp": "2025-12-23T14:30:45.123Z",
  "deployer": "0x...",
  "blr": {
    "address": "0x...",
    "isExternal": true
  },
  "domainResults": [
    {
      "domain": "factorySuite",
      "success": true,
      "configId": "30000",
      "version": 2,
      "facetsDeployed": 1,
      "proxiesUpdated": 2,
      "upgradeTime": 180000
    }
  ],
  "summary": {
    "totalDomains": 4,
    "successfulUpgrades": 4,
    "failedUpgrades": 0,
    "totalFacetsDeployed": 5,
    "totalProxiesUpdated": 6,
    "totalUpgradeTime": 680000,
    "allSuccess": true
  }
}
```

### Understanding Facet Deployment

**Domain-Specific Facets:**
- Always deployed during upgrades
- Hardcoded list in upgrade script for each domain
- No change detection mechanism

**Shared Facets:**
- Deployed once during initial infrastructure setup
- Reused across all domain configurations
- NOT redeployed during domain-specific upgrades
- Referenced by address in BLR

**Configuration Versioning:**
- Each upgrade creates a new version (v1→v2→v3...)
- Old versions remain in BLR (unchanged)
- Proxies must explicitly switch to new versions
- No automatic migration of existing proxies

### Recovery from Failures

If a domain upgrade fails:

1. **Review the error** in console output
2. **Fix the issue** (permissions, gas, etc.)
3. **Retry only the failed domain:**
   ```bash
   npm run upgrade -- --blr-address=0x123... --domains=treasury
   ```

### Troubleshooting

**"BLR validation failed":**
- Verify BLR address is correct
- Ensure BLR is deployed and accessible
- Check network is correct

**"Insufficient permissions":**
- Deployer must have permission to register facets in BLR
- For production, ensure proper role assignments

**"Gas limit exceeded":**
- Large facets may need custom gas limits
- Consider splitting into multiple smaller facets

**"Proxy update failed":**
- Verify proxy addresses are correct
- Ensure proxies use the ResolverProxy pattern
- Check proxy admin permissions

**"Domain upgrade failed":**
- Check domain-specific error message
- Review deployment logs for stack traces
- Verify network connectivity and RPC endpoints

## Implementation Details

### Workflow Composition Pattern

Instead of implementing low-level operations, this orchestration:

1. **Delegates to proven workflows**: Uses existing, tested deployment workflows
2. **Focuses on coordination**: Connects workflows in the correct order
3. **Handles inter-workflow data**: Passes shared facet addresses between workflows
4. **Provides unified logging**: Coordinates logging from multiple workflows

### Shared Facet Reuse

The FactorySuite configuration reuses AccessControl and Pause facets:

1. **Step 3** deploys BOND facets (including AccessControl, Pause)
2. BOND facets registered in BLR → **shared facets now available**
3. **Step 4** extracts shared facet addresses from Step 3 result
4. FactorySuite configuration references existing shared facets
5. Only FactorySuite-specific facets are deployed in Step 4

This prevents duplicate deployments and ensures consistency.

### Error Handling

The orchestration uses simple error handling:

- Checks `success` flags from workflows
- Throws descriptive errors on failure
- Provides clear error context in logs

## Development

### Building

```bash
cd packages/shared/contracts
npm run build
```

This compiles TypeScript and generates type definitions in `build/`.

### Cleaning

```bash
npm run clean         # Remove build artifacts and node_modules
npm run clean:build   # Remove only build artifacts
```

### Code Quality

```bash
npm run lint          # Lint TypeScript code
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## Related Documentation

- **ADR**: [Multi-Module Infrastructure Orchestration](https://iobuilders.atlassian.net/wiki/spaces/EVRCT/pages/4428103749/Multi-Module+Infrastructure+Orchestration+for+Green+Bonds+Platform)
- **ATS Contracts**: `@hashgraph/asset-tokenization-contracts`
- **GBP ATS Contracts**: `@hashgraph/green-bonds-platform-ats-contracts`
- **Project CLAUDE.md**: `/CLAUDE.md` (project-level guidance)

---

**Package**: `@hashgraph/green-bonds-platform-shared-contracts`
**Version**: 1.0.0
**License**: Apache-2.0
