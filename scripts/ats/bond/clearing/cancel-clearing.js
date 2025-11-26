const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

// Parse command line arguments (format: key=value)
const args = {};
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value) {
    args[key] = value;
  }
});

// Operation types mapping
const OPERATION_TYPES = {
  TRANSFER: 0,
  REDEEM: 1,
  HOLD: 2,
};

async function cancelClearing(bondContractId, holderAccountId, clearingId, operationType, partition, format) {
  log(`\n❌ Canceling clearing ${clearingId} for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  // Convert Hedera ID to EVM address if needed
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using holder EVM address: ${holderEvmAddress}`);

  const cancelClearingRequest = {
    partition: partition || undefined,
    operationType: OPERATION_TYPES[operationType.toUpperCase()],
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.delete(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/clearings/${clearingId}`,
      {
        data: cancelClearingRequest,
      },
    );

    logSuccess("Cancel clearing transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Clearing ID: ${clearingId}`);
    logInfo(`Operation Type: ${operationType}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...cancelClearingRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to cancel clearing: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyClearingCanceled(bondContractId, holderAccountId, clearingId, operationType) {
  log(`\n📊 Clearing cancelation verification:`, colors.bright);
  logSuccess(`Cancel clearing transaction has been sent successfully`);
  logInfo(`The ClearingCanceledEvent should have been processed`);
  logInfo(`📋 To verify the clearing was canceled, run:`);
  const endpoint = operationType.toLowerCase();
  logInfo(
    `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} node scripts/ats/bond/clearing/get-clearings-${endpoint}.js`,
  );
  logInfo(`Expected result: Clearing ${clearingId} should have status CANCELED or be removed from the list\n`);
}

async function main() {
  try {
    logHeader("❌ Evercity Cancel Clearing");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

    // Configure parameters (prioritize command line args, then env vars)
    const bondContractId = args.BOND_CONTRACT_ID || process.env.BOND_CONTRACT_ID;
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const clearingId = args.CLEARING_ID || process.env.CLEARING_ID;
    const operationType = args.OPERATION_TYPE || process.env.OPERATION_TYPE || "HOLD";
    const partition = args.PARTITION || process.env.PARTITION || ""; // Optional

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!clearingId) {
      logError("CLEARING_ID is required. Set it as environment variable or argument");
      logError("Example: CLEARING_ID=1 OPERATION_TYPE=HOLD node scripts/ats/bond/clearing/cancel-clearing.js");
      process.exit(1);
    }

    if (!["TRANSFER", "REDEEM", "HOLD"].includes(operationType.toUpperCase())) {
      logError("OPERATION_TYPE must be one of: TRANSFER, REDEEM, HOLD");
      logError("Example: OPERATION_TYPE=HOLD node scripts/ats/bond/clearing/cancel-clearing.js");
      process.exit(1);
    }

    log(`\n🎯 Cancel Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Clearing ID: ${clearingId}`);
    logInfo(`  • Operation Type: ${operationType}`);
    logInfo(`  • Partition: ${partition || "Default"}\n`);

    logHeader("📝 Step 1: Creating Cancel Transaction...");
    const cancelTransaction = await cancelClearing(
      bondContractId,
      holderAccountId,
      clearingId,
      operationType,
      partition,
      format,
    );

    logHeader("✍️  Step 2: Signing Transaction...");
    const signedCancelTx = await signTransaction(cancelTransaction.unsignedTx);
    logSuccess("Cancel transaction signed successfully!");

    logHeader("📤 Step 3: Publishing Transaction...");
    await publishSignedTransaction(signedCancelTx);
    logSuccess("Cancel transaction published to message queue");

    log("\n⏳ Waiting for clearing cancelation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("✅ Step 4: Verifying Clearing Cancelation...");
    await verifyClearingCanceled(bondContractId, holderAccountId, clearingId, operationType);

    logHeader("🎉 Cancel Clearing Operation Completed!");
    logSuccess(`Clearing ${clearingId} canceled for holder: ${holderAccountId}`);
    logSuccess(`Operation type: ${operationType}`);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID is correct");
    logError("   • Verify CLEARING_ID exists and is in the correct status");
    logError("   • Ensure you have permission to cancel this clearing");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cancelClearing, verifyClearingCanceled };
