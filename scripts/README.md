# Evercity Green Bonds Scripts

Modular utility scripts for the Evercity Green Bonds Platform. This refactored architecture provides focused, single-responsibility tools for transaction signing and bond creation workflows.

## 🚀 **Quick Start**

1. **For simple transaction signing**:
   ```bash
   cd scripts
   npm run sign
   ```

2. **For transaction sender testing**:
   ```bash
   cd scripts
   # First, start infrastructure
   npm run infra:start
   
   # Then run transaction sender test
   npm run sender
   ```

3. **For full bond creation simulation**:
   ```bash
   cd scripts
   # First, start infrastructure
   npm run infra:start
   
   # Then run bond simulation
   npm run bond
   ```

## 📁 **Architecture**

### **Main Scripts (`bin/`)**
- **`bin/transaction-signer.js`** - Standalone transaction signing service (no infrastructure required)
- **`bin/transaction-sender.js`** - Transaction sender test utility (requires infrastructure)
- **`bin/bond-simulator.js`** - Full bond creation workflow with infrastructure
- **`bin/infra-setup.js`** - Infrastructure management tool

### **Shared Libraries (`lib/`)**
- **`config.js`** - Environment variables and configuration
- **`logger.js`** - Enhanced logging with colors and semantic functions  
- **`transaction-signer.js`** - Transaction signing logic for Hedera & Ethereum
- **`infrastructure.js`** - Pure infrastructure checks and messaging
- **`bond-service.js`** - Bond creation business logic
- **`input.js`** - User input utilities

## ✨ **Benefits**
- **Modularity**: Single responsibility principle with clear separation of concerns
- **Direct Access**: `npm run sign`, `npm run sender`, or `npm run bond` - no menu navigation
- **Environment-based**: Configured via `.env` file - no repetitive prompts
- **Maintainable**: Small, focused files instead of monolithic scripts

### infra-setup.js
**Infrastructure management tool for starting/stopping required services.**

**Usage:**
```bash
# From scripts folder
cd scripts
npm run infra:start          # Start all services
npm run infra:start:api      # Start API only
npm run infra:start:rabbitmq # Start RabbitMQ only
npm run infra:status         # Check status
npm run infra:stop           # Stop services

# Or from project root
node scripts/bin/infra-setup.js start
node scripts/bin/infra-setup.js status
node scripts/bin/infra-setup.js stop
```

## Setup

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Configure environment variables**:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env file with your blockchain format and private keys
   # BLOCKCHAIN_FORMAT=hedera  # Choose 'hedera' or 'ethereum'
   # HEDERA_PRIVATE_KEY=your-hedera-private-key-in-der-format
   # ACCOUNT_ID=your-hedera-account-id  # Required for Hedera (e.g., 0.0.123456)
   # ETHEREUM_PRIVATE_KEY=your-ethereum-private-key-in-hex-format
   ```

   **💡 Testing Different Blockchain Formats:**
   
   You can test any blockchain flow by simply changing the `BLOCKCHAIN_FORMAT` in your `.env` file:
   - Set `BLOCKCHAIN_FORMAT=hedera` to test Hedera transaction flows
   - Set `BLOCKCHAIN_FORMAT=ethereum` to test Ethereum/EVM transaction flows
   
   All scripts (`npm run sign`, `npm run sender`, `npm run bond`) will automatically use the format specified in `BLOCKCHAIN_FORMAT`.

## Infrastructure Components

- **ATS API**: Bond management service (Port 3000)
- **RabbitMQ**: Message broker for transaction processing (Port 5672, Management UI: 15672)
- **Transaction Sender**: Service that processes signed transactions from RabbitMQ queues