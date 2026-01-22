# Treasury Smart Contracts

Per-bond financial asset management with lifecycle obligations and environmental asset handling for the Evercity green bonds platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Architecture](#architecture)
  - [Diamond Pattern](#diamond-pattern)
  - [Facets](#facets)
  - [Roles & Permissions](#roles--permissions)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deployment Commands](#deployment-commands)
  - [Environment Configuration](#environment-configuration)
- [Upgrades](#upgrades)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites-1)
  - [Upgrade Commands](#upgrade-commands)
  - [Upgrade Output](#upgrade-output)
  - [Troubleshooting Upgrades](#troubleshooting-upgrades)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Coverage](#coverage)
- [Development Commands](#development-commands)
- [Configuration Reference](#configuration-reference)
  - [Config ID](#config-id)
  - [Role Constants](#role-constants)

## Quick Start

```bash
# Install dependencies
npm ci

# Compile contracts
npm run compile

# Run tests
npm run test

# Check coverage
npm run coverage
```

## Overview

This package provides smart contracts for the Treasury domain within the Evercity green bonds platform:

- **Treasury Contract**: Per-bond financial asset management with lifecycle cash flow operations
- **Portfolio Management**: ERC20 payment tokens and ERC721 environmental assets
- **Proceeds Management**: Project fund allocations and beneficiary transfers
- **Lifecycle Cash Flow**: Coupon distributions and bond redemptions

### Key Features

- **Push-Mode Execution**: Issuer-confirmed lifecycle operations
- **Multi-Asset Support**: ERC20 (payment tokens) and ERC721 (environmental assets)
- **Date-Based Constraints**: Execution windows for coupon and redemption events
- **Diamond Pattern**: Upgradeable architecture using EIP-2535
- **Role-Based Access**: Granular permissions for treasury operations

## Architecture

### Diamond Pattern

Treasury uses the Diamond Pattern (EIP-2535) for upgradeability via shared infrastructure:

```
┌─────────────────────────────────┐
│  Treasury Diamond Proxy         │
│  Config ID: 20'000              │
│                                 │
│  Facets:                        │
│  ├─ AccessControlFacet (shared) │
│  ├─ PauseFacet (shared)        │
│  ├─ DiamondFacet (shared)      │
│  ├─ LifeCycleCashFlowFacet     │
│  ├─ PortfolioFacet             │
│  └─ ProceedsManagementFacet    │
└─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  BusinessLogicResolver (BLR)  │
│  Shared across all domains    │
└──────────────────────────────┘
```

### Facets

**Shared Facets** (from ATS infrastructure):

- **AccessControlFacet**: Role-based permissions
- **PauseFacet**: Emergency pause functionality
- **DiamondFacet**: Diamond inspection and management

**Treasury-Specific Facets**:

- **LifeCycleCashFlowFacet**: Coupon distributions and bond redemptions
- **PortfolioFacet**: ERC721 environmental asset transfers
- **ProceedsManagementFacet**: Project fund allocations to beneficiaries

### Roles & Permissions

| Role                    | Description            | Permissions                                  |
| ----------------------- | ---------------------- | -------------------------------------------- |
| `DEFAULT_ADMIN_ROLE`    | Treasury administrator | Grant/revoke roles, configure settings       |
| `PAYOUT_ROLE`           | Lifecycle executor     | Execute coupon distributions and redemptions |
| `CASHOUT_ROLE`          | Beneficiary transfer   | Transfer funds to project beneficiaries      |
| `PORTFOLIO_MANAGER`     | Environmental assets   | Transfer ERC721 carbon credits and forwards  |
| `PROCEEDS_FULL_MANAGER` | Full proceeds control  | Allocate funds and transfer to beneficiaries |
| `FUNDS_MANAGER`         | Fund allocation        | Allocate project funds to beneficiaries      |

## Deployment

### Prerequisites

1. **BLR Infrastructure** - Deployed BusinessLogicResolver proxy
2. **Private Key** - Configured for target network
3. **Network Access** - RPC endpoint for Hedera testnet/mainnet

### Deployment Commands

**From package directory:**

```bash
cd packages/treasury/contracts
npm run deploy -- --blr-address=0x123...
```

**Environment Variables:**

```bash
# .env
BLR_ADDRESS=0x1234567890abcdef...
NETWORK=hedera-testnet
```

Then run:

```bash
npm run deploy
```

### Environment Configuration

Create a `.env` file from `.env.sample`:

```bash
cp .env.sample .env
```

Required variables:

- `NETWORK` - Target network (local, hedera-testnet, hedera-mainnet)
- `HEDERA_TESTNET_PRIVATE_KEY_0` - Deployer private key
- `BLR_ADDRESS` - BusinessLogicResolver proxy address

## Understanding Deployment vs Instance Creation

### What Fresh Deployment Creates

Treasury contracts use a **configuration-only pattern**: the deployment creates the configuration template, but no Treasury instance proxies.

**Infrastructure (shared from platform deployment):**

- ✅ BusinessLogicResolver (BLR) proxy - Already deployed
- ✅ ProxyAdmin - Already deployed
- ✅ Shared facets - AccessControl, Pause, Diamond (already deployed)

**Configuration in BLR (metadata only, not deployed proxy):**

- ✅ **Treasury configuration (Config ID 20000)** - Template for Treasury instances

**Treasury-Specific Facets (deployed implementations):**

- ✅ LifeCycleCashFlowFacet - Coupon and redemption logic
- ✅ PortfolioFacet - Environmental asset management
- ✅ ProceedsManagementFacet - Fund allocation logic

### What Fresh Deployment Does NOT Create

**Instance Proxies (created later on-demand):**

- ❌ **Treasury instance proxies** - Created by calling `FactorySuite.deployBondSuite()` or similar deployment function

### Why This Design?

**One Treasury per bond:**

- Treasury instances are created per bond (one Treasury manages one bond's finances)
- Each bond gets its own dedicated Treasury proxy
- All instances share the same configuration (Config 20000) but have separate storage

**Treasury instances are created with bonds:**

- Typically created via `FactorySuite.deployBondSuite()` which atomically deploys Bond + Treasury + KPI
- Can also be created standalone via a Treasury deployment function
- Each instance is independent but follows the same template

**Configuration defines behavior:**

```
Config 20000 (Treasury)
    ├─ Defines Treasury behavior for all instances
    ├─ AccessControlFacet (shared)
    ├─ PauseFacet (shared)
    ├─ DiamondFacet (shared)
    ├─ LifeCycleCashFlowFacet (coupon & redemption)
    ├─ PortfolioFacet (environmental assets)
    └─ ProceedsManagementFacet (fund allocation)
```

**Factory creates instances on-demand:**

```
FactorySuite Proxy (Config 30000)
        ↓ deploys (atomically)
Bond + Treasury + KPI suite
   Suite #1 → Bond A + Treasury A + KPI A
   Suite #2 → Bond B + Treasury B + KPI B
   Suite #3 → Bond C + Treasury C + KPI C
   ...

All Treasury instances use Config 20000
```

### Deployment Output Explained

**What you'll see in deployment JSON:**

```json
{
  "infrastructure": {
    "blr": {
      "proxy": "0x..."              // BLR (shared infrastructure)
    }
  },
  "configurations": {
    "treasury": {                   // Config 20000 (metadata in BLR)
      "configId": 20000,
      "version": 1,
      "facetKeys": [...]
    }
  },
  "facets": [
    { "name": "LifeCycleCashFlowFacet", "address": "0x..." },
    { "name": "PortfolioFacet", "address": "0x..." },
    { "name": "ProceedsManagementFacet", "address": "0x..." }
  ]
}
```

**What you WON'T see (and why):**

- ❌ No `treasury.infrastructure.proxy` field
- ❌ No instance proxy addresses in deployment output
- **Reason:** Treasury instances don't exist yet - they're created later when bonds are deployed

**This is correct behavior, not an error!** The deployment creates:

1. Treasury configuration template (Config 20000)
2. Treasury facet implementations (LifeCycleCashFlow, Portfolio, ProceedsManagement)
3. Registration in BLR for factory usage

Instance proxies (using Config 20000) are created on-demand when bonds are deployed.

### How to Create Treasury Instances

**Method 1: Via FactorySuite (recommended - atomic deployment):**

```typescript
import { FactorySuiteFacet__factory } from "@hashgraph/ats-contracts";

// Connect to deployed FactorySuite
const factorySuite = FactorySuiteFacet__factory.connect(factorySuiteProxyAddress, signer);

// Deploy complete suite (Bond + Treasury + KPI atomically)
const tx = await factorySuite.deployBondSuite(
  bondData, // Bond configuration
  regulationData, // Regulation settings
  treasuryData, // Treasury configuration
  kpiData, // KPI oracle configuration
);

await tx.wait();

// Extract addresses from events
const event = tx.events?.find((e) => e.event === "BondSuiteDeployed");
const bondProxy = event?.args?.bondAddress;
const treasuryProxy = event?.args?.treasuryAddress;
const kpiProxy = event?.args?.kpiAddress;

console.log("New Treasury instance:", treasuryProxy);
```

**Method 2: Standalone Treasury deployment (if needed):**

```typescript
// Note: Standalone deployment function depends on your implementation
// Typically Treasury is deployed as part of a Bond suite
const tx = await deployTreasuryStandalone({
  blrAddress,
  configId: 20000,
  version: 1,
  bondAddress, // Associated bond
  // ... other params
});
```

**Each instance is independent:**

```typescript
// Suite #1 for Green Bond A
const suite1 = await factorySuite.deployBondSuite(bondDataA, ...);
// Creates: Bond A + Treasury A + KPI A

// Suite #2 for Green Bond B
const suite2 = await factorySuite.deployBondSuite(bondDataB, ...);
// Creates: Bond B + Treasury B + KPI B

// All Treasury instances use Config 20000 but manage separate bonds
```

### Architecture After Fresh Deployment

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  ├─ BLR Proxy ✅                 │
│  ├─ ProxyAdmin ✅                │
│  └─ Shared Facets ✅             │
└──────────────┬───────────────────┘
               │
               ├─► FactorySuite Proxy ✅ (Config 30000)
               │   └─ Can deploy: Bond + Treasury + KPI suites
               │
               └─► BLR contains template:
                   └─ Treasury Config (20000) ✅

❌ NO Treasury instances yet
```

### Architecture After Creating Instances

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  (same as above)                 │
└──────────────┬───────────────────┘
               │
               ├─► FactorySuite Proxy ✅ (Config 30000)
               │   │
               │   ├─► Bond A ✅ + Treasury A ✅ + KPI A ✅
               │   │   └─ Treasury A manages Bond A's finances
               │   │
               │   ├─► Bond B ✅ + Treasury B ✅ + KPI B ✅
               │   │   └─ Treasury B manages Bond B's finances
               │   │
               │   └─► Bond C ✅ + Treasury C ✅ + KPI C ✅
               │       └─ Treasury C manages Bond C's finances
               │
               └─► BLR contains template:
                   └─ All Treasury instances use Config 20000
```

### Key Takeaways

1. **Configuration only, no factory** - Treasury doesn't have a dedicated factory (FactorySuite handles deployment)
2. **One Treasury per bond** - Each bond gets its own Treasury instance for financial management
3. **Missing instance proxies in deployment = correct** - This is by design, not an error
4. **Atomic deployment with FactorySuite** - Treasury instances created alongside Bond and KPI
5. **All instances share same configuration** - Config 20000 defines behavior, but storage is separate per bond

## Upgrades

### Overview

Configuration upgrades allow you to deploy new facet implementations and create new configuration versions without redeploying shared infrastructure (BLR, ProxyAdmin).

**What Upgrades Do:**

- Deploy ALL domain-specific facets (full redeploy, no change detection)
- Register facets in existing BLR (overwrite mode)
- Create new configuration versions (v1→v2, v2→v3, etc.)
- Optionally batch-update proxies to new versions

**What Upgrades DON'T Do:**

- Replace shared infrastructure
- Modify existing configuration versions
- Automatically update all proxies

### Upgrade Mechanics

**Important**: Upgrades deploy ALL domain-specific facets unconditionally, regardless of whether code changed.

**What happens during upgrade:**

1. Deploys complete set of domain facets (no change detection)
2. Registers all facets in BLR with overwrite enabled
3. Creates new configuration version
4. Does NOT optimize or skip unchanged facets

**Gas Cost**: Full facet deployment every upgrade (no change detection optimization)

**Why this approach?**

- Simplicity: No complex bytecode comparison logic
- Safety: Each version is self-contained
- Consistency: Predictable behavior across all upgrades
- Trade-off: Higher gas cost for simplicity and reliability

**Facets deployed every upgrade:**

- LifeCycleCashFlowFacet (complete redeploy)
- PortfolioFacet (complete redeploy)
- ProceedsManagementFacet (complete redeploy)
- TimeTravelLifeCycleCashFlowFacet (if --time-travel flag set)

**Shared facets (NOT redeployed):**

- AccessControlFacet (registered once, reused)
- PauseFacet (registered once, reused)
- DiamondFacet (registered once, reused)

### Prerequisites

Before upgrading, you must have:

1. **Deployed infrastructure** - BLR proxy address from initial deployment
2. **Private key** - With permissions to register facets and create configurations
3. **Network access** - RPC endpoint for target network

### Upgrade Commands

#### Domain-Specific Upgrade

**From package directory:**

```bash
cd packages/treasury/contracts
npm run upgrade -- --blr-address=0x123...
```

**Environment Variables:**

```bash
# .env
BLR_ADDRESS=0x1234567890abcdef...
NETWORK=hedera-testnet
```

Then run:

```bash
npm run upgrade
```

#### Options

| Flag                | Description                               | Default |
| ------------------- | ----------------------------------------- | ------- |
| `--blr-address`     | BLR proxy address (required)              | -       |
| `--time-travel`     | Use TimeTravel facet variants             | false   |
| `--verbose`         | Enable debug logging                      | false   |
| `--proxy-addresses` | Comma-separated proxy addresses to update | -       |

#### Examples

**Basic upgrade:**

```bash
npm run upgrade -- --blr-address=0x123...
```

**Note:** This deploys all domain facets and creates a new configuration version, even if no code changed.

**Upgrade with proxy updates:**

```bash
npm run upgrade -- --blr-address=0x123... --proxy-addresses=0xabc,0xdef
```

**Verbose logging:**

```bash
npm run upgrade -- --blr-address=0x123... --verbose
```

**TimeTravel mode (testing):**

```bash
npm run upgrade:local -- --blr-address=0x123... --time-travel
```

### Upgrade Output

Upgrades save results to `deployments/{network}/{network}-treasury-upgrade-{timestamp}.json`:

```json
{
  "network": "hedera-testnet",
  "timestamp": "2025-12-23T14:30:45.123Z",
  "deployer": "0x...",
  "blr": {
    "address": "0x...",
    "isExternal": true
  },
  "configuration": {
    "configId": "20000",
    "version": 2,
    "facetCount": 3
  },
  "summary": {
    "totalFacetsDeployed": 3,
    "proxiesUpdated": 2,
    "proxiesFailed": 0,
    "success": true
  }
}
```

### Understanding Facet Deployment

**Domain-Specific Facets:**

- Always deployed during upgrades
- Hardcoded list in upgrade script
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

### Troubleshooting Upgrades

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

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/TreasuryLifecycle.test.ts
```

### Coverage

Treasury contracts maintain 80%+ line coverage:

- LifeCycleCashFlow facet: Coupon and redemption flows
- Portfolio facet: Environmental asset transfers
- ProceedsManagement facet: Fund allocation and beneficiary transfers

## Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Generate coverage report
npm run coverage

# Lint Solidity code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

## Configuration Reference

### Config ID

- **Treasury**: `20000`

### Role Constants

```solidity
bytes32 public constant PAYOUT_ROLE = keccak256("PAYOUT_ROLE");
bytes32 public constant CASHOUT_ROLE = keccak256("CASHOUT_ROLE");
bytes32 public constant PORTFOLIO_MANAGER = keccak256("PORTFOLIO_MANAGER");
bytes32 public constant PROCEEDS_FULL_MANAGER = keccak256("PROCEEDS_FULL_MANAGER");
bytes32 public constant FUNDS_MANAGER = keccak256("FUNDS_MANAGER");
```
