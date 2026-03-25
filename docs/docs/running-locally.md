---
title: Running Locally Guide
sidebar_position: 7
sidebar_label: Running Locally
description: Guide for running all Green Bond Platform microservices locally, testing endpoints, and verifying the platform works correctly
keywords: [local development, running services, testing, API testing, development workflow]
---

# Running Locally

This guide explains how to run the Green Bond Platform locally, test endpoints, and verify everything works correctly.

## Overview

The platform consists of 5 microservices that need to run simultaneously:

| Service                | Port | Purpose                        |
| ---------------------- | ---- | ------------------------------ |
| **Gateway**            | 3000 | API Gateway & Authentication   |
| **ATS API**            | 3001 | Asset Tokenization             |
| **Primary Market API** | 3002 | Bond Offerings & Subscriptions |
| **Treasury API**       | 3003 | Financial Management           |
| **Transaction Sender** | 3004 | Blockchain Transactions        |

Plus infrastructure services:

- **PostgreSQL** (5432) - Database
- **RabbitMQ** (5672, 15672) - Message Queue
- **pgAdmin** (5050) - Database UI

## Prerequisites

Before running the platform, ensure:

- You've completed [Installation](installation.md)
- All `.env` files are configured
- Docker containers are running
- Smart contracts are compiled

## Starting All Services

### Option 1: Using Multiple Terminals (Recommended for Development)

Open 5 separate terminal windows/tabs:

**Terminal 1 - Gateway:**

```bash
cd /path/to/green-bond-platform
npm run gateway:start:dev
```

**Terminal 2 - ATS API:**

```bash
cd /path/to/green-bond-platform
npm run ats:api:start:dev
```

**Terminal 3 - Primary Market API:**

```bash
cd /path/to/green-bond-platform
npm run primary-market:api:start:dev
```

**Terminal 4 - Treasury API:**

```bash
cd /path/to/green-bond-platform
npm run treasury:api:start:dev
```

**Terminal 5 - Transaction Sender:**

```bash
cd /path/to/green-bond-platform
npm run transaction-sender:start:dev
```

### Option 2: Using tmux (Advanced)

Create a tmux session with all services:

```bash
#!/bin/bash
# save as start-all-services.sh

tmux new-session -d -s gbp

# Window 0: Gateway
tmux rename-window -t gbp:0 'gateway'
tmux send-keys -t gbp:0 'npm run gateway:start:dev' C-m

# Window 1: ATS
tmux new-window -t gbp:1 -n 'ats'
tmux send-keys -t gbp:1 'npm run ats:api:start:dev' C-m

# Window 2: Primary Market
tmux new-window -t gbp:2 -n 'primary-market'
tmux send-keys -t gbp:2 'npm run primary-market:api:start:dev' C-m

# Window 3: Treasury
tmux new-window -t gbp:3 -n 'treasury'
tmux send-keys -t gbp:3 'npm run treasury:api:start:dev' C-m

# Window 4: Transaction Sender
tmux new-window -t gbp:4 -n 'tx-sender'
tmux send-keys -t gbp:4 'npm run transaction-sender:start:dev' C-m

# Attach to session
tmux attach-session -t gbp
```

Run it:

```bash
chmod +x start-all-services.sh
./start-all-services.sh
```

Navigate between windows: `Ctrl+b` then `0-4`

### Option 3: Using VS Code

1. Open the workspace in VS Code
2. Use the integrated terminal
3. Split terminal into 5 panes (Terminal → Split Terminal)
4. Run each service in its own pane

## Verifying Services are Running

### 1. Check Terminal Output

Each service should display:

**Gateway (Port 3000):**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RouterExplorer] Mapped {/health, GET} route
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

**ATS API (Port 3001):**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [TypeOrmModule] Mapped {ATS} entity
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3001
```

**Primary Market API (Port 3002):**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [TypeOrmModule] Database connection established
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3002
```

**Treasury API (Port 3003):**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [BlockchainListener] Blockchain listener initialized
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3003
```

**Transaction Sender (Port 3004):**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [RabbitMQModule] Connected to RabbitMQ
[Nest] INFO [NestApplication] Nest application successfully started
Application is running on: http://localhost:3004
```

### 2. Check Health Endpoints

Test each service's health endpoint:

```bash
# Gateway
curl http://localhost:3000/api/v1/health

# ATS API
curl http://localhost:3001/api/v1/health

# Primary Market API
curl http://localhost:3002/api/v1/health

# Treasury API
curl http://localhost:3003/api/v1/health

# Transaction Sender
curl http://localhost:3004/api/v1/health
```

Each should return:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "blockchain": { "status": "up" }
  }
}
```

### 3. Quick Verification Script

Create a script to check all services:

```bash
#!/bin/bash
# save as check-services.sh

services=(
  "Gateway:http://localhost:3000/api/v1/health"
  "ATS:http://localhost:3001/api/v1/health"
  "Primary-Market:http://localhost:3002/api/v1/health"
  "Treasury:http://localhost:3003/api/v1/health"
  "Transaction-Sender:http://localhost:3004/api/v1/health"
)

echo "Checking services..."
echo "===================="

for service in "${services[@]}"; do
  name="${service%%:*}"
  url="${service#*:}"

  response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$response" = "200" ]; then
    echo "✅ $name is running"
  else
    echo "❌ $name is NOT running (HTTP $response)"
  fi
done
```

Run it:

```bash
chmod +x check-services.sh
./check-services.sh
```

## Exploring the APIs

### Swagger Documentation

Each API provides interactive Swagger documentation:

- **ATS API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Primary Market API**: [http://localhost:3002/api](http://localhost:3002/api)
- **Treasury API**: [http://localhost:3003/api](http://localhost:3003/api)

Click "Try it out" on any endpoint to test it directly from your browser.

### Example API Calls

#### 1. Get ATS Factory Information

```bash
curl -X GET http://localhost:3001/api/v1/factory
```

Response:

```json
{
  "address": "0x...",
  "owner": "0x...",
  "bondsCount": 0
}
```

#### 2. Create a Bond (via Gateway)

First, get an authentication token:

```bash
# Login (if authentication is enabled)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Create a bond:

```bash
curl -X POST http://localhost:3000/api/v1/ats/bonds \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Energy Green Bond 2024",
    "symbol": "SEGB24",
    "totalSupply": 1000000,
    "maturityDate": "2029-12-31",
    "couponRate": 5.5
  }'
```

#### 3. Query Bond Details

```bash
curl -X GET http://localhost:3001/api/v1/bonds/{bondId}
```

#### 4. Create a Bond Offering

```bash
curl -X POST http://localhost:3002/api/v1/offerings \
  -H "Content-Type: application/json" \
  -d '{
    "bondId": "0x...",
    "totalAmount": 1000000,
    "minSubscription": 1000,
    "maxSubscription": 100000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

#### 5. Subscribe to an Offering

```bash
curl -X POST http://localhost:3002/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "offeringId": "123",
    "investorId": "0x...",
    "amount": 50000
  }'
```

### Testing with Postman

Import the API collections:

1. **Export from Swagger**:
   - Visit [http://localhost:3001/api-json](http://localhost:3001/api-json)
   - Save the JSON file
   - Import into Postman

2. **Or create a collection manually**:
   - Create a new Postman collection
   - Add requests for each endpoint
   - Set up environment variables for base URLs

## Monitoring Infrastructure

### PostgreSQL (Database)

**Access via psql:**

```bash
docker exec -it postgres psql -U postgres
```

**List databases:**

```sql
\l
```

**Connect to a database:**

```sql
\c ats_db
```

**List tables:**

```sql
\dt
```

**Query data:**

```sql
SELECT * FROM bonds LIMIT 10;
```

**Access via pgAdmin:**

1. Open [http://localhost:5050](http://localhost:5050)
2. Login with credentials from `docker-compose.yaml`
3. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: from docker-compose

### RabbitMQ (Message Queue)

**Access Management UI:**

1. Open [http://localhost:15672](http://localhost:15672)
2. Login: `guest` / `guest`

**Key sections:**

- **Queues**: See pending messages
- **Exchanges**: View message routing
- **Connections**: Active connections

**Monitor via CLI:**

```bash
# List queues
docker exec rabbitmq rabbitmqctl list_queues

# List connections
docker exec rabbitmq rabbitmqctl list_connections

# Check status
docker exec rabbitmq rabbitmqctl status
```

## Running Tests

### Unit Tests

Run all unit tests:

```bash
npm run api:test
```

Run tests for specific service:

```bash
npm run ats:api:test
npm run primary-market:api:test
npm run treasury:api:test
npm run gateway:test
npm run transaction-sender:test
```

### Integration Tests

Run all integration tests:

```bash
npm run api:test:integration
```

Run integration tests for specific service:

```bash
npm run ats:api:test:integration
npm run primary-market:api:test:integration
npm run treasury:api:test:integration
```

### E2E Tests

```bash
cd apps/ats/api
npm run test:e2e
```

### Coverage Reports

Generate coverage reports:

```bash
npm run api:test:coverage
```

View coverage:

```bash
open coverage/lcov-report/index.html
```

## Debugging

### Enable Debug Logging

In your `.env` files:

```bash
LOG_LEVEL=debug
NODE_ENV=development
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to ATS API",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/ats/api"
    }
  ]
}
```

Start service with debug flag:

```bash
npm run ats:api:start:debug
```

Attach debugger in VS Code (F5).

### Inspect Database State

```bash
# Quick queries
docker exec -it postgres psql -U postgres -d ats_db -c "SELECT * FROM bonds;"

# Interactive session
docker exec -it postgres psql -U postgres -d ats_db
```

### View Blockchain Transactions

Visit [HashScan Testnet](https://hashscan.io/testnet) and search for your account ID to see all transactions.

## Common Development Workflows

### Adding a New Feature

1. **Make code changes**
2. **Services auto-reload** (in dev mode)
3. **Test changes**:
   ```bash
   curl http://localhost:3001/api/v1/your-new-endpoint
   ```
4. **Run tests**:
   ```bash
   npm run ats:api:test
   ```
5. **Check linting**:
   ```bash
   npm run lint
   ```

### Resetting Local Environment

**Reset databases:**

```bash
docker compose down -v
docker compose up -d
```

**Reset and restart services:**

```bash
# Stop all services (Ctrl+C in each terminal)
npm run clean
npm ci
npm run contracts:build
# Restart services
```

## Performance Monitoring

### Check Service Memory Usage

```bash
# Check Node.js processes
ps aux | grep node

# More detailed with htop
htop
```

### Monitor API Response Times

Add timing to curl requests:

```bash
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/v1/health
```

`curl-format.txt`:

```
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

## Stopping Services

### Graceful Shutdown

Press `Ctrl+C` in each terminal to gracefully stop services.

### Force Kill All

```bash
# Kill all Node.js processes (use with caution)
pkill -9 node

# Or kill specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3003 | xargs kill -9
lsof -ti:3004 | xargs kill -9
```

### Stop Docker Containers

```bash
docker compose down
```

## Next Steps

Now that you have the platform running locally:

1. **Deploy Contracts**: [Getting Started](getting-started.md#step-10-deploy-smart-contracts-to-testnet)
2. **Run Integration Tests**: [Testing Guide](development/testing.md)
3. **Explore Architecture**: [Architecture Guide](architecture.md)
4. **Start Contributing**: [Contributing Guide](development/contributing.md)

## Troubleshooting

Having issues? Check:

- [Installation Troubleshooting](installation.md#troubleshooting)
- [GitHub Issues](https://github.com/hashgraph/green-bond-platform/issues)
- [GitHub Discussions](https://github.com/hashgraph/green-bond-platform/discussions)
