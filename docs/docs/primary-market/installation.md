---
title: Primary Market Installation
sidebar_position: 2
sidebar_label: Installation
description: Installation and configuration guide for Primary Market API - offerings, subscriptions, and allocation system setup
keywords: [primary market installation, setup, environment configuration, database migrations]
---

# Primary Market Installation

Complete installation guide for the Primary Market API.

## Prerequisites

- Node.js v22+
- PostgreSQL 15+
- Docker and Docker Compose
- Hedera testnet account
- Compiled smart contracts

## Installation Steps

### 1. Navigate to Directory

```bash
cd apps/primary-market/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3002
DATABASE_URL=postgresql://user:pass@localhost:5432/primary_market

# Hedera
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
NETWORK=testnet

# Smart Contracts
PRIMARY_MARKET_CONTRACT_ID=0.0.xxxxx
OFFERING_CONTRACT_ID=0.0.xxxxx
```

### 4. Start Database

```bash
docker compose up -d postgres
```

### 5. Run Migrations

```bash
npm run migration:run
```

### 6. Deploy Smart Contracts

```bash
cd ../../../packages/primary-market/contracts
npx hardhat run scripts/deploy.ts --network testnet
```

### 7. Start Service

```bash
cd ../../../apps/primary-market/api
npm run start:dev
```

## Next Steps

- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
