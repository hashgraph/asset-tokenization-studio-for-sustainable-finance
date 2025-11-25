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
