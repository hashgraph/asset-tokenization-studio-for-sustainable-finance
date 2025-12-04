/**
 * Fully Automated Get Primary Market Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Gets the Primary Market details
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market.js
 */

const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION } = require("../shared/test-config");
const { deployPrimaryMarket } = require("./deploy-primary-market");
const { waitForPrimaryMarketDeployment } = require("./get-latest-primary-market");

/**
 * Get primary market details
 * @param {string} marketContractId - The primary market contract ID
 * @returns {Promise<Object>} The primary market details
 */
async function getPrimaryMarket(marketContractId) {
  logHeader(`🔍 Getting Primary Market Details...`);

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}`;
    const response = await gatewayClient.get(endpoint);

    logSuccess(`✅ Primary Market retrieved successfully!`);
    logInfo(`Contract ID: ${response.data.contractId}`);
    logInfo(`Is Paused: ${response.data.isPaused}`);
    logInfo(`Created At: ${response.data.createdAt}`);
    log("");

    return response.data;
  } catch (error) {
    logError(`Failed to get primary market: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 AUTOMATED GET PRIMARY MARKET SCRIPT");
    log("=====================================\n", colors.cyan);

    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }

    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);

    // Configuration parameters
    const resolverContractId = RESOLVER_CONTRACT_ID;
    const configVersion = CONFIG_VERSION;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    log("");

    // ============================================
    // Step 1: Deploy Primary Market
    // ============================================
    logHeader("Step 1: Deploy Primary Market");
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

    logHeader("🔐 Signing deployment transaction...");
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Deployment transaction signed successfully!");

    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Primary Market",
      resolverContractId: resolverContractId,
      configVersion: configVersion,
    });

    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logSuccess(`✅ Primary Market deployed: ${marketContractId}`);
    log("");

    // ============================================
    // Step 2: Get Primary Market Details
    // ============================================
    logHeader("Step 2: Get Primary Market Details");
    const primaryMarket = await getPrimaryMarket(marketContractId);

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET PRIMARY MARKET COMPLETED!");
    log("=====================================", colors.green);
    log(`Contract ID: ${primaryMarket.contractId}`, colors.green);
    log(`Is Paused: ${primaryMarket.isPaused}`, colors.green);
    log(`Created At: ${primaryMarket.createdAt}`, colors.green);
    log("\n✅ Successfully retrieved primary market details!\n", colors.green);
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
  getPrimaryMarket,
};
