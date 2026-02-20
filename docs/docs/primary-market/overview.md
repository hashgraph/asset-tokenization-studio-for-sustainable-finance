---
title: Primary Market Module Overview
sidebar_position: 1
sidebar_label: Overview
description: Primary market component for green bond offerings, investor subscriptions, allocation algorithms, and token distribution
keywords: [primary market, bond offering, subscriptions, allocation, IPO, token distribution]
---

# Primary Market Overview

The Primary Market component manages the initial offering and subscription of green bonds to investors.

## Purpose

Primary Market handles:

- Bond offering creation and management
- Investor subscriptions
- Allocation algorithms
- Payment processing
- Token distribution

## Key Features

- **Offering Management**: Create and manage bond offerings
- **Subscription Handling**: Process investor subscriptions
- **Smart Allocation**: Fair allocation algorithms
- **Payment Integration**: Integrate with payment systems
- **Token Distribution**: Automatic token distribution to investors
- **Compliance**: KYC/AML verification

## Architecture

```
Offering Creation → Subscription Period → Allocation → Payment → Distribution
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Hedera SDK
- **Smart Contracts**: Solidity
- **Queue**: Bull (Redis)

## Quick Start

```bash
cd apps/primary-market/api
npm install
cp .env.example .env
npm run start:dev
```

## Next Steps

- [Installation](installation.md)
- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
- [Smart Contracts](smart-contracts.md)
