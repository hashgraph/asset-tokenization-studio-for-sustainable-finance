---
title: Asset Tokenization Studio (ATS) Overview
sidebar_position: 1
sidebar_label: Overview
description: Asset Tokenization Studio for managing tokenized green bonds on Hedera - bond creation, token management, and lifecycle tracking
keywords: [ATS, asset tokenization, hedera token service, HTS, bond tokens, tokenization]
---

# ATS Overview

Asset Tokenization Studio (ATS) is the core component for managing tokenized green bonds on the Hedera network.

## What is ATS?

ATS provides a complete solution for creating, managing, and transferring tokenized bonds using Hedera Token Service (HTS). It handles the entire lifecycle of green bonds from issuance to maturity.

## Key Features

### Bond Creation

- Create tokenized bonds with custom parameters
- Set maturity dates, interest rates, and denominations
- Configure environmental impact metrics
- Associate metadata with bond tokens

### Token Management

- Issue bond tokens to investors
- Transfer tokens between accounts
- Freeze/unfreeze tokens when needed
- Burn tokens upon redemption

### State Tracking

- Monitor bond lifecycle states
- Track token ownership
- Record transaction history
- Maintain audit trails

### Integration

- REST API for external systems
- Event emission for real-time updates
- Smart contract integration
- Database persistence

## Architecture

ATS follows a hexagonal architecture pattern:

```
External Systems → API Layer → Application Layer → Domain Layer → Infrastructure Layer
                                                                          ↓
                                                                   Hedera Network
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Hedera SDK, Solidity
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## Use Cases

1. **Green Bond Issuance**: Create and distribute green bonds to qualified investors
2. **Secondary Market**: Enable trading of tokenized bonds
3. **Compliance**: Track and verify environmental impact claims
4. **Redemption**: Handle bond maturity and principal repayment

## Quick Start

```bash
# Install dependencies
cd apps/ats/api
npm install

# Configure environment
cp .env.sample .env

# Run database migrations
npm run migration:run

# Start the service
npm run start:dev
```

## Next Steps

- [Installation Guide](installation.md)
- [How It Works](how-it-works.md)
- [API Reference](api-guide.md)
- [Smart Contracts](smart-contracts.md)
