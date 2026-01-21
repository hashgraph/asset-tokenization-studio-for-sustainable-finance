# Green Bonds Platform Scripts

Utility scripts and infrastructure management for the Green Bonds Platform.

## � **Project Structure**

```
scripts/
├── ats/                          # ATS (Asset Tokenization Service) scripts
│   └── bond/                     # Bond-related scripts
│       ├── bond-simulator.js     # Bond creation simulator
│       ├── set-bond-document.js  # Bond document setting simulator (create + set document)
│       └── bond-service.js       # Bond service API client
├── primary-market/               # Primary Market scripts
│   └── offering/                 # Offering-related scripts
│       ├── offering-simulator.js # Offering creation simulator
│       └── offering-service.js   # Offering service API client
├── treasury/                     # Treasury scripts (future)
├── shared/                       # Shared utilities and infrastructure
│   ├── infra/                    # Infrastructure management
│   │   └── infra-setup.js        # Main infrastructure orchestration
│   └── lib/                      # Shared libraries
│       ├── config.js             # Configuration management
│       ├── gateway-client.js     # API Gateway HTTP client
│       ├── infrastructure.js     # RabbitMQ utilities
│       ├── input.js              # User input utilities
│       ├── logger.js             # Logging utilities
│       └── transaction-signer.js # Transaction signing
└── utils/                        # General utility scripts
    ├── transaction-signer.js     # Interactive transaction signer
    └── transaction-sign-and-send.js # Sign and publish transactions
```

## �🚀 **Quick Start**

### **Infrastructure Management**

```bash
cd scripts

# Start everything (Docker services + Node.js APIs)
npm run all:start

# OR start services individually
npm run docker:start              # Start Docker services only
npm run apis:start                # Start Node.js APIs only

# Check status of all services
npm run all:status

# Stop services
npm run apis:stop                 # Stop APIs only
npm run all:stop                  # Stop everything
```

### **Service-Specific Scripts**

```bash
# ATS - Bond creation simulation
npm run ats:bond

# ATS - Bond document setting (creates bond + sets document)
npm run ats:set-bond-document

# Primary Market - Offering creation simulation
npm run primary-market:offering

# Utilities
npm run sign                      # Transaction signing only
npm run sign-and-send             # Sign and publish transaction
```

## 🏗️ **Infrastructure Architecture**

### **Docker Services**

- **PostgreSQL** (Port 5432): Single instance with multiple databases
- **PgAdmin** (Port 5050): Web interface for database management - http://localhost:5050
- **RabbitMQ** (Port 5672): Message broker for transaction processing
- **RabbitMQ Management UI** (Port 15672): Web interface for RabbitMQ - http://localhost:15672

### **PostgreSQL Databases**

The PostgreSQL instance contains separate databases for each service:

| Database            | Description                                |
| ------------------- | ------------------------------------------ |
| `ats_db`            | ATS (Asset Tokenization Service) data      |
| `primary_market_db` | Primary Market offerings and subscriptions |
| `treasury_db`       | Treasury and portfolio management          |
| `postgres`          | Default PostgreSQL database                |

**Connection details:**

- Host: `localhost` (or `postgres` from within Docker network)
- Port: `5432`
- Username: `postgres`
- Password: `postgres`

### **PgAdmin Configuration**

PgAdmin comes pre-configured with all database connections under the **"Green Bonds Platform"** group:

- Green Bonds - ATS (`ats_db`)
- Green Bonds - Primary Market (`primary_market_db`)
- Green Bonds - Treasury (`treasury_db`)
- Green Bonds - Main (`postgres`)

**Access PgAdmin:**

1. Open http://localhost:5050
2. Login: `admin@admin.com` / `admin`
3. Expand "Green Bonds Platform" in the left sidebar
4. Click any server to connect (password: `postgres`)

**Configuration files:**

- `docker-compose.yaml` - Docker services configuration
- `pgadmin-servers.json` - Pre-configured PgAdmin server connections
- `init-db.sh` - Database initialization script (creates databases on first run)

### **Node.js Services**

- **API Gateway** (Port 3000): Authenticated proxy to all services - http://localhost:3000 🔒
- **ATS API** (Port 3001): Bond management service - http://localhost:3001/api/v1/ats
- **Primary Market API** (Port 3002): Offering management service - http://localhost:3002/api/v1/primary-markets
- **Transaction Sender** (Port 3005): Processes signed transactions from RabbitMQ

### **API Access & Security**

- **🔒 Recommended**: Use API Gateway (Port 3000) with authentication
- **🔓 Direct**: Access APIs directly (Ports 3001, 3002) for development only
- **🔑 Authentication**: All gateway requests require `x-api-key` header
- **🎯 Benefits**: Centralized security, request logging, rate limiting

## 📋 **Available Commands**

### **Infrastructure Management**

- `npm run all:start` - Start complete infrastructure (Docker + APIs)
- `npm run all:stop` - Stop all services
- `npm run all:status` - Check status of all components
- `npm run docker:start` - Start only Docker services
- `npm run docker:stop` - Stop Docker services
- `npm run apis:start` - Start only Node.js APIs
- `npm run apis:stop` - Stop Node.js APIs

### **Utility Scripts**

- `npm run sign` - Interactive transaction signing tool
- `npm run sign-and-send` - Transaction signing and sending utility
- `npm run ats:bond` - ATS Bond creation simulation workflow
- `npm run ats:set-bond-document` - ATS Bond creation + document setting workflow (automated)
- `npm run primary-market:offering` - Primary Market offering creation workflow

## ⚙️ **Prerequisites**

- **Docker and Docker Compose** - For infrastructure services
- **Node.js and npm** - For workspace and API services

**Note**: If you have system PostgreSQL running, stop it first to avoid port conflicts:

```bash
sudo systemctl stop postgresql
```

## � **API Gateway Integration**

All scripts now use the API Gateway for secure, authenticated access to services.

### **Architecture Flow**

```
Scripts → API Gateway (Port 3000) → ATS API (Port 3001) / Primary Market API (Port 3002)
         ↓ (with x-api-key)      ↓ (authenticated)
      Security Layer           Service APIs
```

### **Authentication Configuration**

```bash
# In your .env file:
API_KEY=demo-key-1                    # Your API key
ATS_API_URL=http://localhost:3000     # Gateway URL (default)

# Available API keys:
# - demo-key-1
# - demo-key-2
# - your-secret-api-key
```

### **How Scripts Use Gateway**

Your existing scripts work exactly the same, but now with security:

```javascript
// Before: Direct API access (insecure)
axios.post("http://localhost:3001/api/v1/ats/bonds", data);

// After: Gateway access (secure, automatic)
gatewayClient.post("/api/v1/ats/bonds", data);
```

### **Testing Gateway Integration**

```bash
# Test ATS API through gateway
curl -H "x-api-key: demo-key-1" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/v1/ats/bonds

# Test Primary Market API through gateway
curl -H "x-api-key: demo-key-1" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/v1/primary-markets
```

### **Manual API Testing**

```bash
# Through Gateway (Recommended)
curl -H "x-api-key: demo-key-1" http://localhost:3000/api/v1/ats/bonds
curl -H "x-api-key: demo-key-1" http://localhost:3000/api/v1/primary-markets

# Direct API (Development only)
curl http://localhost:3001/api/v1/ats/bonds
curl http://localhost:3002/api/v1/primary-markets
```

## �🛠️ **Setup Instructions**

1. **Install workspace dependencies** (from project root):

   ```bash
   npm install
   ```

2. **Navigate to scripts directory**:

   ```bash
   cd scripts
   ```

3. **Configure environment variables**:

   ```bash
   # Copy example env file
   cp .env.example .env

   # Edit .env file with your configuration
   # API_KEY=demo-key-1                              # Gateway authentication
   # GATEWAY_API_URL=http://localhost:3000           # Gateway URL
   # BLOCKCHAIN_FORMAT=hedera                        # Choose 'hedera' or 'ethereum'
   # HEDERA_PRIVATE_KEY=your-hedera-private-key-in-der-format
   # ACCOUNT_ID=your-hedera-account-id               # Required for Hedera (e.g., 0.0.123456)
   # ETHEREUM_PRIVATE_KEY=your-ethereum-private-key-in-hex-format
   ```

4. **Start the infrastructure**:
   ```bash
   npm run all:start
   ```

## 💡 **Usage Examples**

### **Complete Development Setup**

```bash
# Start everything for development
npm run all:start

# Check if all services are running
npm run all:status

# When done, stop everything
npm run all:stop
```

### **Incremental Setup**

```bash
# Start only Docker services first
npm run docker:start

# Then start APIs when ready
npm run apis:start

# Stop APIs but keep Docker running
npm run apis:stop
```

### **Testing Blockchain Flows**

```bash
# Test ATS bond creation
npm run ats:bond

# Test ATS bond creation + document setting (full flow)
npm run ats:set-bond-document

# Test Primary Market offering creation
npm run primary-market:offering
```

**Bond Document Testing:**
The `ats:set-bond-document` script provides a fully automated test flow:

- Creates a new bond on the blockchain
- Automatically fetches the created bond from the API
- Sets a document on the bond with hardcoded test values
- Document Name: `prospectus`
- Document URI: `https://example.com/documents/bond-prospectus-2024.pdf`
- Document Hash: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

After running, verify in the database:

- Check the `Bond` table for the new bond with the displayed contract ID
- Check the `BondDocument` table for the document entry with the hardcoded values

You can test different blockchain formats by changing the `BLOCKCHAIN_FORMAT` in your `.env` file:

- Set `BLOCKCHAIN_FORMAT=hedera` to test Hedera transaction flows
- Set `BLOCKCHAIN_FORMAT=ethereum` to test Ethereum/EVM transaction flows

All scripts will automatically use the format specified in `BLOCKCHAIN_FORMAT`.

## 🚨 **Troubleshooting**

### **Gateway Authentication Issues**

```bash
# Error: "Authentication failed"
# Solution: Check your API key configuration
echo $API_KEY                         # Should show your key
grep API_KEY .env                     # Should show API_KEY=demo-key-1

# Test authentication
curl -H "x-api-key: demo-key-1" http://localhost:3000/api/v1/ats/bonds
```

### **Connection Issues**

```bash
# Error: "ECONNREFUSED"
# Solution: Make sure infrastructure is running
npm run all:status                    # Check service status
npm run all:start                     # Start if needed

# Check specific ports
lsof -i :3000                        # Gateway should be running
lsof -i :3001                        # ATS API should be running
```

### **Service Health Check**

```bash
# Check all services
npm run all:status

# Manual health checks
curl http://localhost:3000/api/v1/ats/bonds -H "x-api-key: demo-key-1"  # Gateway
curl http://localhost:3001/health                                        # ATS API (direct)
curl http://localhost:5050                                               # PgAdmin
curl http://localhost:15672                                              # RabbitMQ
```

### **Gateway Configuration Issues**

If the gateway isn't routing correctly, check the infra-setup.js configuration:

```javascript
// In scripts/shared/infra/infra-setup.js - Gateway config should have:
PATHS: "/api/v1/ats,/api/v1/primary-markets"; // Routes to intercept
ROUTES: "http://localhost:3001,http://localhost:3002"; // Target APIs
API_KEYS: "demo-key-1,demo-key-2,your-secret-api-key";
```

## 🌐 **Service URLs**

When running, you can access:

- **API Gateway**: http://localhost:3000 (🔒 Requires x-api-key header)
- **ATS API Swagger**: http://localhost:3001/api
- **Primary Market API Swagger**: http://localhost:3002/api
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **RabbitMQ Management**: http://localhost:15672 (guest / guest)
