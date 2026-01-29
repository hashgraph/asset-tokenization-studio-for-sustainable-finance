---
title: Getting Started Guide
sidebar_position: 3
sidebar_label: Getting Started
description: Comprehensive step-by-step guide for first-time setup of the Green Bond Platform - from prerequisites to deployment
keywords: [getting started, setup guide, installation tutorial, first-time setup, step-by-step]
---

# Getting Started

This comprehensive guide will walk you through everything you need to know to get the Green Bond Platform up and running on your local machine for the first time.

## What You'll Learn

By the end of this guide, you will have:

- ✅ All prerequisites installed
- ✅ The platform cloned and configured
- ✅ All services running locally
- ✅ Smart contracts deployed to testnet
- ✅ Verified the platform is working correctly

## Time Required

⏱️ **First-time setup**: Approximately 30-45 minutes (depending on download speeds and familiarity with the tools)

## Step 1: Verify Prerequisites

Before starting, ensure you have the required software installed. Open a terminal and run:

```bash
# Check Node.js version (should be v22+)
node --version

# Check npm version (should be v10+)
npm --version

# Check Docker (should be v26+)
docker --version

# Check Docker Compose (should be v4+)
docker compose --version

# Check Git (should be v2+)
git --version
```

If any of these commands fail or show versions lower than required, see the [Prerequisites](prerequisites.md) guide for installation instructions.

## Step 2: Get a Hedera Testnet Account

You'll need a Hedera testnet account to interact with the blockchain:

1. **Visit the Hedera Portal**: Go to [portal.hedera.com](https://portal.hedera.com)
2. **Create an account**: Sign up for free
3. **Get testnet credentials**: Generate a testnet account
4. **Save your credentials**: You'll receive:
   - Account ID (format: `0.0.xxxxx`)
   - Private Key (hex string starting with `302e...`)
   - Public Key

:::warning Important
Keep your private key safe and never commit it to version control! We'll add it to `.env` files which are git-ignored.
:::

## Step 3: Clone the Repository

Clone the project and navigate into it:

```bash
git clone https://github.com/hashgraph/green-bond-platform.git
cd green-bond-platform
```

For SSH (if you have SSH keys configured with GitHub):

```bash
git clone git@github.com:hashgraph/green-bond-platform.git
cd green-bond-platform
```

## Step 4: Switch to Development Branch

```bash
git checkout develop
```

:::info
Currently, active development happens in the `develop` branch. This will be merged to `main` once stable.
:::

## Step 5: Install Dependencies

Install all dependencies for the entire monorepo:

```bash
npm ci
```

This will take a few minutes as it installs dependencies for all workspaces (APIs, contracts, shared packages).

Expected output:

```
added XXX packages in XXXs
```

## Step 6: Start Infrastructure Services

Start PostgreSQL, RabbitMQ, and pgAdmin using Docker (docker-compose.yml is in scripts folder):

```bash
cd scripts
docker compose up -d
```

Navigate back to the root:

```bash
cd ..
```

Verify containers are running:

```bash
docker ps
```

You should see containers for:

- `postgres` (port 5432)
- `rabbitmq` (ports 5672, 15672)
- `pgadmin` (port 5050)

:::tip Access Interfaces

- **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (user: `guest`, password: `guest`)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)
  :::

## Step 7: Configure Environment Variables

Each service needs its own configuration. Let's set them up one by one:

### Gateway Configuration

```bash
cd apps/shared/gateway
cp .env.example .env
```

### Transaction Sender Configuration

```bash
cd ../transaction-sender
cp .env.example .env
```

### ATS API Configuration

```bash
cd ../../ats/api
cp .env.example .env
```

### Primary Market API Configuration

```bash
cd ../../primary-market/api
cp .env.example .env
```

### Treasury API Configuration

```bash
cd ../../treasury/api
cp .env.example .env
```

Navigate back to the root:

```bash
cd ../../../
```

## Step 8: Compile Smart Contracts

Compile all smart contracts:

```bash
npm run contracts:build
```

This compiles:

- Treasury contracts
- Primary Market contracts
- ATS contracts
- Shared contracts

Expected output:

```
Compiled X Solidity files successfully
```

## Step 9: Deploy Smart Contracts to Testnet (Optional you can use the ones that we have deployed)

Deploy the contracts to Hedera testnet:

```bash
cd scripts

# Deploy Treasury contracts
node treasury/treasury-orchestrator.js

# Deploy Primary Market contracts
node primary-market/primarymarket/deploy-primary-market.js

# Deploy ATS contracts
node ats/factory/deploy-factory.js
```

Navigate back to the root:

```bash
cd ..
```

:::tip
Save the contract addresses that are printed. You'll need them for the `.env` files.
:::

After deployment, update your `.env` files with the deployed contract addresses.

## Step 10: Compile Shared libraries

Compile all shared libraries:

```bash
npm run shared:build
```

This compiles:

- green-bonds-shared-testing library
- green-bonds-shared-core library
- green-bonds-blockchain-listener library
- Shared contracts

Expected output:

```
Compiled X Solidity files successfully
```

## Step 11: Run Database Migrations

Each API manages its own database. Start each API once to run migrations:

Open separate terminal windows/tabs for each:

**Terminal 1 - ATS API:**

```bash
npm run ats:api:start:dev
```

Wait until you see: `Application is running on: http://localhost:3001`
Then press `Ctrl+C` to stop.

**Terminal 2 - Primary Market API:**

```bash
npm run primary-market:api:start:dev
```

Wait until you see: `Application is running on: http://localhost:3002`
Then press `Ctrl+C` to stop.

**Terminal 3 - Treasury API:**

```bash
npm run treasury:api:start:dev
```

Wait until you see: `Application is running on: http://localhost:3003`
Then press `Ctrl+C` to stop.

## Step 12: Start All Services

Now start all services in development mode. Open separate terminals for each:

**Terminal 1 - Gateway:**

```bash
npm run gateway:start:dev
```

**Terminal 2 - Transaction Sender:**

```bash
npm run transaction-sender:start:dev
```

**Terminal 3 - ATS API:**

```bash
npm run ats:api:start:dev
```

**Terminal 4 - Primary Market API:**

```bash
npm run primary-market:api:start:dev
```

**Terminal 5 - Treasury API:**

```bash
npm run treasury:api:start:dev
```

## Step 12: Run Tests

Verify everything is properly configured by running tests:

```bash
# Run all unit tests
npm run api:test

# Run integration tests (optional, takes longer)
npm run api:test:integration
```

## Step 13: Verify Everything Works

### Check Service Health

Visit these URLs in your browser:

- Gateway: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- Transaction Sender: [http://localhost:3010/api/v1/health](http://localhost:3010/api/v1/health)
- ATS API: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
- Primary Market API: [http://localhost:3002/api/v1/health](http://localhost:3002/api/v1/health)
- Treasury API: [http://localhost:3003/api/v1/health](http://localhost:3003/api/v1/health)

Each should return `{"status":"ok"}` or similar.

## Step 14: Explore the Platform

Now that everything is running, you can:

1. **View API Documentation**: Most APIs have Swagger documentation at `/api` endpoint
   - ATS API: [http://localhost:3001/api](http://localhost:3001/api)
   - Primary Market API: [http://localhost:3002/api](http://localhost:3002/api)
   - Treasury API: [http://localhost:3003/api](http://localhost:3003/api)

2. **Make API Calls**: Use tools like Postman, curl, or the Swagger UI to interact with the APIs

## Common Issues & Solutions

### Port Already in Use

If you get `EADDRINUSE` errors:

```bash
# Find process using the port (example for port 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Docker Connection Issues

```bash
cd scripts
# Restart Docker containers
docker compose down
docker compose up -d
```

### Database Connection Errors

Verify PostgreSQL is running:

```bash
docker ps | grep postgres
```

Check connection:

```bash
docker exec -it postgres psql -U postgres
```

### Contract Deployment Failures

- Ensure you have sufficient HBAR in your testnet account
- Verify your private key and account ID are correct
- Check network connectivity to Hedera testnet

## Next Steps

Now that you have the platform running:

1. **Learn the Architecture**: Read the [Architecture](architecture.md) guide
2. **Explore Components**:
   - [ATS Overview](ats/overview)
   - [Primary Market Overview](primary-market/overview)
   - [Treasury Overview](treasury/overview)
3. **Development**: Check the [Development Guide](development/contributing.md)
4. **Testing**: Review [Testing Guide](development/testing.md)

## Need Help?

- 📖 Check the [Troubleshooting Guide](installation.md#troubleshooting)
- 🐛 [Report an Issue](https://github.com/hashgraph/green-bond-platform/issues)
- 💬 [Join Discussions](https://github.com/hashgraph/green-bond-platform/discussions)

Congratulations! 🎉 You now have the Green Bond Platform running locally!
