# Primary Market API

The Primary Market API is a NestJS-based microservice that manages the primary market operations for the Green Bonds platform. It handles bond offerings, subscriptions, role management, and integrates with Hedera blockchain for transaction processing.

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

The Primary Market API provides comprehensive functionality for managing green bond primary market operations, including:

- **Primary Market Management**: Deploy and manage primary markets with pause/unpause capabilities
- **Bond Offerings**: Create, execute, and cancel bond offerings
- **Subscriptions**: Submit, cancel, and track investor subscriptions
- **Role Management**: Grant, revoke, and manage user roles for primary markets and factories
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
│   └── out/                                    # Outbound ports & adapters (DB, Blockchain)
│       └── <functionality>/
│           ├── Adapter.ts
│           └── Port.ts

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

- **PrimaryMarketFactory**: Factory for deploying primary markets
- **PrimaryMarket**: Primary market instances with offerings
- **Offering**: Bond offerings with lifecycle management
- **Subscription**: Investor subscriptions to offerings
- **Role**: Role-based access control for markets and factories

## Features

### Primary Market Factory Operations

- Get factory details and role members
- Grant/revoke factory roles
- Pause/unpause factory
- Deploy new primary markets
- Manage factory user roles

### Primary Market Operations

- Get primary market details
- List all primary markets
- Get bonds associated with a primary market
- Get bond offerings for a market
- Pause/unpause primary market
- Manage market user roles

### Offering Management

- Create bond offerings
- Execute offerings (allocate bonds to investors)
- Cancel offerings
- Get offering details
- List all offerings for a market
- Execute/cancel offerings by subscription ID

### Subscription Management

- Submit investor subscriptions
- Cancel subscriptions
- Get subscription details
- List subscriptions by offering
- List subscriptions by investor

### Role Management

- Grant roles to users
- Revoke roles from users
- Renounce own roles
- Apply multiple roles in batch
- Get role members
- Get user roles

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
cd apps/primary-market/api
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `apps/primary-market/api` directory based on `.env.example`:

```bash
# Application Configuration
PORT=3000
LOG_LEVEL=log

# PostgreSQL Configuration
POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=5433
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
- **POSTGRESQL_PORT**: Database port (default: `5433`)
- **POSTGRESQL_USER**: Database user (default: `postgres`)
- **POSTGRESQL_PASSWORD**: Database password (default: `postgres`)
- **POSTGRESQL_DB**: Database name (default: `postgres`)
- **POSTGRESQL_LOCK_TIMEOUT**: Lock timeout in seconds (default: `10`)
- **BLOCKCHAIN_LISTENER_BLOCK_NUMBER**: Starting block number for event listening (leave empty for automatic)
- **BLOCKCHAIN_LISTENER_POLL_INTERVAL**: Time interval in milliseconds between block checks (default: `3000`)
- **BLOCKCHAIN_LISTENER_CONTRACTS**: Semicolon-separated list of contract addresses to monitor
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

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and pgAdmin
npm run docker:up

# Stop containers
npm run docker:down
```

This will start:

- **PostgreSQL**: Available at `localhost:5433`
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

The API will be available at `http://localhost:3000` (or the PORT specified in `.env`).

## API Documentation

Once the application is running, access the interactive Swagger API documentation:

- **Swagger UI**: `http://localhost:3000/api/v1/docs`
- **Base URL**: `http://localhost:3000/api/v1/`
- **Health Check**: `http://localhost:3000/api/v1/health`

### Main API Endpoints

#### Health Check

- `GET /api/v1/health` - Health check endpoint

#### Primary Market Factory

- `GET /api/v1/factories/:factoryContractId` - Get factory details
- `GET /api/v1/factories/:factoryContractId/roles/:roleId/members` - Get role members
- `GET /api/v1/factories/:factoryContractId/users/:userAccountId/roles` - Get user roles
- `POST /api/v1/factories/:factoryContractId/roles/:roleId/users/:userAccountId` - Grant role
- `DELETE /api/v1/factories/:factoryContractId/roles/:roleId/users/:userAccountId` - Revoke role
- `POST /api/v1/factories/:factoryContractId/pause` - Pause factory
- `POST /api/v1/factories/:factoryContractId/unpause` - Unpause factory
- `POST /api/v1/factories/:factoryContractId/markets` - Deploy primary market

#### Primary Market

- `GET /api/v1/:marketContractId` - Get primary market details
- `GET /api/v1/markets` - List all primary markets
- `GET /api/v1/:marketContractId/bonds` - Get market bonds
- `GET /api/v1/:marketContractId/bonds/:bondContractId/offerings` - Get bond offerings
- `GET /api/v1/:marketContractId/users/:userAccountId/roles` - Get user roles
- `POST /api/v1/:marketContractId/pause` - Pause market
- `POST /api/v1/:marketContractId/unpause` - Unpause market

#### Offerings

- `GET /api/v1/:marketContractId/offerings` - List all offerings
- `GET /api/v1/:marketContractId/offerings/:offeringId` - Get offering details
- `POST /api/v1/:marketContractId/bonds/:bondContractId/offerings` - Create offering
- `POST /api/v1/:marketContractId/offerings/:offeringId` - Execute offering
- `DELETE /api/v1/:marketContractId/offerings/:offeringId` - Cancel offering
- `POST /api/v1/:marketContractId/offerings/:offeringId/subscription-executes` - Execute by subscription
- `DELETE /api/v1/:marketContractId/offerings/:offeringId/subscription-cancellations` - Cancel by subscription

#### Subscriptions

- `GET /api/v1/:marketContractId/offerings/:offeringId/subscriptions` - List subscriptions
- `GET /api/v1/:marketContractId/offerings/:offeringId/subscriptions/:subscriptionId` - Get subscription
- `GET /api/v1/investors/:investorAccountId/subscriptions` - Get investor subscriptions
- `POST /api/v1/:marketContractId/offerings/:offeringId/subscriptions` - Submit subscription
- `DELETE /api/v1/:marketContractId/offerings/:offeringId/subscriptions/:subscriptionId` - Cancel subscription

#### Role Management

- `GET /api/v1/:marketContractId/roles/:roleId/members` - Get role members
- `POST /api/v1/:marketContractId/roles/:roleId/users/:userAccountId` - Grant role
- `DELETE /api/v1/:marketContractId/roles/:roleId` - Renounce role
- `POST /api/v1/:marketContractId/roles/apply` - Apply multiple roles

## Database

### Database Schema

The application uses PostgreSQL with TypeORM for persistence. Main entities include:

- **PrimaryMarketFactoryPersistence**: Factory contract information
- **PrimaryMarketPersistence**: Primary market instances
- **OfferingPersistence**: Bond offerings
- **SubscriptionPersistence**: Investor subscriptions
- **UserRolePersistence**: User role assignments
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
apps/primary-market/api/
├── src/
│   ├── app/                          # Application layer (use cases)
│   │   ├── offering/                 # Offering use cases
│   │   │   ├── createoffering/       # Create offering command
│   │   │   ├── canceloffering/       # Cancel offering command
│   │   │   ├── executeoffering/      # Execute offering command
│   │   │   ├── getoffering/          # Get offering query
│   │   │   └── getofferings/         # Get offerings query
│   │   ├── subscription/             # Subscription use cases
│   │   │   ├── submitsubscription/   # Submit subscription command
│   │   │   ├── cancelsubscription/   # Cancel subscription command
│   │   │   ├── getsubscription/      # Get subscription query
│   │   │   ├── getsubscriptions/     # Get subscriptions query
│   │   │   └── getsubscriptionsbyinvestor/
│   │   ├── primarymarket/            # Primary market use cases
│   │   │   ├── deployprimarymarket/  # Deploy market command
│   │   │   ├── pauseprimarymarket/   # Pause market command
│   │   │   ├── unpauseprimarymarket/ # Unpause market command
│   │   │   ├── getprimarymarket/     # Get market query
│   │   │   ├── getprimarymarkets/    # Get markets query
│   │   │   ├── getprimarymarketbonds/
│   │   │   └── getprimarymarketbondofferings/
│   │   ├── primarymarketfactory/     # Factory use cases
│   │   │   ├── pauseprimarymarketfactory/
│   │   │   ├── unpauseprimarymarketfactory/
│   │   │   └── getprimarymarketfactory/
│   │   └── transaction/              # Transaction use cases
│   │       ├── createoffering/       # Create offering transaction
│   │       ├── submitsubscription/   # Submit subscription transaction
│   │       ├── cancelsubscription/   # Cancel subscription transaction
│   │       ├── canceloffering/       # Cancel offering transaction
│   │       ├── executeoffering/      # Execute offering transaction
│   │       ├── executeofferingbysubscriptionid/
│   │       ├── cancelofferingbysubscriptionid/
│   │       ├── deployprimarymarket/  # Deploy market transaction
│   │       ├── pauseprimarymarket/   # Pause market transaction
│   │       ├── unpauseprimarymarket/ # Unpause market transaction
│   │       ├── grantrole/            # Grant role transaction
│   │       ├── renouncerole/         # Renounce role transaction
│   │       ├── applyroles/           # Apply roles transaction
│   │       ├── grantprimarymarketfactoryrole/
│   │       ├── revokeprimarymarketfactoryrole/
│   │       ├── pauseprimarymarketfactorytransaction/
│   │       └── unpauseprimarymarketfactorytransaction/
│   ├── domain/                       # Domain layer (business logic)
│   │   ├── offering/                 # Offering domain
│   │   │   ├── model/                # Offering entity
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── CreateOfferingDomainService.ts
│   │   │   │   ├── ProcessOfferingDomainService.ts
│   │   │   │   └── CheckOfferingExistsDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── OfferingNotFoundError.ts
│   │   │   │   ├── OfferingFoundError.ts
│   │   │   │   └── OfferingUnauthorizedOperatorError.ts
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── subscription/             # Subscription domain
│   │   │   ├── model/                # Subscription entity
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── SubmitSubscriptionDomainService.ts
│   │   │   │   ├── CancelSubscriptionDomainService.ts
│   │   │   │   ├── UpdateSubscriptionsStatusDomainService.ts
│   │   │   │   └── CheckSubscriptionExistsDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── SubscriptionNotFoundError.ts
│   │   │   │   └── SubscriptionFoundError.ts
│   │   │   ├── events/               # Domain events
│   │   │   │   └── SubscriptionCancelledEvent.ts
│   │   │   └── repository/           # Repository interface
│   │   ├── primarymarket/            # Primary market domain
│   │   │   ├── model/                # PrimaryMarket entity
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── DeployPrimaryMarketDomainService.ts
│   │   │   │   └── CheckPrimaryMarketExistsDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── PrimaryMarketNotFoundError.ts
│   │   │   │   ├── PrimaryMarketFoundError.ts
│   │   │   │   ├── PrimaryMarketPausedError.ts
│   │   │   │   ├── PrimaryMarketAlreadyPausedError.ts
│   │   │   │   └── PrimaryMarketAlreadyUnpausedError.ts
│   │   │   ├── events/               # Domain events
│   │   │   └── repository/           # Repository interface
│   │   ├── primarymarketfactory/     # Factory domain
│   │   │   ├── model/                # PrimaryMarketFactory entity
│   │   │   ├── services/             # Domain services
│   │   │   │   └── CheckPrimaryMarketFactoryExistsDomainService.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   │   ├── PrimaryMarketFactoryNotFoundError.ts
│   │   │   │   ├── PrimaryMarketFactoryAlreadyPausedError.ts
│   │   │   │   └── PrimaryMarketFactoryAlreadyUnpausedError.ts
│   │   │   ├── events/               # Domain events
│   │   │   │   ├── PrimaryMarketFactoryPausedEvent.ts
│   │   │   │   └── PrimaryMarketFactoryUnpausedEvent.ts
│   │   │   └── repository/           # Repository interface
│   │   ├── role/                     # Role domain
│   │   ├── usermarketrole/           # User market role domain
│   │   └── shared/                   # Shared domain utilities
│   ├── port.adapter/                 # Port & adapter layer
│   │   ├── blockchain/               # Blockchain integration
│   │   │   └── BlockchainAdapter.ts
│   │   ├── offering/                 # Offering HTTP adapters
│   │   │   └── usecase/
│   │   │       ├── createoffering/   # Event adapter
│   │   │       │   └── CreateOfferingNestJSEventAdapter.ts
│   │   │       ├── canceloffering/
│   │   │       │   └── CancelOfferingNestJSEventAdapter.ts
│   │   │       ├── executeoffering/
│   │   │       │   └── ExecuteOfferingNestJSEventAdapter.ts
│   │   │       ├── getoffering/      # Query adapter
│   │   │       │   └── GetOfferingHttpAdapter.ts
│   │   │       └── getofferings/
│   │   │           └── GetOfferingsHttpAdapter.ts
│   │   ├── subscription/             # Subscription HTTP adapters
│   │   │   └── usecase/
│   │   │       ├── submitsubscription/
│   │   │       │   └── SubmitSubscriptionNestJSEventAdapter.ts
│   │   │       ├── cancelsubscription/
│   │   │       │   └── CancelSubscriptionNestJSEventAdapter.ts
│   │   │       ├── getsubscription/
│   │   │       │   └── GetSubscriptionHttpAdapter.ts
│   │   │       ├── getsubscriptions/
│   │   │       │   └── GetSubscriptionsHttpAdapter.ts
│   │   │       ├── getsubscriptionsbyinvestor/
│   │   │       │   └── GetSubscriptionsByInvestorHttpAdapter.ts
│   │   │       └── shared/
│   │   ├── primarymarket/            # Primary market HTTP adapters
│   │   │   └── usecase/
│   │   │       ├── deployprimarymarket/
│   │   │       │   └── DeployPrimaryMarketNestJSEventAdapter.ts
│   │   │       ├── pauseprimarymarket/
│   │   │       │   └── PausePrimaryMarketNestJSEventAdapter.ts
│   │   │       ├── unpauseprimarymarket/
│   │   │       │   └── UnpausePrimaryMarketNestJSEventAdapter.ts
│   │   │       ├── getprimarymarket/
│   │   │       │   └── GetPrimaryMarketHttpAdapter.ts
│   │   │       ├── getprimarymarkets/
│   │   │       │   └── GetPrimaryMarketsHttpAdapter.ts
│   │   │       ├── getprimarymarketbonds/
│   │   │       │   └── GetPrimaryMarketBondsHttpAdapter.ts
│   │   │       ├── getprimarymarketbondofferings/
│   │   │       │   └── GetPrimaryMarketBondOfferingsHttpAdapter.ts
│   │   │       ├── getprimarymarketuserroles/
│   │   │       │   └── GetPrimaryMarketUserRolesHttpAdapter.ts
│   │   │       ├── createprimarymarketfilters/
│   │   │       │   └── CreatePrimaryMarketFiltersAdapter.ts
│   │   │       └── shared/
│   │   ├── primarymarketfactory/     # Factory HTTP adapters
│   │   │   └── usecase/
│   │   │       ├── pauseprimarymarketfactory/
│   │   │       │   └── PausePrimaryMarketFactoryNestJSEventAdapter.ts
│   │   │       ├── unpauseprimarymarketfactory/
│   │   │       │   └── UnpausePrimaryMarketFactoryNestJSEventAdapter.ts
│   │   │       ├── getprimarymarketfactory/
│   │   │       │   └── GetPrimaryMarketFactoryHttpAdapter.ts
│   │   │       ├── getprimarymarketfactoryrolemembers/
│   │   │       │   └── GetPrimaryMarketFactoryRoleMembersHttpAdapter.ts
│   │   │       └── getprimarymarketfactoryuserroles/
│   │   │           └── GetPrimaryMarketFactoryUserRolesHttpAdapter.ts
│   │   ├── role/                     # Role HTTP adapters
│   │   │   └── usecase/
│   │   │       ├── grantrole/
│   │   │       │   └── GrantRoleNestJSEventAdapter.ts
│   │   │       ├── renouncerole/
│   │   │       │   └── RenounceRoleNestJSEventAdapter.ts
│   │   │       ├── applyroles/
│   │   │       │   └── ApplyRolesNestJSEventAdapter.ts
│   │   │       └── getrolemembers/
│   │   │           └── GetRoleMembersHttpAdapter.ts
│   │   ├── transaction/              # Transaction HTTP adapters
│   │   │   └── usecase/              # Transaction endpoints
│   │   │       ├── createoffering/
│   │   │       │   └── CreateOfferingTransactionHttpAdapter.ts
│   │   │       ├── cancelOffering/
│   │   │       │   └── CancelOfferingTransactionHttpAdapter.ts
│   │   │       ├── executeOffering/
│   │   │       │   └── ExecuteOfferingTransactionHttpAdapter.ts
│   │   │       ├── executeofferingbysubscriptionid/
│   │   │       ├── cancelofferingbysubscriptionid/
│   │   │       ├── submitsubscription/
│   │   │       │   └── SubmitSubscriptionTransactionHttpAdapter.ts
│   │   │       ├── cancelsubscription/
│   │   │       │   └── CancelSubscriptionTransactionHttpAdapter.ts
│   │   │       ├── deployprimarymarket/
│   │   │       │   └── DeployPrimaryMarketTransactionHttpAdapter.ts
│   │   │       ├── pauseprimarymarket/
│   │   │       │   └── PausePrimaryMarketTransactionHttpAdapter.ts
│   │   │       ├── unpauseprimarymarket/
│   │   │       │   └── UnpausePrimaryMarketTransactionHttpAdapter.ts
│   │   │       ├── pauseprimarymarketfactorytransaction/
│   │   │       │   └── PausePrimaryMarketFactoryTransactionHttpAdapter.ts
│   │   │       ├── unpauseprimarymarketfactorytransaction/
│   │   │       │   └── UnpausePrimaryMarketFactoryTransactionHttpAdapter.ts
│   │   │       ├── grantrole/
│   │   │       │   └── GrantRoleTransactionHttpAdapter.ts
│   │   │       ├── renouncerole/
│   │   │       │   └── RenounceRoleTransactionHttpAdapter.ts
│   │   │       ├── applyroles/
│   │   │       │   └── ApplyRolesTransactionHttpAdapter.ts
│   │   │       ├── grantprimarymarketfactoryrole/
│   │   │       │   └── GrantPrimaryMarketFactoryRoleTransactionHttpAdapter.ts
│   │   │       └── revokeprimarymarketfactoryrole/
│   │   │           └── RevokePrimaryMarketFactoryRoleTransactionHttpAdapter.ts
│   │   ├── transactionbuilder/       # Transaction builder adapter
│   │   │   └── TransactionBuilderAdapter.ts
│   │   ├── persistence/              # Database repositories & models
│   │   │   ├── offering/
│   │   │   │   ├── model/            # TypeORM entity
│   │   │   │   │   └── OfferingPersistence.ts
│   │   │   │   └── repositories/     # Repository implementation
│   │   │   │       └── OfferingTypeORMRepository.ts
│   │   │   ├── subscription/
│   │   │   │   ├── model/
│   │   │   │   │   └── SubscriptionPersistence.ts
│   │   │   │   └── repositories/
│   │   │   │       └── SubscriptionTypeORMRepository.ts
│   │   │   ├── primarymarket/
│   │   │   │   ├── model/
│   │   │   │   │   └── PrimaryMarketPersistence.ts
│   │   │   │   └── repositories/
│   │   │   │       └── PrimaryMarketTypeORMRepository.ts
│   │   │   └── primarymarketfactory/
│   │   │       ├── model/
│   │   │       │   └── PrimaryMarketFactoryPersistence.ts
│   │   │       └── repositories/
│   │   │           └── PrimaryMarketFactoryTypeORMRepository.ts
│   │   ├── health/                   # Health check adapter
│   │   │   └── HealthHttpAdapter.ts
│   │   └── shared/                   # Shared adapters
│   ├── config/                       # Configuration
│   │   ├── PostgresModule.ts         # Database configuration
│   │   ├── ConfigKeys.ts             # Configuration keys
│   │   ├── Datasource.ts             # TypeORM datasource
│   │   └── DatabaseSeederService.ts  # Database seeding
│   ├── migrations/                   # Database migrations
│   │   └── 1764680230530-migrations.ts
│   ├── AppModule.ts                  # Root application module
│   ├── Components.ts                 # DI container configuration
│   └── main.ts                       # Application entry point
├── test/                             # Test files
│   ├── port.adapter/                 # Integration tests
│   │   ├── offering/
│   │   ├── subscription/
│   │   ├── primarymarket/
│   │   ├── primarymarketfactory/
│   │   ├── role/
│   │   └── transaction/
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
- `@hashgraph/green-bonds-platform-primarymarket-contracts`: Smart contract integration
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

6. **Implement Repository** in `src/port.adapter/persistence/<aggregate>/repositories/`
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

- Create offering
- Submit subscription
- Grant role
- Deploy primary market

**Queries** (Read Operations):

- Get offering details
- List subscriptions
- Get primary market
- Get role members

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

## License

Apache 2.0

---

For more information about the Green Bonds platform, see the [main repository README](../../../README.md).
