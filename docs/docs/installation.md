---
title: Installation Guide
sidebar_position: 5
sidebar_label: Installation
description: Complete installation guide for Green Bond Platform - clone repository, install dependencies, compile contracts, and troubleshooting
keywords: [installation, setup, npm install, smart contracts, troubleshooting, dependencies]
---

# Installation

This guide will walk you through the complete installation process of Green Bond Platform.

## 1. Clone the Repository

```bash
git clone git@github.com:hashgraph/green-bond-platform.git
cd green-bond-platform
```

If you prefer to use HTTPS:

```bash
git clone https://github.com/hashgraph/green-bond-platform.git
cd green-bond-platform
```

## 2. Switch to Development Branch

```bash
git checkout develop
```

## 3. Install Dependencies

Install all dependencies for all workspaces in the monorepo:

```bash
npm ci
```

:::tip
Use `npm ci` instead of `npm install` for a faster and reproducible installation based on `package-lock.json`.
:::

The command will install dependencies for:

- All applications (Gateway, Transaction Sender, ATS, Primary Market, Treasury)
- All shared packages (Contracts, Core, Blockchain Listener, Testing)
- Utility scripts

## 4. Compile Smart Contracts

Compile all smart contracts in the project:

```bash
npm run contracts:build
```

This will compile:

- ATS contracts
- Primary Market contracts
- Treasury contracts
- Shared contracts

You will see output similar to:

```
✓ Compiling ATS contracts...
✓ Compiling Primary Market contracts...
✓ Compiling Treasury contracts...
✓ Compiling Shared contracts...
```

## 5. Start Services with Docker

Start the necessary infrastructure services:

```bash
docker-compose up -d
```

This will start:

- **PostgreSQL**: Main database (port 5432)
- **pgAdmin**: Web interface for PostgreSQL (port 5050)
- **RabbitMQ**: Message broker (ports 5672, 15672)

Verify that containers are running:

```bash
docker ps
```

## 6. Verify Installation

### Verify Compilation

Run unit tests to verify everything is correctly installed:

```bash
npm run api:test
```

### Verify Linting

```bash
npm run lint
```

### Verify Formatting

```bash
npm run format:check
```

## Individual Component Installation

If you only need to work with a specific component, you can install it individually:

### ATS API

```bash
cd apps/ats/api
npm install
```

### Primary Market API

```bash
cd apps/primary-market/api
npm install
```

### Treasury API

```bash
cd apps/treasury/api
npm install
```

### Gateway

```bash
cd apps/shared/gateway
npm install
```

### Transaction Sender

```bash
cd apps/shared/transaction-sender
npm install
```

## Available NPM Scripts

### Cleanup Scripts

```bash
# Clean node_modules and builds
npm run clean

# Forced cleanup (removes everything)
npm run clean:force
```

### Formatting Scripts

```bash
# Format all code
npm run format

# Check format without changing files
npm run format:check

# Format only changed files
npm run format:changed
```

### Linting Scripts

```bash
# Run linting (JS + Solidity)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Lint only JavaScript/TypeScript files
npm run lint:js

# Lint only Solidity files
npm run lint:sol
```

### Testing Scripts

```bash
# Run all tests
npm run api:test

# Run integration tests
npm run api:test:integration

# Run tests with coverage
npm run api:test:coverage
```

### Contract Scripts

```bash
# Compile all contracts
npm run contracts:build

# Clean contract builds
npm run ats:contracts:clean
npm run primary-market:contracts:clean
npm run treasury:contracts:clean
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Find the process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use fuser (Linux)
fuser -k 3000/tcp
```

**Alternative**: Change the port in your `.env` file:

```bash
PORT=3001
```

#### 2. Docker Connection Failed

**Error**: `Cannot connect to Docker daemon`

**Solutions**:

**Linux**:

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to docker group (to avoid sudo)
sudo usermod -aG docker $USER
newgrp docker
```

**macOS/Windows**:

- Open Docker Desktop application
- Ensure it's running (check system tray/menu bar)

**Verify Docker is running**:

```bash
docker ps
```

#### 3. PostgreSQL Connection Issues

**Error**: `ECONNREFUSED` or `Connection refused to database`

**Diagnose**:

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check container logs
docker logs postgres

# Test connection
docker exec -it postgres psql -U postgres
```

**Solutions**:

**If container is not running**:

```bash
docker-compose up -d postgres
```

**If database doesn't exist**:

```bash
# Access PostgreSQL
docker exec -it postgres psql -U postgres

# Create databases
CREATE DATABASE ats_db;
CREATE DATABASE primary_market_db;
CREATE DATABASE treasury_db;
```

**Reset database completely**:

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
```

#### 4. npm Install/ci Failures

**Error**: `npm ERR! code EINTEGRITY` or checksum errors

**Solution**:

```bash
# Clean npm cache
npm cache clean --force

# Remove lock file and node_modules
rm -rf package-lock.json node_modules

# Reinstall
npm install
```

**Error**: `gyp ERR!` or native module build errors

**Solution**:

```bash
# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential python3

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools
```

#### 5. Smart Contract Compilation Failures

**Error**: `HardhatError: Cannot find module '@nomicfoundation/hardhat-toolbox'`

**Solution**:

```bash
# Clean contract artifacts
npm run ats:contracts:clean
npm run primary-market:contracts:clean
npm run treasury:contracts:clean

# Reinstall contract dependencies
cd packages/ats/contracts && npm install && cd ../../..
cd packages/primary-market/contracts && npm install && cd ../../..
cd packages/treasury/contracts && npm install && cd ../../..

# Rebuild
npm run contracts:build
```

**Error**: Solidity compilation error

**Solution**:

```bash
# Check Solidity version in hardhat.config.ts
# Should be compatible with contracts (usually 0.8.x)

# Clear cache and recompile
npx hardhat clean
npx hardhat compile
```

#### 6. Hedera Connection/Transaction Errors

**Error**: `INVALID_ACCOUNT_ID` or `INSUFFICIENT_TX_FEE`

**Solutions**:

**Check account ID format**:

```bash
# Must be format: 0.0.xxxxx (e.g., 0.0.12345)
# NOT: 0.0.0.12345 or 12345
```

**Check private key format**:

```bash
# Should be hex string starting with 302e
# Length: 96 characters for ED25519
```

**Ensure sufficient HBAR**:

- Visit [Hedera Portal](https://portal.hedera.com) to get testnet HBAR
- Minimum ~5 HBAR recommended for testing

**Check network connectivity**:

```bash
# Test mirror node access
curl https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.2

# Should return JSON with account info
```

#### 7. RabbitMQ Connection Issues

**Error**: `ECONNREFUSED localhost:5672`

**Solution**:

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq

# Check logs
docker logs rabbitmq

# Access management UI
open http://localhost:15672
```

#### 8. Environment Variable Issues

**Error**: `Configuration validation failed` or missing env vars

**Solution**:

```bash
# Verify .env file exists
ls -la apps/shared/gateway/.env

# Check file is not empty
cat apps/shared/gateway/.env

# Ensure no extra spaces or quotes
# ❌ WRONG: HEDERA_ACCOUNT_ID = "0.0.12345"
# ✅ CORRECT: HEDERA_ACCOUNT_ID=0.0.12345
```

**Common missing variables**:

```bash
# Required in all API .env files:
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e...

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=<service_specific>
```

#### 9. Module Resolution Errors

**Error**: `Cannot find module '@hashgraph/green-bonds-platform-core'`

**This happens when workspace dependencies are not properly linked.**

**Solution**:

```bash
# From root directory, reinstall all workspaces
npm ci

# Or rebuild specific packages
npm run shared:core:build
```

#### 10. TypeORM Migration Errors

**Error**: `No migrations pending` or `Cannot run migrations`

**Solution**:

```bash
# Drop and recreate database
docker exec -it postgres psql -U postgres -c "DROP DATABASE ats_db;"
docker exec -it postgres psql -U postgres -c "CREATE DATABASE ats_db;"

# Run the API to auto-run migrations
npm run ats:api:start:dev
```

#### 11. Memory/Performance Issues

**Error**: `JavaScript heap out of memory`

**Solution**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Add to package.json scripts if needed
"start:dev": "NODE_OPTIONS='--max-old-space-size=4096' nest start --watch"
```

**Slow compilation**:

```bash
# Use more CPU cores
npm config set jobs $(nproc)

# Disable source maps in development (faster builds)
# In nest-cli.json: "compilerOptions": { "sourceMap": false }
```

#### 12. Testing Failures

**Error**: Tests fail with timeout errors

**Solution**:

```bash
# Increase Jest timeout in jest.config.js
testTimeout: 30000  // 30 seconds

# For specific tests
jest.setTimeout(60000);
```

**Error**: Database connection in tests

**Solution**:

```bash
# Ensure test database is running
docker-compose up -d

# Run tests with proper environment
NODE_ENV=test npm run api:test
```

### Getting More Help

If you're still experiencing issues:

1. **Check Logs**:

   ```bash
   # API logs (check the terminal where service is running)

   # Docker container logs
   docker logs <container_name>

   # System logs
   journalctl -xe  # Linux
   ```

2. **Enable Debug Mode**:

   ```bash
   # In .env file
   LOG_LEVEL=debug
   NODE_ENV=development
   ```

3. **Search Existing Issues**:
   - [GitHub Issues](https://github.com/hashgraph/green-bond-platform/issues)
   - [GitHub Discussions](https://github.com/hashgraph/green-bond-platform/discussions)

4. **Report a New Issue**:
   - Include error messages
   - Share your environment (OS, Node version, Docker version)
   - Describe steps to reproduce
   - Share relevant logs

## Common Problems

### Error: "Cannot find module"

If you receive module not found errors:

```bash
# Clean npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Node.js version Error

If you receive an error about Node.js version:

```bash
# With nvm
nvm install 22
nvm use 22

# Verify version
node --version
```

### Permission Error

If you have permission issues during installation:

```bash
# Change npm ownership
sudo chown -R $(whoami) ~/.npm

# Or reinstall with sudo (not recommended)
sudo npm ci
```

### Docker is not running

If `docker-compose up` fails:

```bash
# Start Docker daemon
sudo systemctl start docker

# On macOS/Windows, open Docker Desktop
```

### Port already in use

If any port is in use (5432, 3000, etc.):

```bash
# See which process is using the port
lsof -i :5432

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yaml
```

### Corrupted npm cache

If installation fails with strange errors:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm ci
```

### Error when compiling contracts

If `npm run contracts:build` fails:

```bash
# Clean and recompile
npm run contracts:clean
npm run contracts:build

# Verify Hardhat version
npx hardhat --version
```

## Structure After Installation

After successful installation, you should have:

```
green-bond-platform/
├── node_modules/           # Installed dependencies
├── apps/                   # Applications
│   ├── ats/api/node_modules
│   ├── primary-market/api/node_modules
│   ├── treasury/api/node_modules
│   ├── shared/gateway/node_modules
│   └── shared/transaction-sender/node_modules
├── packages/               # Shared packages
│   ├── ats/contracts/artifacts
│   ├── primary-market/contracts/artifacts
│   ├── treasury/contracts/artifacts
│   └── shared/*/node_modules
└── scripts/node_modules
```

## Next Steps

After successful installation, continue with:

1. [Configuration](configuration.md) - Configure environment variables
2. [ATS Installation](ats/installation) - Configure ATS API
3. [Primary Market Installation](primary-market/installation) - Configure Primary Market
4. [Treasury Installation](treasury/installation) - Configure Treasury
5. [Gateway Installation](gateway/installation) - Configure Gateway
6. [Transaction Sender Installation](transaction-sender/installation) - Configure Transaction Sender
