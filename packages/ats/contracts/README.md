# ATS Smart Contracts

Asset Tokenization Studio (ATS) smart contracts for the Evercity green bonds platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Architecture](#architecture)
  - [FactorySuite System](#factorysuite-system)
  - [KPI System](#kpi-system)
  - [Multi-Registry Architecture](#multi-registry-architecture)
- [Smart Contracts Reference](#smart-contracts-reference)
  - [IFactorySuite Interface](#ifactorysuite-interface)
  - [IKpi Interface](#ikpi-interface)
  - [Roles & Permissions](#roles--permissions)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deployment Options](#deployment-options)
  - [Usage Examples](#usage-examples)
- [Upgrades](#upgrades)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites-1)
  - [Upgrade Commands](#upgrade-commands)
  - [Upgrade Output](#upgrade-output)
  - [Troubleshooting Upgrades](#troubleshooting-upgrades)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Architecture](#test-architecture)
  - [Coverage](#coverage)
- [Development Commands](#development-commands)
- [Configuration Reference](#configuration-reference)
  - [Config IDs](#config-ids)
  - [Role Constants](#role-constants)
  - [Resolver Keys](#resolver-keys)
- [Registry Generation](#registry-generation)
- [Troubleshooting](#troubleshooting)

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

This package provides smart contracts for the ATS domain within the Evercity green bonds platform:

- **FactorySuite**: Atomic deployment mechanism for Bond + Treasury + KPI contract suites
- **KPI Contract**: Oracle data storage for variable-rate bonds using transparent proxy pattern

### Key Features

- **Atomic Deployment**: All-or-nothing deployment prevents inconsistent states
- **Diamond Pattern**: FactorySuite uses EIP-2535 for upgradeability
- **Multi-Registry Support**: Combines ATS standard facets with custom FactorySuite facets
- **Comprehensive Testing**: 100% statement coverage with fixture-based tests

## Architecture

### FactorySuite System

FactorySuite is the **central deployment mechanism** for green bonds, providing atomic deployment of three interdependent contracts:

1. **Bond Contract**: Asset tokenization with economic terms and lifecycle management
2. **Treasury Contract**: Per-bond financial asset management with lifecycle obligations
3. **KPI Contract**: Oracle data storage for variable-rate bonds and sustainability metrics

**Architecture Pattern**: Diamond Pattern (EIP-2535) via shared infrastructure

```
┌─────────────────────────────────┐
│  FactorySuite Diamond Proxy    │
│  Config ID: 30'000              │
│                                 │
│  Facets:                        │
│  ├─ AccessControlFacet (shared) │
│  ├─ PauseFacet (shared)        │
│  └─ FactorySuiteFacet (custom) │
└─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  BusinessLogicResolver (BLR)  │
│  Shared across all domains    │
└──────────────────────────────┘
```

**Components:**

- `FactorySuite.sol` - Core business logic with validation and orchestration
- `FactorySuiteStorageWrapper.sol` - Deployment logic for Bond, Treasury, and KPI
- `FactorySuiteFacet.sol` - Diamond facet with metadata functions
- `IFactorySuite.sol` - Interface with TreasuryData, KpiData structs

**Why Atomic Deployment?**

- Prevents inconsistent states (all contracts deployed or none)
- Cost efficient (single transaction vs multiple deployments)
- Operational simplicity (one-step bond creation)
- Automatic relationship management between contracts

### KPI System

The KPI contract stores Oracle data for variable-rate bonds with support for date-range queries.

**Architecture Pattern**: Transparent Upgradeable Proxy

**Components:**

- `Kpi.sol` - Main implementation with unstructured storage
- `KpiTimeTravel.sol` - TimeTravel variant for testing
- `IKpi.sol` - Interface defining KPI data structures

**Key Features:**

- Date-based KPI value storage
- Range aggregation queries
- Access control (KPI_DATA_MANAGER_ROLE)
- Pause functionality for emergency stops
- Upgradeable via transparent proxy pattern

### Multi-Registry Architecture

FactorySuite leverages **shared infrastructure** from ATS while adding custom facets:

- **Shared from atsRegistry**: AccessControlFacet, PauseFacet
- **Custom from factorySuiteRegistry**: FactorySuiteFacet
- **Single BLR**: One BusinessLogicResolver for all domains (cost efficient)

## Smart Contracts Reference

### IFactorySuite Interface

**Main Function:**

```solidity
function deployBondSuite(
  address bondFactoryAddress,
  IAtsFactory.BondData calldata bondData,
  AtsFactoryRegulationData calldata factoryRegulationData,
  TreasuryData calldata treasuryData,
  KpiData calldata kpiData
) external returns (address bondAddress, address treasuryAddress, address kpiAddress);
```

**Data Structures:**

```solidity
struct TreasuryData {
  IBusinessLogicResolver resolver;
  IAtsFactory.ResolverProxyConfiguration resolverProxyConfiguration;
  IResolverProxy.Rbac[] rbacs;
  address paymentToken;
  address[] environmentalAssets;
}

struct KpiData {
  address admin;
  IResolverProxy.Rbac[] rbacs;
}
```

**Events:**

- `BondSuiteDeployed(operator, bondAddress, treasuryAddress, kpiAddress, ...)`

**Errors:**

- `BondDeploymentFailed()`
- `TreasuryDeploymentFailed()`
- `KpiDeploymentFailed()`
- `InvalidTreasuryData()`
- `InvalidKpiData()`
- `InvalidContractAddress(address)`

### IKpi Interface

**Main Functions:**

```solidity
function addKpiData(uint256 date, uint256 kpiValue) external;

function getKpiData(uint256 fromDate, uint256 toDate) external view returns (uint256 kpiAggregatedValue, bool exists);

function initialize(IResolverProxy.Rbac[] memory rbacs) external;
```

**Data Structures:**

```solidity
struct KpiEntry {
  uint256 value;
  bool exists;
}

struct KpiStorage {
  mapping(uint256 timestamp => KpiEntry) kpiData;
  bool initialized;
}
```

**Events:**

- `KpiDataAdded(indexed date, value)`

**Errors:**

- `InvalidDate(providedDate)`
- `InvalidDateRange(fromDate, toDate)`
- `KpiDataNotFound(requestedDate)`

### Roles & Permissions

**FactorySuite Roles:**

- `DEPLOYER_ROLE`: Required to call `deployBondSuite()`
- Inherits AccessControl and Pause roles from ATS

**KPI Roles:**

- `KPI_DATA_MANAGER_ROLE`: Required to call `addKpiData()`
- `PAUSER_ROLE`: Required to pause/unpause contract

## Deployment

### Prerequisites

**Infrastructure Requirements:**

1. **Shared Infrastructure** (if using existing):
   - BusinessLogicResolver (BLR) proxy deployed
   - ProxyAdmin deployed
   - AccessControlFacet and PauseFacet registered in BLR

2. **Treasury Configuration** (required before calling deployBondSuite):
   - Treasury facets deployed and registered in BLR
   - Treasury configuration created (Config ID: 20'000)

3. **ATS Factory** (required):
   - ATS Bond Factory deployed

4. **Tokens** (for production):
   - Payment token (e.g., USDC) deployed
   - Environmental asset tokens (ERC721) if needed

### Deployment Options

#### Option 1: Complete System Deployment

Use when deploying to a new network without existing infrastructure.

```typescript
import { ethers } from "hardhat";
import { deployFactorySuiteSystem } from "@scripts/workflows";

const [deployer] = await ethers.getSigners();

const output = await deployFactorySuiteSystem(deployer, "testnet", {
  useTimeTravel: false,
  saveOutput: true,
});

console.log("FactorySuite Proxy:", output.infrastructure.factorySuite.proxy);
console.log("BLR Proxy:", output.infrastructure.blr.proxy);
```

**Deploys:**

- ProxyAdmin
- BusinessLogicResolver (implementation + proxy)
- Facets (AccessControl, Pause, FactorySuite)
- FactorySuite configuration (ID: 30'000)
- FactorySuite ResolverProxy

#### Option 2: Deploy with Existing Infrastructure

Use when ATS or other domains already deployed shared infrastructure.

```typescript
import { ethers } from "hardhat";
import { deployFactorySuiteWithExistingInfra } from "@scripts/workflows";

const [deployer] = await ethers.getSigners();

const output = await deployFactorySuiteWithExistingInfra(
  deployer,
  "testnet",
  {
    blrAddress: "0x...", // Existing BLR
    proxyAdminAddress: "0x...", // Existing ProxyAdmin
    facets: {
      accessControl: "0x...", // Existing facet
      pause: "0x...", // Existing facet
    },
  },
  { useTimeTravel: false },
);
```

**Deploys:**

- FactorySuiteFacet only (new)
- FactorySuite configuration (combines existing + new facets)
- FactorySuite ResolverProxy

### Usage Examples

#### Calling deployBondSuite()

```typescript
import { ethers } from "hardhat";
import { LATEST_VERSION } from "@hashgraph/asset-tokenization-contracts/scripts";

// Prepare data structures
const treasuryData = {
  resolver: blrAddress,
  resolverProxyConfiguration: {
    key: "0x0000000000000000000000000000000000000000000000000000000000004e20", // 20'000
    version: LATEST_VERSION, // Auto-updates to latest BLR version (use specific version for production)
  },
  rbacs: [],
  paymentToken: usdcAddress,
  environmentalAssets: [carbonCreditNftAddress],
};

const kpiData = {
  admin: adminAddress,
  rbacs: [
    {
      role: KPI_DATA_MANAGER_ROLE,
      members: [managerAddress],
    },
  ],
};

// Deploy bond suite
const tx = await factorySuite.deployBondSuite(
  bondFactoryAddress,
  bondData,
  factoryRegulationData,
  treasuryData,
  kpiData,
);

const receipt = await tx.wait();
const event = receipt.events.find((e) => e.event === "BondSuiteDeployed");
const { bondAddress, treasuryAddress, kpiAddress } = event.args;
```

## Understanding Deployment vs Instance Creation

### What Fresh Deployment Creates

ATS has **two configurations**: BOND (for bond instances) and FactorySuite (atomic suite deployment factory).

**Infrastructure (shared across platform):**

- ✅ BusinessLogicResolver (BLR) proxy - Configuration registry
- ✅ ProxyAdmin - Upgrade management
- ✅ Shared facets - AccessControl, Pause, Diamond (reused by all domains)

**Configurations in BLR (metadata only for instances, factory proxy for FactorySuite):**

- ✅ **BOND configuration (Config ID 2)** - Template for Bond instances
- ✅ **FactorySuite configuration (Config ID 30000)** - Template for FactorySuite factory proxy

**Factory Proxies (deployed and immediately usable):**

- ✅ **Bond Factory proxy** - Can deploy individual Bond instances (uses Config 2)
- ✅ **FactorySuite ResolverProxy** - Can deploy Bond+Treasury+KPI suites atomically (uses Config 30000)

### What Fresh Deployment Does NOT Create

**Instance Proxies (created later on-demand):**

- ❌ **Bond instance proxies** - Created by calling `BondFactory.deployBond()` or `FactorySuite.deployBondSuite()`
- ❌ **Treasury instance proxies** - Created by calling `FactorySuite.deployBondSuite()`
- ❌ **KPI instance proxies** - Created by calling `FactorySuite.deployBondSuite()`

### Why This Design?

**Two deployment patterns:**

**Pattern 1 - Individual Bond (via Bond Factory):**

- Deploy single Bond instance
- Manual Treasury and KPI setup required
- More flexibility, more steps

**Pattern 2 - Complete Suite (via FactorySuite - recommended):**

- Deploy Bond + Treasury + KPI atomically
- Ensures proper inter-contract relationships
- Less flexibility, fewer steps, safer

**Configurations are templates:**

- Config 2 (BOND) defines which facets a Bond instance will use
- Config 30000 (FactorySuite) defines factory behavior for atomic deployment
- BLR stores these templates, factories reference them when deploying instances

**Factory creates instances on-demand:**

```
Bond Factory (uses Config 2)
    ↓ deploys
Bond instances (Config 2)
   Bond #1, Bond #2, Bond #3, ...

FactorySuite (Config 30000)
    ↓ deploys atomically
Bond + Treasury + KPI suites
   Suite #1 → Bond A + Treasury A + KPI A
   Suite #2 → Bond B + Treasury B + KPI B
   Suite #3 → Bond C + Treasury C + KPI C
   ...
```

### Deployment Output Explained

**What you'll see in deployment JSON:**

```json
{
  "infrastructure": {
    "blr": {
      "proxy": "0x..."              // BLR (shared infrastructure)
    },
    "factory": {
      "proxy": "0x..."              // Bond Factory (deployed) ✅
    },
    "factorySuite": {
      "proxy": "0x..."              // FactorySuite Factory (deployed) ✅
    }
  },
  "configurations": {
    "bond": {                       // Config 2 (metadata in BLR)
      "configId": 2,
      "version": 1,
      "facetKeys": [...]
    },
    "factorySuite": {               // Config 30000 (metadata in BLR)
      "configId": 30000,
      "version": 1,
      "facetKeys": [...]
    }
  },
  "facets": [
    { "name": "BondFacet", "address": "0x..." },
    { "name": "FactorySuiteFacet", "address": "0x..." }
  ]
}
```

**What you WON'T see (and why):**

- ❌ No `bond.infrastructure.proxy` field
- ❌ No individual Bond instance proxy addresses
- ❌ No Treasury instance proxy addresses
- ❌ No KPI instance proxy addresses
- **Reason:** Instance proxies don't exist yet - they're created later by calling factories

**This is correct behavior, not an error!** The deployment creates:

1. Template configurations (Config 2 for Bonds, Config 30000 for FactorySuite)
2. Factory proxies (Bond Factory, FactorySuite)
3. Facet implementations (used by configurations)

Instance proxies are created on-demand after deployment.

### How to Create Instances After Deployment

**Method 1: FactorySuite (recommended - atomic deployment):**

```typescript
import { FactorySuiteFacet__factory } from "@hashgraph/ats-contracts";

// Connect to deployed FactorySuite
const factorySuite = FactorySuiteFacet__factory.connect(deploymentResult.infrastructure.factorySuite.proxy, signer);

// Deploy complete suite atomically (Bond + Treasury + KPI)
const tx = await factorySuite.deployBondSuite(
  bondData, // Bond configuration
  regulationData, // Bond regulation settings
  treasuryData, // Treasury configuration
  kpiData, // KPI oracle configuration
);

await tx.wait();

// Extract addresses from events
const event = tx.events?.find((e) => e.event === "BondSuiteDeployed");
const bondProxy = event?.args?.bondAddress;
const treasuryProxy = event?.args?.treasuryAddress;
const kpiProxy = event?.args?.kpiAddress;

console.log("Complete suite deployed:");
console.log("  Bond:", bondProxy);
console.log("  Treasury:", treasuryProxy);
console.log("  KPI:", kpiProxy);
```

**Method 2: Bond Factory (individual Bond only):**

```typescript
import { BondFactory__factory } from "@hashgraph/ats-contracts";

// Connect to deployed Bond Factory
const bondFactory = BondFactory__factory.connect(deploymentResult.infrastructure.factory.proxy, signer);

// Deploy individual Bond instance
const tx = await bondFactory.deployBond(
  bondData, // Bond configuration
  regulationData, // Regulation settings
  2, // Config ID for Bond instances
  1, // Version
);

await tx.wait();

// Extract Bond address from events
const event = tx.events?.find((e) => e.event === "BondSuiteDeployed");
const bondProxy = event?.args?.bondAddress;
const treasuryProxy = event?.args?.treasuryAddress;

console.log("Bond deployed:", bondProxy);
console.log("Treasury deployed:", treasuryProxy);
// Note: Bond, Treasury, and KPI are deployed together in a single transaction
```

**Each instance is independent:**

```typescript
// Suite #1 - Green Bond A with full setup
const suite1 = await factorySuite.deployBondSuite(bondDataA, regA, treasuryA, kpiA);

// Suite #2 - Green Bond B with full setup
const suite2 = await factorySuite.deployBondSuite(bondDataB, regB, treasuryB, kpiB);

// All Bond instances use Config 2
// All Treasury instances use Config 20000
// All KPI instances use their respective configuration
```

### Architecture After Fresh Deployment

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  ├─ ProxyAdmin ✅                │
│  ├─ BLR Proxy ✅                 │
│  └─ Shared Facets ✅             │
└──────────────┬───────────────────┘
               │
               ├─► Bond Factory Proxy ✅ (uses Config 2)
               │   └─ Can deploy: Individual Bond instances
               │
               ├─► FactorySuite Proxy ✅ (Config 30000)
               │   └─ Can deploy: Bond + Treasury + KPI suites
               │
               └─► BLR contains templates:
                   ├─ BOND Config (2) ✅
                   └─ FactorySuite Config (30000) ✅

❌ NO Bond instances yet
❌ NO Treasury instances yet
❌ NO KPI instances yet
```

### Architecture After Creating Instances

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  (same as above)                 │
└──────────────┬───────────────────┘
               │
               ├─► Bond Factory Proxy ✅
               │   ├─ Bond #1 ✅ (standalone)
               │   └─ Bond #2 ✅ (standalone)
               │
               └─► FactorySuite Proxy ✅ (Config 30000)
                   │
                   ├─► Suite #1 ✅
                   │   ├─ Bond A ✅ (Config 2)
                   │   ├─ Treasury A ✅ (Config 20000)
                   │   └─ KPI A ✅
                   │
                   └─► Suite #2 ✅
                       ├─ Bond B ✅ (Config 2)
                       ├─ Treasury B ✅ (Config 20000)
                       └─ KPI B ✅
```

### Key Takeaways

1. **Two deployment methods** - Bond Factory for individual Bonds, FactorySuite for complete suites
2. **FactorySuite is recommended** - Atomic deployment ensures proper inter-contract relationships
3. **Factories are deployed, instances are not** - Fresh deployment creates factory tools, not bond instances
4. **Missing instance proxies in deployment = correct** - This is by design, not an error
5. **All Bond instances use Config 2** - Configuration defines behavior, but each instance has separate storage
6. **Suites deploy multiple contracts** - One FactorySuite call creates 3 proxies (Bond + Treasury + KPI)

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

- FactorySuiteFacet (complete redeploy)
- TimeTravelFacet (if --time-travel flag set)

**Shared facets (NOT redeployed):**

- AccessControlFacet (registered once, reused)
- PauseFacet (registered once, reused)

### Prerequisites

Before upgrading, you must have:

1. **Deployed infrastructure** - BLR proxy address from initial deployment
2. **Private key** - With permissions to register facets and create configurations
3. **Network access** - RPC endpoint for target network

### Upgrade Commands

#### Domain-Specific Upgrade

**From package directory:**

```bash
cd packages/ats/contracts
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

Upgrades save results to `deployments/{network}/{network}-factorysuite-upgrade-{timestamp}.json`:

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
    "configId": "30000",
    "version": 2,
    "facetCount": 1
  },
  "summary": {
    "totalFacetsDeployed": 1,
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

# Run specific test suites
npm run test:factory-suite
npm run test:kpi

# Generate coverage report
npm run coverage
npm run coverage:factory-suite
npm run coverage:kpi
```

### Test Architecture

**Pattern**: Fixture-based testing using `loadFixture` for performance

```typescript
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployFactorySuiteWithMocksForBusinessLogic } from "@test/fixtures";

describe("FactorySuite", () => {
  it("should deploy bond suite successfully", async () => {
    const { factorySuite, mockAtsFactory, admin } = await loadFixture(deployFactorySuiteWithMocksForBusinessLogic);

    // Test logic here - fixture executed once, state snapshotted
  });
});
```

**Test Organization:**

- `test/fixtures/` - Reusable deployment fixtures
- `test/helpers/` - Test utilities and data generation
- `test/unit/` - Unit tests for individual contracts
- `test/integration/` - End-to-end workflow tests

**Mock Contracts:**

Tests use lightweight mocks for fast execution:

- `MockAtsFactory` - Bond deployment without full implementation
- `MockTreasuryFacet` - Minimal Treasury for testing FactorySuite logic
- `MockERC20` / `MockERC721` - Test tokens

### Coverage

**Target**: 100% line and branch coverage

**Current Coverage:**

```
File                            |  % Stmts | % Branch |  % Funcs |  % Lines |
--------------------------------|----------|----------|----------|----------|
contracts/Kpi.sol               |      100 |      100 |      100 |      100 |
contracts/facets/
  FactorySuite.sol              |      100 |    95.45 |      100 |      100 |
  FactorySuiteFacet.sol         |      100 |      100 |      100 |      100 |
  FactorySuiteStorageWrapper.sol|      100 |      100 |      100 |      100 |
--------------------------------|----------|----------|----------|----------|
All files                       |      100 |    97.62 |      100 |      100 |
```

## Development Commands

```bash
# Compilation
npm run compile                    # Compile contracts
npm run compile:force              # Clean and compile

# Testing
npm run test                       # Run test suite
npm run coverage                   # Generate coverage report

# Code Quality
npm run lint                       # Run linting (ESLint + Solhint)
npm run format                     # Check code formatting
npm run fix                        # Auto-fix linting and formatting

# Registry
npm run generate:registry          # Regenerate facet registry

# Cleanup
npm run clean                      # Clean build artifacts
```

## Configuration Reference

### Config IDs

| Domain         | Config ID | Hex Value   | Description                       |
| -------------- | --------- | ----------- | --------------------------------- |
| Primary Market | 10'000    | `0x...2710` | Primary market configuration      |
| Treasury       | 20'000    | `0x...4e20` | Treasury facets configuration     |
| FactorySuite   | 30'000    | `0x...7530` | FactorySuite facets configuration |

### Role Constants

| Role                    | Keccak256 Hash                                                       | Usage                               |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| `DEPLOYER_ROLE`         | `0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283` | Deploy bond suites via FactorySuite |
| `KPI_DATA_MANAGER_ROLE` | `0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e` | Add KPI data to KPI contract        |
| `PAUSER_ROLE`           | Inherited from ATS                                                   | Pause/unpause contracts             |
| `DEFAULT_ADMIN_ROLE`    | `0x0000000000000000000000000000000000000000000000000000000000000000` | Grant/revoke roles                  |

### Resolver Keys

| Contract          | Resolver Key                                                         | Usage                |
| ----------------- | -------------------------------------------------------------------- | -------------------- |
| FactorySuiteFacet | `0xcf89d9e351b154ec73d93d535b6701c171db4dd978aa2e8967ef3aae7d45453f` | BLR registration key |

## Registry Generation

The FactorySuite registry is automatically generated using ATS registry tools.

**Automatic Generation:**

```bash
npm run compile  # Compiles + generates registry automatically
```

**Manual Generation:**

```bash
npm run generate:registry           # Standard output
npm run generate:registry -- --verbose  # Detailed output
```

**Generated File:** `scripts/domain/factorySuiteRegistry.data.ts`

**Contents:**

- Facet definitions with methods, events, errors
- Selectors and topic0 hashes
- Inheritance chains
- Resolver keys
- Role constants

**Multi-Registry Usage:**

```typescript
import { ethers } from "hardhat";
import { deployFacets } from "@hashgraph/asset-tokenization-contracts/scripts";
import { atsRegistry } from "@hashgraph/asset-tokenization-contracts/scripts";
import { factorySuiteRegistry } from "@scripts/domain";
import { AccessControlFacet__factory, FactorySuiteFacet__factory } from "@contract-types";

const [deployer] = await ethers.getSigners();

// Create TypeChain factories
const facetFactories = {
  AccessControlFacet: new AccessControlFacet__factory(deployer),
  FactorySuiteFacet: new FactorySuiteFacet__factory(deployer),
};

// Pass array of registries for facet metadata lookup
await deployFacets(facetFactories, {
  confirmations: 1,
  registries: [atsRegistry, factorySuiteRegistry],
});
```

## Troubleshooting

### Common Issues

**Issue**: `InvalidTreasuryData` error when calling deployBondSuite

**Solution**: Ensure Treasury configuration exists in BLR before calling deployBondSuite:

```typescript
// Verify Treasury config exists
const configExists = await blr.getConfiguration("0x...4e20", 1);
// If not, deploy and register Treasury facets first
```

**Issue**: `AccountHasNoRole` when deploying

**Solution**: Grant DEPLOYER_ROLE to your address:

```typescript
await factorySuite.grantRole(DEPLOYER_ROLE, myAddress);
```

**Issue**: Test failures with "contract not found"

**Solution**: Ensure contracts are compiled before running tests:

```bash
npm run compile
npm run test
```

**Issue**: Registry generation fails

**Solution**: Compile contracts first, then regenerate:

```bash
npm run compile:force
npm run generate:registry
```

**Issue**: Coverage report missing contracts

**Solution**: Ensure all contract files use proper SPDX license identifiers and are in the `contracts/` directory.
