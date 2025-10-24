# ATS Smart Contracts

Asset Tokenization Studio (ATS) smart contracts for the Evercity green bonds platform.

## Overview

This package contains smart contracts for the ATS domain, including:

- **FactorySuite**: Atomic deployment of Bond + Treasury + KPI contract suites
- **KPI**: Oracle data storage for variable-rate bonds with transparent proxy pattern

## FactorySuite Architecture

### Purpose

FactorySuite is the **central deployment mechanism** for green bonds in the Evercity platform, providing atomic deployment of three interdependent smart contracts:

1. **Bond Contract**: Asset tokenization with economic terms and lifecycle management
2. **Treasury Contract**: Per-bond financial asset management with lifecycle obligations
3. **KPI Contract**: Oracle data storage for variable-rate bonds and sustainability metrics

### Why Atomic Deployment?

- **Atomicity**: All-or-nothing deployment prevents inconsistent states
- **Cost Efficiency**: Single transaction vs multiple separate deployments
- **Operational Simplicity**: One-step bond creation process
- **Relationship Management**: Ensures proper inter-contract associations

### Architecture Pattern

FactorySuite uses the **Diamond Pattern** (EIP-2535) via ATS's shared infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│              FactorySuite Diamond Proxy                     │
│                                                              │
│  Facets:                                                     │
│  ├─ AccessControlFacet (shared)                            │
│  ├─ PauseFacet (shared)                                    │
│  └─ FactorySuiteFacet (FactorySuite-specific)             │
│                                                              │
│  Configuration: BLR Config ID 30'000                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  BusinessLogicResolver (BLR)  │
        │  Shared across all domains    │
        │                               │
        │  Configurations:              │
        │  ├─ 10'000: Primary Market   │
        │  ├─ 20'000: Treasury         │
        │  └─ 30'000: FactorySuite     │
        └───────────────────────────────┘
```

### Components

- **FactorySuite.sol**: Core business logic with validation and orchestration
- **FactorySuiteStorageWrapper.sol**: Deployment logic for Bond, Treasury, and KPI
- **FactorySuiteFacet.sol**: Diamond facet with metadata functions
- **IFactorySuite.sol**: Interface defining TreasuryData, KpiData structs and deployBondSuite()

### Integration with Shared Infrastructure

FactorySuite leverages existing ATS infrastructure with multi-registry support:
- **BusinessLogicResolver**: Single shared registry for all facets across domains
- **AccessControlFacet**: Reused from ATS deployment for RBAC
- **PauseFacet**: Reused from ATS deployment for emergency pause
- **ResolverProxy**: Standard proxy pattern for Diamond deployment
- **Multi-Registry**: Combines `atsRegistry` (standard facets) with `factorySuiteRegistry` (custom facets)

## Deployment Flows

### Test Deployment Flow

Test deployment uses **mocks** to validate FactorySuite business logic without deploying complete Treasury infrastructure:

```
┌──────────────────────────────────────────────────────────────┐
│  TEST FIXTURE: deployFactorySuiteWithMocksForBusinessLogic   │
└──────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
  INFRASTRUCTURE                  MOCK TREASURY
  ├─ ProxyAdmin                  ├─ Deploy MockTreasuryFacet
  ├─ BusinessLogicResolver       ├─ Register in BLR
  │  (impl + proxy)               └─ Create Treasury Config
  ├─ Deploy 3 Facets:                 ID: 20'000, version: 1
  │  ├─ AccessControlFacet            Facets: [AccessControl,
  │  ├─ PauseFacet                            MockTreasury]
  │  └─ FactorySuiteFacet
  ├─ Register facets in BLR
  ├─ Create FactorySuite Config
  │  ID: 30'000, version: 1
  └─ Deploy FactorySuite Proxy
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
  GRANT ROLES                      DEPLOY MOCKS
  └─ DEPLOYER_ROLE                ├─ MockAtsFactory
     to admin signer              ├─ MockERC20 (payment)
                                  └─ MockERC721 (env assets)
                        │
                        ▼
        ┌─────────────────────────────────────────┐
        │  READY FOR TESTING                      │
        │  factorySuite.deployBondSuite(...)      │
        └─────────────────────────────────────────┘
```

**Key Points:**
- Uses **MockTreasuryFacet** instead of 5 real Treasury facets
- Minimal Treasury configuration for fast test execution
- Mock contracts (ATS Factory, ERC20, ERC721) for isolated testing
- Shared BLR pattern (same as production)

### Production Deployment Flow

Production deployment has **two options** depending on whether infrastructure exists:

#### Option 1: Complete System Deployment

Use when deploying FactorySuite to a **new network** without existing infrastructure:

```typescript
import { deployFactorySuiteSystem } from '@scripts/workflows';

const output = await deployFactorySuiteSystem(provider, 'testnet', {
  useTimeTravel: false
});
```

**Steps:**
1. Deploy ProxyAdmin
2. Deploy BusinessLogicResolver (implementation + proxy)
3. Deploy facets: AccessControlFacet, PauseFacet, FactorySuiteFacet
4. Register facets in BLR
5. Create FactorySuite configuration (ID 30'000, version 1)
6. Deploy FactorySuite ResolverProxy

#### Option 2: Deploy with Existing Infrastructure

Use when ATS or other domains **already deployed** shared infrastructure:

```typescript
import { deployFactorySuiteWithExistingInfra } from '@scripts/workflows';

const output = await deployFactorySuiteWithExistingInfra(
  provider,
  'testnet',
  {
    blrAddress: '0x...',              // REUSE existing BLR
    proxyAdminAddress: '0x...',       // REUSE existing ProxyAdmin
    facets: {
      accessControl: '0x...',         // REUSE existing facet
      pause: '0x...'                  // REUSE existing facet
    }
  },
  { useTimeTravel: false }
);
```

**Steps:**
1. Validate existing infrastructure addresses
2. Deploy ONLY FactorySuiteFacet (new)
3. Register new facet in existing BLR
4. Create FactorySuite configuration (combines existing + new facets)
5. Deploy FactorySuite ResolverProxy

**When to use each option:**
- **Option 1**: Fresh network deployment, isolated testing
- **Option 2**: Production multi-domain deployment, cost optimization (reuse infrastructure)

### Internal Execution Flow: deployBondSuite()

When calling `factorySuite.deployBondSuite(...)`, the following execution occurs:

```
┌─────────────────────────────────────────────────────────┐
│  USER CALLS: deployBondSuite(...)                       │
│  Params: bondFactory, bondData, regulationData,        │
│          treasuryData, kpiData                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  PRE-FLIGHT VALIDATION (Modifiers)                      │
├─────────────────────────────────────────────────────────┤
│  ✓ nonReentrant: Prevent reentrancy attacks            │
│  ✓ onlyUnpaused: Contract not paused                   │
│  ✓ onlyRole(DEPLOYER_ROLE): Caller authorized          │
│  ✓ validContractAddress: bondFactory is contract       │
│  ✓ validTreasuryData: resolver, paymentToken ≠ 0x0     │
│  ✓ validKpiData: admin ≠ 0x0                            │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌────────┐    ┌────────┐    ┌───────────┐
   │ STEP 1 │    │ STEP 2 │    │  STEP 3   │
   │ Deploy │    │ Deploy │    │  Deploy   │
   │  KPI   │───▶│  Bond  │───▶│ Treasury  │
   └────────┘    └────────┘    └───────────┘
        │               │               │
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  EMIT: BondSuiteDeployed      │
        │  Return: (bond, treasury, kpi)│
        └───────────────────────────────┘
```

**Step 1: Deploy KPI Contract**
- Deploys Kpi logic contract (implementation)
- Deploys ProxyAdmin (owned by kpiData.admin)
- Deploys TransparentUpgradeableProxy
- Initializes with kpiData.rbacs
- **Pattern**: Transparent Upgradeable Proxy

**Step 2: Deploy Bond Contract**
- Calls IAtsFactory(bondFactoryAddress).deployBond(...)
- Uses existing ATS Factory deployment
- KPI address passed (reserved for future integration)
- **Pattern**: Delegated to ATS Factory

**Step 3: Deploy Treasury Contract**
- Deploys ResolverProxy (Diamond proxy)
- Constructor queries BLR for config ID 20'000
- Retrieves registered Treasury facets
- Performs diamond cut (adds all facets)
- Configures RBACs
- **Pattern**: ResolverProxy (Diamond Pattern)

## Deployment Prerequisites

### What Must Exist BEFORE Calling deployBondSuite()

The prerequisites differ significantly between test and production environments:

#### For Testing

```typescript
// Already handled by deployFactorySuiteWithMocksForBusinessLogic fixture
```

✅ **Automatically Provided:**
1. FactorySuite infrastructure deployed
2. MockTreasuryFacet deployed and registered in BLR
3. Treasury configuration (ID 20'000) created with MockTreasuryFacet
4. Mock contracts: MockAtsFactory, MockERC20, MockERC721
5. DEPLOYER_ROLE granted to test signers

#### For Production

🚨 **You MUST Deploy Separately:**

**1. Deploy Real Treasury Facets** (NOT part of FactorySuite):
```solidity
// These 5 facets must be deployed independently
LifeCycleCashFlowFacet
PortfolioFacet
ProceedsManagementFacet
AccessControlFacet (or reuse existing)
PauseFacet (or reuse existing)
```

**2. Register Treasury Facets in BLR:**
```typescript
await registerFacets(provider, {
  blrAddress: blr.address,
  facets: {
    LifeCycleCashFlowFacet: '0x...',
    PortfolioFacet: '0x...',
    ProceedsManagementFacet: '0x...',
    AccessControlFacet: '0x...',
    PauseFacet: '0x...'
  }
});
```

**3. Create Treasury Configuration in BLR:**
```typescript
await createTreasuryConfiguration(blr, facetAddresses, useTimeTravel);
// Creates config ID: bytes32(uint256(20000))
// Version: 1
// Registers all 5 Treasury facets
```

**4. Deploy Real ATS Factory** (if not already deployed)

**5. Prepare Real Tokens:**
- Payment token (e.g., USDC, USDT) deployed and accessible
- Environmental asset tokens (ERC721) deployed if needed

### Why This Separation?

- **Treasury is a separate domain** with its own lifecycle
- **Reusability**: One Treasury configuration serves multiple bonds
- **Modularity**: Treasury can be upgraded independently
- **Testing**: Allows testing FactorySuite without full Treasury deployment

## Key Differences: Tests vs Production

Understanding the differences between test and production deployments is critical:

| Component | Tests | Production |
|-----------|-------|------------|
| **Bond Deployment** | `MockAtsFactory` - Returns mock address without actual deployment | Real `ATS Factory` - Deploys complete Bond contract with full functionality |
| **Treasury Facets** | `MockTreasuryFacet` - Single mock facet with minimal interface | **5 Real Facets**: LifeCycleCashFlow, Portfolio, ProceedsManagement, AccessControl, Pause |
| **Treasury BLR Config** | ID `20'000`, version `1` - 2 facets (AccessControl + Mock) | ID `20'000`, version `1` - 5 facets (all real implementations) |
| **KPI Deployment** | Real `TransparentUpgradeableProxy` contract | Real `TransparentUpgradeableProxy` contract (SAME) |
| **Payment Token** | `MockERC20` - Simplified test token | Real ERC20 (USDC, USDT, etc.) with production security |
| **Environmental Assets** | `MockERC721` - Simplified test NFTs | Real ERC721 tokens representing carbon credits, forwards, etc. |
| **BusinessLogicResolver** | Real BLR created in test fixture (SHARED pattern) | Real BLR pre-deployed or newly deployed (SHARED pattern) |
| **Infrastructure Reuse** | Shared AccessControl and Pause facets | Shared AccessControl and Pause facets (SAME) |
| **TimeTravel** | Disabled (`false`) for business logic tests | Optional - depends on network and testing needs |
| **Deployment Speed** | Fast (~1-2 seconds) - mocks optimize for speed | Slower (~30-60 seconds) - real contract complexity |
| **Gas Cost** | Low - minimal contract deployment | High - full Treasury Diamond deployment |

### Critical Insights

1. **Shared BLR Pattern is IDENTICAL**: Both test and production use the same BusinessLogicResolver architecture - the only difference is which facets are registered

2. **Treasury Configuration is the Key Variable**:
   - Tests: Minimal config (2 facets)
   - Production: Full config (5 facets)
   - Same config ID (`20'000`) in both cases

3. **KPI Deployment is REAL in Tests**: Unlike Treasury and Bond, KPI deployment is not mocked - tests use the actual Transparent Upgradeable Proxy pattern

4. **Mocks Validate Business Logic, Not Integration**: Test mocks verify FactorySuite's orchestration logic (validation, sequencing, error handling) without the overhead of complete deployments

## Shared Infrastructure Pattern

### Overview

FactorySuite uses a **single shared BusinessLogicResolver (BLR)** across all domains. This centralized registry approach provides:

- **Cost Efficiency**: Deploy common facets once, reuse across domains
- **Consistency**: Same AccessControl and Pause implementations everywhere
- **Simplicity**: One upgrade mechanism for shared functionality
- **Modularity**: Domain-specific facets registered alongside shared ones

### Architecture

```
┌────────────────────────────────────────────────────────┐
│        BusinessLogicResolver (Single Instance)         │
│                                                         │
│  Registered Configurations:                            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Config ID: 10'000 (Primary Market)             │ │
│  │  Version: 1                                      │ │
│  │  Facets: AccessControl, Pause, PrimaryMarket... │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Config ID: 20'000 (Treasury)                   │ │
│  │  Version: 1                                      │ │
│  │  Facets: AccessControl, Pause,                  │ │
│  │          LifeCycleCashFlow, Portfolio,          │ │
│  │          ProceedsManagement                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Config ID: 30'000 (FactorySuite)               │ │
│  │  Version: 1                                      │ │
│  │  Facets: AccessControl, Pause, FactorySuite     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Registered Facet Implementations:                     │
│  ├─ AccessControlFacet: 0xABC...                      │
│  ├─ PauseFacet: 0xDEF...                              │
│  ├─ FactorySuiteFacet: 0x123...                       │
│  ├─ LifeCycleCashFlowFacet: 0x456...                  │
│  ├─ PortfolioFacet: 0x789...                          │
│  └─ ... (other facets)                                 │
└────────────────────────────────────────────────────────┘
             │                │                │
             ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Primary      │  │  Treasury    │  │ FactorySuite │
    │ Market       │  │  ResolverProxy│  │ ResolverProxy│
    │ ResolverProxy│  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
```

### How ResolverProxy Works

When deploying a Treasury contract via `deployBondSuite()`:

```typescript
// TreasuryData structure
const treasuryData = {
  resolver: blrAddress,                    // Shared BLR address
  resolverProxyConfiguration: {
    key: bytes32(20000),                   // Treasury config ID
    version: 1                             // Config version
  },
  rbacs: [...],                            // Role configurations
  paymentToken: '0x...',                   // Payment token address
  environmentalAssets: ['0x...']           // Environmental asset addresses
};

// Internal execution in FactorySuiteStorageWrapper.sol
new ResolverProxy(
  treasuryData.resolver,                   // BLR address
  treasuryData.resolverProxyConfiguration.key,    // 20'000
  treasuryData.resolverProxyConfiguration.version, // 1
  treasuryData.rbacs
);
```

**ResolverProxy Constructor Steps:**
1. Queries BLR: "Give me configuration 20'000, version 1"
2. BLR returns: List of Treasury facet addresses
3. ResolverProxy performs Diamond Cut: Adds all 5 facets to proxy
4. Applies RBAC configurations
5. Result: Fully functional Treasury Diamond proxy

### Facet Reuse Strategy

**Shared Facets** (used by multiple domains):
- `AccessControlFacet`: RBAC management
- `PauseFacet`: Emergency pause functionality

**Domain-Specific Facets** (unique to each domain):
- FactorySuite: `FactorySuiteFacet`
- Treasury: `LifeCycleCashFlowFacet`, `PortfolioFacet`, `ProceedsManagementFacet`
- Primary Market: `PrimaryMarketFacet` (future)

### Configuration Version Management

Each config ID supports multiple versions for upgrades:

```
Config ID 20'000:
├─ Version 1: Initial Treasury implementation (5 facets)
├─ Version 2: Enhanced Treasury with additional features (6 facets)
└─ Version 3: Optimized Treasury (6 facets, gas improvements)
```

When deploying a new bond, specify which version to use via `resolverProxyConfiguration.version`.

## Code Examples

### Example 1: Calling deployBondSuite() in Tests

```typescript
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployFactorySuiteWithMocksForBusinessLogic, createTestDataSets } from '@test/fixtures';

describe('FactorySuite Tests', () => {
  it('should deploy bond suite successfully', async () => {
    // Load fixture (happens once, snapshotted for subsequent tests)
    const { factorySuite, mockAtsFactory, blr, paymentToken,
            environmentalAssetToken1, admin } =
      await loadFixture(deployFactorySuiteWithMocksForBusinessLogic);

    // Create test data
    const testData = createTestDataSets({
      mockResolver: { address: blr.address },
      paymentToken,
      environmentalAssetToken1,
      environmentalAssetToken2: environmentalAssetToken1, // Reuse for simplicity
      admin,
      user: admin
    });

    // Call deployBondSuite
    const tx = await factorySuite
      .connect(admin)
      .deployBondSuite(
        mockAtsFactory.address,
        testData.validBondData,
        testData.validFactoryRegulationData,
        testData.validTreasuryData,
        testData.validKpiData
      );

    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });
});
```

### Example 2: Preparing TreasuryData for Production

```typescript
import { TREASURY_CONFIG_ID } from '@scripts';
import { ethers } from 'hardhat';

// Assume Treasury facets already deployed and registered in BLR
const blrAddress = '0x...'; // Shared BLR address
const treasuryConfigVersion = 1; // Use version 1 of Treasury config

// Prepare payment token (e.g., USDC on Hedera testnet)
const usdcAddress = '0x...';

// Prepare environmental assets (e.g., carbon credit NFTs)
const carbonCreditNftAddress = '0x...';
const carbonForwardNftAddress = '0x...';

// Define RBAC for Treasury
const FUNDS_MANAGER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('FUNDS_MANAGER')
);
const fundsManagerAddress = '0x...'; // Issuer's funds manager

const treasuryData = {
  resolver: blrAddress,
  resolverProxyConfiguration: {
    key: TREASURY_CONFIG_ID, // bytes32(uint256(20000))
    version: treasuryConfigVersion
  },
  rbacs: [
    {
      role: FUNDS_MANAGER_ROLE,
      members: [fundsManagerAddress]
    }
  ],
  paymentToken: usdcAddress,
  environmentalAssets: [
    carbonCreditNftAddress,
    carbonForwardNftAddress
  ]
};

// Now ready to call deployBondSuite with this treasuryData
```

### Example 3: Deploying FactorySuite to Production

```typescript
import { deployFactorySuiteWithExistingInfra } from '@scripts/workflows';
import { HardhatProvider } from '@hashgraph/asset-tokenization-contracts/scripts';

async function deployToTestnet() {
  const provider = new HardhatProvider();

  // Assume ATS already deployed shared infrastructure
  const existingInfrastructure = {
    blrAddress: '0x...',              // From ATS deployment
    proxyAdminAddress: '0x...',       // From ATS deployment
    facets: {
      accessControl: '0x...',         // From ATS deployment
      pause: '0x...'                  // From ATS deployment
    }
  };

  // Deploy FactorySuite using existing infrastructure
  const output = await deployFactorySuiteWithExistingInfra(
    provider,
    'testnet',
    existingInfrastructure,
    {
      useTimeTravel: false,
      saveOutput: true,
      outputPath: './deployments/factorysuite-testnet.json'
    }
  );

  console.log('FactorySuite Proxy:', output.infrastructure.factorySuite.proxy);
  console.log('Config ID:', output.configuration.configId);
  console.log('Config Version:', output.configuration.version);

  return output;
}
```

## Registry Generation

### Overview

The FactorySuite registry is automatically generated using ATS registry tools. The registry provides comprehensive metadata for all our custom facets including method signatures, event topics, error selectors, and more.

### Automatic Generation

The registry is regenerated automatically every time you compile:

```bash
npm run compile
# ✅ Compiles contracts
# ✅ Generates TypeChain types
# ✅ Generates registry (silent mode)
```

### Manual Generation

To regenerate without full compilation:

```bash
npm run generate:registry           # Standard output
npm run generate:registry -- --verbose # Detailed output
npx hardhat generate-registry       # Via Hardhat task
```

### Generated Output

**File:** `scripts/domain/factorySuiteRegistry.data.ts`

Contains:
- **FACET_REGISTRY**: Complete facet definitions with metadata
- **CONTRACT_REGISTRY**: Infrastructure contract definitions
- **STORAGE_WRAPPER_REGISTRY**: Storage wrapper definitions
- **ROLES**: All role constants (auto-extracted from constants files)
- **TOTAL_FACETS**, **TOTAL_ROLES**: Summary counts

Each facet includes:
- Name and description
- Method signatures and selectors
- Event signatures and topic0 hashes
- Custom error signatures and selectors
- Inheritance chain
- Resolver key

### Usage

```typescript
import { getFacetDefinition, getAllFacets, ROLES, factorySuiteRegistry } from '@scripts/domain';

// Get facet metadata using helper functions
const facet = getFacetDefinition('FactorySuiteFacet');
console.log(facet.methods);      // All public/external methods
console.log(facet.events);       // All events with topic0
console.log(facet.errors);       // All custom errors
console.log(facet.resolverKey);  // Resolver key for BLR registration

// Get all facets
const allFacets = getAllFacets();

// Access roles
console.log(ROLES.DEPLOYER_ROLE);
console.log(ROLES.KPI_DATA_MANAGER_ROLE);

// Use in deployment with multi-registry support
import { deployFacets, atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts';

// Pass multiple registries as array - ATS handles combining internally
const result = await deployFacets(provider, {
  facetNames: ['AccessControlFacet', 'PauseFacet', 'FactorySuiteFacet'],
  registries: [atsRegistry, factorySuiteRegistry]
});
```

### When Registry Updates

Registry automatically regenerates when:
- ✅ Running `npm run compile`
- ✅ Adding new facets
- ✅ Modifying facet methods
- ✅ Adding/changing events or errors

The generated file is committed to git for version tracking.

### Multi-Registry Support

FactorySuite combines ATS standard facets with custom facets using multi-registry support:

**Pattern:**
```typescript
import { atsRegistry } from '@hashgraph/asset-tokenization-contracts/scripts';
import { factorySuiteRegistry } from '@scripts/domain';

// Pass array of registries - ATS infrastructure combines them internally
await deployFacets(provider, {
  facetNames: ['AccessControlFacet', 'FactorySuiteFacet'],
  registries: [atsRegistry, factorySuiteRegistry]
});

await registerFacets(provider, {
  blrAddress: '0x123...',
  facets: { 'AccessControlFacet': '0xabc...', 'FactorySuiteFacet': '0xdef...' },
  registries: [atsRegistry, factorySuiteRegistry]
});

await createFactorySuiteConfiguration(
  blr,
  facetAddresses,
  false,
  [atsRegistry, factorySuiteRegistry]
);
```

**Benefits:**
- ✅ ATS handles registry combining with conflict resolution
- ✅ Standard facets resolve from `atsRegistry`
- ✅ Custom facets resolve from `factorySuiteRegistry`
- ✅ Clean separation of concerns

### Integration with ATS

Uses ATS registry generation tools and patterns:
- **Generator**: `generateRegistryPipeline` from ATS for consistency
- **Factory Pattern**: `createRegistryHelpers` for type-safe helper functions
- **Metadata Format**: Same structure as ATS for compatibility
- **Multi-Registry**: Pass arrays of registries to ATS deployment operations
- **Direct Imports**: Core utilities from `@hashgraph/asset-tokenization-contracts/scripts`

This alignment ensures:
- ✅ Code reuse with battle-tested ATS infrastructure
- ✅ Consistent patterns across projects
- ✅ Seamless integration of custom and standard facets
- ✅ Easy maintenance and future updates
- ✅ Seamless integration with ATS deployment workflows

## Development Commands

```shell
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

# Cleanup
npm run clean                      # Clean build artifacts
```

## Testing Strategy

### Framework & Tools

- **Hardhat 2.26.3**: Core development environment
- **TypeChain + Ethers V5**: Type-safe contract interactions
- **Chai + Hardhat Matchers**: Ethereum-specific assertions
- **Solidity Coverage**: Code coverage analysis

### Testing Architecture

#### Primary Approach: TypeScript Testing
- **Language**: TypeScript for type safety and rich tooling
- **Pattern**: Fixture-based isolation using `loadFixture`
- **Performance**: Automatic state snapshots between tests
- **Assertions**: Ethereum-specific matchers for events, balances, reverts

#### Secondary Approach: Solidity Testing (Future)
- **Use Case**: Gas-optimized scenarios and fuzz testing
- **Benefits**: EVM-native execution and cheatcodes access
- **Integration**: Complementary to TypeScript tests

### Test Organization

```
test/
├── fixtures/                      # Reusable deployment fixtures
│   ├── factorySuiteFixtures.ts   # Core FactorySuite infrastructure
│   └── factoryFixtures.ts        # Supporting factory fixtures
├── mocks/                         # Mock contracts for testing
│   ├── MockAtsFactory.sol        # Mock Bond deployment
│   ├── MockTreasuryFacet.sol     # Mock Treasury functionality
│   ├── MockERC20.sol             # Mock payment tokens
│   └── MockERC721.sol            # Mock environmental assets
├── helpers/                       # Test utilities
│   ├── data.ts                   # Test data generation
│   └── blr.ts                    # BLR configuration helpers
├── unit/                          # Unit tests
│   ├── factorySuite.test.ts      # Core factory business logic
│   └── factorySuiteFacet.test.ts # Facet-specific tests
└── integration/                   # Integration tests
    └── FactorySuite.test.ts      # End-to-end workflows
```

#### Fixture-Based Testing

Tests use **Hardhat Network Helpers' loadFixture pattern** for optimal performance:

```typescript
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deployFactorySuiteWithMocksForBusinessLogic } from '@test/fixtures';

describe('FactorySuite', () => {
  it('should deploy bond suite', async () => {
    // loadFixture executes deployment ONCE, then snapshots state
    // Subsequent calls restore from snapshot (fast!)
    const { factorySuite, mockAtsFactory, admin } =
      await loadFixture(deployFactorySuiteWithMocksForBusinessLogic);

    // Test logic here
  });
});
```

**Benefits:**
- **Performance**: Deployment happens once, state snapshotted
- **Isolation**: Each test gets fresh state from snapshot
- **Consistency**: Identical starting conditions across tests
- **Speed**: ~10x faster than redeploying for each test

#### Mock Treasury Configuration

Tests use a **lightweight Treasury configuration** for speed:

```typescript
// Test configuration (2 facets)
Config ID: 20'000
Version: 1
Facets:
  - AccessControlFacet (shared, reused)
  - MockTreasuryFacet (minimal implementation)

// vs Production configuration (5 facets)
Config ID: 20'000
Version: 1
Facets:
  - AccessControlFacet
  - PauseFacet
  - LifeCycleCashFlowFacet
  - PortfolioFacet
  - ProceedsManagementFacet
```

This approach validates FactorySuite's orchestration logic without the overhead of deploying complete Treasury infrastructure.

#### Test Data Generation

The `createTestDataSets()` helper generates valid and invalid test data:

```typescript
const testData = createTestDataSets({
  mockResolver: { address: blr.address },
  paymentToken,
  environmentalAssetToken1,
  environmentalAssetToken2,
  admin,
  user
});

// Provides:
testData.validBondData
testData.validFactoryRegulationData
testData.validTreasuryData
testData.validKpiData
testData.invalidTreasuryData.zeroResolver
testData.invalidTreasuryData.zeroPaymentToken
testData.invalidKpiData
```

### Coverage Standards

- **Target**: 100% line and branch coverage
- **Rationale**: Critical deployment infrastructure requires complete testing
- **Areas**: Happy paths, error conditions, edge cases, access control
- **Tools**: `npx hardhat coverage` for detailed coverage reports

### Testing Patterns

#### Fixture Pattern
```typescript
async function deployFactorySuiteFixture() {
  // Setup contracts and return state
  return { factorySuite, mockFactory, accounts };
}

describe('FactorySuite', () => {
  beforeEach(async () => {
    ({ factorySuite, mockFactory } = await loadFixture(deployFactorySuiteFixture));
  });
});
```

#### Event Testing
```typescript
await expect(contract.deployBondSuite(...args))
  .to.emit(contract, 'BondSuiteDeployed')
  .withArgs(expectedArgs);
```

#### Error Testing
```typescript
await expect(contract.invalidCall())
  .to.be.revertedWithCustomError(contract, 'InvalidTreasuryData');
```

#### Access Control Testing
```typescript
await expect(contract.connect(unauthorizedUser).restrictedFunction())
  .to.be.revertedWith('AccessControl: account 0x... is missing role 0x...');
```

### Best Practices

1. **Isolation**: Each test starts from clean fixture state
2. **Specificity**: One assertion per test when possible
3. **Descriptive**: Test names explain the scenario and expected outcome
4. **Comprehensive**: Cover all execution paths including error conditions
5. **Performance**: Use `loadFixture` to optimize deployment costs

### CI Integration

Tests are integrated into the development workflow:
- **Pre-commit**: Automated testing on code changes
- **Coverage Gates**: Minimum coverage thresholds enforced
- **Gas Analysis**: Monitor deployment and execution costs
- **Security**: Automated vulnerability scanning
