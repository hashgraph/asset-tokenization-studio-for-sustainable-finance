# Green Bonds Platform

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

A monorepo platform for managing Green Bonds assets on Hedera and EVM blockchains, built with NestJS, TypeScript, Hardhat, and Solidity.

It follows Hexagonal Architecture and Domain-Driven Design (DDD) principles to ensure modularity, scalability, and maintainability.

### Table of Contents

- **[Features](#features)**<br>
- **[Architecture](#architecture)**<br>
- **[Prerequisites](#prerequisites)**<br>
- **[Installation](#installation)**<br>
- **[Configuration](#configuration)**<br>
- **[Start up GBP demo](#start-up-gbp-demo)**<br>
- **[Test GBP demo](#test-gbp-demo)**<br>
- **[Stop GBP demo](#stop-gbp-demo)**<br>
- **[Adding app to monorepo](#adding-app-to-monorepo)**<br>
- **[Testing](#testing)**<br>
- **[Deployment](#deployment)**<br>
- **[Contributing](#contributing)**<br>
- **[License](#license)**<br>

# Features

- **Blockchain Integration**: Support for Hedera and EVM networks (testnet, previewnet, mainnet).
- **API Management**: RESTful APIs for Green Bonds ATS (Asset Tokenization Studio) operations.
- **Smart Contracts**: Solidity contracts for bond issuance, trading, and lifecycle management.
- **Event Listening**: Real-time blockchain event monitoring with configurable polling.
- **Database Support**: PostgreSQL integration for data persistence.
- **Monorepo Structure**: Organized workspaces for apps, packages, and scripts using npm workspaces.
- **Quality Assurance**: Linting, formatting, and testing tools (ESLint, Prettier, Solhint).

# Architecture

The project adheres to Hexagonal Architecture and DDD:

- **Domain Layer**: Core business logic, entities, repositories, and domain services.
- **Application Layer**: Use cases, commands, queries, and application services.
- **Infrastructure Layer**: Ports and adapters for external integrations (e.g., blockchain, database).
- **Configuration**: Centralized config for environments and dependencies.

![Platformf Architecture Diagram](docs/gbp_architecture.png)

![Smart Contracts Architecture Diagram](docs/gbp_sc_architecture.png)

## Workspaces:

- `apps/`: Applications;
  - `gateway`: API gateway for routing requests to various services and handling authentication.
  - `transaction-sender`: Service for sending and managing blockchain transactions on Hedera or EVM networks. It uses RabbitMQ to receive a send messages to Evercity.
  - `ats`: Asset Tokenization Studio API for managing tokenized green bond assets, including issuance and trading.
  - `primary market`: Application for handling primary market operations, such as initial bond offerings and investor subscriptions.
  - `treasury`: Treasury management service for tracking bond-related funds, payments, and financial reporting.
- `packages/`: Shared libraries;
  - `ats-contracts`: Solidity smart contracts for Asset Tokenization Studio, handling tokenization and management of green bond assets.
  - `primary-market-contracts`: Smart contracts for primary market operations, including bond issuance, subscriptions, and investor management.
  - `treasury-contracts`: Contracts for treasury management, tracking funds, payments, and financial reporting related to bonds.
  - `blockchain-listener`: Library for real-time event listening on Hedera or EVM blockchains, with configurable polling and contract monitoring.
  - `core`: Shared core utilities, including common models, services, and helpers for the platform.
- `scripts/`: Utility scripts for deployment and automation.

# Prerequisites

- Node.js (v22+)
- npm (v10+)
- PostgreSQL (for database)
- Hardhat (for smart contracts)
- Access to Hedera or EVM testnets (e.g., via Hedera SDK or Web3 providers)
- Docker containers

# Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd green-bond-platform
   ```

2. Intall dependencies
   ```bash
   npm install
   npm ci
   ```

# Configuration

## Gateway

1. Copy the example environment file:
   ```bash
   cp apps/shared/gateway/.env.sample apps/shared/gateway/.env
   ```

## Transaction Sender

1. Copy the example environment file:
   ```bash
   cp apps/shared/transaction-sender/.env.example apps/shared/transaction-sender/.env
   ```

## ATS

1. Copy the example environment file:
   ```bash
   cp apps/ats/api/.env.example apps/ats/api/.env
   ```

## Primary Market

1. Copy the example environment file:
   ```bash
   cp apps/primary-market/api/.env.example apps/primary-market/api/.env
   ```

## Treasury

1. Copy the example environment file:
   ```bash
   cp apps/treasury/api/.env.example apps/treasury/api/.env
   ```

# Start up GBP demo

Previously finish Installation and Configuration steps.

## Scripts

1. Copy the example environment file:

   ```bash
   cp scripts/.env.example scripts/.env
   ```

2. Configure scripts/.env properties:
   If you are going to use an **ED25519** hedera address to sign transactions configure .env in this way:
   - BLOCKCHAIN_FORMAT=hedera
   - HEDERA_PRIVATE_KEY=\<add here the hedera private key in der format\>
   - ACCOUNT_ID=\<add here the hedera id\>

   If you are going to use an **ECDSA** hedera address to sign transactions configure .env in this way:
   - BLOCKCHAIN_FORMAT=ethereum
   - ETHEREUM_PRIVATE_KEY=\<add here the ethereum private key in hex format\>
   - ACCOUNT_ID=\<add here the hedera id\>

3. Stand up platform:

> Make sure docker is running

```bash
npm run scripts:gbp:start
```

If you don't need the full platform and need to test a backend, you can stand up only the postgresql database and the rabbitMQ executing this command:

```bash
npm run scripts:docker:start
```

# Test GBP demo

These tests are going to test the green bond platform e2e.

- Each test call API Gateway, the API Gateway call the API backend and return the unsigned transaction.
- The unsigned transaction is singed with the address configured in .env file and send a message to the RabbitMQ.
- The transaction sender read the message and send it to the hedera testnet.
- The API backend read the event from hedera testnet and save the data in the postgresql database.

## Create Green Bond

To deploy a green bond in hedera testnet you can execute this commnad

```bash
npm run scripts:test:bond
```

# Stop GBP demo

To stop the platform execute this command:

```bash
npm run scripts:gbp:stop
```

If you only stand up the postgresql database and the rabbitMQ executing this command to stop them:

```bash
npm run scripts:docker:stop
```

# Adding app to monorepo

```bash
nest generate app <app-name> <workspace-name>
```

This command creates a folder inside apps/<workspace-name>/<app-name> with a basic NestJS structure.

# Testing

- Unit tests: npm run test (in specific workspaces).
- E2E tests: npm run test:e2e.
- Coverage: npm run test:cov.

# Deployment

- Use Docker for containerized deployment (see scripts/).
- For production, configure environment variables and use tools like Mau for NestJS apps.
- Refer to NestJS Deployment Docs for more.

# Contributing

1. Follow the architecture guidelines.
2. Run npm run lint and npm run format before committing.
3. Submit pull requests with clear descriptions.

# License

Licensed under Apache 2.0. See LICENSE for details.
