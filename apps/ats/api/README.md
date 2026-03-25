# ATS (Automated Trading System) API

The ATS API is a NestJS-based microservice that manages the automated trading system operations for the Green Bonds platform. It handles bond lifecycle management, clearing operations, holder balance management, and integrates with Hedera blockchain for transaction processing.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Overview

The ATS API provides comprehensive functionality for managing green bond automated trading system operations, including:

- **Bond Management**: Deploy and manage bond contracts with full lifecycle control
- **Factory Operations**: Manage bond suite factory with pause/unpause capabilities
- **Clearing Operations**: Handle clearing holds, transfers, and redemptions with multi-party approval
- **Holder Balance Management**: Track and manage bond holder balances and transfers
- **Hold & Lock Management**: Create and manage temporary holds and locks on bond positions
- **Document Management**: Set, update, and remove bond-related documents
- **Coupon Management**: Configure and track bond coupon payments
- **Control List Management**: Manage authorized participants and compliance controls
- **Cap Management**: Set and enforce maximum supply limits
- **Proceed Recipients**: Manage recipients of bond proceeds
- **Blockchain Integration**: Seamless integration with Hedera blockchain via transaction builder
- **Event-Driven Architecture**: Real-time event processing through blockchain listeners and RabbitMQ

## Architecture

This application follows **Hexagonal Architecture** (Ports & Adapters) and **Domain-Driven Design (DDD)** principles with clear separation of concerns:

### Layers

```
config/                                         # Configuration modules

port.adapter/                                   # Port & Adapter layer (Infrastructure)
├── <aggregate>/                                # Grouped by domain aggregate
│   ├── usecase/                                # Inbound ports & adapters (HTTP, Events)
│   │   ├── <functionality>/                    # Grouped by functionality
│   │   │   ├── Adapter.ts                      # Adapter implementation
│   │   │   └── Port.ts                         # Port interface
│   └── persistence/                            # Outbound ports & adapters (DB)
│       ├── model/                              # TypeORM entities
│       └── repositories/                       # Repository implementations

app/                                            # Application layer
├── <aggregate>/                                # Grouped by domain aggregate
│   ├── <functionality>/
│   │   ├── query/                              # Query handlers (CQRS read)
│   │   │   └── Query.ts
│   │   ├── command/                            # Command handlers (CQRS write)
│   │   │   └── Command.ts
│   │   └── service/                            # Application services
│   │       └── Service.ts

domain/                                         # Domain layer (Business Logic)
├── <aggregate>/                                # Grouped by domain aggregate
│   ├── errors/                                 # Domain-specific errors
│   ├── events/                                 # Domain events
│   ├── model/                                  # Domain entities & value objects
│   ├── services/                               # Domain services
│   └── repository/                             # Repository interfaces
```

### Key Architectural Patterns

- **Hexagonal Architecture**: Domain at the center, adapters at the edges
- **Clean Architecture**: Independence from frameworks, UI, databases, and external agencies
- **Domain-Driven Design**: Rich domain model with entities, value objects, aggregates, and domain services
- **CQRS**: Command Query Responsibility Segregation for reads and writes
- **Event-Driven**: Domain events and blockchain event listeners
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: NestJS IoC container

### Domain Aggregates

- **Factory**: Factory for deploying bond suites
- **Bond**: Bond contract instances with lifecycle management
- **Clearing**: Multi-party clearing operations (holds, transfers, redemptions)
- **HolderBalance**: Bond holder positions and balances
- **Hold**: Temporary holds on bond positions
- **Lock**: Locks on bond positions for compliance
- **Document**: Bond-related documentation
- **Coupon**: Coupon payment configuration
- **ControlList**: Authorized participant management
- **ProceedRecipient**: Bond proceeds distribution

## Features

### Factory Operations

- Get factory details
- Pause/unpause factory
- Deploy new bond suites (bond + treasury + KPI contracts)

### Bond Management

- Create and deploy bonds
- Get bond details
- List all bonds
- Pause/unpause bonds
- Get bond holders
- Track bond lifecycle events

### Clearing Operations

- **Clearing Holds**: Create, approve, cancel, and reclaim clearing holds
- **Clearing Transfers**: Create transfer clearings for multi-party approval
- **Clearing Redemptions**: Create redemption clearings for bond redemption
- Get clearing details (holds, transfers, redemptions)
- List all clearings by type
- Multi-party approval workflow

### Holder Balance Management

- Get holder balances
- Get all bond holders
- Transfer by partition
- Update holder balances
- Redeem holder balances

### Hold Management

- Create bond holds
- Execute holds
- Release holds
- Reclaim holds
- Get hold details
- List all holds for a bond

### Lock Management

- Create bond locks
- Release locks
- Get lock details
- List all locks

### Document Management

- Set bond documents
- Remove bond documents
- Get bond documents
- Track document versions

### Coupon Management

- Set bond coupons
- Get coupon details
- List all coupons for a bond

### Control List Management

- Add control list members
- Remove control list members
- Get control list members

### Cap Management

- Set bond maximum supply cap
- Track cap enforcement

### Proceed Recipient Management

- Add proceed recipients
- Remove proceed recipients
- Get bond proceed recipients

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v15 or higher
- **Docker & Docker Compose**: For local development
- **RabbitMQ**: For event messaging (optional, can be disabled)

## Installation

```bash
# Install dependencies from the root of the monorepo
npm install

# Or install dependencies for this specific package
cd apps/ats/api
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `apps/ats/api` directory based on `.env.example`:

```bash
# Application Configuration
PORT=3000
LOG_LEVEL=log

# PostgreSQL Configuration
POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=5432
POSTGRESQL_USER=postgres
POSTGRESQL_PASSWORD=postgres
POSTGRESQL_DB=postgres
POSTGRESQL_LOCK_TIMEOUT=10

# Hedera Network Configuration
HEDERA_NETWORK=testnet

# Blockchain Listener Configuration
BLOCKCHAIN_LISTENER_BLOCK_NUMBER=
BLOCKCHAIN_LISTENER_POLL_INTERVAL=3000
BLOCKCHAIN_LISTENER_CONTRACTS=<contract_addresses_separated_by_semicolon>
BLOCKCHAIN_LISTENER_EVENTS=<event_signatures>

# RabbitMQ Configuration
RABBITMQ_PUBLISH_ENABLED=true
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_EXCHANGE_NAME=greenbond.events
RABBITMQ_BLOCKCHAIN_ROUTING_KEY=blockchain.events
RABBITMQ_CONNECTION_WAIT=false
```

### Configuration Details

- **PORT**: The port where the app will listen (default: `3000`)
- **LOG_LEVEL**: Log level of the application. Options: `verbose`, `debug`, `log`, `warn`, `error`, `fatal`
- **HEDERA_NETWORK**: Hedera network to connect to (`testnet`, `previewnet`, or `mainnet`)
- **POSTGRESQL_HOST**: Database host (default: `localhost`)
- **POSTGRESQL_PORT**: Database port (default: `5432`)
- **POSTGRESQL_USER**: Database user (default: `postgres`)
- **POSTGRESQL_PASSWORD**: Database password (default: `postgres`)
- **POSTGRESQL_DB**: Database name (default: `postgres`)
- **POSTGRESQL_LOCK_TIMEOUT**: Lock timeout in seconds (default: `10`)
- **BLOCKCHAIN_LISTENER_BLOCK_NUMBER**: Starting block number for event listening (leave empty for automatic)
- **BLOCKCHAIN_LISTENER_POLL_INTERVAL**: Time interval in milliseconds between block checks (default: `3000`)
- **BLOCKCHAIN_LISTENER_CONTRACTS**: Semicolon-separated list of contract addresses to monitor (factory contracts)
- **BLOCKCHAIN_LISTENER_EVENTS**: Event signatures to listen for (see `.env.example` for format)
- **RABBITMQ_PUBLISH_ENABLED**: Enable/disable RabbitMQ publishing (`true`/`false`)
- **RABBITMQ_URI**: RabbitMQ connection URI (default: `amqp://localhost:5672`)
- **RABBITMQ_EXCHANGE_NAME**: Exchange name for publishing events (default: `greenbond.events`)
- **RABBITMQ_BLOCKCHAIN_ROUTING_KEY**: Base routing key for blockchain events (default: `blockchain.events`)
- **RABBITMQ_CONNECTION_WAIT**: Wait for RabbitMQ connection on bootstrap (`true`/`false`)

### TypeScript Path Mappings

The project uses TypeScript path mappings for clean imports:

- `@app/*` → `src/app/*`
- `@domain/*` → `src/domain/*`
- `@port/*` → `src/port.adapter/*`
- `@config/*` → `src/config/*`
- `@test/*` → `test/*`
- `@components` → `src/Components`
- `@utils/*` → `src/utils/*`

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and pgAdmin
npm run docker:up

# Stop containers
npm run docker:down
```

This will start:

- **PostgreSQL**: Available at `localhost:5432`
- **pgAdmin**: Available at `http://localhost:5050` (admin@admin.com / admin)

### Development Mode

```bash
# Start in watch mode
npm run start:dev

# Start in debug mode
npm run start:debug

# Start normally
npm run start
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

The API will be available at `http://localhost:3001` (or the PORT specified in `.env`).

## API Documentation

Once the application is running, access the interactive Swagger API documentation:

- **Swagger UI**: `http://localhost:3001/api/v1/docs`
- **Base URL**: `http://localhost:3001/api/v1/ats`
- **Health Check**: `http://localhost:3001/api/v1/health`

### Main API Endpoints

#### Health Check

- `GET /api/v1/health` - Health check endpoint

#### Factory

- `GET /api/v1/ats/factories/:factoryContractId` - Get factory details
- `POST /api/v1/ats/factories/:factoryContractId/pause` - Pause factory
- `POST /api/v1/ats/factories/:factoryContractId/unpause` - Unpause factory
- `POST /api/v1/ats/factories/:factoryContractId/bonds` - Deploy bond suite

#### Bond Management

- `GET /api/v1/ats/bonds/:bondContractId` - Get bond details
- `GET /api/v1/ats/bonds` - List all bonds
- `POST /api/v1/ats/bonds` - Create bond (via factory)
- `POST /api/v1/ats/bonds/:bondContractId/pause` - Pause bond
- `POST /api/v1/ats/bonds/:bondContractId/unpause` - Unpause bond

#### Clearing Operations

- `GET /api/v1/ats/bonds/:bondContractId/clearings/holds` - List clearing holds
- `GET /api/v1/ats/bonds/:bondContractId/clearings/holds/:clearingId` - Get clearing hold details
- `POST /api/v1/ats/bonds/:bondContractId/clearings/holds` - Create clearing hold
- `POST /api/v1/ats/bonds/:bondContractId/clearings/holds/:clearingId/approve` - Approve clearing hold
- `POST /api/v1/ats/bonds/:bondContractId/clearings/holds/:clearingId/cancel` - Cancel clearing hold
- `POST /api/v1/ats/bonds/:bondContractId/clearings/holds/:clearingId/reclaim` - Reclaim clearing hold
- `GET /api/v1/ats/bonds/:bondContractId/clearings/transfers` - List clearing transfers
- `GET /api/v1/ats/bonds/:bondContractId/clearings/transfers/:clearingId` - Get clearing transfer details
- `POST /api/v1/ats/bonds/:bondContractId/clearings/transfers` - Create clearing transfer
- `GET /api/v1/ats/bonds/:bondContractId/clearings/redeems` - List clearing redemptions
- `GET /api/v1/ats/bonds/:bondContractId/clearings/redeems/:clearingId` - Get clearing redeem details
- `POST /api/v1/ats/bonds/:bondContractId/clearings/redeems` - Create clearing redemption

#### Holder Balance Management

- `GET /api/v1/ats/bonds/:bondContractId/holders` - Get all bond holders
- `GET /api/v1/ats/bonds/:bondContractId/holders/:holderAccountId/balances` - Get holder balances
- `POST /api/v1/ats/bonds/:bondContractId/holders/:holderAccountId/balances` - Update holder balance
- `POST /api/v1/ats/bonds/:bondContractId/holders/:holderAccountId/balances/transfer` - Transfer by partition
- `POST /api/v1/ats/bonds/:bondContractId/holders/:holderAccountId/balances/redeem` - Redeem holder balance

#### Hold Management

- `GET /api/v1/ats/bonds/:bondContractId/holds` - List all holds
- `GET /api/v1/ats/bonds/:bondContractId/holds/:holdId` - Get hold details
- `POST /api/v1/ats/bonds/:bondContractId/holds` - Create hold
- `POST /api/v1/ats/bonds/:bondContractId/holds/:holdId/execute` - Execute hold
- `POST /api/v1/ats/bonds/:bondContractId/holds/:holdId/release` - Release hold
- `POST /api/v1/ats/bonds/:bondContractId/holds/:holdId/reclaim` - Reclaim hold

#### Lock Management

- `GET /api/v1/ats/bonds/:bondContractId/locks` - List all locks
- `GET /api/v1/ats/bonds/:bondContractId/locks/:lockId` - Get lock details
- `POST /api/v1/ats/bonds/:bondContractId/locks` - Create lock
- `POST /api/v1/ats/bonds/:bondContractId/locks/:lockId/release` - Release lock

#### Document Management

- `GET /api/v1/ats/bonds/:bondContractId/documents` - Get bond documents
- `POST /api/v1/ats/bonds/:bondContractId/documents` - Set bond document
- `DELETE /api/v1/ats/bonds/:bondContractId/documents/:documentId` - Remove bond document

#### Coupon Management

- `GET /api/v1/ats/bonds/:bondContractId/coupons` - Get bond coupons
- `GET /api/v1/ats/bonds/:bondContractId/coupons/:couponId` - Get coupon details
- `POST /api/v1/ats/bonds/:bondContractId/coupons` - Set bond coupon

#### Control List Management

- `GET /api/v1/ats/bonds/:bondContractId/controllist` - Get control list members
- `POST /api/v1/ats/bonds/:bondContractId/controllist` - Add control list member
- `DELETE /api/v1/ats/bonds/:bondContractId/controllist/:memberId` - Remove control list member

#### Cap Management

- `POST /api/v1/ats/bonds/:bondContractId/cap` - Set bond cap

#### Proceed Recipient Management

- `GET /api/v1/ats/bonds/:bondContractId/proceed-recipients` - Get proceed recipients
- `POST /api/v1/ats/bonds/:bondContractId/proceed-recipients` - Add proceed recipient
- `DELETE /api/v1/ats/bonds/:bondContractId/proceed-recipients/:recipientId` - Remove proceed recipient

## Database

### Database Schema

The application uses PostgreSQL with TypeORM for persistence. Main entities include:

- **FactoryPersistence**: Factory contract information
- **BondPersistence**: Bond contract instances
- **ClearingHoldPersistence**: Clearing hold operations
- **ClearingTransferPersistence**: Clearing transfer operations
- **ClearingRedeemPersistence**: Clearing redemption operations
- **HolderBalancePersistence**: Bond holder balances
- **HoldPersistence**: Hold operations
- **LockPersistence**: Lock operations
- **DocumentPersistence**: Bond documents
- **CouponPersistence**: Coupon configurations
- **ControlListMemberPersistence**: Control list members
- **ProceedRecipientPersistence**: Proceed recipients
- **BlockchainEvent**: Event listener tracking

### Migrations

```bash
# Generate a new migration
npm run migration:generate

# Migrations run automatically on application startup (migrationsRun: true)
```

The migration command uses TypeORM CLI with the following configuration:

- Migrations are stored in `src/migrations/`
- The datasource configuration is in `src/config/Datasource.ts`

### Database Access

Use pgAdmin to explore the database:

1. Navigate to `http://localhost:5050`
2. Login with credentials: `admin@admin.com` / `admin`
3. Server configuration is auto-loaded from `pgadmin-servers.json`

## Testing

```bash
# Run unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

### Test Structure

Tests are organized by layer:

- `test/port.adapter/` - Integration tests for HTTP adapters
- Unit tests are co-located with source files (when applicable)

## Project Structure

```
apps/ats/api/
├── src/
│   ├── app/                          # Application layer (use cases)
│   │   ├── factory/                  # Factory use cases
│   │   │   ├── getfactory/           # Get factory query
│   │   │   ├── pausefactory/         # Pause factory command
│   │   │   └── unpausefactory/       # Unpause factory command
│   │   ├── bond/                     # Bond use cases
│   │   │   ├── createbond/           # Create bond command
│   │   │   ├── getbond/              # Get bond query
│   │   │   ├── getbonds/             # Get bonds query
│   │   │   ├── pausebond/            # Pause bond command
│   │   │   └── unpausebond/          # Unpause bond command
│   │   ├── clearing/                 # Clearing use cases
│   │   │   ├── createclearinghold/   # Create clearing hold
│   │   │   ├── createclearingtransfer/ # Create clearing transfer
│   │   │   ├── createclearingredeem/ # Create clearing redeem
│   │   │   ├── approveclearing/      # Approve clearing
│   │   │   ├── cancelclearing/       # Cancel clearing
│   │   │   ├── reclaimclearing/      # Reclaim clearing
│   │   │   ├── getclearinghold/      # Get clearing hold query
│   │   │   ├── getclearingshold/     # Get clearings hold query
│   │   │   ├── getclearingtransfer/  # Get clearing transfer query
│   │   │   ├── getclearingstransfer/ # Get clearings transfer query
│   │   │   ├── getclearingredeem/    # Get clearing redeem query
│   │   │   └── getclearingsredeem/   # Get clearings redeem query
│   │   ├── holderbalance/            # Holder balance use cases
│   │   │   ├── getbondholders/       # Get bond holders query
│   │   │   ├── getholderbalances/    # Get holder balances query
│   │   │   ├── updatebondholderbalance/ # Update holder balance
│   │   │   ├── transferbypartition/  # Transfer by partition
│   │   │   └── redeembondholderbalance/ # Redeem holder balance
│   │   ├── hold/                     # Hold use cases
│   │   │   ├── createbondhold/       # Create hold command
│   │   │   ├── executebondhold/      # Execute hold command
│   │   │   ├── releasebondhold/      # Release hold command
│   │   │   ├── reclaimbondhold/      # Reclaim hold command
│   │   │   ├── getbondhold/          # Get hold query
│   │   │   └── getbondholds/         # Get holds query
│   │   ├── lock/                     # Lock use cases
│   │   │   ├── createbondlock/       # Create lock command
│   │   │   ├── releasebondlock/      # Release lock command
│   │   │   ├── getbondlock/          # Get lock query
│   │   │   └── getbondlocks/         # Get locks query
│   │   ├── document/                 # Document use cases
│   │   │   ├── setbonddocument/      # Set document command
│   │   │   ├── removebonddocument/   # Remove document command
│   │   │   └── getbonddocuments/     # Get documents query
│   │   ├── coupon/                   # Coupon use cases
│   │   │   ├── setbondcoupon/        # Set coupon command
│   │   │   ├── getbondcoupon/        # Get coupon query
│   │   │   └── getbondcoupons/       # Get coupons query
│   │   ├── controllist/              # Control list use cases
│   │   │   ├── addcontrollistmember/ # Add member command
│   │   │   ├── removecontrollistmember/ # Remove member command
│   │   │   └── getcontrollistmembers/ # Get members query
│   │   ├── cap/                      # Cap use cases
│   │   │   └── setbondcap/           # Set cap command
│   │   ├── proceedrecipient/         # Proceed recipient use cases
│   │   │   ├── addproceedrecipient/  # Add recipient command
│   │   │   ├── removeproceedrecipient/ # Remove recipient command
│   │   │   └── getbondproceedrecipients/ # Get recipients query
│   │   └── transaction/              # Transaction use cases
│   │       ├── bond/                 # Bond transactions
│   │       │   ├── createbondtransaction/
│   │       │   ├── mintbondtransaction/
│   │       │   └── redeembondtransaction/
│   │       ├── cap/                  # Cap transactions
│   │       │   └── setbondcaptransaction/
│   │       ├── clearing/             # Clearing transactions
│   │       │   ├── createclearingholdtransaction/
│   │       │   ├── createclearingtransfertransaction/
│   │       │   ├── createclearingredeemtransaction/
│   │       │   ├── updateclearingholdtransaction/
│   │       │   └── cancelclearingtransaction/
│   │       ├── controllist/          # Control list transactions
│   │       │   ├── addcontrollistmembertransaction/
│   │       │   └── removecontrollistmembertransaction/
│   │       ├── coupon/               # Coupon transactions
│   │       │   └── setbondcoupontransaction/
│   │       ├── document/             # Document transactions
│   │       │   ├── setbonddocumenttransaction/
│   │       │   └── removebonddocumenttransaction/
│   │       ├── hold/                 # Hold transactions
│   │       │   ├── createbondholdtransaction/
│   │       │   ├── executeholdtransaction/
│   │       │   ├── releaseholdtransaction/
│   │       │   └── reclaimholdtransaction/
│   │       ├── holderbalance/        # Holder balance transactions
│   │       │   └── transferbypartitiontransaction/
│   │       ├── lock/                 # Lock transactions
│   │       │   ├── createbondlocktransaction/
│   │       │   └── releasebondlocktransaction/
│   │       └── proceedrecipient/     # Proceed recipient transactions
│   │           └── addproceedrecipienttransaction/
│   ├── domain/                       # Domain layer (business logic)
│   │   ├── factory/                  # Factory domain
│   │   │   ├── model/                # Factory entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── bond/                     # Bond domain
│   │   │   ├── model/                # Bond entity
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── CreateBondDomainService.ts
│   │   │   │   ├── PauseBondDomainService.ts
│   │   │   │   └── UnpauseBondDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── BondNotFoundError.ts
│   │   │   │   ├── BondFoundError.ts
│   │   │   │   └── BondPausedError.ts
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── clearing/                 # Clearing domain
│   │   │   ├── model/                # Clearing entities
│   │   │   │   ├── ClearingHold.ts
│   │   │   │   ├── ClearingTransfer.ts
│   │   │   │   ├── ClearingRedeem.ts
│   │   │   │   ├── ClearingStatus.ts
│   │   │   │   └── ClearingOperationType.ts
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── CreateClearingHoldDomainService.ts
│   │   │   │   ├── CreateClearingTransferDomainService.ts
│   │   │   │   ├── CreateClearingRedeemDomainService.ts
│   │   │   │   ├── UpdateClearingHoldStatusDomainService.ts
│   │   │   │   ├── UpdateClearingTransferStatusDomainService.ts
│   │   │   │   ├── UpdateClearingRedeemStatusDomainService.ts
│   │   │   │   └── DeleteClearingHoldDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── ClearingNotFoundError.ts
│   │   │   │   ├── ClearingFoundError.ts
│   │   │   │   ├── ClearingExpiredError.ts
│   │   │   │   ├── InvalidClearingActionError.ts
│   │   │   │   └── InsufficientClearingBalanceError.ts
│   │   │   ├── events/               # Domain events
│   │   │   │   ├── ClearingCreatedEvent.ts
│   │   │   │   ├── ClearingApprovedEvent.ts
│   │   │   │   ├── ClearingCanceledEvent.ts
│   │   │   │   └── ClearingReclaimedEvent.ts
│   │   │   └── repository/           # Repository interfaces
│   │   │       ├── ClearingHoldRepository.ts
│   │   │       ├── ClearingTransferRepository.ts
│   │   │       └── ClearingRedeemRepository.ts
│   │   ├── holderbalance/            # Holder balance domain
│   │   │   ├── model/                # HolderBalance entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── hold/                     # Hold domain
│   │   │   ├── model/                # Hold entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── lock/                     # Lock domain
│   │   │   ├── model/                # Lock entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── document/                 # Document domain
│   │   │   ├── model/                # Document entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── coupon/                   # Coupon domain
│   │   │   ├── model/                # Coupon entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── controllist/              # Control list domain
│   │   │   ├── model/                # ControlListMember entity
│   │   │   ├── services/             # Domain services
│   │   │   ├── errors/               # Domain errors
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   └── proceedrecipient/         # Proceed recipient domain
│   │       ├── model/                # ProceedRecipient entity
│   │       ├── services/             # Domain services
│   │       ├── errors/               # Domain errors
│   │       ├── events/               # Domain events
│   │       └── repository/           # Repository interface
│   ├── port.adapter/                 # Port & adapter layer
│   │   ├── factory/                  # Factory adapters
│   │   │   ├── usecase/              # HTTP & Event adapters
│   │   │   │   ├── getfactory/
│   │   │   │   ├── pausefactory/
│   │   │   │   └── unpausefactory/
│   │   │   └── persistence/          # Database adapters
│   │   │       ├── model/            # TypeORM entities
│   │   │       └── repositories/     # Repository implementations
│   │   ├── bond/                     # Bond adapters
│   │   │   ├── usecase/
│   │   │   │   ├── createbond/
│   │   │   │   ├── getbond/
│   │   │   │   ├── getbonds/
│   │   │   │   ├── pausebond/
│   │   │   │   └── unpausebond/
│   │   │   └── persistence/
│   │   │       ├── model/
│   │   │       └── repositories/
│   │   ├── clearing/                 # Clearing adapters
│   │   │   ├── usecase/
│   │   │   │   ├── createclearinghold/
│   │   │   │   ├── createclearingtransfer/
│   │   │   │   ├── createclearingredeem/
│   │   │   │   ├── approveclearing/
│   │   │   │   ├── cancelclearing/
│   │   │   │   ├── reclaimclearing/
│   │   │   │   ├── getclearinghold/
│   │   │   │   ├── getclearingshold/
│   │   │   │   ├── getclearingtransfer/
│   │   │   │   ├── getclearingstransfer/
│   │   │   │   ├── getclearingredeem/
│   │   │   │   └── getclearingsredeem/
│   │   │   └── persistence/
│   │   │       ├── model/
│   │   │       │   ├── ClearingHoldPersistence.ts
│   │   │       │   ├── ClearingTransferPersistence.ts
│   │   │       │   └── ClearingRedeemPersistence.ts
│   │   │       └── repositories/
│   │   ├── holderbalance/            # Holder balance adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── hold/                     # Hold adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── lock/                     # Lock adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── document/                 # Document adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── coupon/                   # Coupon adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── controllist/              # Control list adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── cap/                      # Cap adapters
│   │   │   └── usecase/
│   │   ├── proceedrecipient/         # Proceed recipient adapters
│   │   │   ├── usecase/
│   │   │   └── persistence/
│   │   ├── transaction/              # Transaction HTTP adapters
│   │   │   └── usecase/
│   │   │       └── <transaction-types>/
│   │   ├── transactionbuilder/       # Transaction builder adapter
│   │   │   ├── TransactionBuilderAdapter.ts
│   │   │   └── model/
│   │   ├── health/                   # Health check adapter
│   │   │   └── HealthHttpAdapter.ts
│   │   └── shared/                   # Shared adapters
│   │       └── model/
│   ├── config/                       # Configuration
│   │   ├── PostgresModule.ts         # Database configuration
│   │   ├── ConfigKeys.ts             # Configuration keys
│   │   ├── Datasource.ts             # TypeORM datasource
│   │   └── DatabaseSeederService.ts  # Database seeding
│   ├── migrations/                   # Database migrations
│   ├── AppModule.ts                  # Root application module
│   ├── Components.ts                 # DI container configuration
│   └── main.ts                       # Application entry point
├── test/                             # Test files
│   ├── port.adapter/                 # Integration tests
│   ├── shared/                       # Test utilities
│   └── jest-e2e.json                 # E2E test configuration
├── docker-compose.yaml               # Docker composition
├── pgadmin-servers.json              # pgAdmin configuration
├── nest-cli.json                     # NestJS CLI configuration
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.build.json               # Build TypeScript configuration
├── eslint.config.mjs                 # ESLint configuration
├── jest.setup.js                     # Jest setup
├── package.json                      # Package dependencies
├── .env.example                      # Environment variables example
├── .env                              # Environment variables (git ignored)
├── .prettierrc                       # Prettier configuration
└── README.md                         # This file
```

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Key Dependencies

#### Core Dependencies

- `@nestjs/common`: NestJS core functionality
- `@nestjs/typeorm`: TypeORM integration for NestJS
- `@nestjs/swagger`: OpenAPI/Swagger documentation
- `typeorm`: ORM for database operations
- `pg`: PostgreSQL driver

#### Internal Dependencies

- `@hashgraph/green-bonds-blockchain-listener`: Blockchain event listener
- `@hashgraph/green-bonds-platform-ats-contracts`: Smart contract integration
- `@hashgraph/green-bonds-shared-core`: Shared utilities and components

#### Development Dependencies

- `@nestjs/cli`: NestJS CLI tools
- `@nestjs/testing`: Testing utilities
- `jest`: Testing framework
- `supertest`: HTTP testing
- `ts-jest`: TypeScript support for Jest
- `typescript-eslint`: ESLint for TypeScript

### Creating New Features

When adding new functionality, follow the hexagonal architecture pattern:

1. **Define the Domain Model** in `src/domain/<aggregate>/model/`
   - Create domain entities with business logic
   - Define value objects for complex types

2. **Create Domain Services** in `src/domain/<aggregate>/services/`
   - Implement domain logic that doesn't belong to a single entity
   - Keep services stateless and focused

3. **Define Domain Events** in `src/domain/<aggregate>/events/`
   - Create events for important domain actions
   - Use events to decouple aggregates

4. **Create Domain Errors** in `src/domain/<aggregate>/errors/`
   - Define specific error types for domain violations
   - Extend base error classes for consistency

5. **Define Repository Interface** in `src/domain/<aggregate>/repository/`
   - Create interface for data access
   - Keep it technology-agnostic

6. **Implement Repository** in `src/port.adapter/<aggregate>/persistence/repositories/`
   - Implement the domain repository interface
   - Use TypeORM entities for persistence

7. **Create Command/Query Handlers** in `src/app/<aggregate>/<usecase>/`
   - Commands for write operations (CQRS write side)
   - Queries for read operations (CQRS read side)
   - Application services for complex orchestration

8. **Create HTTP Adapters** in `src/port.adapter/<aggregate>/usecase/<functionality>/`
   - HTTP adapters for REST endpoints
   - Event adapters for domain event listeners

9. **Register Components** in `src/Components.ts`
   - Add to CONTROLLERS array if it's a controller
   - Add to PROVIDERS array if it's a service, repository, or handler

10. **Write Tests** in `test/port.adapter/<aggregate>/`
    - Integration tests for HTTP adapters
    - Unit tests for domain services

### Event-Driven Flow

1. **HTTP Request** → HTTP Adapter (Port)
2. **Adapter** → Application Service (Use Case)
3. **Application Service** → Domain Service
4. **Domain Service** → Repository (Domain Interface)
5. **Repository Implementation** → Database (TypeORM)
6. **Domain Events** → Event Listeners (NestJS EventEmitter)
7. **Blockchain Events** → Blockchain Listener → Database Updates → RabbitMQ

### CQRS Pattern

The application separates read and write operations:

**Commands** (Write Operations):

- Create bond
- Create clearing hold
- Transfer by partition
- Set coupon
- Add control list member

**Queries** (Read Operations):

- Get bond details
- List clearings
- Get holder balances
- Get documents
- Get control list members

### Transaction Flow

For blockchain transactions:

1. HTTP Request to Transaction Controller
2. Transaction Application Service validates request
3. Transaction Builder creates transaction payload
4. Transaction is sent to blockchain
5. Blockchain Event Listener detects confirmation
6. Event Adapter updates database
7. Domain Event is published
8. Response returned to client

### Clearing Operations

The clearing system implements a multi-party approval workflow:

1. **Clearing Hold**: Temporary hold on bonds pending approval
2. **Clearing Transfer**: Multi-party transfer requiring approval
3. **Clearing Redemption**: Bond redemption with approval workflow

Each clearing operation has the following lifecycle:

- `Created` → Initial state
- `Approved` → Approved by all required parties
- `Cancelled` → Cancelled before approval
- `Reclaimed` → Reclaimed by originator

## License

Apache 2.0

---

For more information about the Green Bonds platform, see the [main repository README](../../../README.md).
