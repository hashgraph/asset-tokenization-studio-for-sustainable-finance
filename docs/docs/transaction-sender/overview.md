---
title: Transaction Sender Service Overview
sidebar_position: 1
sidebar_label: Overview
description: Transaction Sender microservice for reliable blockchain transaction submission, queue management, and retry mechanisms on Hedera
keywords: [transaction sender, blockchain transactions, hedera, queue processing, transaction retry, nonce management]
---

# Transaction Sender Overview

The Transaction Sender is a microservice that handles all blockchain transaction submissions to the Hedera network.

## Purpose

Transaction Sender provides:

- Centralized transaction management
- Transaction queue processing
- Retry mechanism for failed transactions
- Transaction status tracking
- Gas optimization

## Key Features

- **Queue-based Processing**: Bull queue for reliable transaction handling
- **Automatic Retries**: Configurable retry strategy for failed transactions
- **Transaction Tracking**: Complete transaction lifecycle monitoring
- **Nonce Management**: Automatic nonce handling
- **Gas Optimization**: Dynamic gas price calculation
- **Multi-account Support**: Support for multiple operator accounts

## Architecture

```
API Request → Queue → Transaction Processing → Hedera Network → Confirmation
```

## Technology Stack

- **Backend**: NestJS, TypeScript
- **Queue**: Bull (Redis)
- **Blockchain**: Hedera SDK
- **Database**: PostgreSQL (for transaction history)

## Quick Start

```bash
cd apps/shared/transaction-sender
npm install
cp .env.sample .env
npm run start:dev
```

## Next Steps

- [Installation](installation.md)
- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
