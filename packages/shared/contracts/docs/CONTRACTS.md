# Smart Contracts Architecture

## Overview

The platform uses a **modular Diamond Pattern (EIP-2535)** architecture. All contracts are proxies that delegate to facet implementations registered in a shared **BusinessLogicResolver (BLR)**. This allows upgrading logic without redeploying proxies.

There are four contract suites: **Bond (ATS)**, **Treasury**, **FactorySuite**, and **Primary Market**.

---

## System Architecture

```
                        ┌─────────────────────────────────┐
                        │     BusinessLogicResolver (BLR) │
                        │   TransparentUpgradeableProxy   │
                        │                                 │
                        │  resolveLatestBusinessLogic()   │
                        │  registerFacet()                │
                        │  (configId, version) → facet    │
                        └────────────┬────────────────────┘
                                     │ resolves facets for all proxies
               ┌─────────────────────┼──────────────────────┐
               ▼                     ▼                       ▼
  ┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
  │    FactorySuite    │  │      Treasury        │  │  FactoryPrimaryMarket│
  │   ResolverProxy    │  │   ResolverProxy      │  │   ResolverProxy      │
  │   configId: 30000  │  │   configId: 20000    │  │   configId: 10000    │
  └─────────┬──────────┘  └─────────────────────┘  └──────────┬───────────┘
            │ deploys                                           │ deploys
            ▼                                                   ▼
  ┌────────────────────┐                             ┌──────────────────────┐
  │    Bond Token      │                             │   PrimaryMarket      │
  │   (ATS Factory)    │                             │   ResolverProxy      │
  │   configId: 0x...4 │                             │   configId: 10001    │
  │   (KpiLinkedRate)  │                             └──────────────────────┘
  └────────────────────┘
         +
  ┌────────────────────┐
  │    Treasury        │
  │   ResolverProxy    │
  │   configId: 20000  │
  └────────────────────┘
```

---

## Deployed Contracts (hedera-testnet, 2026-02-11)

| Contract             | Type                        | EVM Address                                  | Hedera ID     |
| -------------------- | --------------------------- | -------------------------------------------- | ------------- |
| ProxyAdmin           | OpenZeppelin TUP admin      | `0x7BdFeB49F8302bF1594F246AA3404C1330bf55De` | `0.0.7902005` |
| BLR                  | TransparentUpgradeableProxy | `0xFFEa931Cb729809014B08db4c4B8C26c4be55691` | `0.0.7902012` |
| ATS Factory          | TransparentUpgradeableProxy | `0x2a69A3Ef7Dc0E33c94D0518e317FCa83BB4A7047` | `0.0.7902373` |
| FactorySuite         | ResolverProxy               | `0x1fcad0e2457b8c40D6d1e577275746335d272326` | `0.0.7902410` |
| PrimaryMarketFactory | ResolverProxy               | `0x7D570A0Dcc44b2db6958C5733eA89495AEc22311` | `0.0.7902425` |

---

## Configuration IDs

Each contract suite has a `configId` that maps to a set of facets in the BLR. Versions increment on upgrades.

| Domain               | configId (decimal) | configId (hex) | Description                                            |
| -------------------- | ------------------ | -------------- | ------------------------------------------------------ |
| bond                 | 2                  | `0x...0002`    | Bond token (basic)                                     |
| bondKpiLinkedRate    | 4                  | `0x...0004`    | Bond token with KPI interest rate ← used in production |
| FactoryPrimaryMarket | 10000              | `0x...2710`    | Primary market factory                                 |
| PrimaryMarket        | 10001              | `0x...2711`    | Primary market instance                                |
| Treasury             | 20000              | `0x...4e20`    | Treasury                                               |
| FactorySuite         | 30000              | `0x...7530`    | Atomic bond+treasury factory                           |

---

## Key Concept: ResolverProxy vs TransparentUpgradeableProxy

|                   | TransparentUpgradeableProxy    | ResolverProxy                         |
| ----------------- | ------------------------------ | ------------------------------------- |
| Used for          | BLR, ATS Factory               | FactorySuite, Treasury, PrimaryMarket |
| Upgrade mechanism | ProxyAdmin calls `upgradeTo()` | BLR registers new facet version       |
| Facet resolution  | Static implementation          | Dynamic via BLR at call time          |
| Admin             | ProxyAdmin contract            | BLR + role-based                      |

---

## Contract Suites

---

### 1. FactorySuite (`packages/ats/contracts/`, configId: 30000)

**Purpose:** Atomically deploys a Bond + Treasury pair in a single transaction. Ensures the two are properly linked and configured.

**Entry point function:**

```solidity
function deployBondSuite(
    address bondFactoryAddress,
    IAtsFactory.BondKpiLinkedRateData calldata bondKpiData,
    TreasuryData calldata treasuryData
) external returns (address bondAddress, address treasuryAddress)
```

**What it does internally:**

1. Validates `bondFactoryAddress` is a contract
2. Validates `treasuryData` (resolver, payment token)
3. Calls `bondFactory.deployBondKpiLinkedRate(bondKpiData)` → gets `bondAddress`
4. Creates a Treasury ResolverProxy with the given resolver + RBACs
5. Calls `LifeCycleCashFlow.initialize(bondAddress)` on Treasury
6. Calls `Portfolio.initialize(paymentToken, environmentalAssets)` on Treasury
7. Grants `MATURITY_REDEEMER_ROLE` to Treasury on the Bond
8. Revokes `DEFAULT_ADMIN_ROLE` from FactorySuite on the Bond

**Input structures:**

```solidity
struct TreasuryData {
  IBusinessLogicResolver resolver;
  ResolverProxyConfiguration resolverProxyConfiguration; // { bytes32 key, uint256 version }
  Rbac[] rbacs; // [{ bytes32 role, address[] members }]
  address paymentToken; // HTS token address for distributions
  address[] environmentalAssets;
}
```

**Event emitted:**

```solidity
event BondSuiteDeployed(
    address indexed operator,
    address indexed bondAddress,
    address indexed treasuryAddress,
    IAtsFactory.BondKpiLinkedRateData bondKpiData,
    TreasuryData treasuryData
)
```

**Access control:** Caller must have `DEPLOYER_ROLE` on FactorySuite.

**Errors:**
| Error | Cause |
|-------|-------|
| `BondDeploymentFailed()` | ATS Factory returned zero address |
| `TreasuryDeploymentFailed()` | Treasury proxy deployment failed |
| `InvalidTreasuryData()` | Missing resolver or payment token |
| `InvalidContractAddress(address)` | bondFactoryAddress is not a contract |

---

### 2. Bond Token — KPI Linked Rate (`packages/ats/contracts/`, configId: `0x...0004`)

**Purpose:** ERC-1400 / ERC-1155-compatible security token with built-in KPI-linked interest rate mechanism. Deployed by ATS Factory.

**Key facets and their functions:**

#### AccessControl facet

- `grantRole(bytes32 role, address account)` — assign role
- `revokeRole(bytes32 role, address account)` — remove role
- `renounceRole(bytes32 role)` — self-remove role
- `hasRole(bytes32 role, address account) → bool`

#### Pause facet

- `pause()` — halt transfers; requires `PAUSER_ROLE`
- `unpause()` — resume transfers
- `isPaused() → bool`
- Events: `TokenPaused(address operator)`, `TokenUnpaused(address operator)`

#### Cap facet

- `setMaxSupply(uint256 newCap)` — update max supply; requires `CAP_MANAGER_ROLE`
- `getMaxSupply() → uint256`
- Event: `MaxSupplySet(address operator, uint256 newMaxSupply, uint256 previousMaxSupply)`

#### Partition facet (ERC-1400)

- `balanceOfByPartition(bytes32 partition, address account) → uint256`
- `issueByPartition(bytes32 partition, address to, uint256 amount, bytes data)` — mint; requires `ISSUER_ROLE`
- `redeemByPartition(bytes32 partition, address from, uint256 amount, bytes data, bytes operatorData)` — burn; requires `REDEEMER_ROLE`
- `redeemAtMaturityByPartition(bytes32 partition, address from, uint256 amount)` — burn at maturity; requires `MATURITY_REDEEMER_ROLE`
- `transferByPartition(bytes32 partition, address from, address to, uint256 amount, ...)` — transfer
- Default partition: `0x...0001`

#### Hold facet (ERC-1400)

- `holdByPartition(bytes32 partition, uint256 holdId, HoldData hold, bytes operatorData)` — create hold
- `executeHoldByPartition(bytes32 partition, uint256 holdId, uint256 amount, address to)` — execute
- `releaseHoldByPartition(bytes32 partition, uint256 holdId, uint256 amount)` — release
- `reclaimHoldByPartition(bytes32 partition, uint256 holdId, uint256 amount)` — reclaim expired

#### Lock facet

- `lockByPartition(bytes32 partition, uint256 lockId, address holder, uint256 amount, uint256 expiration)` — create compliance lock
- `lockByPartitionRelease(bytes32 partition, uint256 lockId)` — release lock

#### Clearing facet

- Multi-party settlement: holds + approvals before final execution
- `createClearingHoldByPartition(...)` — create clearing hold
- `updateClearingOperation(bytes32 partition, uint256 clearingId, ...)` — update status
- `cancelClearingOperation(...)`, `approveClearingOperation(...)`

#### Document facet (ERC-1400)

- `setDocument(bytes32 name, string uri, bytes32 documentHash)` — attach document
- `removeDocument(bytes32 name)` — detach document
- Events: `DocumentUpdated`, `DocumentRemoved`

#### Control list facet

- `addToControlList(address account)` — add to KYC/compliance list; requires `CONTROL_LIST_MANAGER_ROLE`
- `removeFromControlList(address account)` — remove

#### KPI / Interest Rate facet

- Stores `interestRate` and `impactData` configuration
- `getInterestRate() → InterestRateData`
- `getImpactData() → ImpactData`

```solidity
struct InterestRateData {
  uint256 maxRate; // e.g. 1000 = 10.00%
  uint256 baseRate; // e.g. 500  = 5.00%
  uint256 minRate; // e.g. 100  = 1.00%
  uint256 startPeriod; // unix timestamp
  uint256 startRate; // initial rate
  uint256 missedPenalty; // penalty for missed KPI
  uint256 reportPeriod; // seconds between reports (e.g. 86400*30)
  uint8 rateDecimals; // decimal places (e.g. 2)
}

struct ImpactData {
  uint256 maxDeviationCap; // upper bound (e.g. 150)
  uint256 baseLine; // baseline (e.g. 100)
  uint256 maxDeviationFloor; // lower bound (e.g. 50)
  uint8 impactDataDecimals; // decimal places
  uint256 adjustmentPrecision; // precision factor
}
```

**Constraint:** `maxDeviationFloor <= baseLine <= maxDeviationCap`

#### Proceeds Recipients facet

- `addProceedRecipient(address recipient, bytes data)` — register green project recipient
- `removeProceedRecipient(address recipient)` — deregister
- `getProceedRecipients() → address[]`

**Roles used by Bond:**
| Role | keccak256 hash | Purpose |
|------|----------------|---------|
| DEFAULT_ADMIN_ROLE | `0x00` | Superuser |
| ISSUER_ROLE | `0x4be3...` | Mint tokens |
| PAUSER_ROLE | `0x6f65...` | Pause/unpause |
| CAP_MANAGER_ROLE | — | Set max supply |
| CONTROL_LIST_MANAGER_ROLE | `0xca53...` | KYC list management |
| MATURITY_REDEEMER_ROLE | — | Redeem at maturity (granted to Treasury) |
| CORPORATE_ACTION_ROLE | `0x8a13...` | Execute corporate actions (coupons) |

---

### 3. Treasury (`packages/treasury/contracts/`, configId: 20000)

**Purpose:** Manages the financial lifecycle of a bond — distributions (coupons), redemptions at maturity, and asset management.

Each Treasury is linked 1:1 to a Bond via `LifeCycleCashFlow.initialize(bondAddress)`.

#### LifeCycleCashFlow facet

**Purpose:** Execute dividend/coupon distributions and bond redemptions in batches.

```solidity
// Execute distribution to a page of holders
function executeDistribution(
    address asset,
    uint256 distributionID,
    uint256 pageIndex,
    uint256 pageLength
) external returns (PaymentResult[] memory results, bool hasMore)

// Retry distribution for specific holders
function executeDistributionByAddresses(
    address asset,
    uint256 distributionID,
    address[] calldata holders
) external returns (PaymentResult[] memory results)

// Redeem bonds at maturity (batch)
function executeBondRedemption(
    address bond,
    uint256 pageIndex,
    uint256 pageLength
) external returns (PaymentResult[] memory results, bool hasMore)
```

```solidity
enum PaymentStatus {
  SUCCEEDED,
  FAILED,
  ALREADY_PAID
}

struct PaymentResult {
  address holder;
  PaymentStatus status;
  int64 amount;
}
```

**Access:** `PAYOUT_ROLE` required. Distribution only executes on designated payment date.

**Events:** `DistributionExecuted`, `RedemptionExecuted`

#### Portfolio facet

**Purpose:** Manage the treasury's payment token (e.g. USDC) and environmental asset tokens.

```solidity
function updatePaymentToken(address paymentToken) external returns (int256 dissociationError)
function addEnvironmentalAssetToken(address environmentalAsset) external
function removeEnvironmentalAssetToken(address environmentalAsset) external returns (int256 dissociationError)
function getPaymentToken() external view returns (address)
function getEnvironmentalAssetTokens(uint256 pageIndex, uint256 pageLength) external view returns (address[])
```

**Access:** `PORTFOLIO_MANAGER_ROLE`

**Hedera note:** Must call associate/dissociate on tokens before/after use. `dissociationError` is the Hedera response code — a non-zero value means dissociation failed but the removal is still recorded.

#### ProceedsManagement facet

**Purpose:** Transfer assets out of treasury to green project managers.

```solidity
function transferPaymentToken(address to, uint256 amount) external
function transferEnvironmentalAssetToken(address environmentalAsset, address to, uint256 tokenId) external
function fundProceedsRecipient(address proceedsRecipient, uint256 amount) external
```

**Access:** `PROCEEDS_FULL_MANAGER_ROLE` / `FUNDS_MANAGER_ROLE`

**Hedera constraint:** Amounts must fit in `int64` (Hedera token service limit).

**Treasury roles:**
| Role | Purpose |
|------|---------|
| PAYOUT_ROLE | Execute distributions and redemptions |
| PORTFOLIO_MANAGER_ROLE | Manage payment token and environmental assets |
| PROCEEDS_FULL_MANAGER_ROLE | Transfer any treasury asset |
| FUNDS_MANAGER_ROLE | Fund registered proceeds recipients |
| PAUSER_ROLE | Pause treasury operations |

---

### 4. Primary Market (`packages/primary-market/contracts/`, configIds: 10000 / 10001)

**Purpose:** Two-contract system. `FactoryPrimaryMarket` (10000) deploys `PrimaryMarket` (10001) instances. Each PrimaryMarket manages offerings and subscriptions for one or more bonds.

#### FactoryPrimaryMarket (configId: 10000)

```solidity
function deployPrimaryMarket(
    IBusinessLogicResolver resolver,
    ResolverProxyConfiguration calldata resolverProxyConfiguration,
    Rbac[] calldata rbacs
) external returns (address primaryMarketAddress)
```

**Access:** `PM_DEPLOYER_ROLE`

**Event:** `PrimaryMarketDeployed(address operator, address primaryMarketAddress, ...)`

#### PrimaryMarket (configId: 10001)

**Offering states:**

```
PENDING → OPEN → EXECUTABLE → PROCESSED (executed)
                ↘ CANCELLABLE → PROCESSED (cancelled)
```

**Policy combinations:**

| TargetQuantityRule | DeadlineRule         | Behaviour                                                          |
| ------------------ | -------------------- | ------------------------------------------------------------------ |
| NOT_ALLOWED        | WAIT_UNTIL_END       | Accept until endDate; execute only after endDate if target reached |
| NOT_ALLOWED        | CLOSE_TARGET_REACHED | Close + execute immediately when target reached                    |
| ALLOWED            | WAIT_UNTIL_END       | Accept beyond target until endDate; execute after endDate          |
| ALLOWED            | CLOSE_TARGET_REACHED | ❌ Invalid combination                                             |

**Key functions:**

```solidity
// Create offering
function createOffering(Offering calldata offeringInfo) external
// requires OFFERING_CREATOR_ROLE
// validates: dates in future, startDate < endDate, minLots <= maxLots <= targetLots

// Submit subscription (investor)
function submitSubscription(uint256 offeringId, uint256 lotUnits) external
// validates: offering OPEN, lotUnits in [minLots, maxLots]
// transfers paymentToken from investor to treasury
// checks investor KYC compliance

// Execute offering in batches
function executeOffering(uint256 offeringId, uint256 pageIndex, uint256 pageLength)
    external returns (OfferingProcessResult[] memory)
// requires OFFERING_CREATOR_ROLE or offering operator
// mints/transfers bond tokens to subscribers

// Cancel offering with refunds
function cancelOffering(uint256 offeringId, uint256 pageIndex, uint256 pageLength)
    external returns (OfferingProcessResult[] memory)
// refunds paymentToken to each subscriber
```

**Offering struct:**

```solidity
struct Offering {
  address asset; // Bond token address
  TargetQuantityRule targetQuantityRule;
  DeadlineRule deadlineRule;
  uint8 priceDecimals;
  address treasury; // Receives subscription payments
  address paymentToken; // e.g. USDC
  uint256 lotSize; // Minimum subscription unit
  uint256 minLots; // Min lots per subscription
  uint256 maxLots; // Max lots per subscription
  uint256 targetLots; // Total target
  uint256 startDate; // Unix timestamp
  uint256 endDate; // Unix timestamp
  uint256 price; // Per lot (0 = use asset nominal value)
}
```

---

## Deployment Process

### Initial deployment (`deployGbpInfrastructure`)

```
1. Deploy ProxyAdmin (manages TUP upgrades)
2. Deploy BLR implementation + TransparentUpgradeableProxy
3. Deploy Bond (ATS) facets → register in BLR → create configId 0x...0004
   └─ Deploy ATS Factory (TUP)
4. Deploy Treasury facets → register in BLR → create configId 20000
   (reuses AccessControl, Pause, Diamond facets from step 3)
5. Deploy FactorySuite facet → register in BLR → create configId 30000
   └─ Deploy FactorySuite ResolverProxy
6. Deploy FactoryPrimaryMarket + PrimaryMarket facets → register in BLR
   └─ Deploy FactoryPrimaryMarket ResolverProxy
```

**Checkpoints:** After each step the deployer saves state to `deployments/.checkpoints/`. If deployment fails mid-way it can be resumed automatically.

**Output file:** `packages/shared/contracts/deployments/hedera-testnet/gbpInfrastructure-<timestamp>.json`

### Upgrade (`upgradeGbpConfigurations`)

```
For each domain (factorySuite | treasury | factoryPrimaryMarket | primaryMarket):
  1. Deploy new facet implementation(s)
  2. Register in BLR → new version created
  3. Optionally update existing ResolverProxy addresses to point to new version
```

Existing proxies keep working until explicitly updated. Multiple versions can coexist.

---

## BLR Internals

```
BLR storage:
  configId → version → [selector → facetAddress]

On proxy call:
  1. Proxy calls BLR.resolveLatestBusinessLogic(resolverKey)
  2. BLR returns facetAddress for (configId, latestVersion, selector)
  3. Proxy delegatecalls facetAddress

On upgrade:
  1. Deploy new facet
  2. BLR.registerFacet(configId, newVersion, facetAddress, selectors[])
  3. BLR.setLatestVersion(configId, newVersion)
  4. All proxies with that configId now use new implementation
```

---

## Role Assignments in a Deployed Suite

After `FactorySuite.deployBondSuite()`:

```
Bond contract roles:
  ISSUER_ROLE          → operator (deployer)
  PAUSER_ROLE          → operator
  DEFAULT_ADMIN_ROLE   → operator
  MATURITY_REDEEMER_ROLE → Treasury address  ← automatically granted by FactorySuite

Treasury contract roles:
  DEFAULT_ADMIN_ROLE   → operator
  PAYOUT_ROLE          → operator
  PORTFOLIO_MANAGER_ROLE → operator
```

FactorySuite revokes its own `DEFAULT_ADMIN_ROLE` from the Bond after deployment so it can't interfere further.

---

## Hedera-Specific Notes

- **Token association:** Before receiving HTS tokens, a contract must call `associate()`. Treasury does this automatically in `Portfolio.initialize()`.
- **int64 limit:** Hedera's token service works with `int64` amounts. Any transfer >9.2×10¹⁸ will revert. Treasury enforces this with `NotAllowedAmount` errors.
- **Contract IDs vs EVM addresses:** Hedera assigns both `0.0.XXXXX` IDs and EVM `0x...` addresses to each contract. Both refer to the same contract. APIs and event listeners use EVM addresses; the mirror node exposes both.
- **Mirror node:** Used to fetch events and blocks — `https://testnet.mirrornode.hedera.com`. Events come from `/api/v1/contracts/results/{txId}/actions`.

---

## Common Error Reference

| Selector   | Error                                                     | Cause                              |
| ---------- | --------------------------------------------------------- | ---------------------------------- |
| `be94552d` | `BondDeploymentFailed()`                                  | ATS Factory returned 0x0           |
| `c340e5b3` | `TreasuryDeploymentFailed()`                              | Treasury ResolverProxy failed      |
| `dcf61246` | `WrongTimestamp(uint256)`                                 | `startingDate` is in the past      |
| `1c94559c` | `WrongDates(uint256,uint256)`                             | startDate >= endDate               |
| `a60b6cba` | `WrongImpactDataValues(...)`                              | floor > baseline or baseline > cap |
| `570cf0d3` | `WrongInterestRateValues(...)`                            | Invalid interest rate config       |
| `a1180aad` | `AccountHasNoRole(address,bytes32)`                       | Missing role on caller             |
| `5416eb98` | `FunctionNotFound(bytes4)`                                | Selector not registered in BLR     |
| `9a7772cd` | `ResolverProxyConfigurationNoRegistered(bytes32,uint256)` | Wrong configId/version             |
| `0dc149f0` | `AlreadyInitialized()`                                    | Init called twice                  |

---

## Source Files Quick Reference

```
packages/
  ats/contracts/contracts/
    facets/FactorySuite/          FactorySuite + deployBondSuite()
    facets/KpiLinkedRate/         KPI interest rate storage + getters
    facets/AccessControl/         Role management
    facets/Pause/                 Pause/unpause
    facets/Cap/                   Max supply
    facets/Hold/                  ERC-1400 holds
    facets/Lock/                  Compliance locks
    facets/Clearing/              Multi-party settlement
    facets/Document/              On-chain documents
    facets/ControlList/           KYC/whitelist
    facets/ProceedsRecipients/    Green project recipients

  treasury/contracts/contracts/
    facets/LifeCycleCashFlow/     Distributions + redemptions
    facets/Portfolio/             Payment token + env assets
    facets/ProceedsManagement/    Transfer assets out

  primary-market/contracts/contracts/
    facets/FactoryPrimaryMarket/  Deploy PrimaryMarket instances
    facets/PrimaryMarket/         Offerings + subscriptions

  shared/contracts/
    scripts/workflows/            deployGbpInfrastructure.ts, upgradeGbpConfigurations.ts
    deployments/hedera-testnet/   Deployment output JSON files
```
