---
title: Quick Start Guide
sidebar_position: 2
sidebar_label: Quick Start
description: Get the Green Bond Platform running in under 10 minutes with this fast-track setup guide for experienced developers
keywords: [quick start, setup, installation, docker, hedera, getting started quickly]
---

# Quick Start

Get the Green Bond Platform running in **under 10 minutes**. This guide assumes you have basic knowledge of Node.js and Docker.

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js v22+ and npm v10+
- ✅ Docker and Docker Compose
- ✅ Git

:::tip First Time Here?
If you don't have these installed or need more detailed instructions, see the [Getting Started](getting-started.md) guide instead.
:::

## Step 1: Get Hedera Testnet Account (2 min)

You need a Hedera testnet account to run the platform:

1. Visit [portal.hedera.com](https://portal.hedera.com)
2. Sign up and create a testnet account
3. Save your **Account ID** (0.0.xxxxx) and **Private Key**

:::info
Keep these credentials handy - you'll need them in Step 4.
:::

## Step 2: Clone and Install (3 min)

```bash
# Clone repository
git clone https://github.com/hashgraph/green-bond-platform.git
cd green-bond-platform

# Switch to development branch
git checkout develop

# Install dependencies
npm ci
```

## Step 3: Start Infrastructure (1 min)

Start PostgreSQL, RabbitMQ, and pgAdmin:

```bash
docker compose up -d
```

Verify containers are running:

```bash
docker ps
```

## Step 4: Configure Environment (2 min)

Quick setup for all services:

```bash
# Gateway
cd apps/shared/gateway
cp .env.example .env
# Edit .env: Add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY

# Transaction Sender
cd ../transaction-sender
cp .env.example .env
# Edit .env: Add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY

# ATS API
cd ../../ats/api
cp .env.example .env
# Edit .env: Add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY

# Primary Market API
cd ../../primary-market/api
cp .env.example .env
# Edit .env: Add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY

# Treasury API
cd ../../treasury/api
cp .env.example .env
# Edit .env: Add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY

# Return to root
cd ../../../..
```

:::tip Quick Edit
Use your favorite editor to add the same credentials to all five `.env` files:

```bash
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...
```

:::

## Step 5: Build Contracts (1 min)

```bash
npm run contracts:build
```

## Step 6: Start Services (1 min)

Open 5 terminal windows and run each command in a separate terminal:

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

:::tip Use a Terminal Multiplexer
Consider using `tmux` or `screen` to manage multiple terminals, or use VS Code's split terminal feature.
:::

## Step 7: Verify It Works! (30 sec)

Open your browser and check these health endpoints:

- ✅ Gateway: [http://localhost:3000/health](http://localhost:3000/health)
- ✅ ATS API: [http://localhost:3001/health](http://localhost:3001/health)
- ✅ Primary Market: [http://localhost:3002/health](http://localhost:3002/health)
- ✅ Treasury: [http://localhost:3003/health](http://localhost:3003/health)

Each should return `{"status":"ok"}` or similar.

## 🎉 Success!

You now have the Green Bond Platform running locally! Here's what you can do next:

### Explore the APIs

Visit the Swagger documentation for each service:

- **ATS API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Primary Market**: [http://localhost:3002/api](http://localhost:3002/api)
- **Treasury**: [http://localhost:3003/api](http://localhost:3003/api)

### View Database

Access pgAdmin at [http://localhost:5050](http://localhost:5050) to inspect the databases.

### Monitor RabbitMQ

Check message queues at [http://localhost:15672](http://localhost:15672)

- Username: `guest`
- Password: `guest`

### Run Tests

Verify everything is working correctly:

```bash
# Unit tests
npm run api:test

# Integration tests
npm run api:test:integration
```

## Common Quick Fixes

### Port Already in Use

```bash
# Kill process on port 3000 (adjust port as needed)
lsof -i :3000
kill -9 <PID>
```

### Docker Not Running

```bash
# Restart Docker daemon
sudo systemctl restart docker

# Or on macOS/Windows, restart Docker Desktop
```

### Compilation Errors

```bash
# Clean and rebuild
npm run clean:force
npm ci
npm run contracts:build
```

## What's Next?

Now that you're up and running:

1. **📚 Learn the Architecture**: Read [Architecture Guide](architecture.md)
2. **🔧 Deploy Smart Contracts**: See [Getting Started](getting-started.md#step-10-deploy-smart-contracts-to-testnet)
3. **🧪 Run Integration Tests**: Check [Testing Guide](development/testing.md)
4. **👨‍💻 Start Developing**: Review [Contributing Guide](development/contributing.md)

## Need More Help?

- 📖 **Detailed Setup**: [Getting Started Guide](getting-started.md)
- 🛠️ **Configuration Details**: [Configuration Guide](configuration.md)
- 🐛 **Troubleshooting**: [Installation Guide](installation.md#troubleshooting)
- 💬 **Ask Questions**: [GitHub Discussions](https://github.com/hashgraph/green-bond-platform/discussions)

**Happy coding! 🚀**
