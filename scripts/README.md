# Green Bonds Platform Scripts

Utility scripts and infrastructure management for the Green Bonds Platform.

## 🚀 **Quick Start**

### **Infrastructure Management**
```bash
cd scripts

# Start everything (Docker services + Node.js APIs)
npm run all:start

# OR start services individually
npm run docker:start              # Start Docker services only (PostgreSQL, RabbitMQ, PgAdmin)
npm run apis:start                 # Start Node.js APIs only (ATS API, Transaction Sender)

# Check status of all services
npm run all:status

# Stop services
npm run apis:stop                  # Stop APIs only
npm run all:stop                   # Stop everything (Docker + APIs)
```

### **Utility Scripts**
```bash
# Transaction signing only
npm run sign

# Transaction signing and sending (requires infrastructure)
npm run sign-and-send  

# Bond creation simulation (requires infrastructure)
npm run bond
```

## 🏗️ **Infrastructure Architecture**

### **Docker Services** 
- **PostgreSQL** (Port 5432): Database for ATS API
- **PgAdmin** (Port 5050): Web interface for database management - http://localhost:5050
- **RabbitMQ** (Port 5672): Message broker for transaction processing
- **RabbitMQ Management UI** (Port 15672): Web interface for RabbitMQ - http://localhost:15672

### **Node.js Services**
- **API Gateway** (Port 3000): Authenticated proxy to all services - http://localhost:3000 🔒
- **ATS API** (Port 3001): Bond management service - http://localhost:3001/api/v1/ats (Direct)
- **Transaction Sender** (Port 3005): Processes signed transactions from RabbitMQ

### **API Access & Security**
- **🔒 Recommended**: Use API Gateway (Port 3000) with authentication
- **🔓 Direct**: Access ATS API directly (Port 3001) for development only  
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
- `npm run bond` - Bond creation simulation workflow

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
Scripts → API Gateway (Port 3000) → ATS API (Port 3001)
         ↓ (with x-api-key)      ↓ (authenticated)
      Security Layer           Bond Management
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
axios.post('http://localhost:3001/api/v1/ats/bonds', data)

// After: Gateway access (secure, automatic)
gatewayClient.post('/api/v1/ats/bonds', data)
```

### **Testing Gateway Integration**
```bash
cd scripts/cli
node test-gateway-integration.js     # Test gateway connection
```

### **Manual API Testing**
```bash
# Through Gateway (Recommended)
curl -H "x-api-key: demo-key-1" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/v1/ats/bonds

# Direct API (Development only)  
curl http://localhost:3001/api/v1/ats/bonds
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
   # ATS_API_URL=http://localhost:3000               # Gateway URL
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
You can test different blockchain formats by changing the `BLOCKCHAIN_FORMAT` in your `.env` file:
- Set `BLOCKCHAIN_FORMAT=hedera` to test Hedera transaction flows
- Set `BLOCKCHAIN_FORMAT=ethereum` to test Ethereum/EVM transaction flows

All utility scripts (`npm run sign`, `npm run sign-and-send`, `npm run bond`) will automatically use the format specified in `BLOCKCHAIN_FORMAT`.

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
// In scripts/cli/infra-setup.js - Gateway config should have:
PATHS: '/api/v1/ats'                  // Routes to intercept
ROUTES: 'http://localhost:3001'       // Target ATS API
API_KEYS: 'demo-key-1,demo-key-2,your-secret-api-key'
```

## 🌐 **Service URLs**

When running, you can access:
- **ATS API**: http://localhost:3000/api
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **RabbitMQ Management**: http://localhost:15672 (guest / guest)