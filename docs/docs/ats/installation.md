---
title: ATS Installation
sidebar_position: 2
sidebar_label: Installation
description: Installation and configuration guide for Asset Tokenization Studio (ATS) API - setup, environment variables, and database
keywords: [ATS installation, setup ATS, environment configuration, database setup]
---

# ATS Installation

Installation guide and configuration for ATS (Asset Tokenization Studio) API.

## Prerequisites

- Node.js v22 or higher
- PostgreSQL 14 or higher
- Hedera testnet account with HBAR
- Docker (optional)

## Installation Steps

### 1. Navigate to ATS Directory

```bash
cd apps/ats/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env` file from sample:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=ats_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Smart Contracts
BOND_FACTORY_ADDRESS=0x...
TOKEN_MANAGER_ADDRESS=0x...
ROLE_MANAGER_ADDRESS=0x...

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=3600

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=ats-transactions

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
```

### 4. Database Setup

Create database:

```bash
createdb ats_db
```

Run migrations:

```bash
npm run migration:run
```

### 5. Deploy Smart Contracts

Deploy ATS smart contracts to Hedera:

```bash
cd ../../../packages/ats/contracts
npx hardhat deploy --network testnet
```

Copy deployed contract addresses to `.env` file.

### 6. Start the Service

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## Verify Installation

### Check API Health

```bash
curl http://localhost:3001/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "database": "connected",
  "blockchain": "connected"
}
```

### Access Swagger Documentation

Open browser:

```
http://localhost:3001/api/docs
```

### Run Tests

```bash
npm run test
npm run test:e2e
```

## Docker Setup (Optional)

Using Docker Compose:

```bash
cd apps/ats/api
docker compose up -d
```

This will start:

- ATS API service
- PostgreSQL database
- pgAdmin

## Database Configuration

The `ormconfig.ts` file contains the TypeORM configuration:

```typescript
import { DataSourceOptions } from "typeorm";

export const config: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
};
```

## Common Issues

### Port Already in Use

If port 3001 is already in use:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=3002
```

### Database Connection Error

Verify PostgreSQL is running:

```bash
pg_isready
```

Check credentials in `.env` file.

### Hedera Connection Error

Verify:

- Account ID is correct
- Private key is valid
- Network (testnet/previewnet/mainnet) is correct
- Account has sufficient HBAR

## Next Steps

- [How It Works](how-it-works.md)
- [API Guide](api-guide.md)
- [Smart Contracts](smart-contracts.md)
