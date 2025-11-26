const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { gatewayClient } = require("../../../shared/lib/gateway-client");

// Parse command line arguments (format: key=value)
const args = {};
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value) {
    args[key] = value;
  }
});

async function getBondLocks(bondContractId, holderAccountId, limit = 10, page = 1) {
  log(`\n🔒 Fetching locks for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/locks?limit=${limit}&page=${page}`,
    );

    if (response.data && response.data.items) {
      const locks = response.data.items;

      logSuccess(`Found ${locks.length} lock(s)`);
      logInfo(`\nPagination Info:`);
      logInfo(`  • Page: ${response.data.page} of ${response.data.totalPages}`);
      logInfo(`  • Total locks: ${response.data.total}`);
      logInfo(`  • Items per page: ${response.data.limit}`);

      if (locks.length > 0) {
        log(`\n📋 Lock Details:`, colors.cyan);
        locks.forEach((lock, index) => {
          log(`\n  Lock ${index + 1}:`, colors.bright);
          logInfo(`    • Lock ID: ${lock.id}`);
          logInfo(`    • Contract ID: ${lock.contractId}`);
          logInfo(`    • Holder Account ID: ${lock.holderAccountId}`);
          logInfo(`    • Partition: ${lock.partition || "Default"}`);
          logInfo(`    • Amount: ${lock.amount}`);
          logInfo(`    • Expiration: ${new Date(lock.expirationTimestamp).toISOString()}`);
          logInfo(`    • Operator: ${lock.operatorAccountId}`);
          logInfo(`    • Created At: ${new Date(lock.createdAt).toISOString()}`);
        });
      }

      return response.data;
    } else {
      logInfo("No locks found for this holder");
      return { items: [], total: 0 };
    }
  } catch (error) {
    logError(`Failed to fetch bond locks: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    logHeader("🔒 Evercity Get Bond Locks");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    // Configure these values (prioritize command line args, then env vars)
    const bondContractId = args.BOND_CONTRACT_ID || process.env.BOND_CONTRACT_ID;
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const limit = parseInt(args.LIMIT || process.env.LIMIT) || 10;
    const page = parseInt(args.PAGE || process.env.PAGE) || 1;

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required. Set it in .env, as environment variable, or as argument");
      logError("Example: node scripts/ats/bond/lock/get-bond-locks.js BOND_CONTRACT_ID=0.0.xxxxx");
      process.exit(1);
    }

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env, as environment variable, or as argument");
      logError(
        "Example: node scripts/ats/bond/lock/get-bond-locks.js BOND_CONTRACT_ID=0.0.xxxxx HOLDER_ACCOUNT_ID=0.0.xxxxx",
      );
      process.exit(1);
    }

    log(`\n🎯 Target Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Limit: ${limit}`);
    logInfo(`  • Page: ${page}\n`);

    const result = await getBondLocks(bondContractId, holderAccountId, limit, page);

    logHeader("\n✅ Operation Completed Successfully!");
    logSuccess(`Retrieved ${result.items?.length || 0} lock(s)`);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID is correct");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getBondLocks };
