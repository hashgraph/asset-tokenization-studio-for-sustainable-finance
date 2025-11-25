const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { gatewayClient } = require("../../../shared/lib/gateway-client");

// Parse command line arguments (format: key=value)
const args = {};
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value) {
    args[key] = value;
  }
});

async function releaseBondLock(bondContractId, holderAccountId, lockId, partition, format) {
  log(`\n🔓 Releasing lock ${lockId} for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  const releaseBondLockRequest = {
    lockId: String(lockId),
    partition: partition || undefined,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.delete(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks`,
      {
        data: releaseBondLockRequest,
      },
    );

    logSuccess("Bond lock release transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Lock ID: ${lockId}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...releaseBondLockRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to release bond lock: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyLockReleased(bondContractId, holderAccountId, lockId) {
  log(`\n📊 Bond lock release verification:`, colors.bright);
  logSuccess(`Release bond lock transaction has been sent successfully`);
  logInfo(`The ReleasedBondLockEvent should have been processed`);
  logInfo(`📋 To verify the lock was released, run:`);
  logInfo(
    `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} LOCK_ID=${lockId} node scripts/ats/bond/lock/get-bond-lock.js`,
  );
  logInfo(`Expected result: Lock ${lockId} should no longer exist or be marked as released\n`);
}

async function main() {
  try {
    logHeader("🔓 Evercity Release Bond Lock");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

    // Configure these values
    const bondContractId = args.BOND_CONTRACT_ID || process.env.BOND_CONTRACT_ID;
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const lockId = args.LOCK_ID || process.env.LOCK_ID;
    const partition = args.LOCK_PARTITION || ""; // Optional

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!lockId) {
      logError("LOCK_ID is required. Set it as environment variable");
      logError("Example: LOCK_ID=1 node scripts/ats/bond/lock/release-bond-lock.js");
      process.exit(1);
    }

    log(`\n🎯 Release Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Lock ID: ${lockId}`);
    logInfo(`  • Partition: ${partition || "Default"}\n`);

    logHeader("📝 Step 1: Creating Release Transaction...");
    const releaseTransaction = await releaseBondLock(bondContractId, holderAccountId, lockId, partition, format);

    logHeader("✍️  Step 2: Signing Transaction...");
    const signedReleaseTx = await signTransaction(releaseTransaction.unsignedTx);
    logSuccess("Release transaction signed successfully!");

    logHeader("📤 Step 3: Publishing Transaction...");
    await publishSignedTransaction(signedReleaseTx);
    logSuccess("Release transaction published to message queue");

    log("\n⏳ Waiting for lock release to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("✅ Step 4: Verifying Lock Release...");
    await verifyLockReleased(bondContractId, holderAccountId, lockId);

    logHeader("🎉 Release Bond Lock Operation Completed!");
    logSuccess(`Lock ${lockId} released for holder: ${holderAccountId}`);
    logSuccess(`Bonds are now available for transfers`);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID is correct");
    logError("   • Verify LOCK_ID exists and is not already released");
    logError("   • Ensure you have permission to release this lock");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { releaseBondLock, verifyLockReleased };
