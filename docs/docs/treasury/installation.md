---
title: Treasury Installation
sidebar_position: 2
sidebar_label: Installation
description: Installation and configuration guide for Treasury API - payment processing, redemptions, and distribution system setup
keywords: [treasury installation, setup, redis, bull queue, payment system setup]
---

# Treasury Installation

Complete installation guide for the Treasury API.

## Prerequisites

- Node.js v22+
- PostgreSQL 15+
- Redis 7+ (for Bull Queue)
- Docker and Docker Compose
- Hedera testnet account

## Installation Steps

### 1. Navigate to Directory

```bash
cd apps/treasury/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.sample .env
```

Edit `.env`:

```bash
PORT=3003
DATABASE_URL=postgresql://user:pass@localhost:5432/treasury
REDIS_URL=redis://localhost:6379

# Hedera
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
NETWORK=testnet

# Smart Contracts
TREASURY_CONTRACT_ID=0.0.xxxxx
PAYMENT_TOKEN_ID=0.0.xxxxx
```

### 4. Start Services

```bash
docker-compose up -d postgres redis
```

### 5. Run Migrations

```bash
npm run migration:run
```

### 6. Deploy Smart Contracts

```bash
cd ../../../packages/treasury/contracts
npx hardhat run scripts/deploy.ts --network testnet
```

### 7. Start Service

```bash
cd ../../../apps/treasury/api
npm run start:dev
```

## Next Steps

- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
