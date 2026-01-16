---
title: ATS Smart Contracts
sidebar_position: 5
sidebar_label: Smart Contracts
description: Smart contracts documentation for Asset Tokenization Studio - BondFactory, Bond, TokenManager, and RoleManager contracts
keywords: [smart contracts, solidity, bond contracts, factory pattern, hedera contracts, HTS]
---

# ATS Smart Contracts

Smart contracts documentation for Asset Tokenization Studio.

## Contracts Overview

ATS uses the following smart contracts on Hedera:

1. **BondFactory**: Creates new bond contracts
2. **Bond**: Manages individual bond lifecycle
3. **TokenManager**: Handles HTS token operations
4. **RoleManager**: Manages access control

## BondFactory Contract

### Purpose

Factory pattern for creating new bond contracts.

### Key Functions

```solidity
// Create a new bond
function createBond(
  string memory name,
  string memory symbol,
  uint256 totalSupply,
  uint256 maturityDate,
  uint256 interestRate
) external returns (address bondAddress, address tokenId);

// Get all bonds created
function getBonds() external view returns (address[] memory);

// Check if address is a bond
function isBond(address bondAddress) external view returns (bool);
```

### Events

```solidity
event BondCreated(
  address indexed bondAddress,
  address indexed tokenId,
  address indexed issuer,
  string name,
  uint256 timestamp
);
```

## Bond Contract

### Purpose

Manages the lifecycle of a single bond.

### State Variables

```solidity
string public name;
string public symbol;
address public tokenId;
uint256 public totalSupply;
uint256 public issuedSupply;
uint256 public maturityDate;
uint256 public interestRate;
BondState public state;
address public issuer;
```

### Key Functions

```solidity
// Issue tokens to investor
function issueTokens(address investor, uint256 amount) external onlyIssuer whenActive;

// Transfer tokens
function transfer(address from, address to, uint256 amount) external whenActive;

// Pause the bond
function pause() external onlyIssuer;

// Resume the bond
function unpause() external onlyIssuer;

// Mark bond as matured
function mature() external onlyIssuer;

// Get token balance
function balanceOf(address account) external view returns (uint256);
```

### Modifiers

```solidity
modifier onlyIssuer() {
    require(msg.sender == issuer, "Not issuer");
    _;
}

modifier whenActive() {
    require(state == BondState.Active, "Bond not active");
    _;
}

modifier beforeMaturity() {
    require(block.timestamp < maturityDate, "Bond matured");
    _;
}
```

### Events

```solidity
event TokensIssued(address indexed investor, uint256 amount);
event TokensTransferred(address indexed from, address indexed to, uint256 amount);
event BondPaused(uint256 timestamp);
event BondUnpaused(uint256 timestamp);
event BondMatured(uint256 timestamp);
```

## TokenManager Contract

### Purpose

Manages HTS token operations.

### Key Functions

```solidity
// Create HTS token
function createToken(
  string memory name,
  string memory symbol,
  uint256 initialSupply,
  address treasury
) external returns (address tokenId);

// Associate token with account
function associateToken(address tokenId, address account) external;

// Transfer tokens
function transferToken(address tokenId, address from, address to, uint256 amount) external;

// Burn tokens
function burnToken(address tokenId, uint256 amount) external;
```

## RoleManager Contract

### Purpose

Role-based access control.

### Roles

```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
```

### Key Functions

```solidity
// Grant role to account
function grantRole(bytes32 role, address account) external onlyAdmin;

// Revoke role from account
function revokeRole(bytes32 role, address account) external onlyAdmin;

// Check if account has role
function hasRole(bytes32 role, address account) external view returns (bool);
```

## Deployment

### Local Deployment

```bash
cd packages/ats/contracts
npx hardhat deploy --network local
```

### Testnet Deployment

```bash
npx hardhat deploy --network testnet
```

### Deployment Script

```typescript
import { ethers } from "hardhat";

async function main() {
  // Deploy RoleManager
  const RoleManager = await ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy();
  await roleManager.deployed();

  // Deploy TokenManager
  const TokenManager = await ethers.getContractFactory("TokenManager");
  const tokenManager = await TokenManager.deploy();
  await tokenManager.deployed();

  // Deploy BondFactory
  const BondFactory = await ethers.getContractFactory("BondFactory");
  const bondFactory = await BondFactory.deploy(roleManager.address, tokenManager.address);
  await bondFactory.deployed();

  console.log("RoleManager:", roleManager.address);
  console.log("TokenManager:", tokenManager.address);
  console.log("BondFactory:", bondFactory.address);
}
```

## Testing

### Unit Tests

```typescript
describe("Bond Contract", () => {
  it("should issue tokens", async () => {
    const amount = 1000;
    await bond.issueTokens(investor.address, amount);

    const balance = await bond.balanceOf(investor.address);
    expect(balance).to.equal(amount);
  });

  it("should reject issuance when paused", async () => {
    await bond.pause();

    await expect(bond.issueTokens(investor.address, 1000)).to.be.revertedWith("Bond not active");
  });
});
```

## Gas Optimization

- Use `uint256` instead of smaller types
- Minimize storage writes
- Batch operations when possible
- Use events for off-chain data

## Security Considerations

1. **Access Control**: All state-changing functions protected by modifiers
2. **Reentrancy**: ReentrancyGuard on token transfers
3. **Integer Overflow**: SafeMath for arithmetic operations
4. **Input Validation**: Require statements validate all inputs
5. **Pausable**: Emergency pause mechanism

## Audit

Contracts should be audited before mainnet deployment:

- **Static Analysis**: Slither, Mythril
- **Manual Review**: Security audit firm
- **Test Coverage**: >95% coverage
- **Formal Verification**: Critical functions

## Next Steps

- [API Guide](api-guide.md)
- [How It Works](how-it-works.md)
