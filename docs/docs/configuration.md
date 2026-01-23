---
title: Configuration Guide
sidebar_position: 6
sidebar_label: Configuration
description: Complete configuration guide for Green Bond Platform - environment variables, database, blockchain, and service settings
keywords: [configuration, environment variables, setup, hedera config, database config, env file]
---

# Configuration

This guide explains how to configure Green Bond Platform for different environments.

## Global Environment Variables

### Blockchain Configuration

These variables are used across multiple system components:

```bash
# Hedera Network
HEDERA_NETWORK=testnet          # testnet, previewnet, or mainnet
HEDERA_ACCOUNT_ID=0.0.xxxxx     # Your Hedera Account ID
HEDERA_PRIVATE_KEY=302e020100... # Your private key (hex)

# Mirror Node (for queries)
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

### Database Configuration

PostgreSQL configuration shared between APIs:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=green_bonds

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### RabbitMQ Configuration

For inter-service communication:

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=transactions
```

## Configuration per Component

Each component has its own `.env` file with specific configurations.

### Gateway

```bash
cd apps/shared/gateway
cp .env.example .env
```

Edit the `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=3600  # 1 hour in seconds

# Service URLs
ATS_API_URL=http://localhost:3001
PRIMARY_MARKET_API_URL=http://localhost:3002
TREASURY_API_URL=http://localhost:3003

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4200

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

**See more details**: [Gateway Configuration](gateway/installation)

### Transaction Sender

```bash
cd apps/shared/transaction-sender
cp .env.example .env
```

Specific configuration:

```bash
# Server
PORT=3004
NODE_ENV=development

# Hedera Network
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=transactions

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY=5000  # milliseconds
```

**See more details**: [Transaction Sender Configuration](transaction-sender/installation)

### ATS API

```bash
cd apps/ats/api
cp .env.example .env
```

Configuration:

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

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...

# Smart Contracts
BOND_FACTORY_ADDRESS=0x...
TOKEN_MANAGER_ADDRESS=0x...
```

**See more details**: [ATS Configuration](ats/installation)

### Primary Market API

```bash
cd apps/primary-market/api
cp .env.example .env
```

Configuration:

```bash
# Server
PORT=3002
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=primary_market_db

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...

# Smart Contracts
PRIMARY_MARKET_ADDRESS=0x...
SUBSCRIPTION_MANAGER_ADDRESS=0x...
```

**See more details**: [Primary Market Configuration](primary-market/installation)

### Treasury API

```bash
cd apps/treasury/api
cp .env.example .env
```

Configuration:

```bash
# Server
PORT=3003
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=treasury_db

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=302e020100...

# Smart Contracts
TREASURY_ADDRESS=0x...
PAYMENT_MANAGER_ADDRESS=0x...
```

**See more details**: [Treasury Configuration](treasury/installation)

## Environment-Specific Configuration

### Development

For local development:

```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_SWAGGER=true
ENABLE_CORS=true
```

### Testing

For testing environment:

```bash
NODE_ENV=test
LOG_LEVEL=info
ENABLE_SWAGGER=true
DB_NAME=test_db
```

### Production

For production environment:

```bash
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_SWAGGER=false
ENABLE_CORS=false  # Configure specific origins
```

## Configuration Validation

Create a script to verify the configuration:

```bash
#!/bin/bash

echo "Verifying configuration..."

# Check required environment variables
required_vars=("HEDERA_NETWORK" "HEDERA_ACCOUNT_ID" "HEDERA_PRIVATE_KEY" "DB_HOST" "DB_PASSWORD")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var is not set"
    exit 1
  else
    echo "✓ $var is set"
  fi
done

echo "✓ All required variables are set"
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Rotate private keys** regularly
4. **Use environment-specific credentials**
5. **Enable SSL/TLS** in production
6. **Restrict CORS origins** in production
7. **Use secrets management** (AWS Secrets Manager, HashiCorp Vault, etc.)

## Configuration Files

### TypeORM Configuration

Located in `ormconfig.ts`:

```typescript
import { DataSourceOptions } from "typeorm";

export const config: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
};
```

### NestJS Configuration

Using `@nestjs/config` module:

```typescript
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        HEDERA_NETWORK: Joi.string().valid("testnet", "previewnet", "mainnet").required(),
      }),
    }),
  ],
})
export class AppModule {}
```

## Next Steps

After configuration:

1. [Start the services](installation#6-verify-installation)
2. [Run tests](development/testing)
3. [Deploy to production](development/deployment)
