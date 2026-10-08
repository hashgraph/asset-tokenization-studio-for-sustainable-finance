# Primary Market Smart Contracts

Public offering management with subscription handling and DvP (Delivery vs Payment) guarantees for the Evercity green bonds platform.

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Architecture](#architecture)
  - [Dual Configuration Pattern](#dual-configuration-pattern)
  - [Factory Configuration](#factory-configuration)
  - [Instance Configuration](#instance-configuration)
  - [Roles & Permissions](#roles--permissions)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Deployment Commands](#deployment-commands)
  - [Environment Configuration](#environment-configuration)
- [Upgrades](#upgrades)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites-1)
  - [Upgrade Commands](#upgrade-commands)
  - [Upgrading Both Configurations](#upgrading-both-configurations)
  - [Upgrade Output](#upgrade-output)
  - [Troubleshooting Upgrades](#troubleshooting-upgrades)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Coverage](#coverage)
- [Development Commands](#development-commands)
- [Configuration Reference](#configuration-reference)
  - [Config IDs](#config-ids)
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

This package provides smart contracts for the Primary Market domain within the Evercity green bonds platform:

- **Primary Market Factory**: Deploys new Primary Market instances
- **Primary Market Contract**: Manages offerings and subscriptions with DvP guarantees
- **Offering Lifecycle**: Creation, subscription, execution, and cancellation
- **Payment Integration**: ERC20 payment token transfers with allowance validation

### Key Features

- **DvP Guarantees**: Delivery vs Payment for atomic asset and payment transfers
- **Dual Configuration**: Factory for deployment + Instance for business logic
- **Role-Based Offering**: Only authorized users can create offerings
- **Compliance Checks**: Whitelist validation and allowance verification
- **Diamond Pattern**: Upgradeable architecture using EIP-2535

## Architecture

### Dual Configuration Pattern

Primary Market uses **two separate Diamond configurations**:

1. **FactoryPrimaryMarket** (Config ID: 10000) - Deploys new PM instances
2. **PrimaryMarket** (Config ID: 10001) - Offering and subscription management

### Factory Configuration

```
┌─────────────────────────────────┐
│  FactoryPrimaryMarket Proxy     │
│  Config ID: 10'000              │
│                                 │
│  Facets:                        │
│  ├─ AccessControlFacet (shared) │
│  ├─ PauseFacet (shared)        │
│  └─ FactoryPrimaryMarketFacet  │
└─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  BusinessLogicResolver (BLR)  │
│  Shared across all domains    │
└──────────────────────────────┘
```

**Responsibilities:**

- Deploy new Primary Market diamond proxies
- Configure RBAC for new instances
- Set up resolver proxy integration

### Instance Configuration

```
┌─────────────────────────────────┐
│  PrimaryMarket Diamond Proxy    │
│  Config ID: 10'001              │
│                                 │
│  Facets:                        │
│  ├─ AccessControlFacet (shared) │
│  ├─ PauseFacet (shared)        │
│  ├─ DiamondFacet (shared)      │
│  ├─ OfferingFacet              │
│  └─ SubscriptionFacet          │
└─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  BusinessLogicResolver (BLR)  │
│  Shared across all domains    │
└──────────────────────────────┘
```

**Responsibilities:**

- Create and manage offerings
- Accept and process subscriptions
- Execute offerings with DvP guarantees
- Cancel offerings and refund subscribers

### Roles & Permissions

| Role                 | Description                  | Permissions                               |
| -------------------- | ---------------------------- | ----------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Primary Market administrator | Grant/revoke roles, configure settings    |
| `OFFERING_CREATOR`   | Offering manager             | Create new offerings for tokenized assets |
| `PAUSER_ROLE`        | Emergency control            | Pause/unpause contract operations         |

## Deployment

### Prerequisites

1. **BLR Infrastructure** - Deployed BusinessLogicResolver proxy
2. **Private Key** - Configured for target network
3. **Network Access** - RPC endpoint for Hedera testnet/mainnet

### Deployment Commands

**From package directory:**

```bash
cd packages/primary-market/contracts
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

Primary Market uses a **dual configuration pattern**: one configuration for the factory, one for instances.

**Infrastructure (shared from platform deployment):**

- ✅ BusinessLogicResolver (BLR) proxy - Already deployed
- ✅ ProxyAdmin - Already deployed
- ✅ Shared facets - AccessControl, Pause, Diamond (already deployed)

**Configurations in BLR (metadata only, not deployed proxies):**

- ✅ **FactoryPrimaryMarket configuration (Config ID 10000)** - Template for factory proxy
- ✅ **PrimaryMarket configuration (Config ID 10001)** - Template for PM instances

**Factory Proxy (deployed and immediately usable):**

- ✅ **FactoryPrimaryMarket ResolverProxy** - Uses Config 10000, can deploy PM instances

### What Fresh Deployment Does NOT Create

**Instance Proxies (created later on-demand):**

- ❌ **PrimaryMarket instance proxies** - Created by calling `FactoryPrimaryMarket.deployPrimaryMarket()`

### Why This Design?

**One factory creates many instances:**

- Primary Market instances are created per offering (many instances possible)
- Each offering gets its own dedicated PrimaryMarket proxy
- All instances share the same configuration (Config 10001) but have separate storage

**Dual configuration pattern:**

```
Config 10000 (FactoryPrimaryMarket)
    ├─ Defines factory behavior
    ├─ AccessControlFacet
    ├─ PauseFacet
    └─ FactoryPrimaryMarketFacet (deployment logic)

Config 10001 (PrimaryMarket)
    ├─ Defines instance behavior
    ├─ AccessControlFacet
    ├─ PauseFacet
    ├─ DiamondFacet
    ├─ OfferingFacet (business logic)
    └─ SubscriptionFacet (business logic)
```

**Factory vs Instance relationship:**

```
FactoryPrimaryMarket Proxy (Config 10000)
        ↓ deploys
PrimaryMarket instances (Config 10001)
   Instance #1 → Offering for Bond A
   Instance #2 → Offering for Bond B
   Instance #3 → Secondary sale for Bond A
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
    "factoryPrimaryMarket": {
      "proxy": "0x..."              // Factory proxy (deployed) ✅
    }
  },
  "configurations": {
    "factoryPrimaryMarket": {       // Config 10000 (metadata in BLR)
      "configId": 10000,
      "version": 1,
      "facetKeys": [...]
    },
    "primaryMarket": {              // Config 10001 (metadata in BLR)
      "configId": 10001,
      "version": 1,
      "facetKeys": [...]
    }
  },
  "facets": [
    { "name": "FactoryPrimaryMarketFacet", "address": "0x..." },
    { "name": "OfferingFacet", "address": "0x..." },
    { "name": "SubscriptionFacet", "address": "0x..." }
  ]
}
```

**What you WON'T see (and why):**

- ❌ No `primaryMarket.infrastructure.proxy` field
- ❌ No instance proxy addresses in deployment output
- **Reason:** PrimaryMarket instances don't exist yet - they're created later by calling the factory

**This is correct behavior, not an error!** The deployment creates:

1. Template configurations (10000 and 10001)
2. Factory proxy (uses Config 10000)
3. Facet implementations (used by both configs)

Instance proxies (using Config 10001) are created on-demand after deployment.

### How to Create PrimaryMarket Instances

**After deployment, create instances using the factory:**

```typescript
import { FactoryPrimaryMarketFacet__factory } from "@hashgraph/primary-market-contracts";

// Connect to deployed factory
const factory = FactoryPrimaryMarketFacet__factory.connect(
  deploymentResult.infrastructure.factoryPrimaryMarket.proxy,
  signer,
);

// Deploy new PrimaryMarket instance for an offering
const tx = await factory.deployPrimaryMarket(
  assetAddress, // Bond asset to create offering for
  10001, // Config ID for PrimaryMarket instances
  1, // Version (from deployment)
);

await tx.wait();

// Extract new proxy address from events
const event = tx.events?.find((e) => e.event === "PrimaryMarketDeployed");
const primaryMarketProxy = event?.args?.proxyAddress;

console.log("New PrimaryMarket instance:", primaryMarketProxy);
```

**Each instance is independent:**

```typescript
// Instance #1 for Bond A's primary offering
const pm1 = await factory.deployPrimaryMarket(bondA, 10001, 1);

// Instance #2 for Bond B's primary offering
const pm2 = await factory.deployPrimaryMarket(bondB, 10001, 1);

// Instance #3 for Bond A's secondary sale
const pm3 = await factory.deployPrimaryMarket(bondA, 10001, 1);

// All three use Config 10001 but have separate storage
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
               ├─► FactoryPrimaryMarket Proxy ✅ (Config 10000)
               │   └─ Can deploy: PrimaryMarket instances
               │
               └─► BLR contains templates:
                   ├─ FactoryPrimaryMarket Config (10000) ✅
                   └─ PrimaryMarket Config (10001) ✅

❌ NO PrimaryMarket instances yet
```

### Architecture After Creating Instances

```
┌──────────────────────────────────┐
│  Shared Infrastructure           │
│  (same as above)                 │
└──────────────┬───────────────────┘
               │
               ├─► FactoryPrimaryMarket Proxy ✅ (Config 10000)
               │   │
               │   ├─► PrimaryMarket Instance #1 ✅ (Config 10001)
               │   │   └─ Offering for Bond A
               │   │
               │   ├─► PrimaryMarket Instance #2 ✅ (Config 10001)
               │   │   └─ Offering for Bond B
               │   │
               │   └─► PrimaryMarket Instance #3 ✅ (Config 10001)
               │       └─ Secondary sale for Bond A
               │
               └─► BLR contains templates:
                   └─ All instances use PrimaryMarket Config (10001)
```

### Key Takeaways

1. **Two configurations, not one** - Factory uses Config 10000, instances use Config 10001
2. **Factory is deployed, instances are not** - Deployment creates factory, instances created on-demand
3. **Missing instance proxies in deployment = correct** - This is by design, not an error
4. **One factory, unlimited instances** - Each offering gets its own PrimaryMarket proxy
5. **All instances share same configuration** - Config 10001 defines behavior, but storage is separate

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

**Factory Configuration (10000):**

- FactoryPrimaryMarketFacet (complete redeploy)
- TimeTravelFactoryPrimaryMarketFacet (if --time-travel flag set)

**Instance Configuration (10001):**

- OfferingFacet (complete redeploy)
- SubscriptionFacet (complete redeploy)
- TimeTravelOfferingFacet (if --time-travel flag set)

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
cd packages/primary-market/contracts
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

### Upgrading Both Configurations

Primary Market has **two configurations** that can be upgraded:

**Upgrade Factory only:**

```bash
npm run upgrade:factory -- --blr-address=0x123...
```

**Upgrade Instance only:**

```bash
npm run upgrade:instance -- --blr-address=0x123...
```

**Upgrade both (recommended):**

```bash
npm run upgrade -- --blr-address=0x123...
```

### Upgrade Output

Upgrades save results to:

- Factory: `deployments/{network}/{network}-factoryprimarymarket-upgrade-{timestamp}.json`
- Instance: `deployments/{network}/{network}-primarymarket-upgrade-{timestamp}.json`

**Factory Upgrade Output:**

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
    "configId": "10000",
    "version": 2,
    "facetCount": 1
  },
  "summary": {
    "totalFacetsDeployed": 1,
    "proxiesUpdated": 0,
    "proxiesFailed": 0,
    "success": true
  }
}
```

**Instance Upgrade Output:**

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
    "configId": "10001",
    "version": 2,
    "facetCount": 2
  },
  "summary": {
    "totalFacetsDeployed": 2,
    "proxiesUpdated": 3,
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
npx hardhat test test/PrimaryMarketOffering.test.ts
```

### Coverage

Primary Market contracts maintain 80%+ line coverage:

- Offering facet: Offering creation, execution, cancellation
- Subscription facet: Subscription submission and processing
- Factory facet: Primary Market instance deployment

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

### Config IDs

- **FactoryPrimaryMarket**: `10000`
- **PrimaryMarket**: `10001`

### Role Constants

```solidity
bytes32 public constant OFFERING_CREATOR = keccak256("OFFERING_CREATOR");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
```
