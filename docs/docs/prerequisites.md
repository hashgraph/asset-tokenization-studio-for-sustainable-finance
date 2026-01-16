---
title: Prerequisites & Requirements
sidebar_position: 4
sidebar_label: Prerequisites
description: Required software and dependencies for running the Green Bond Platform - Node.js, PostgreSQL, Docker, and Hedera account setup
keywords: [prerequisites, installation, node.js, postgresql, docker, hedera, setup requirements]
---

# Prerequisites

Before starting with Green Bond Platform, ensure you have the following components installed:

## Required Software

### Node.js and npm

- **Node.js**: v22 or higher
- **npm**: v10 or higher

Verify installed versions:

```bash
node --version
npm --version
```

If you need to install or update Node.js, we recommend using [nvm](https://github.com/nvm-sh/nvm):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 22
nvm install 22
nvm use 22
```

### PostgreSQL

- **PostgreSQL**: 14 or higher
- Required for data storage

You can run PostgreSQL using Docker (recommended) or install it locally.

#### Option 1: Docker (Recommended)

```bash
docker run --name postgres-gbp \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=green_bonds \
  -p 5432:5432 \
  -d postgres:14
```

#### Option 2: Local Installation

- **Ubuntu/Debian**: `sudo apt-get install postgresql-14`
- **macOS**: `brew install postgresql@14`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Docker and Docker Compose

Required to run containerized services (PostgreSQL, RabbitMQ, pgAdmin).

Verify installed versions:

```bash
docker --version
docker-compose --version
```

Installation:

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get install docker.io docker-compose
  ```
- **macOS**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Development Tools

### Hardhat

Installed automatically with project dependencies. No manual installation required.

### Git

For version control and repository cloning.

```bash
git --version
```

If not installed:

- **Ubuntu/Debian**: `sudo apt-get install git`
- **macOS**: `brew install git`
- **Windows**: Download from [git-scm.com](https://git-scm.com/)

## Blockchain Access

### Hedera Testnet/Previewnet

You will need:

- **Hedera Account ID**: Your account identifier (format: 0.0.xxxxx)
- **Private Key**: Private key associated with your account
- **HBAR**: Tokens to pay for transactions

#### Get a Hedera Testnet Account

1. Visit the [Hedera Portal](https://portal.hedera.com)
2. Create an account
3. Get free testnet HBAR from the [faucet](https://portal.hedera.com/faucet)

Alternatively, use the Hedera CLI:

```bash
npm install -g @hashgraph/hedera-cli
hedera account create
```

### Required Environment Variables

You will need to configure these variables:

```bash
# Hedera Network
HEDERA_NETWORK=testnet  # or previewnet, mainnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...

# Mirror Node
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

## Optional but Recommended Tools

### IDE

**Visual Studio Code** (recommended) with the following extensions:

- **ESLint**: For JavaScript/TypeScript linting
- **Prettier**: For code formatting
- **Solidity**: For smart contract development
- **Thunder Client**: For API testing (alternative to Postman)
- **Docker**: For container management

Quick VSCode installation:

```bash
# Ubuntu/Debian
sudo snap install code --classic

# macOS
brew install --cask visual-studio-code
```

### Database Client

For PostgreSQL database management and visualization:

- **pgAdmin** (included in project's docker-compose)
- **DBeaver** ([dbeaver.io](https://dbeaver.io/))
- **TablePlus** ([tableplus.com](https://tableplus.com/))

### Postman or Thunder Client

For REST API testing:

- **Postman**: [postman.com](https://www.postman.com/)
- **Thunder Client**: VSCode extension (lighter)

## Prerequisites Verification

Run these commands to verify everything is correctly installed:

```bash
# Verify Node.js
node --version
# Expected: v22.x.x or higher

# Verify npm
npm --version
# Expected: v10.x.x or higher

# Verify Docker
docker --version
# Expected: Docker version 20.x.x or higher

# Verify Docker Compose
docker-compose --version
# Expected: docker-compose version 1.29.x or higher

# Verify Git
git --version
# Expected: git version 2.x.x or higher

# Verify PostgreSQL (if installed locally)
psql --version
# Expected: psql (PostgreSQL) 14.x or higher
```

## Recommended System Resources

For smooth development, we recommend:

- **RAM**: Minimum 8GB, recommended 16GB
- **Disk**: Minimum 10GB of free space
- **CPU**: Multi-core processor (4+ cores recommended)

## Next Steps

Once you have all prerequisites installed, continue with the [Installation](installation.md).
