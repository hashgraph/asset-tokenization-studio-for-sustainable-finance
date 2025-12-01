const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { config } = require("../../../shared/lib/config");

async function releaseHold(format, bondContractId, holderAccountId, holdId, partition, amount) {
  logHeader(`📋 Releasing Bond Hold in ${format.toUpperCase()} Bond...`);

  const releaseHoldRequest = {
    partition: partition,
    amount: amount,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending release hold request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds/${holdId}`;
    const response = await gatewayClient.delete(endpoint, { data: releaseHoldRequest });

    logSuccess(`${format.toUpperCase()} Release hold transaction created!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Hold ID: ${holdId}`);
    logInfo(`Partition: ${partition}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...releaseHoldRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to release hold transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Get all holds for a holder to find the partition of a specific hold
 */
async function getHoldPartition(bondContractId, holderAccountId, holdId) {
  try {
    logInfo(`🔍 Looking up hold ${holdId} to get its partition...`);
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/holders/${holderAccountId}/holds`;
    const response = await gatewayClient.get(endpoint);

    if (!response.data?.items || response.data.items.length === 0) {
      throw new Error("No holds found for this holder");
    }

    const hold = response.data.items.find((h) => h.id === holdId);
    if (!hold) {
      throw new Error(`Hold with ID ${holdId} not found. Available holds: ${response.data.items.map((h) => h.id).join(", ")}`);
    }

    logSuccess(`Found hold ${holdId} with partition: ${hold.partition}`);
    return hold;
  } catch (error) {
    logError(`Failed to get hold information: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    logHeader("🚀 RELEASE BOND HOLD SCRIPT");
    log("=====================================\n", colors.cyan);

    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }

    if (!process.env.ACCOUNT_ID) {
      logError("ACCOUNT_ID not found in environment variables");
      logInfo("Please set ACCOUNT_ID in your .env file");
      process.exit(1);
    }

    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);

    // Configuration parameters
    const bondContractId = process.argv[2] || process.env.BOND_CONTRACT_ID;
    const holderAccountId = process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const holdId = parseInt(process.env.HOLD_ID || "1");

    if (!bondContractId) {
      logError("BOND_CONTRACT_ID is required");
      logInfo("Usage: node release-hold.js <BOND_CONTRACT_ID>");
      logInfo("Or set BOND_CONTRACT_ID in your .env file");
      process.exit(1);
    }

    // First, get the hold to retrieve its partition automatically
    const hold = await getHoldPartition(bondContractId, holderAccountId, holdId);
    const partition = process.env.PARTITION || hold.partition; // Allow manual override but default to actual partition
    const amount = process.env.AMOUNT || hold.amount; // Default to the hold's full amount

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Hold ID: ${holdId}`);
    logInfo(`Partition: ${partition}`);
    logInfo(`Amount: ${amount}`);
    log("");

    // Release hold
    const releaseHoldTx = await releaseHold(format, bondContractId, holderAccountId, holdId, partition, amount);

    logHeader("🔐 Signing transaction...");
    const signedTx = await signTransaction(releaseHoldTx.unsignedTx);
    logSuccess("Transaction signed successfully!");
    logInfo(`Signed Tx: ${signedTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedTx, {
      description: "Release Bond Hold",
      bondContractId: bondContractId,
      holderAccountId: holderAccountId,
      holdId: holdId,
      amount: amount,
    });

    logHeader("✅ Release Bond Hold Completed!");
    log("The bond hold has been released successfully.", colors.green);
    log("The held tokens have been returned to the holder's available balance.", colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Holder Account ID: ${holderAccountId}`, colors.green);
    log(`Hold ID: ${holdId}`, colors.green);
    log(`Amount Released: ${amount}\n`, colors.green);

    logInfo("💡 Tip: Use get-holder-balances.js to see the updated balances");
    logInfo("💡 Tip: Use get-bond-holds.js to verify the hold is no longer active");
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
  releaseHold,
};
