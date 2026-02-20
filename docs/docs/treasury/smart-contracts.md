---
title: Treasury Smart Contracts
sidebar_position: 5
sidebar_label: Smart Contracts
description: Smart contracts for treasury operations - coupon payments, bond redemptions, environmental token distributions
keywords: [treasury contracts, payment contracts, redemption contracts, solidity, smart contracts]
---

# Treasury Smart Contracts

Smart contract documentation.

## Treasury Contract

Main contract for payment and redemption management.

### Key Functions

```solidity
function processCouponPayment(
  bytes32 bondId,
  uint256 amount
) external onlyRole(TREASURY_ROLE)
```

```solidity
function redeemBond(
  bytes32 bondId,
  uint256 amount
) external
```

```solidity
function distributeEnvironmentalTokens(
  bytes32 bondId,
  address[] calldata holders,
  uint256[] calldata amounts
) external onlyRole(DISTRIBUTOR_ROLE)
```

## Events

```solidity
event CouponPaymentProcessed(bytes32 bondId, uint256 amount);
event BondRedeemed(bytes32 bondId, address holder, uint256 amount);
event EnvironmentalTokensDistributed(bytes32 bondId, uint256 totalAmount);
```

## Next Steps

- [How It Works](how-it-works.md)
