# Green Bonds Platform - Shared Infrastructure Contracts

Multi-Module Infrastructure Orchestration for the Green Bonds Platform. Deploy complete GBP infrastructure with smart contract orchestration, Diamond pattern architecture, and comprehensive upgrade workflows.

## Quick Reference

| I want to...                          | Command                             | Documentation                                            |
| ------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| **Deploy locally** (fastest - 30 sec) | `npm run deploy:local`              | [Quick Start](#quick-start-5-minutes)                    |
| **Deploy to Hedera testnet**          | `npm run deploy:hedera:testnet`     | [Testnet Deployment](#hedera-testnetmainnet-deployment)  |
| **Upgrade configurations**            | `BLR_ADDRESS=0x... npm run upgrade` | [Upgrades](#upgrades)                                    |
| **Validate deployment**               | See validation commands             | [docs/output-validation.md](./docs/output-validation.md) |
| **Test deployment**                   | Step-by-step procedures             | [docs/testing.md](./docs/testing.md)                     |
| **Understand architecture**           | Read architecture section           | [Architecture](#architecture)                            |

## Table of Contents

### 🚀 Getting Started (5-10 minutes)

- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Prerequisites](#prerequisites)
- [Deployment Modes](#deployment-modes)
- [Hardhat Local Deployment](#hardhat-local-deployment)
- [Hedera Local Deployment](#hedera-local-deployment)
- [Hedera Testnet/Mainnet Deployment](#hedera-testnetmainnet-deployment)
- [Validating Your Deployment](#validating-your-deployment)
- [Success Criteria](#success-criteria)
- [Troubleshooting](#troubleshooting)

### 📖 Core Documentation (5-10 minutes)

- [Architecture](#architecture)
- [Understanding Deployment vs Instance Creation](#understanding-deployment-vs-instance-creation)
- [Deployment Result](#deployment-result)
- [Configuration Upgrades](#upgrades)

### 🔧 Advanced Topics

- [Implementation Details](#implementation-details)
- [Development](#development)
- [Related Documentation](#related-documentation)

---

## Quick Start (5 Minutes)

**Goal:** Deploy GBP infrastructure to Hardhat local network and verify success.

```bash
# 1. Navigate to shared contracts package
cd packages/shared/contracts

# 2. Install dependencies (if not done already from monorepo root)
npm ci

# 3. Start Hardhat local network (Terminal 1)
npm run local:hardhat
# Keep this terminal open - Hardhat node must stay running

# 4. Deploy infrastructure (Terminal 2)
npm run deploy:local
# Or from monorepo root: npm run shared:contracts:deploy:local

# 5. Verify success
# Look for: "[SUCCESS] ✅ GBP infrastructure deployment completed!"
# Deployment should take ~30 seconds
```

### Success Checklist ✓

After deployment completes, verify these indicators:

**✓ Console Output:**

```
[SUCCESS] ✅ GBP infrastructure deployment completed!
```

**✓ 5 Callable Contracts:**

```bash
# Quick validation (requires jq)
jq '.callableContracts | keys | length' \
  $(ls -t deployments/local/gbpInfrastructure-*.json | head -1)
# Should show: 5
```

**✓ All Configurations Successful:**

```bash
# Check summary
jq '.result.bondDeployment.summary.success,
    .result.treasuryDeployment.summary.success,
    .result.factorySuiteDeployment.summary.success,
    .result.primaryMarketDeployment.summary.success' \
  $(ls -t deployments/local/gbpInfrastructure-*.json | head -1)
# Should show: true, true, true, true
```

**✓ Correct Facet Counts:**

```bash
# Verify total facets deployed
jq '[.result.bondDeployment.summary.totalFacets,
     .result.treasuryDeployment.summary.totalFacets,
     .result.factorySuiteDeployment.summary.totalFacets,
     .result.primaryMarketDeployment.summary.totalFacets] | add' \
  $(ls -t deployments/local/gbpInfrastructure-*.json | head -1)
# Should show: 54 (48 + 3 + 1 + 2)
```

**✓ Output File Size:**

```bash
# Check file size is reasonable
ls -lh $(ls -t deployments/local/gbpInfrastructure-*.json | head -1)
# Should be approximately 44 KB
```

**If all checks pass:** 🎉 **Success!** Your GBP infrastructure is deployed and ready.

**If any check fails:** See [Troubleshooting](#troubleshooting) section for common issues.

**Expected Result:** 5 callable contracts deployed, output JSON file created (~44KB).

**What You Just Did:**

- Started a local Ethereum development network (Hardhat, Chain ID 31337)
- Deployed complete GBP infrastructure: ProxyAdmin + BLR + 4 domain systems
- Generated deployment output with contract addresses and metadata

**Next Steps:**

- **Verify deployment:** See [Validating Your Deployment](#validating-your-deployment)
- **Understand what was deployed:** See [Understanding Deployment vs Instance Creation](#understanding-deployment-vs-instance-creation)
- **Learn more:** Read [Architecture](#architecture) section

---

## Prerequisites

### Required Software

- **Node.js**: Version 22.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 10.x or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Terminal**: Command-line access (bash, zsh, or similar)

**Verify Installation:**

```bash
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### Optional Tools

- **jq**: JSON processor for validation commands ([Install Guide](https://jqlang.github.io/jq/download/))

  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt install jq
  ```

- **Docker Desktop**: Required only for Hedera local network testing

### ⚠️ CRITICAL: Build Contracts First

**All deployments and upgrades require pre-built contracts.**

From monorepo root:

```bash
cd /path/to/green-bonds-platform
npm ci
npm run contracts:build
```

This compiles all smart contracts and generates TypeScript artifacts. **Deployments will fail if this step is skipped.**

**Verification:**

```bash
# Check that build artifacts exist
ls -lh packages/shared/contracts/build/
# Should show compiled TypeScript files
```

### Project Setup

If you haven't cloned the repository yet:

```bash
# Clone repository
git clone <repository-url>
cd green-bonds-platform

# Install all dependencies (from monorepo root)
npm ci

# Navigate to shared contracts
cd packages/shared/contracts
```

### Configuration Setup

**Environment File Setup:**

All configuration is managed through environment variables that can be set in a `.env` file or exported inline.

```bash
# 1. Copy the template to create your .env file
cp .env.example .env

# 2. Edit .env with your actual configuration
nano .env  # or use your preferred editor (vim, code, etc.)
```

**Required Environment Variables by Network:**

See `.env.example` for the complete list of all 30+ environment variables. Key variables for each network:

**For Hardhat Local Development:**

```bash
NETWORK=local  # Optional, defaults to local if not set
LOCAL_PRIVATE_KEY_0=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# ↑ Hardhat test account #0 (pre-funded with 10000 ETH)
```

**For Hedera Testnet:**

```bash
NETWORK=hedera-testnet
HEDERA_TESTNET_PRIVATE_KEY_0=0x...  # Your testnet private key (64 hex chars)
```

**For Hedera Mainnet:**

```bash
NETWORK=hedera-mainnet
HEDERA_MAINNET_PRIVATE_KEY_0=0x...  # Your mainnet private key (64 hex chars)
```

**Upgrade-Specific Variables (required for upgrade operations only):**

```bash
BLR_ADDRESS=0x...  # Business Logic Resolver proxy address from deployment output
# Optional proxy addresses (only needed for ResolverProxy contracts):
FACTORYSUITE_PROXIES=0x...
FACTORYPRIMARYMARKET_PROXIES=0x...
```

**Note:** All environment variables can be set in the `.env` file OR exported inline in your terminal. The `.env` file method is recommended for persistent configuration.

---

## Deployment Modes

Choose the deployment mode that fits your needs:

| Mode              | Network        | Duration | Use Case                 | Requires            |
| ----------------- | -------------- | -------- | ------------------------ | ------------------- |
| **Hardhat Local** | Local (31337)  | ~30 sec  | Development, testing     | Node.js only        |
| **Hedera Local**  | Docker Hedera  | ~5-8 min | Hedera-specific features | Docker + hedera CLI |
| **Testnet**       | Hedera Testnet | ~10 min  | Staging, pre-production  | Account + HBAR      |
| **Mainnet**       | Hedera Mainnet | ~10 min  | Production deployment    | Account + HBAR      |

### Decision Matrix

**Choose Hardhat Local if:**

- ✅ You're developing or testing locally
- ✅ You need fast iteration cycles (instant mining)
- ✅ You don't need Hedera-specific features (contract IDs, mirror node)
- ✅ This is your first time deploying GBP contracts

**Choose Hedera Local if:**

- ✅ You need to test Hedera-specific features
- ✅ You want contract IDs and mirror node API access
- ✅ You're testing before deploying to testnet/mainnet
- ✅ You have Docker Desktop installed

**Choose Testnet/Mainnet if:**

- ✅ You're deploying for staging or production
- ✅ You have a funded Hedera account
- ✅ You need persistent deployments on real networks

**Recommendation for first-time users:** Start with **Hardhat Local** to understand the deployment process, then move to Hedera networks when needed.

---

## Expected Execution Times

Understanding typical execution times helps set expectations and identify stuck processes.

### Deployment Duration

| Network            | Total Time   | Breakdown                                     |
| ------------------ | ------------ | --------------------------------------------- |
| **Hardhat Local**  | 1-2 seconds  | Instant mining, no consensus delay            |
| **Hedera Local**   | 6-8 minutes  | Full consensus simulation + contract creation |
| **Hedera Testnet** | 8-12 minutes | Network consensus + mirror node indexing      |
| **Hedera Mainnet** | 8-12 minutes | Network consensus + mirror node indexing      |

### Upgrade Duration

| Network            | Total Time    | Per Domain     |
| ------------------ | ------------- | -------------- |
| **Hardhat Local**  | 3-5 seconds   | ~1 second      |
| **Hedera Local**   | 50-70 seconds | ~12-18 seconds |
| **Hedera Testnet** | 60-90 seconds | ~15-22 seconds |
| **Hedera Mainnet** | 60-90 seconds | ~15-22 seconds |

### Detailed Breakdown: Hedera Local Deployment

**Phase-by-Phase Timing** (7-minute total):

| Phase | Component          | Time  | Description                                      |
| ----- | ------------------ | ----- | ------------------------------------------------ |
| 1     | ProxyAdmin         | ~45s  | Single contract deployment                       |
| 2     | BLR Infrastructure | ~90s  | Implementation + Proxy + initialization          |
| 3     | BOND Domain        | ~120s | 48 facets + configuration registration           |
| 4     | Treasury Domain    | ~60s  | 3 facets + configuration registration            |
| 5     | FactorySuite       | ~60s  | 1 facet + configuration registration             |
| 6     | PrimaryMarket      | ~90s  | 2 facets + 2 configurations (factory + instance) |

**Why Hedera Takes Longer:**

- **Consensus Delay**: Multi-node consensus (~3-5 seconds per transaction)
- **Contract Creation**: Hedera creates contract on all nodes
- **Mirror Node Indexing**: Additional time for mirror node to index transactions
- **Network Simulation**: Full network stack (not just EVM)

### Detailed Breakdown: Hedera Upgrade

**Per-Domain Timing** (1-minute total for all 4 domains):

| Domain               | Facets   | Configuration   | Time |
| -------------------- | -------- | --------------- | ---- |
| FactorySuite         | 1 facet  | Config ID 30000 | ~14s |
| Treasury             | 3 facets | Config ID 20000 | ~22s |
| FactoryPrimaryMarket | 1 facet  | Config ID 10000 | ~14s |
| PrimaryMarket        | 1 facet  | Config ID 10001 | ~15s |

**What Takes Time:**

- **Facet Deployment**: Each facet is a separate contract deployment (~3-5s each)
- **BLR Registration**: Registering facets in BusinessLogicResolver (~2-3s per domain)
- **Configuration Creation**: Creating new configuration version (~2-3s per domain)
- **Proxy Updates** (optional): If proxy addresses provided, ~3-5s per proxy

### Performance Tips

**For Fastest Development:**

- Use **Hardhat Local** for rapid iteration
- Transactions mine instantly (no waiting)
- Full deployment completes in 1-2 seconds
- Ideal for testing deployment scripts and contract logic

**For Hedera-Specific Testing:**

- Use **Hedera Local** when you need:
  - Contract IDs (e.g., `0.0.1001`)
  - Mirror node REST API queries
  - Realistic network behavior
- Accept 7-minute deployment time as trade-off for realism

**For Pre-Production:**

- Use **Hedera Testnet** before mainnet deployment
- Similar timing to mainnet (~10 minutes)
- Test with real network conditions
- Free testnet HBAR from faucets

### When to Be Concerned

**Deployment is Taking Too Long:**

| Scenario       | Normal  | Concerning | Action                                       |
| -------------- | ------- | ---------- | -------------------------------------------- |
| Hardhat Local  | 1-2s    | >10s       | Check node console for errors                |
| Hedera Local   | 6-8min  | >15min     | Check Docker resources, restart network      |
| Hedera Testnet | 8-12min | >20min     | Check network status, verify account balance |

**Signs of Stuck Process:**

1. **No Console Output**: If deployment console shows no activity for >2 minutes

   ```bash
   # Check if process is still running
   ps aux | grep node

   # Check network connectivity (Hedera)
   curl http://127.0.0.1:7546
   ```

2. **Repeating Error Messages**: Same error appearing multiple times
   - Check logs for root cause
   - May indicate network issue or configuration problem

3. **High CPU/Memory Usage**: Process using excessive resources

   ```bash
   # macOS: Check resource usage
   top -pid $(pgrep -f "npm run deploy")

   # May indicate infinite loop or memory leak
   ```

**Recovery Steps:**

1. **Graceful Stop**: Press `Ctrl+C` in deployment terminal
2. **Check Network**: Ensure local network is still running (Terminal 1)
3. **Review Logs**: Check for error messages before the hang
4. **Restart Clean**:

   ```bash
   # Hedera Local
   hedera stop --clean
   hedera start -d

   # Hardhat Local
   # Ctrl+C in node terminal
   npm run local:hardhat
   ```

5. **Try Again**: Re-run deployment after clean restart

### Timing Variability

**Factors Affecting Execution Time:**

- **System Resources**: CPU, RAM, disk speed
- **Docker Configuration**: Memory allocation for Hedera local
- **Network Conditions**: For testnet/mainnet deployments
- **Concurrent Operations**: Other processes competing for resources

**Typical Variance:**

- **Hardhat Local**: ±0.5 seconds (very consistent)
- **Hedera Local**: ±2 minutes (Docker overhead, resource contention)
- **Hedera Testnet/Mainnet**: ±3 minutes (network congestion, gas prices)

---

## Hardhat Local Deployment

Deploy to a local Ethereum node for fast local development and testing. Works with Hardhat, Anvil (Foundry), Ganache, or any local node running on `http://127.0.0.1:8545`.

### Step 1: Start the Network

**Open Terminal 1:**

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
...

Chain ID: 0x7a69 (31337 in decimal)
```

**Keep this terminal open** - the Hardhat node must continue running for deployment to work.

**Verify Network is Running:**

```bash
# In Terminal 2, test connectivity
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","id":1,"result":"0x7a69"}
```

### Step 2: Run the Deployment

**In Terminal 2:**

```bash
cd packages/shared/contracts
npm run deploy:local
# Or from monorepo root: npm run shared:contracts:deploy:local
```

**What Happens:**

1. Builds TypeScript source (`npm run build`)
2. Executes deployment workflow with 6 orchestration steps:
   - **Step 1:** Deploy ProxyAdmin
   - **Step 2:** Deploy Business Logic Resolver (BLR) + TransparentUpgradeableProxy
   - **Step 3:** Deploy BOND domain (48 facets, config ID 2)
   - **Step 4:** Deploy Treasury domain (3 facets, config ID 20000)
   - **Step 5:** Deploy FactorySuite (1 facet, config ID 30000)
   - **Step 6:** Deploy PrimaryMarket (2 facets, config IDs 10000 & 10001)
3. Saves deployment output to JSON file

**Expected Duration:** ~30 seconds for Hardhat local

### Step 3: Verify Deployment Success

Look for this final message in Terminal 2:

```
[SUCCESS] ✅ GBP infrastructure deployment completed!
```

You should also see summary output:

```
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
```

### Automated Option

Single command that starts node, deploys, and cleans up:

```bash
npm run deploy:local:auto
```

**Note**: This runs the node in background and logs to `hardhat-node.log`. Less visible but convenient for quick tests.

### Advantages

- **Fast**: Instant transaction mining
- **Free**: No gas fees or testnet faucets needed
- **Deterministic**: Same accounts and state every restart
- **Debug-Friendly**: Detailed error messages and stack traces
- **Isolated**: No external dependencies

### When to Use

- **Local Development**: Rapid iteration without testnet delays
- **Testing**: Test deployment scripts before running on testnet
- **CI/CD**: Automated deployment testing in pipelines
- **Debugging**: Investigate deployment issues with full visibility

---

## Hedera Local Deployment

Deploy to Docker-based Hedera local network for testing Hedera-specific features with full network consensus simulation.

### Overview

The Hedera local network provides:

- **Full Hedera Network Simulation**: Multi-node consensus (4 nodes), mirror node REST API, JSON-RPC relay
- **Contract IDs**: Hedera-specific contract identifiers (e.g., `0.0.1001`)
- **Realistic Environment**: Tests Hedera-specific features not available on EVM-only networks
- **Deployment Time**: ~7 minutes (vs 1-2 seconds for Hardhat)

### Prerequisites

**Install Hedera CLI** (one-time setup):

```bash
# Install globally
npm install -g @hashgraph/hedera-local

# Verify installation
hedera --version  # Should show version number
```

**Ensure Docker is Running:**

```bash
# Check Docker status
docker ps

# If not running, start Docker Desktop
# macOS: Open Docker Desktop application
# Linux: sudo systemctl start docker
```

### Step 1: Start Hedera Network

**Open Terminal 1:**

```bash
hedera start -d
```

**Expected Output:**

```
Starting Hedera Local Node...
✓ Consensus nodes started (4 nodes)
✓ Mirror node started
✓ JSON-RPC relay started

Network Information:
  JSON-RPC Endpoint: http://127.0.0.1:7546
  Mirror Node REST API: http://127.0.0.1:5551
  Mirror Node gRPC: localhost:5600

Default Accounts:
  Account: 0.0.2 (Operator)
    - Private Key: 0x105d050185ccb907fba04dd92d8de9e32c18305e097ab41dadda21489a211524
    - EVM Address: 0x67D8d32E9Bf1a9968a5ff53B87d777Aa8EBBEe69
```

**Keep this terminal open** - the network must continue running for deployment.

**Verify Network is Running:**

```bash
# In Terminal 2, test JSON-RPC endpoint
curl -X POST http://127.0.0.1:7546 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","id":1,"result":"0x129"}  # Chain ID 297

# Test mirror node REST API
curl http://127.0.0.1:5551/api/v1/network/nodes

# Expected: JSON response with network node information
```

### Step 2: Deploy Infrastructure

**From Package Directory:**

```bash
cd packages/shared/contracts
npm run deploy:hedera:local
```

**From Monorepo Root:**

```bash
npm run shared:contracts:deploy:hedera:local
```

**Note:** Both commands produce identical results.

**What Happens:**

1. Builds TypeScript source (`npm run build`)
2. Executes deployment workflow with 6 orchestration steps:
   - **Step 1:** Deploy ProxyAdmin → Contract ID assigned
   - **Step 2:** Deploy BLR + TransparentUpgradeableProxy → Contract IDs assigned
   - **Step 3:** Deploy BOND domain (48 facets, config ID 2)
   - **Step 4:** Deploy Treasury domain (3 facets, config ID 20000)
   - **Step 5:** Deploy FactorySuite (1 facet, config ID 30000)
   - **Step 6:** Deploy PrimaryMarket (2 facets, config IDs 10000 & 10001)
3. Saves deployment output to `deployments/hedera-local/gbpInfrastructure-{timestamp}.json`

**Expected Duration:** ~7 minutes for Hedera local (vs 1-2 seconds for Hardhat)

### Step 3: Verify Deployment Success

**Look for Success Message:**

```
[SUCCESS] ✅ GBP infrastructure deployment completed!
```

**Check Deployment Output:**

```bash
# Find latest deployment file
ls -t deployments/hedera-local/gbpInfrastructure-*.json | head -1

# View contract IDs
cat $(ls -t deployments/hedera-local/gbpInfrastructure-*.json | head -1) | jq '.callableContracts'
```

**Expected Output Structure:**

```json
{
  "proxyAdmin": {
    "address": "0x...",
    "contractId": "0.0.1001"
  },
  "businessLogicResolver": {
    "address": "0x...",
    "contractId": "0.0.1002"
  },
  "atsFactory": {
    "address": "0x...",
    "contractId": "0.0.1003"
  }
}
```

### Step 4: Upgrade Configurations (Optional)

After deploying infrastructure, you can upgrade domain configurations:

**From Package Directory:**

```bash
cd packages/shared/contracts
BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28 npm run upgrade:hedera:local
```

**From Monorepo Root:**

```bash
BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28 npm run shared:contracts:upgrade:hedera:local
```

**Note:** Both commands produce identical results. Extract BLR address from deployment output file.

**What Happens:**

- Deploys new facet implementations for all 4 domains
- Registers facets in existing BLR
- Creates new configuration versions
- Duration: ~1 minute

### Step 5: Cleanup

**Stop Hedera Network:**

```bash
# Stop network (keeps data)
hedera stop

# Stop and remove all data
hedera stop --clean
```

**Remove Docker Containers:**

```bash
# List Hedera containers
docker ps -a | grep hedera

# Remove all Hedera containers
docker rm -f $(docker ps -aq --filter "name=hedera")

# Remove volumes (optional)
docker volume prune
```

### Common Issues

#### Hedera CLI Not Found

**Symptom:** `hedera: command not found`

**Solution:**

```bash
# Install CLI globally
npm install -g @hashgraph/hedera-local

# Verify installation
which hedera
hedera --version
```

#### Docker Not Running

**Symptom:** `Cannot connect to the Docker daemon`

**Solution:**

```bash
# macOS: Open Docker Desktop application
open -a Docker

# Linux: Start Docker service
sudo systemctl start docker

# Verify Docker is running
docker ps
```

#### Port Already in Use

**Symptom:** Network fails to start with port conflict error

**Hedera Ports:**

- **7546**: JSON-RPC relay
- **5551**: Mirror node REST API
- **5600**: Mirror node gRPC

**Solution:**

```bash
# Check what's using port 7546
lsof -ti:7546

# Kill process using the port
lsof -ti:7546 | xargs kill -9

# Or stop Hedera cleanly
hedera stop
```

#### Deployment Times Out

**Symptom:** Deployment hangs or times out after several minutes

**Solution:**

1. Check Docker resource allocation (Docker Desktop → Settings → Resources)
   - Recommended: 4 GB RAM minimum
2. Stop and restart network cleanly:
   ```bash
   hedera stop --clean
   hedera start -d
   ```
3. Check container health:
   ```bash
   docker ps --filter "name=hedera"
   ```

### Advantages

- **Hedera-Specific Features**: Contract IDs, mirror node queries, HTS tokens
- **Realistic Testing**: Multi-node consensus simulation
- **No External Dependencies**: Fully local, no testnet access needed
- **Reproducible**: Same environment every restart
- **Free**: No gas fees or faucets required

### When to Use

- **Hedera Feature Testing**: Test contract ID references, mirror node integration
- **Pre-Testnet Validation**: Validate before deploying to public testnet
- **Integration Testing**: Test full Hedera network behavior locally
- **CI/CD Pipelines**: Automated testing with Hedera-specific features

---

## Hedera Testnet/Mainnet Deployment

Deploy to Hedera public networks for staging or production.

### Setup

1. **Copy environment template**:

   ```bash
   cp .env.example .env
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

### Deploy

**To Hedera Testnet:**

```bash
# From packages/shared/contracts:
npm run deploy:hedera:testnet
# Or from monorepo root:
npm run shared:contracts:deploy:hedera:testnet
```

**To Hedera Mainnet:**

```bash
# From packages/shared/contracts:
npm run deploy:hedera:mainnet
# Or from monorepo root:
npm run shared:contracts:deploy:hedera:mainnet
```

### Configuration

| Environment Variable         | Required | Default          | Description                    |
| ---------------------------- | -------- | ---------------- | ------------------------------ |
| `NETWORK`                    | No       | `hedera-testnet` | Target network                 |
| `PRIVATE_KEY_HEDERA_TESTNET` | Yes\*    | -                | Testnet private key            |
| `PRIVATE_KEY_HEDERA_MAINNET` | Yes\*    | -                | Mainnet private key            |
| `USE_TIME_TRAVEL`            | No       | `false`          | Enable time-travel for testing |
| `VERBOSE`                    | No       | `false`          | Enable verbose logging         |

\*Required for the corresponding network

### Output

Deployment results are saved to `deployments/{network}/gbpInfrastructure-{timestamp}.json`:

```json
{
  "timestamp": "2025-01-05T10:30:00.000Z",
  "network": "hedera-testnet",
  "callableContracts": {
    "proxyAdmin": { "address": "0x...", "contractId": "0.0.12345" },
    "businessLogicResolver": { "address": "0x...", "contractId": "0.0.12346" },
    ...
  },
  "result": {
    "proxyAdmin": "0x...",
    "blr": "0x...",
    "bondDeployment": { ... },
    "treasuryDeployment": { ... },
    "factorySuiteDeployment": { ... },
    "primaryMarketDeployment": { ... }
  }
}
```

**Note on Hedera Networks:** Contract IDs will be included in the output (format: `"0.0.XXXXX"`).

---

## Validating Your Deployment

After deployment completes, validate that everything deployed correctly.

### Quick Validation (Manual)

#### 1. Locate the Output File

**⚠️ Known Issue:** Output currently saves to `node_modules/` instead of `deployments/local/`. See [docs/testing.md](./docs/testing.md#known-issues) for details and workaround.

```bash
# Find the output file
export DEPLOYMENT_FILE=$(find node_modules -name "gbpInfrastructure-*.json" -type f 2>/dev/null | head -1)
echo "Deployment file: $DEPLOYMENT_FILE"

# Check file size (should be > 40KB)
ls -lh "$DEPLOYMENT_FILE"
```

#### 2. Verify All Addresses Present

```bash
# List all contract addresses
jq '.callableContracts | to_entries | .[] | "\(.key): \(.value.address)"' "$DEPLOYMENT_FILE"
```

**Expected:** 5 lines showing addresses for proxyAdmin, businessLogicResolver, atsFactory, factorySuite, primaryMarketFactory

#### 3. Check Configuration IDs

```bash
# Verify config IDs match expected values
jq '.result | {
  bond: .bondDeployment.configurations.bond.configId,
  treasury: .treasuryDeployment.configuration.configId,
  factorySuite: .factorySuiteDeployment.configuration.configId,
  factoryPM: .primaryMarketDeployment.configuration.configId,
  pm: .primaryMarketDeployment.primaryMarketConfiguration.configId
}' "$DEPLOYMENT_FILE"
```

**Expected:**

```json
{
  "bond": "0x0000000000000000000000000000000000000000000000000000000000000002",
  "treasury": "0x0000000000000000000000000000000000000000000000000000000000004e20",
  "factorySuite": "0x0000000000000000000000000000000000000000000000000000000000007530",
  "factoryPM": "0x0000000000000000000000000000000000000000000000000000000000002710",
  "pm": "0x0000000000000000000000000000000000000000000000000000000000002711"
}
```

**Configuration ID Decimal Values:**

- BOND: 2
- Treasury: 20000
- FactorySuite: 30000
- FactoryPrimaryMarket: 10000
- PrimaryMarket: 10001

#### 4. Verify Deployment Success

```bash
# Check all domains succeeded
jq '.result | {
  bond: .bondDeployment.summary.success,
  treasury: .treasuryDeployment.summary.success,
  factorySuite: .factorySuiteDeployment.summary.success,
  primaryMarket: .primaryMarketDeployment.summary.success
}' "$DEPLOYMENT_FILE"
```

**Expected:** All values should be `true`

### Comprehensive Validation

For complete validation procedures with 20+ validation commands, see [docs/output-validation.md](./docs/output-validation.md).

### Testing Procedures

For step-by-step testing procedures including upgrade workflows, see [docs/testing.md](./docs/testing.md).

---

## Success Criteria

Use this checklist to verify your deployment succeeded:

### Deployment Process

- [ ] Network started successfully (Hardhat port 8545 or Hedera network)
- [ ] Deployment script completed without errors
- [ ] Final message: `[SUCCESS] ✅ GBP infrastructure deployment completed!`
- [ ] Deployment duration reasonable (< 1 min local, < 10 min testnet)

### Output File

- [ ] Output file created (find with: `find deployments -name "gbpInfrastructure-*.json"` or check node_modules/)
- [ ] File size > 40KB (indicates full deployment)
- [ ] JSON is valid (test with: `jq . "$DEPLOYMENT_FILE"`)

### Callable Contracts

- [ ] 5 callable contracts present (proxyAdmin, BLR, atsFactory, factorySuite, primaryMarketFactory)
- [ ] All addresses are valid Ethereum addresses (`0x` + 40 hex chars)
- [ ] Proxy types specified where applicable (TUP or ResolverProxy)

### Configuration IDs

- [ ] BOND config ID = 2 (`0x...0002`)
- [ ] Treasury config ID = 20000 (`0x...4e20`)
- [ ] FactorySuite config ID = 30000 (`0x...7530`)
- [ ] FactoryPM config ID = 10000 (`0x...2710`)
- [ ] PrimaryMarket config ID = 10001 (`0x...2711`)

### Domain Deployments

- [ ] BOND domain: 48 facets deployed, `summary.success = true`
- [ ] Treasury domain: 3 facets deployed, `summary.success = true`
- [ ] FactorySuite domain: 1 facet deployed, `summary.success = true`
- [ ] PrimaryMarket domain: 2 facets deployed, `summary.success = true`

**If all checkboxes are checked:** ✅ **CONGRATULATIONS!** Your deployment succeeded.

**If any checkbox is unchecked:** See [Troubleshooting](#troubleshooting) below.

---

## Troubleshooting

### Port 8545 Already in Use

**Symptom:** Hardhat node fails to start with error about port already in use.

**Solution:**

```bash
# Find and kill process using port 8545
lsof -ti:8545 | xargs kill -9

# Or kill all hardhat processes
pkill -f hardhat

# Then restart
npm run local:hardhat
```

### Deployment Timeout or Transaction Reverted

**Symptom:** Deployment hangs or fails with transaction errors.

**Solution:**

1. Verify network node is running in Terminal 1
2. Check for error messages in node console
3. Restart node and try again:

   ```bash
   # Terminal 1: Stop with Ctrl+C, then restart
   npm run local:hardhat

   # Terminal 2: Try deployment again
   npm run deploy:local
   ```

### Cannot Find Output File

**Symptom:** Validation commands can't find `gbpInfrastructure-*.json` file.

**✅ Fixed in Current Version**: Output files now correctly save to `./deployments/{network}/` directory.

**Solution:**

```bash
# Find latest deployment file
ls -t packages/shared/contracts/deployments/local/gbpInfrastructure-*.json | head -1

# Or set environment variable
export DEPLOYMENT_FILE=$(ls -t packages/shared/contracts/deployments/local/gbpInfrastructure-*.json | head -1)

# Verify it exists
ls -lh "$DEPLOYMENT_FILE"
```

### jq: Command Not Found

**Symptom:** Validation commands fail because `jq` is not installed.

**Solution:**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Or skip validation commands and check deployment manually
cat "$DEPLOYMENT_FILE" | grep -A 5 "callableContracts"
```

### Output File Too Small

**Symptom:** Output file exists but is much smaller than expected (should be ~44KB).

**Possible Cause:** Deployment failed or was interrupted.

**Solution:**

1. Check deployment console output for error messages
2. Look for `[SUCCESS]` messages for all 4 domains
3. If any domain failed, check node console for transaction errors
4. Try deployment again with fresh node

### Private Key Not Found (Testnet/Mainnet)

**Symptom:** Deployment fails with private key error.

**Solution:**

```bash
# Ensure environment variable is set correctly
echo $PRIVATE_KEY_HEDERA_TESTNET

# Variable name format: PRIVATE_KEY_{NETWORK_UPPERCASE}
# Example: PRIVATE_KEY_HEDERA_TESTNET, PRIVATE_KEY_HEDERA_MAINNET
```

### Network Not Found

**Symptom:** Unknown network error.

**Solution:** Check supported networks: `local`, `hedera-local`, `hedera-testnet`, `hedera-preview`, `hedera-mainnet`

### Build Errors

**Symptom:** TypeScript compilation fails.

**Solution:**

```bash
# Clean and rebuild
npm run clean:build
npm run build
```

### BLR Address Not Recognized / Validation Failed

**Symptom:** Upgrade fails with "BLR validation failed" or "Invalid BLR address".

**Cause:** BLR_ADDRESS environment variable not set.

**Solution:**

```bash
# Use environment variable
BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28 npm run upgrade:hedera:testnet

# Or set in .env file
echo "BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28" >> .env
npm run upgrade:hedera:testnet
```

### Switching Between Networks (Port Conflicts)

**Symptom:** Network fails to start with "address already in use" error.

**Network Ports:**

- **Hardhat Local**: Port 8545
- **Hedera Local**: Port 7546

**Solution:**

```bash
# Check what's using the port
lsof -ti:8545  # For Hardhat
lsof -ti:7546  # For Hedera

# Kill process using the port
lsof -ti:8545 | xargs kill -9

# Or stop Hardhat node properly
# Press Ctrl+C in Terminal 1 where node is running
```

### Deployment Fails with TypeScript Errors

**Symptom:** Deployment fails with TypeScript compilation or import errors.

**Cause:** Contracts not built before deployment.

**Solution:**

```bash
# Build all contracts first (from monorepo root)
npm run contracts:build

# Verify build artifacts exist
ls -lh packages/shared/contracts/build/
ls -lh packages/ats/contracts/build/
ls -lh packages/treasury/contracts/build/
ls -lh packages/primary-market/contracts/build/

# Then run deployment
npm run shared:contracts:deploy:local
```

### npm ci Fails with Husky Error

**Symptom:** `npm ci` fails with "sh: husky: command not found" error.

**Cause:** Husky git hooks trying to install before husky package is available.

**Solution:**

```bash
# Install without running scripts
npm install --ignore-scripts

# Then install husky hooks manually
npx husky install
```

### Finding Latest Output Files

**Symptom:** Need to locate most recent deployment or upgrade output files.

**Solution:**

```bash
# Find latest deployment file
ls -t packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | head -1

# Find latest upgrade file
ls -t packages/shared/contracts/deployments/hedera-local/gbpUpgrade-*.json | head -1

# Extract specific data from latest deployment
jq '.callableContracts.businessLogicResolver.address' \
  $(ls -t packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | head -1)

# List all files by date (most recent first)
ls -lt packages/shared/contracts/deployments/hedera-local/
```

### "2 Proxies Failed" During Upgrade

**Symptom:** Upgrade completes successfully but shows "Total proxies: 0 updated, 2 failed" with warnings for FactorySuite and FactoryPrimaryMarket.

**Example output:**

```
✓ factorySuite         v2 (0x...7530) - 1 facets, 0 proxies (14s)
✓ factoryPrimaryMarket v2 (0x...2710) - 1 facets, 0 proxies (13s)

Total proxies: 0 updated, 2 failed
```

**Root Cause:**

FactorySuite and FactoryPrimaryMarket use **ResolverProxy** instances that require explicit proxy addresses to be passed during upgrades. Without these addresses, the upgrade:

- ✅ Successfully creates new configuration versions in BLR
- ✅ Successfully deploys new facets
- ❌ Cannot update existing proxy instances to use the new configuration

**Solution:**

Pass proxy addresses from your deployment to the upgrade command using environment variables:

**Step 1: Extract proxy addresses from deployment**

```bash
# Find latest deployment file
export DEPLOY_FILE=$(ls -t packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | head -1)

# Extract FactorySuite proxy address
export FACTORYSUITE_PROXY=$(jq -r '.callableContracts.factorySuite.address' "$DEPLOY_FILE")

# Extract FactoryPrimaryMarket proxy address
export FACTORYPRIMARYMARKET_PROXY=$(jq -r '.callableContracts.primaryMarketFactory.address' "$DEPLOY_FILE")

# Verify addresses
echo "FactorySuite: $FACTORYSUITE_PROXY"
echo "FactoryPrimaryMarket: $FACTORYPRIMARYMARKET_PROXY"
```

**Step 2: Run upgrade with proxy addresses**

**From Package Directory:**

```bash
cd packages/shared/contracts
BLR_ADDRESS=0x... \
FACTORYSUITE_PROXIES=$FACTORYSUITE_PROXY \
FACTORYPRIMARYMARKET_PROXIES=$FACTORYPRIMARYMARKET_PROXY \
npm run upgrade:hedera:local
```

**From Monorepo Root:**

```bash
BLR_ADDRESS=0x... \
FACTORYSUITE_PROXIES=$FACTORYSUITE_PROXY \
FACTORYPRIMARYMARKET_PROXIES=$FACTORYPRIMARYMARKET_PROXY \
npm run shared:contracts:upgrade:hedera:local
```

**Expected Success Output:**

```
✓ factorySuite         v3 (0x...7530) - 1 facets, 1 proxies (19s)
✓ factoryPrimaryMarket v3 (0x...2710) - 1 facets, 1 proxies (18s)

Total proxies: 2 updated, 0 failed
```

**Additional Notes:**

- **Multiple proxies**: Use comma-separated addresses: `FACTORYSUITE_PROXIES=0xABC...,0xDEF...`
- **CLI flags**: You can also use `--factorysuite-proxies=0x...` and `--factoryprimarymarket-proxies=0x...` flags
- **Treasury & PrimaryMarket**: These domains don't use factory proxies, so they don't show proxy update warnings
- **When to ignore**: If you haven't deployed any FactorySuite or FactoryPrimaryMarket instances yet, the "2 proxies failed" warning is expected and can be safely ignored

### Still Having Issues?

1. **Check node console** (Terminal 1) for error messages
2. **Check deployment console** (Terminal 2) for stack traces
3. **Verify prerequisites:** Node.js 22.x, npm 10.x, dependencies installed
4. **Try clean restart:**
   ```bash
   # Stop node (Ctrl+C in Terminal 1)
   # Clean and reinstall
   npm run clean
   npm ci
   # Try deployment again
   ```
5. **Consult detailed testing guide:** [docs/testing.md](./docs/testing.md)
6. **File an issue** with details: Node version, error messages, console output

---

## Architecture

### Overview

This package implements **Phase 1** of the Multi-Module Infrastructure Orchestration, focusing on:

✅ **Step 1-2**: Deploy ProxyAdmin + BLR with TUP
✅ **Step 3**: Deploy BOND configuration (via ATS `deployWithExistingBlr` workflow)

- Deploys ALL BOND facets (including AccessControl, Pause)
- Registers facets in BLR
- Creates BOND configuration (config ID: 2)
- Deploys ATS Factory

✅ **Step 4**: Deploy Treasury domain (3 facets, config ID 20000)
✅ **Step 5**: Deploy FactorySuite (1 facet, config ID 30000)
✅ **Step 6**: Deploy PrimaryMarket (2 facets, config IDs 10000 & 10001)

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
               ├─► Step 4: deployTreasuryWithExistingInfra()
               │   (GBP Treasury Workflow)
               │   ├─ Deploy Treasury facets
               │   ├─ Reuse shared facets (AccessControl, Pause)
               │   └─ Create Treasury configuration
               │
               ├─► Step 5: deployFactorySuiteWithExistingInfra()
               │   (GBP ATS Workflow)
               │   ├─ Deploy FactorySuite facet
               │   ├─ Reuse shared facets
               │   ├─ Create FactorySuite configuration
               │   └─ Deploy FactorySuite ResolverProxy
               │
               └─► Step 6: deployFactoryPrimaryMarketWithExistingInfra()
                   (GBP Primary Market Workflow)
                   ├─ Deploy Primary Market facets
                   ├─ Reuse shared facets
                   ├─ Create two configurations
                   └─ Deploy FactoryPrimaryMarket ResolverProxy
```

### Configuration IDs Reference

Configuration IDs are used by the BusinessLogicResolver (BLR) to map domain contracts to their facet implementations.

#### Configuration ID Table

| Domain                   | Config ID (Decimal) | Config ID (Hex) | Description                       |
| ------------------------ | ------------------- | --------------- | --------------------------------- |
| **BOND**                 | 2                   | `0x0000...0002` | Bond asset contracts (ATS)        |
| **EQUITY**               | 1                   | `0x0000...0001` | Equity asset contracts (ATS)      |
| **FactoryPrimaryMarket** | 10000               | `0x0000...2710` | Primary Market Factory contracts  |
| **PrimaryMarket**        | 10001               | `0x0000...2711` | Primary Market instance contracts |
| **Treasury**             | 20000               | `0x0000...4e20` | Treasury instance contracts       |
| **FactorySuite**         | 30000               | `0x0000...7530` | Factory Suite contracts           |

#### ID Range Allocation

| Domain             | Range         | Purpose                            |
| ------------------ | ------------- | ---------------------------------- |
| **ATS**            | 1-9,999       | Asset tokenization (bonds, equity) |
| **Primary Market** | 10,000-19,999 | Primary market operations          |
| **Treasury**       | 20,000-29,999 | Treasury management                |
| **FactorySuite**   | 30,000-39,999 | Atomic deployment suites           |

**Why Ranges?**

- **Future-proof**: Allows adding new configurations within each domain
- **Clear separation**: Easy to identify which domain a configuration belongs to
- **Collision-free**: No overlap between domains

#### Validating Configurations

After deployment or upgrade, verify configurations are registered:

```bash
# Extract BLR address from deployment
BLR_ADDRESS=$(jq -r '.callableContracts.businessLogicResolver.address' \
  $(ls -t deployments/hedera-local/gbpInfrastructure-*.json | head -1))

# Query configuration version (example for FactorySuite)
cast call $BLR_ADDRESS \
  "getConfigurationVersion(bytes32)" \
  "0x0000000000000000000000000000000000000000000000000000000000007530"
```

**Expected Output:**

- Successful deployment: Returns version number (e.g., `1`, `2`, `3`)
- Failed/missing config: Returns `0` or reverts

**Configuration Version History:**

- After fresh deployment: All configurations at version `1`
- After upgrade: Increments to `2`, `3`, etc.
- Version `0`: Configuration doesn't exist (not registered)

### Shared Facet Reuse

The system optimizes gas costs by deploying shared facets once and reusing them across domains:

1. **Step 3** deploys BOND facets (including AccessControl, Pause)
2. BOND facets registered in BLR → **shared facets now available**
3. **Steps 4-6** extract shared facet addresses from Step 3 result
4. Later configurations reference existing shared facets
5. Only domain-specific facets are deployed in subsequent steps

This prevents duplicate deployments and ensures consistency.

---

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

### How to Create Instances After Deployment

**Create a PrimaryMarket instance:**

```typescript
// Connect to deployed factory
const factoryPM = FactoryPrimaryMarket__factory.connect(
  deploymentResult.primaryMarketDeployment.infrastructure.factoryPrimaryMarket.proxy,
  signer,
);

// Deploy new PM instance using Config 10001
const tx = await factoryPM.deployPrimaryMarket(
  assetAddress,
  10001, // Config ID for PrimaryMarket instances
  1, // Version
);

// New PrimaryMarket proxy created at tx.events.ProxyDeployed.proxyAddress
```

**Create a Bond+Treasury+KPI suite:**

```typescript
// Connect to deployed FactorySuite
const factorySuite = FactorySuiteFacet__factory.connect(
  deploymentResult.factorySuiteDeployment.infrastructure.factorySuite.proxy,
  signer,
);

// Deploy complete suite (3 contracts atomically)
const tx = await factorySuite.deployBondSuite(bondData, regulationData, treasuryData, kpiData);

// New Bond, Treasury, and KPI proxies created
```

### Key Takeaways

1. **Deployment creates factories, not instances** - Factories are tools to create instances on-demand
2. **Configurations are templates** - Stored in BLR, referenced when creating instances
3. **Multiple instances share same config** - All PrimaryMarket instances use Config 10001, all Treasury instances use Config 20000
4. **Missing proxies in deployment output is correct** - Instance proxies created later via factory calls

---

## Deployment Result

The `deployGbpInfrastructure` function returns a comprehensive result object:

```typescript
interface DeploymentResult {
  /** ProxyAdmin contract address */
  proxyAdmin: string;

  /** BusinessLogicResolver (BLR) proxy address */
  blr: string;

  /** BLR implementation address */
  blrImplementationAddress: string;

  /** BOND deployment result (from ATS workflow) */
  bondDeployment: DeploymentWithExistingBlrOutput;

  /** Treasury deployment result */
  treasuryDeployment: DeployTreasuryOutput;

  /** FactorySuite deployment result (from GBP ATS workflow) */
  factorySuiteDeployment: DeployFactorySuiteOutput;

  /** PrimaryMarket deployment result */
  primaryMarketDeployment: DeployFactoryPrimaryMarketOutput;
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

### Output File Structure

The deployment creates a JSON file (~44KB, ~1000 lines) with this structure:

```json
{
  "timestamp": "2025-12-31T13:22:06.265Z",
  "network": "local",
  "callableContracts": {
    "proxyAdmin": {
      "description": "Manages upgrades for TransparentUpgradeableProxy contracts",
      "address": "0x..."
    },
    "businessLogicResolver": {
      "description": "Shared diamond resolver for all GBP contracts",
      "address": "0x...",
      "proxyType": "TransparentUpgradeableProxy",
      "implementation": { "address": "0x..." }
    },
    "atsFactory": {
      "description": "Creates new Asset Tokenization bonds",
      "address": "0x...",
      "proxyType": "TransparentUpgradeableProxy",
      "implementation": { "address": "0x..." }
    },
    "factorySuite": {
      "description": "Atomic deployment of Bond + Treasury + KPI",
      "address": "0x...",
      "proxyType": "ResolverProxy",
      "resolver": { "address": "0x..." }
    },
    "primaryMarketFactory": {
      "description": "Creates new Primary Market instances",
      "address": "0x...",
      "proxyType": "ResolverProxy",
      "resolver": { "address": "0x..." }
    }
  },
  "result": {
    "proxyAdmin": "0x...",
    "blr": "0x...",
    "bondDeployment": {
      /* 48 facets */
    },
    "treasuryDeployment": {
      /* 3 facets */
    },
    "factorySuiteDeployment": {
      /* 1 facet */
    },
    "primaryMarketDeployment": {
      /* 2 facets */
    }
  }
}
```

**Callable Contracts** are the user-facing contract addresses you'll use to interact with the GBP platform.

**TUP** = TransparentUpgradeableProxy (standard upgradeable pattern)
**ResolverProxy** = Diamond pattern proxy (facet-based architecture)

---

## Output File Management

Understanding where deployment and upgrade outputs are stored and how to manage them.

### File Locations

All output files are stored in network-specific directories:

```
packages/shared/contracts/deployments/
├── local/                           # Hardhat local network
│   ├── gbpInfrastructure-*.json
│   └── gbpUpgrade-*.json
├── hedera-local/                    # Hedera local network
│   ├── gbpInfrastructure-*.json
│   └── gbpUpgrade-*.json
├── hedera-testnet/                  # Hedera testnet
│   ├── gbpInfrastructure-*.json
│   └── gbpUpgrade-*.json
├── hedera-preview/                  # Hedera previewnet
│   ├── gbpInfrastructure-*.json
│   └── gbpUpgrade-*.json
└── hedera-mainnet/                  # Hedera mainnet
    ├── gbpInfrastructure-*.json
    └── gbpUpgrade-*.json
```

### File Naming Convention

**Deployment Files:**

```
gbpInfrastructure-{timestamp}.json
```

**Upgrade Files:**

```
gbpUpgrade-{timestamp}.json
```

**Timestamp Format:** `YYYY-MM-DDTHH-mm-ss`

- Example: `gbpInfrastructure-2026-01-05T11-09-00.json`
- Derived from ISO 8601 timestamp with special characters replaced
- Allows chronological sorting with standard filesystem commands

### Finding Latest Files

**Quick Commands:**

```bash
# Find latest deployment file for any network
ls -t packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | head -1

# Find latest upgrade file
ls -t packages/shared/contracts/deployments/hedera-local/gbpUpgrade-*.json | head -1

# List all files by date (most recent first)
ls -lt packages/shared/contracts/deployments/hedera-local/

# Extract specific data from latest deployment
jq '.callableContracts.businessLogicResolver.address' \
  $(ls -t packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | head -1)

# Count total deployments per network
ls -1 packages/shared/contracts/deployments/hedera-local/gbpInfrastructure-*.json | wc -l
```

**Setting Environment Variables:**

```bash
# Store latest deployment file path
export DEPLOYMENT_FILE=$(ls -t packages/shared/contracts/deployments/hedera-testnet/gbpInfrastructure-*.json | head -1)

# Extract and store BLR address for upgrades
export BLR_ADDRESS=$(jq -r '.callableContracts.businessLogicResolver.address' "$DEPLOYMENT_FILE")

# Verify
echo "Deployment: $DEPLOYMENT_FILE"
echo "BLR Address: $BLR_ADDRESS"
```

### Git Management

**Recommended Approach:**

1. **Commit deployment outputs to version control:**
   - Deployment files document infrastructure state
   - Useful for team collaboration and auditing
   - Network-specific directories prevent conflicts

2. **Add to .gitignore if needed:**

   ```gitignore
   # Ignore local development deployments only
   packages/shared/contracts/deployments/local/
   packages/shared/contracts/deployments/hedera-local/

   # Keep testnet/mainnet deployments in version control
   # packages/shared/contracts/deployments/hedera-testnet/
   # packages/shared/contracts/deployments/hedera-mainnet/
   ```

3. **Clean up old deployments periodically:**
   ```bash
   # Keep only last 10 deployments per network
   cd packages/shared/contracts/deployments/hedera-local
   ls -t gbpInfrastructure-*.json | tail -n +11 | xargs rm -f
   ls -t gbpUpgrade-*.json | tail -n +11 | xargs rm -f
   ```

### File Size Reference

**Typical File Sizes:**

| File Type                 | Size    | Lines | Content                                                               |
| ------------------------- | ------- | ----- | --------------------------------------------------------------------- |
| gbpInfrastructure-\*.json | ~44 KB  | ~1000 | Complete deployment output with all contracts, facets, configurations |
| gbpUpgrade-\*.json        | ~2-3 KB | ~60   | Upgrade summary with domain results and metrics                       |

**What to Check:**

- **Deployment file < 30 KB**: May be incomplete, check for errors
- **Deployment file > 60 KB**: Unusual, verify output structure
- **Upgrade file < 1 KB**: Likely failed, check console output

### Programmatic Access

**TypeScript/Node.js:**

```typescript
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// Find latest deployment file
const deploymentsDir = "packages/shared/contracts/deployments/hedera-testnet";
const files = readdirSync(deploymentsDir)
  .filter((f) => f.startsWith("gbpInfrastructure-"))
  .sort()
  .reverse();

const latestFile = join(deploymentsDir, files[0]);
const deployment = JSON.parse(readFileSync(latestFile, "utf-8"));

console.log("BLR Address:", deployment.callableContracts.businessLogicResolver.address);
console.log("Network:", deployment.network);
console.log("Timestamp:", deployment.timestamp);
```

**Bash Script:**

```bash
#!/bin/bash
# extract-addresses.sh - Extract key addresses from latest deployment

NETWORK=${1:-hedera-testnet}
DEPLOYMENT_FILE=$(ls -t packages/shared/contracts/deployments/$NETWORK/gbpInfrastructure-*.json | head -1)

if [ -z "$DEPLOYMENT_FILE" ]; then
  echo "No deployment found for network: $NETWORK"
  exit 1
fi

echo "Latest Deployment: $DEPLOYMENT_FILE"
echo ""
echo "Key Addresses:"
jq -r '.callableContracts | to_entries[] | "\(.key): \(.value.address)"' "$DEPLOYMENT_FILE"
```

### Troubleshooting

**File Not Found:**

- Verify deployment completed successfully
- Check correct network directory
- Use `find` command to search all directories:
  ```bash
  find packages/shared/contracts/deployments -name "gbpInfrastructure-*.json"
  ```

**Invalid JSON:**

- Deployment may have been interrupted
- Check file size (should be ~44 KB for infrastructure)
- Validate with `jq`:
  ```bash
  jq empty "$DEPLOYMENT_FILE"  # Exits with error if invalid JSON
  ```

**Missing Fields:**

- Compare with expected structure (see "Deployment Result" section above)
- Some fields (like `contractId`) are only present on Hedera networks
- Use `jq` to explore structure:
  ```bash
  jq keys "$DEPLOYMENT_FILE"
  ```

---

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

### Prerequisites

1. **Deployed infrastructure** - BLR proxy address from deployment
2. **Private key** - Configured for target network
3. **Domain packages built** - All contract packages must be built

### Upgrade Commands

#### All Domains (Package Directory)

```bash
cd packages/shared/contracts
BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28 npm run upgrade:hedera:testnet
```

#### All Domains (From Repository Root)

```bash
BLR_ADDRESS=0x6D10B5AAEFAB41849df40C7AEc9823545f646c28 npm run shared:contracts:upgrade:hedera:testnet
```

**Note:** This deploys all facets for all 4 domains and creates new configuration versions.

#### Extracting BLR Address from Deployment

```bash
# Extract BLR address from latest deployment file
export BLR_ADDRESS=$(jq -r '.callableContracts.businessLogicResolver.address' \
  deployments/hedera-testnet/gbpInfrastructure-*.json)

# Run upgrade
BLR_ADDRESS=$BLR_ADDRESS npm run upgrade:hedera:testnet
```

### Configuration

**Required Environment Variables:**

```bash
# .env

# 1. BLR_ADDRESS - Required for all upgrades
#    Source: Extract from deployment output file (see "Extracting BLR Address" above)
BLR_ADDRESS=0x1234567890abcdef...

# 2. Network configuration
NETWORK=hedera-testnet

# 3. Optional flags
USE_TIME_TRAVEL=false
VERBOSE=false
```

**Optional Proxy Addresses (Only for ResolverProxy contracts):**

Some contracts use the **ResolverProxy** pattern and require explicit proxy addresses:

- **FactorySuite** - Uses ResolverProxy → requires `FACTORYSUITE_PROXIES`
- **FactoryPrimaryMarket** - Uses ResolverProxy → requires `FACTORYPRIMARYMARKET_PROXIES`

Other contracts use **TransparentUpgradeableProxy** and do NOT need proxy addresses:

- **Treasury** - Uses TransparentUpgradeableProxy (proxy addresses optional for batch updates)
- **PrimaryMarket** - Uses TransparentUpgradeableProxy (proxy addresses optional for batch updates)

**Extract proxy addresses from deployment output:**

```bash
# For FactorySuite
jq -r '.callableContracts.factorySuite.address' \
  deployments/hedera-testnet/gbpInfrastructure-*.json

# For FactoryPrimaryMarket
jq -r '.callableContracts.factoryPrimaryMarket.address' \
  deployments/hedera-testnet/gbpInfrastructure-*.json
```

**Add to .env (if needed):**

```bash
# Only required for ResolverProxy contracts (FactorySuite, FactoryPrimaryMarket)
FACTORYSUITE_PROXIES=0xabc...,0xdef...
FACTORYPRIMARYMARKET_PROXIES=0x333...

# Optional for batch updates (Treasury, PrimaryMarket)
TREASURY_PROXIES=0x111...,0x222...
PRIMARYMARKET_PROXIES=0x444...,0x555...
```

### Upgrade Result

Upgrades save results to `deployments/{network}/gbpUpgrade-{timestamp}.json`:

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

### Recovery from Failures

If a domain upgrade fails:

1. **Review the error** in console output
2. **Fix the issue** (permissions, gas, etc.)
3. **Retry only the failed domain:**
   ```bash
   BLR_ADDRESS=0x123... npm run upgrade -- --domains=treasury
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

### Testing Upgrades

For step-by-step upgrade testing procedures, see [docs/testing.md#configuration-upgrades](./docs/testing.md#configuration-upgrades-hardhat-local).

For upgrade output validation, see [docs/output-validation.md#upgrade-output-validation](./docs/output-validation.md#upgrade-output-validation).

---

## Implementation Details

### Workflow Composition Pattern

Instead of implementing low-level operations, this orchestration:

1. **Delegates to proven workflows**: Uses existing, tested deployment workflows
2. **Focuses on coordination**: Connects workflows in the correct order
3. **Handles inter-workflow data**: Passes shared facet addresses between workflows
4. **Provides unified logging**: Coordinates logging from multiple workflows

### Error Handling

The orchestration uses simple error handling:

- Checks `success` flags from workflows
- Throws descriptive errors on failure
- Provides clear error context in logs

---

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

### Testing

```bash
npm run test          # Run all integration tests (deployment + upgrade + checkpoint)
npm run test:only     # Run tests without recompiling contracts
```

Test suites:

- `deployGbpInfrastructure.test.ts` - Full deployment orchestration (67 tests)
- `upgradeGbpConfigurations.test.ts` - Configuration upgrade workflows (45+ tests)
- `checkpointResume.test.ts` - Checkpoint CRUD, resume, cleanup (17 tests)

### Checkpoint Management

```bash
npm run checkpoint:list -- <network>              # List checkpoints
npm run checkpoint -- show <checkpoint-id>         # Show checkpoint details
npm run checkpoint -- reset <checkpoint-id>        # Reset failed → in-progress
npm run checkpoint -- delete <checkpoint-id>       # Delete a checkpoint
npm run checkpoint:cleanup -- <network> [days]     # Clean completed > N days
```

### Code Quality

```bash
npm run lint          # Lint TypeScript code
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

---

## Related Documentation

### Essential Guides

- **[Testing Guide](./docs/testing.md)** - Complete testing procedures for Hardhat and Hedera local
- **[Output Validation](./docs/output-validation.md)** - Manual validation commands using `jq`
- **[Deployment Artifacts](./deployments/README.md)** - Understanding deployment output files and checkpoints

### External Resources

- **ADR**: [Multi-Module Infrastructure Orchestration](https://iobuilders.atlassian.net/wiki/spaces/EVRCT/pages/4428103749/Multi-Module+Infrastructure+Orchestration+for+Green+Bonds+Platform)
- **ATS Contracts**: `@hashgraph/asset-tokenization-contracts`
- **GBP ATS Contracts**: `@hashgraph/green-bonds-platform-ats-contracts`
- **Project CLAUDE.md**: `/CLAUDE.md` (project-level guidance)

---

**Package**: `@hashgraph/green-bonds-platform-shared-contracts`
**Version**: 1.0.0
**License**: Apache-2.0
