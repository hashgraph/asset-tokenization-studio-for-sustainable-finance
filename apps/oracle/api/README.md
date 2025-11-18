# Oracle API

Independent backend service for the Green Bonds Platform.

## Description

Oracle API is a standalone NestJS application with its own database, completely independent from other platform modules.

## Features

- NestJS framework with TypeScript
- PostgreSQL database with TypeORM
- Swagger/OpenAPI documentation
- Health check endpoint
- Hexagonal architecture (Ports & Adapters)
- CQRS pattern support
- **Per-registry execution frequency** - Each oracle registry can have its own independent frequency (in minutes) for fetching KPI values
- Scheduler service that checks registries and executes based on their individual frequencies
- Support for both Hedera SDK and JSON-RPC for blockchain transactions

## Installation

From the root of the monorepo:

```bash
npm ci
```

## Configuration

Copy the `.env.example` file to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Key environment variables:
- `PORT`: API server port (default: 3010)
- `POSTGRES_HOST`: Database host
- `POSTGRES_PORT`: Database port
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name (default: oracle_db)

## Running the app

From the root of the monorepo:

```bash
# Development mode with watch
npm run oracle:api:start:dev

# Production mode
npm run oracle:api:start

# Build
npm run oracle:api:build
```

Or from this directory (`apps/oracle/api`):

```bash
# Development
npm run start:dev

# Production
npm run start

# Build
npm run build
```

## API Documentation

Once running, access the Swagger documentation at:
- http://localhost:3010/api/v1/docs

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Project Structure

```
apps/oracle/api/
├── src/
│   ├── app/                    # Application layer (use cases, handlers)
│   ├── domain/                 # Domain layer (business logic)
│   ├── port.adapter/           # Adapters (HTTP controllers, persistence)
│   ├── config/                 # Configuration modules
│   ├── utils/                  # Utility functions
│   ├── AppModule.ts           # Main application module
│   ├── Components.ts          # Dependency injection registry
│   └── main.ts                # Application entry point
├── test/                      # Tests
└── package.json
```

## Path Aliases

- `@app/*` → `src/app/*`
- `@domain/*` → `src/domain/*`
- `@port/*` → `src/port.adapter/*`
- `@config/*` → `src/config/*`
- `@utils/*` → `src/utils/*`
- `@components` → `src/Components`

## Database

The application uses PostgreSQL with TypeORM. Database entities should be placed in the appropriate domain folder with the `.entity.ts` suffix.

Example: `src/port.adapter/example/persistence/Example.entity.ts`

## License

Apache 2.0
