const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { gatewayClient } = require("../../../shared/lib/gateway-client");

async function getBondLock(bondContractId, holderAccountId, lockId) {
  log(`\n🔒 Fetching lock ${lockId} for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks/${lockId}`,
    );

    if (response.data) {
      const lock = response.data;

      logSuccess("Lock details retrieved successfully!");
      log(`\n📋 Lock Information:`, colors.cyan);
      logInfo(`  • Lock ID: ${lock.id}`);
      logInfo(`  • Contract ID: ${lock.bondContractId}`);
      logInfo(`  • Holder Account ID: ${lock.holderAccountId}`);
      logInfo(`  • Partition: ${lock.partition || "Default"}`);
      logInfo(`  • Amount: ${lock.amount}`);
      logInfo(`  • Expiration Timestamp: ${new Date(lock.expirationTimestamp).toISOString()}`);
      logInfo(`  • Operator Account ID: ${lock.operatorAccountId}`);
      logInfo(`  • Created At: ${new Date(lock.createdAt).toISOString()}`);
      logInfo(`  • Updated At: ${new Date(lock.updatedAt).toISOString()}`);

      // Check if lock is expired
      const now = Date.now();
      const expirationDate = new Date(lock.expirationTimestamp).getTime();
      const isExpired = now > expirationDate;

      if (isExpired) {
        log(`\n⚠️  Lock Status: EXPIRED`, colors.yellow);
        logInfo(`    Expired ${Math.floor((now - expirationDate) / 1000 / 60)} minutes ago`);
      } else {
        log(`\n✅ Lock Status: ACTIVE`, colors.green);
        logInfo(`    Expires in ${Math.floor((expirationDate - now) / 1000 / 60)} minutes`);
      }

      return lock;
    } else {
      logError("Lock not found");
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch lock: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    logHeader("🔒 Evercity Get Bond Lock");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    // Parse command line arguments (format: key=value)
    const args = {};
    process.argv.slice(2).forEach((arg) => {
      const [key, value] = arg.split("=");
      if (key && value) {
        args[key] = value;
      }
    });

    // Configure these values (prioritize command line args, then env vars)
    const bondContractId = args.BOND_CONTRACT_ID || process.env.BOND_CONTRACT_ID;
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const lockId = args.LOCK_ID || process.env.LOCK_ID;

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required. Set it in .env, as environment variable, or as argument");
      logError("Example: node scripts/ats/bond/lock/get-bond-lock.js LOCK_ID=1");
      process.exit(1);
    }

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env, as environment variable, or as argument");
      logError("Example: node scripts/ats/bond/lock/get-bond-lock.js HOLDER_ACCOUNT_ID=0.0.xxxxx LOCK_ID=1");
      process.exit(1);
    }

    if (!lockId) {
      logError("LOCK_ID is required. Set it as environment variable or as argument");
      logError("Example: node scripts/ats/bond/lock/get-bond-lock.js LOCK_ID=1");
      process.exit(1);
    }

    log(`\n🎯 Target Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Lock ID: ${lockId}\n`);

    const lock = await getBondLock(bondContractId, holderAccountId, parseInt(lockId));

    if (lock) {
      logHeader("\n✅ Operation Completed Successfully!");
      logSuccess(`Retrieved lock ID: ${lock.id}`);
    }
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID is correct");
    logError("   • Verify LOCK_ID exists for this holder");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getBondLock };
