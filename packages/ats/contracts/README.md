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
) external returns (
    address bondAddress,
    address treasuryAddress,
    address kpiAddress
);
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

function getKpiData(uint256 fromDate, uint256 toDate)
    external view
    returns (uint256 kpiAggregatedValue, bool exists);

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
import { ethers } from 'hardhat';
import { deployFactorySuiteSystem } from '@scripts/workflows';

const [deployer] = await ethers.getSigners();

const output = await deployFactorySuiteSystem(deployer, 'testnet', {
  useTimeTravel: false,
  saveOutput: true
});

console.log('FactorySuite Proxy:', output.infrastructure.factorySuite.proxy);
console.log('BLR Proxy:', output.infrastructure.blr.proxy);
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
import { ethers } from 'hardhat';
import { deployFactorySuiteWithExistingInfra } from '@scripts/workflows';

const [deployer] = await ethers.getSigners();

const output = await deployFactorySuiteWithExistingInfra(
  deployer,
  'testnet',
  {
    blrAddress: '0x...',              // Existing BLR
    proxyAdminAddress: '0x...',       // Existing ProxyAdmin
    facets: {
      accessControl: '0x...',         // Existing facet
      pause: '0x...'                  // Existing facet
    }
  },
  { useTimeTravel: false }
);
```

**Deploys:**
- FactorySuiteFacet only (new)
- FactorySuite configuration (combines existing + new facets)
- FactorySuite ResolverProxy

### Usage Examples

#### Calling deployBondSuite()

```typescript
import { ethers } from 'hardhat';

// Prepare data structures
const treasuryData = {
  resolver: blrAddress,
  resolverProxyConfiguration: {
    key: '0x0000000000000000000000000000000000000000000000000000000000004e20', // 20'000
    version: 1
  },
  rbacs: [],
  paymentToken: usdcAddress,
  environmentalAssets: [carbonCreditNftAddress]
};

const kpiData = {
  admin: adminAddress,
  rbacs: [{
    role: KPI_DATA_MANAGER_ROLE,
    members: [managerAddress]
  }]
};

// Deploy bond suite
const tx = await factorySuite.deployBondSuite(
  bondFactoryAddress,
  bondData,
  factoryRegulationData,
  treasuryData,
  kpiData
);

const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === 'BondSuiteDeployed');
const { bondAddress, treasuryAddress, kpiAddress } = event.args;
```

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
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployFactorySuiteWithMocksForBusinessLogic } from '@test/fixtures';

describe('FactorySuite', () => {
  it('should deploy bond suite successfully', async () => {
    const { factorySuite, mockAtsFactory, admin } =
      await loadFixture(deployFactorySuiteWithMocksForBusinessLogic);

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

| Domain | Config ID | Hex Value | Description |
|--------|-----------|-----------|-------------|
| Primary Market | 10'000 | `0x...2710` | Primary market configuration |
| Treasury | 20'000 | `0x...4e20` | Treasury facets configuration |
| FactorySuite | 30'000 | `0x...7530` | FactorySuite facets configuration |

### Role Constants

| Role | Keccak256 Hash | Usage |
|------|----------------|-------|
| `DEPLOYER_ROLE` | `0x1e30887951e961109b31c3e05261cd69e3d6381327ba40ce9968bbadbebce283` | Deploy bond suites via FactorySuite |
| `KPI_DATA_MANAGER_ROLE` | `0x8108220811ff31812653b43da259792e3fb45324bd180667be52cdb5621e363e` | Add KPI data to KPI contract |
| `PAUSER_ROLE` | Inherited from ATS | Pause/unpause contracts |
| `DEFAULT_ADMIN_ROLE` | `0x0000000000000000000000000000000000000000000000000000000000000000` | Grant/revoke roles |

### Resolver Keys

| Contract | Resolver Key | Usage |
|----------|--------------|-------|
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
import { ethers } from 'hardhat';
import { deployFacets } from '@hashgraph/asset-tokenization-contracts/scripts';
import { atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts';
import { factorySuiteRegistry } from '@scripts/domain';
import { AccessControlFacet__factory, FactorySuiteFacet__factory } from '@contract-types';

const [deployer] = await ethers.getSigners();

// Create TypeChain factories
const facetFactories = {
  AccessControlFacet: new AccessControlFacet__factory(deployer),
  FactorySuiteFacet: new FactorySuiteFacet__factory(deployer)
};

// Pass array of registries for facet metadata lookup
await deployFacets(facetFactories, {
  confirmations: 1,
  registries: [atsRegistry, factorySuiteRegistry]
});
```

## Troubleshooting

### Common Issues

**Issue**: `InvalidTreasuryData` error when calling deployBondSuite

**Solution**: Ensure Treasury configuration exists in BLR before calling deployBondSuite:
```typescript
// Verify Treasury config exists
const configExists = await blr.getConfiguration('0x...4e20', 1);
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
