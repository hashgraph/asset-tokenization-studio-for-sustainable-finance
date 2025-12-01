const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../../shared/lib/logger");
const { config } = require("../../../shared/lib/config");

async function getBondHolders(bondContractId, page = 1, limit = 10) {
  logHeader(`📋 Fetching Bond Holders...`);

  try {
    logInfo("Sending get bond holders request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page: page,
        limit: limit,
        sort: "totalBalance,desc", // Sort by total balance descending
      },
    });

    logSuccess(`Bond holders retrieved successfully!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);

    // Handle different response formats
    const data = response.data;
    if (data.meta) {
      logInfo(`Total holders: ${data.meta.totalItems}`);
      logInfo(`Page: ${data.meta.page}/${data.meta.totalPages}`);
    } else if (Array.isArray(data)) {
      logInfo(`Total holders: ${data.length}`);
    }

    return response.data;
  } catch (error) {
    logError(`Failed to get bond holders: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Display bond holders in a formatted table
 */
function displayHolders(holders) {
  if (!holders || holders.length === 0) {
    logInfo("No holders found");
    return;
  }

  logHeader("📊 Bond Holders:");
  log("");

  holders.forEach((holder, index) => {
    log(`${index + 1}. Holder Account: ${holder.holderAccountId}`, colors.cyan);
    log(`   Total Balance: ${holder.totalBalance || 0}`, colors.white);
    log(`   Available Balance: ${holder.availableBalance || 0}`, colors.green);
    log(`   Locked Balance: ${holder.lockedBalance || 0}`, colors.yellow);
    log(`   On Hold Balance: ${holder.onHoldBalance || 0}`, colors.yellow);
    log("");
  });
}

async function main() {
  try {
    logHeader("🚀 GET BOND HOLDERS SCRIPT");
    log("=====================================\n", colors.cyan);

    // Configuration parameters
    const bondContractId = process.argv[2] || process.env.BOND_CONTRACT_ID;
    const page = parseInt(process.env.PAGE || "1");
    const limit = parseInt(process.env.LIMIT || "10");

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required");
      logInfo("Usage: node get-bond-holders.js <BOND_CONTRACT_ID>");
      logInfo("Or set BOND_CONTRACT_ID in your .env file");
      process.exit(1);
    }

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Page: ${page}`);
    logInfo(`Limit: ${limit}`);
    log("");

    // Get bond holders
    const result = await getBondHolders(bondContractId, page, limit);

    // Display holders
    const items = result.items || result;
    displayHolders(items);

    // Display pagination info
    if (result.meta && result.meta.totalPages > 1) {
      logInfo(`Showing page ${result.meta.page} of ${result.meta.totalPages}`);
      logInfo(`Total items: ${result.meta.totalItems}`);

      if (result.meta.page < result.meta.totalPages) {
        logInfo(`💡 Tip: To see the next page, set PAGE=${result.meta.page + 1}`);
      }
    }

    logHeader("✅ Get Bond Holders Completed!");
    logInfo("💡 Tip: Use get-holder-balances.js to see detailed balance info for a specific holder");
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
  getBondHolders,
  displayHolders,
};
