---
title: Transaction Sender Installation
sidebar_position: 2
sidebar_label: Installation
description: Installation and configuration guide for Transaction Sender service - queue setup, Redis, and Hedera configuration
keywords: [transaction sender installation, queue setup, redis, hedera transactions]
---

# Transaction Sender Installation

Installation guide for the Transaction Sender service.

## Prerequisites

- Node.js v22+
- Redis 7+
- PostgreSQL 15+
- Hedera testnet account with HBAR balance

## Installation Steps

### 1. Navigate to Directory

```bash
cd apps/shared/transaction-sender
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
PORT=3004
DATABASE_URL=postgresql://user:pass@localhost:5432/transaction_sender
REDIS_URL=redis://localhost:6379

# Hedera
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
NETWORK=testnet

# Queue Configuration
MAX_RETRIES=3
RETRY_DELAY=5000
CONCURRENCY=5
```

### 4. Start Redis

```bash
docker compose up -d redis
```

### 5. Start Database

```bash
docker compose up -d postgres
```

### 6. Run Migrations

```bash
npm run migration:run
```

### 7. Start Service

```bash
npm run start:dev
```

## Verification

Check service health:

```bash
curl http://localhost:3004/health
```

## Next Steps

- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
