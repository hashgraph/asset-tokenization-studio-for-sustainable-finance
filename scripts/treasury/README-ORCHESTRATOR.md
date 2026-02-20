# Treasury Orchestrator 🎭

Orchestrator script that executes all Treasury verification scripts in sequential order.

## 📋 Description

The `treasury-orchestrator.js` is a comprehensive script that:

1. **Deploys** a new bond and treasury
2. **Executes** all verification scripts in order
3. **Reports** results for each step (✅ passed, ❌ failed, ⏭️ skipped)

## 🚀 Usage

### Basic Execution

```bash
node scripts/treasury/treasury-orchestrator.js
```

### Execution Order

The orchestrator executes the following scripts in order:

1. **Deploy Bond and Treasury** 📦
2. **Pause/Unpause** ⏸️
3. **Roles** 🔐
4. **Payment Token** 💰
   - Update Payment Token
   - Transfer TO Treasury
   - Transfer FROM Treasury
   - Dissociate Payment Token
5. **Environmental Assets** 🌱
   - Add Environmental Asset Token
   - Transfer TO Treasury
   - Transfer FROM Treasury
   - Delete Environmental Asset Token
   - Dissociate Environmental Asset Token
6. **Proceeds Recipient Fund** 💵
7. **Distributions** 📊
8. **Redemption** 💰

## ⚙️ Configuration

You can customize which tests to run by modifying the configuration object:

```javascript
const customConfig = {
  deployBondAndTreasury: true,
  pauseUnpause: true,
  roles: true,
  paymentToken: {
    enabled: true,
    updateToken: true,
    transferToTreasury: true,
    transferFromTreasury: true,
    dissociate: true,
  },
  environmentalAssets: {
    enabled: true,
    addToken: true,
    transferToTreasury: true,
    transferFromTreasury: true,
    deleteToken: true,
    dissociate: true,
  },
  proceedsRecipient: true,
  distribution: true,
  redemption: true,
};
```

### Configuration Examples

#### Payment Token Tests Only

```javascript
const config = {
  ...DEFAULT_CONFIG,
  pauseUnpause: false,
  roles: false,
  environmentalAssets: { ...DEFAULT_CONFIG.environmentalAssets, enabled: false },
  distribution: false,
  redemption: false,
};
```

#### Environmental Assets Only

```javascript
const config = {
  ...DEFAULT_CONFIG,
  pauseUnpause: false,
  roles: false,
  paymentToken: { ...DEFAULT_CONFIG.paymentToken, enabled: false },
  distribution: false,
  redemption: false,
};
```

#### Without Dissociation Tests

```javascript
const config = {
  ...DEFAULT_CONFIG,
  paymentToken: {
    ...DEFAULT_CONFIG.paymentToken,
    dissociate: false,
  },
  environmentalAssets: {
    ...DEFAULT_CONFIG.environmentalAssets,
    dissociate: false,
  },
};
```

## 📊 Output

The script provides a final summary:

```
📋 ORCHESTRATOR TEST SUITE SUMMARY

✅ Passed: 15
   • Deploy Bond and Treasury
   • Pause and Unpause
   • Treasury Roles
   • Update Payment Token
   • Transfer Payment Token TO Treasury
   • Transfer Payment Token FROM Treasury
   • Add Environmental Asset Token
   • Transfer Environmental Asset Token TO Treasury
   • Transfer Environmental Asset Token FROM Treasury
   • Delete Environmental Asset Token
   • Treasury Distributions
   • Treasury Redemption

❌ Failed: 0

⏭️  Skipped: 2
   • Dissociate Payment Token
   • Dissociate Environmental Asset Token

🎉 ALL TESTS PASSED! Treasury orchestrator completed successfully!
```

## 🔑 Required Environment Variables

Make sure you have the following variables configured:

```bash
# Account
ACCOUNT_ID=0.0.XXXXXX
HEDERA_PRIVATE_KEY=your_private_key

# Optional: For distributions/redemptions
HOLDER_ACCOUNT_1=0.0.XXXXXX
HOLDER_ACCOUNT_2=0.0.XXXXXX
MINT_AMOUNT=500000
```

## ⚠️ Important Notes

1. **Mandatory Deployment**: The `deployBondAndTreasury` step is mandatory as it's the foundation for pause/unpause and roles tests.

2. **Test Isolation**: Most tests create their own treasury infrastructure for proper setup:
   - **Pause/Unpause** and **Roles**: Use the orchestrator's deployed treasury
   - **Payment Token** (transfer/dissociate): Create their own treasury with custom token setup
   - **Environmental Assets**: Create their own treasury with custom token setup
   - **Proceeds Recipient Fund**: Creates its own treasury with custom payment token setup
   - **Distribution** and **Redemption**: Create complete infrastructure (bonds, tokens, holders)

3. **Script Dependencies**: Some test functions have internal dependencies:
   - `verifyTransferEnvironmentalAssetTokenFromTreasury` calls `verifyTransferEnvironmentalAssetTokenToTreasury`
   - `verifyDissociateEnvironmentalAssetToken` calls `verifyDeleteEnvironmentalAssetToken`
   - `verifyTransferPaymentTokenFromTreasury` calls `verifyTransferPaymentTokenToTreasury`

4. **Duration**: Full execution may take **several minutes** due to:
   - Multiple treasury deployments (one per test that needs custom setup)
   - Waiting for blockchain confirmations
   - Transaction processing
   - Verification with retries

## 🛠️ Development

### Code Structure

```javascript
async function runTreasuryOrchestrator(config = DEFAULT_CONFIG, overridesBondCreationRequest = {}) {
  // 1. Deploy Bond and Treasury
  const treasury = await deployBondWaitTreasuryAndApplyRoles(...);

  // 2. Execute each test suite based on config
  if (config.pauseUnpause) { ... }
  if (config.roles) { ... }
  if (config.paymentToken?.enabled) { ... }
  // ... etc

  // 3. Return results summary
  return results;
}
```

### Adding New Tests

To add new tests to the orchestrator:

1. Import the verification function:

```javascript
const { verifyNewFeature } = require("./verify-new-feature");
```

2. Add to default config:

```javascript
const DEFAULT_CONFIG = {
  // ... existing config
  newFeature: true,
};
```

3. Add execution:

```javascript
if (config.newFeature) {
  logHeader("🆕 Step X: Testing New Feature");
  try {
    await verifyNewFeature(treasury.contractId);
    logSuccess("✅ New Feature tests passed!");
    results.passed.push("New Feature");
  } catch (error) {
    logError(`❌ Failed new feature tests: ${error.message}`);
    results.failed.push({ step: "New Feature", error: error.message });
  }
}
```

## 📝 Individual Scripts

If you prefer to run individual scripts instead of the orchestrator:

```bash
# Pause/Unpause
node scripts/treasury/verify-treasury-pause-unpause.js

# Roles
node scripts/treasury/verify-treasury-roles.js

# Payment Token - Update
node scripts/treasury/paymenttoken/verify-update-treasury-payment-token.js

# Environmental Assets - Add
node scripts/treasury/environmentalassettoken/verify-add-environmental-asset-token.js

# Distributions
node scripts/treasury/distribution/verify-treasury-distributions.js

# Redemption
node scripts/treasury/redemption/verify-treasury-redemption.js
```

## 🐛 Troubleshooting

### Error: "Cannot proceed without deploying a treasury"

- **Cause**: `deployBondAndTreasury` is disabled in config
- **Solution**: Enable `deployBondAndTreasury: true`

### Error: "Signing configuration validation failed"

- **Cause**: Environment variables not configured
- **Solution**: Verify `.env` has `ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`

### Tests fail intermittently

- **Cause**: Timeouts in blockchain or asynchronous processing
- **Solution**: Scripts have automatic retries, wait for them to complete

## 📚 References

- [Treasury Scripts Documentation](./README.md)
- [Payment Token Scripts](./paymenttoken/)
- [Environmental Assets Scripts](./environmentalassettoken/)
- [Distribution Scripts](./distribution/)
- [Redemption Scripts](./redemption/)
