---
title: Primary Market Smart Contracts
sidebar_position: 5
sidebar_label: Smart Contracts
description: Smart contracts for primary market operations - offering creation, subscriptions, allocation logic, and events
keywords: [primary market contracts, offering contracts, subscription contracts, solidity, smart contracts]
---

# Primary Market Smart Contracts

Smart contract documentation.

## PrimaryMarket Contract

Main contract for managing offerings and subscriptions.

### Key Functions

```solidity
function createOffering(
  bytes32 bondId,
  uint256 totalAmount,
  uint256 minSubscription,
  uint256 startDate,
  uint256 endDate
) external onlyRole(ISSUER_ROLE)
```

```solidity
function subscribe(
  bytes32 offeringId,
  uint256 amount
) external payable
```

```solidity
function allocate(
  bytes32 offeringId
) external onlyRole(ALLOCATOR_ROLE)
```

## Events

```solidity
event OfferingCreated(bytes32 offeringId, bytes32 bondId, uint256 totalAmount);
event SubscriptionSubmitted(bytes32 offeringId, address investor, uint256 amount);
event AllocationCompleted(bytes32 offeringId);
```

## Next Steps

- [How It Works](how-it-works.md)
