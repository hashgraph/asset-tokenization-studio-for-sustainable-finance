const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../../shared/lib/logger");
const { config } = require("../../../shared/lib/config");

async function getHolderBalances(bondContractId, holderAccountId, page = 1, limit = 10) {
  logHeader(`📋 Fetching Holder Balances...`);

  try {
    logInfo("Sending get holder balances request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/balances`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page: page,
        limit: limit,
      },
    });

    logSuccess(`Holder balances retrieved successfully!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);

    // Handle different response formats
    const data = response.data;
    if (data.meta) {
      logInfo(`Total partitions: ${data.meta.totalItems}`);
      logInfo(`Page: ${data.meta.page}/${data.meta.totalPages}`);
    } else if (Array.isArray(data)) {
      logInfo(`Total partitions: ${data.length}`);
    }

    return response.data;
  } catch (error) {
    logError(`Failed to get holder balances: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Display holder balances in a formatted table
 */
function displayBalances(balances) {
  if (!balances || balances.length === 0) {
    logInfo("No balances found for this holder");
    return;
  }

  logHeader("📊 Holder Balances by Partition:");
  log("");

  balances.forEach((balance, index) => {
    log(`${index + 1}. Partition: ${balance.partition}`, colors.cyan);
    log(`   Total Balance: ${balance.totalBalance || 0}`, colors.white);
    log(`   Available Balance: ${balance.availableBalance || 0}`, colors.green);
    log(`   Locked Balance: ${balance.lockedBalance || 0}`, colors.yellow);
    log(`   On Hold Balance: ${balance.onHoldBalance || 0}`, colors.yellow);

    // Calculate percentages
    const total = parseInt(balance.totalBalance || 0);
    if (total > 0) {
      const availablePercent = ((parseInt(balance.availableBalance || 0) / total) * 100).toFixed(2);
      const lockedPercent = ((parseInt(balance.lockedBalance || 0) / total) * 100).toFixed(2);
      const holdPercent = ((parseInt(balance.onHoldBalance || 0) / total) * 100).toFixed(2);

      log(
        `   Distribution: ${availablePercent}% available, ${lockedPercent}% locked, ${holdPercent}% on hold`,
        colors.dim,
      );
    }

    log("");
  });
}

async function main() {
  try {
    logHeader("🚀 GET HOLDER BALANCES SCRIPT");
    log("=====================================\n", colors.cyan);

    // Configuration parameters
    const bondContractId = process.argv[2] || process.env.BOND_CONTRACT_ID;
    const holderAccountId = process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const page = parseInt(process.env.PAGE || "1");
    const limit = parseInt(process.env.LIMIT || "10");

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required");
      logInfo("Usage: node get-holder-balances.js <BOND_CONTRACT_ID>");
      logInfo("Or set BOND_CONTRACT_ID in your .env file");
      process.exit(1);
    }

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID or ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Page: ${page}`);
    logInfo(`Limit: ${limit}`);
    log("");

    // Get holder balances
    const result = await getHolderBalances(bondContractId, holderAccountId, page, limit);

    // Display balances
    const items = result.items || result;
    displayBalances(items);

    // Display summary
    if (items && items.length > 0) {
      const totalAcrossPartitions = items.reduce((sum, b) => sum + parseInt(b.totalBalance || 0), 0);
      const availableAcrossPartitions = items.reduce((sum, b) => sum + parseInt(b.availableBalance || 0), 0);
      const lockedAcrossPartitions = items.reduce((sum, b) => sum + parseInt(b.lockedBalance || 0), 0);
      const holdAcrossPartitions = items.reduce((sum, b) => sum + parseInt(b.onHoldBalance || 0), 0);

      logHeader("📈 Summary Across All Partitions:");
      log(`   Total: ${totalAcrossPartitions}`, colors.white);
      log(`   Available: ${availableAcrossPartitions}`, colors.green);
      log(`   Locked: ${lockedAcrossPartitions}`, colors.yellow);
      log(`   On Hold: ${holdAcrossPartitions}`, colors.yellow);
      log("");
    }

    // Display pagination info
    if (result.meta && result.meta.totalPages > 1) {
      logInfo(`Showing page ${result.meta.page} of ${result.meta.totalPages}`);
      logInfo(`Total partitions: ${result.meta.totalItems}`);

      if (result.meta.page < result.meta.totalPages) {
        logInfo(`💡 Tip: To see the next page, set PAGE=${result.meta.page + 1}`);
      }
    }

    logHeader("✅ Get Holder Balances Completed!");
    logInfo("💡 Tip: Use get-bond-locks.js to see active locks on this holder's balance");
    logInfo("💡 Tip: Use get-bond-holds.js to see active holds on this holder's balance");
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  getHolderBalances,
  displayBalances,
};
