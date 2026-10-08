/**
 * Fully Automated Get Offering Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Grants OFFERING_CREATOR_ROLE
 * 4. Creates an offering
 * 5. Gets the specific offering by ID
 *
 * Usage: node scripts/primary-market/offering/get-offering.js
 */

const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const {
  RESOLVER_CONTRACT_ID,
  CONFIG_VERSION,
  BOND_CONTRACT_ID,
  TREASURY_CONTRACT_ID,
} = require("../shared/test-config");
const { setupPrimaryMarketWithToken } = require("../shared/setup-service");
const { createOffering } = require("./offering-service");
const { waitForOfferingCreation } = require("./create-offering");

/**
 * Get a specific offering by ID
 * @param {string} marketContractId - The primary market contract ID
 * @param {number} offeringId - The offering ID
 * @returns {Promise<Object>} Offering response
 */
async function getOffering(marketContractId, offeringId) {
  logHeader(`🔍 Getting Offering...`);

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`;
    const response = await gatewayClient.get(endpoint);

    logSuccess(`✅ Offering retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Offering ID: ${response.data.id}`);
    log("");

    // Display offering details
    log("Offering Details:", colors.cyan);
    logInfo(`  ID: ${response.data.id}`);
    logInfo(`  Bond Contract ID: ${response.data.bondContractId}`);
    logInfo(`  Operator Account ID: ${response.data.operatorAccountId}`);
    logInfo(`  Treasury Contract ID: ${response.data.treasuryContractId}`);
    logInfo(`  Payment Token Contract ID: ${response.data.paymentTokenContractId}`);
    logInfo(`  Lot Size: ${response.data.lotSize}`);
    logInfo(`  Min Lots: ${response.data.minLots}`);
    logInfo(`  Max Lots: ${response.data.maxLots}`);
    logInfo(`  Target Lots: ${response.data.targetLots}`);
    logInfo(`  Target Quantity Rule: ${response.data.targetQuantityRule}`);
    logInfo(`  Start Date: ${response.data.startDate}`);
    logInfo(`  End Date: ${response.data.endDate}`);
    logInfo(`  Deadline Rule: ${response.data.deadlineRule}`);
    logInfo(`  Price: ${response.data.price}`);
    logInfo(`  Price Decimals: ${response.data.priceDecimals}`);
    logInfo(`  Status: ${response.data.status}`);
    logInfo(`  Created At: ${response.data.createdAt}`);
    log("");

    return response.data;
  } catch (error) {
    logError(`Failed to get offering: ${error.message}`);
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
    logHeader("🚀 AUTOMATED GET OFFERING SCRIPT");
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
    const resolverContractId = await RESOLVER_CONTRACT_ID;
    const configVersion = CONFIG_VERSION;
    const bondContractId = BOND_CONTRACT_ID;
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // ============================================
    // Steps 1-3: Setup Primary Market with Token and Role
    // ============================================
    const { marketContractId, tokenId } = await setupPrimaryMarketWithToken(
      format,
      resolverContractId,
      configVersion,
      userAccountId,
      { name: "Offering Token", symbol: "OFT", decimals: 6, initialSupply: 1_000_000_000_000 },
    );
    log("");

    // ============================================
    // Step 4: Create Offering
    // ============================================
    logHeader("Step 4: Create Offering");
    const now = Date.now();

    const offeringParams = {
      treasuryContractId: TREASURY_CONTRACT_ID,
      paymentTokenContractId: tokenId,
      lotSize: "1000",
      minLots: "1",
      maxLots: "50",
      targetLots: "1000",
      targetQuantityRule: 0,
      startDate: new Date(now + 60000),
      endDate: new Date(now + 180000),
      deadlineRule: 0,
      price: "0",
      priceDecimals: 2,
    };

    const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);
    const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);

    await publishSignedTransaction(signedCreateOfferingTx, {
      description: "Create Offering",
    });

    const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
    logSuccess(`✅ Offering created: ID ${createdOffering.id}`);
    log("");

    // ============================================
    // Step 5: Get Offering
    // ============================================
    logHeader("Step 5: Get Offering");
    const offering = await getOffering(marketContractId, createdOffering.id);

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET OFFERING COMPLETED!");
    log("=====================================", colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Offering ID: ${offering.id}`, colors.green);
    log(`Offering Status: ${offering.status}`, colors.green);
    log("\n✅ Successfully retrieved offering!\n", colors.green);
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
  getOffering,
};
