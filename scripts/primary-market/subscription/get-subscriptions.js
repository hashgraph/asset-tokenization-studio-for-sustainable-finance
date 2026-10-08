/**
 * Fully Automated Get Subscriptions Script
 *
 * This script performs the complete flow and then retrieves all subscriptions for an offering:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Approves token allowance for the Primary Market
 * 4. Grants OFFERING_CREATOR_ROLE
 * 5. Creates an offering
 * 6. Waits for offering to be OPEN
 * 7. Submits multiple subscriptions
 * 8. Waits for subscriptions to be created
 * 9. Gets all subscriptions for the offering (paginated)
 *
 * Usage: node scripts/primary-market/subscription/get-subscriptions.js
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
const { grantOfferingCreatorRole, OFFERING_CREATOR_ROLE } = require("../shared/role-service");
const { createOffering } = require("../offering/offering-service");
const { waitForOfferingCreation } = require("../offering/create-offering");
const { deployHTSToken, approveTokenAllowance } = require("../offering/hts-token-service");
const { deployPrimaryMarket } = require("../primarymarket/deploy-primary-market");
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require("../primarymarket/get-latest-primary-market");

/**
 * Get offering details from the database
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @returns {Promise<Object>} The offering details
 */
async function getOffering(marketContractId, offeringId) {
  try {
    const response = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch offering: ${error.message}`);
    throw error;
  }
}

/**
 * Wait for offering to reach a specific status
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {string} expectedStatus - The expected status to wait for
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 60)
 * @param {number} intervalMs - Interval between polls in milliseconds (default: 2000)
 * @returns {Promise<Object>} The offering with the expected status
 */
async function waitForOfferingStatus(
  marketContractId,
  offeringId,
  expectedStatus,
  maxAttempts = 60,
  intervalMs = 2000,
) {
  logInfo(`⏳ Waiting for offering to reach status: ${expectedStatus}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const offering = await getOffering(marketContractId, offeringId);

    if (offering.status === expectedStatus) {
      logSuccess(`✅ Offering status is now: ${expectedStatus}`);
      return offering;
    }

    logInfo(
      `Attempt ${attempt}/${maxAttempts}: Current status is ${offering.status}, waiting for ${expectedStatus}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timeout: Offering did not reach status ${expectedStatus} after ${maxAttempts} attempts`);
}

/**
 * Submit a subscription to an offering
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {string} lotUnits - The number of lot units to subscribe for
 * @returns {Promise<Object>} The submit subscription transaction details
 */
async function submitSubscription(format, marketContractId, offeringId, lotUnits) {
  const subscriptionRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    lotUnits: lotUnits.toString(),
  };

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const response = await gatewayClient.post(endpoint, subscriptionRequest);

    logInfo(`Subscription transaction created for ${lotUnits} lot units`);

    return { ...subscriptionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create subscription transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Get all subscriptions for an offering (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Paginated subscriptions response
 */
async function getSubscriptions(marketContractId, offeringId, options = {}) {
  logHeader(`🔍 Getting All Subscriptions for Offering...`);

  const { page = 1, limit = 10, orderBy = "createdAt", order = "desc" } = options;

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order,
      },
    });

    logSuccess(`✅ Subscriptions retrieved successfully!`);
    logInfo(`Total Items: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Subscriptions on this page: ${response.data.items.length}`);
    log("");

    // Display each subscription
    response.data.items.forEach((subscription, index) => {
      log(`Subscription #${index + 1}:`, colors.cyan);
      logInfo(`  ID: ${subscription.id}`);
      logInfo(`  Offering ID: ${subscription.offeringId}`);
      logInfo(`  Investor Account ID: ${subscription.investorAccountId}`);
      logInfo(`  Lot Units: ${subscription.lotUnits}`);
      logInfo(`  Status: ${subscription.status}`);
      logInfo(`  Created At: ${subscription.createdAt}`);
      log("");
    });

    return response.data;
  } catch (error) {
    logError(`Failed to get subscriptions: ${error.message}`);
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
    logHeader("🚀 AUTOMATED GET SUBSCRIPTIONS SCRIPT");
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
    // Step 1: Deploy HTS Payment Token
    // ============================================
    logHeader("Step 1: Deploy HTS Payment Token");
    const { tokenId, evmAddress: paymentTokenAddress } = await deployHTSToken(
      "Get Subscriptions Token",
      "GSTS",
      6,
      1_000_000_000_000,
    );
    const paymentTokenContractId = tokenId;
    logSuccess(`✅ HTS Token deployed: ${tokenId}`);
    log("");

    // ============================================
    // Step 2: Deploy Primary Market
    // ============================================
    logHeader("Step 2: Deploy Primary Market");
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

    logHeader("🔐 Signing deployment transaction...");
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Deployment transaction signed successfully!");

    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Primary Market",
    });

    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logSuccess(`✅ Primary Market deployed: ${marketContractId}`);
    log("");

    // ============================================
    // Step 3: Approve Token Allowance
    // ============================================
    logHeader("Step 3: Approve Token Allowance for Primary Market");
    await approveTokenAllowance(tokenId, marketContractId);
    logSuccess(`✅ Primary Market can now spend tokens!`);
    log("");

    // ============================================
    // Step 4: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader("Step 4: Grant OFFERING_CREATOR_ROLE");
    const grantRoleTx = await grantOfferingCreatorRole(format, marketContractId, userAccountId);

    logHeader("🔐 Signing grant role transaction...");
    const signedGrantRoleTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess("Grant role transaction signed successfully!");

    await publishSignedTransaction(signedGrantRoleTx, {
      description: "Grant OFFERING_CREATOR_ROLE",
    });

    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log("");

    // ============================================
    // Step 5: Create Offering
    // ============================================
    logHeader("Step 5: Create Offering");
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
      endDate: new Date(now + 120000),
      deadlineRule: 0,
      price: "0",
      priceDecimals: 2,
    };

    logInfo(`Offering will start in 1 minute and end in 2 minutes`);

    const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);

    logHeader("🔐 Signing create offering transaction...");
    const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);
    logSuccess("Create offering transaction signed successfully!");

    await publishSignedTransaction(signedCreateOfferingTx, {
      description: "Create Offering",
    });

    const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
    const offeringId = createdOffering.id;

    logSuccess(`✅ Offering created: ID ${offeringId}`);
    log("");

    // ============================================
    // Step 6: Wait for offering status to be OPEN
    // ============================================
    logHeader("Step 6: Wait for offering to be OPEN");
    await waitForOfferingStatus(marketContractId, offeringId, "OPEN");
    logSuccess(`✅ Offering is now OPEN and ready for subscriptions`);
    log("");

    // ============================================
    // Step 7: Submit Multiple Subscriptions
    // ============================================
    logHeader("Step 7: Submit Multiple Subscriptions");
    const subscriptionLots = [5, 10, 15, 20]; // Different lot units for each subscription

    for (let i = 0; i < subscriptionLots.length; i++) {
      const lotUnits = subscriptionLots[i];
      logInfo(`Creating subscription ${i + 1}/${subscriptionLots.length} with ${lotUnits} lot units...`);

      const submitSubscriptionTx = await submitSubscription(format, marketContractId, offeringId, lotUnits);
      const signedSubmitSubscriptionTx = await signTransaction(submitSubscriptionTx.unsignedTx);

      await publishSignedTransaction(signedSubmitSubscriptionTx, {
        description: `Submit Subscription #${i + 1}`,
      });
    }

    logSuccess(`✅ All ${subscriptionLots.length} subscriptions submitted!`);
    log("");

    // ============================================
    // Step 8: Wait for subscriptions to be processed
    // ============================================
    logHeader("Step 8: Wait for subscriptions to be processed");
    logInfo(`⏳ Waiting 15 seconds for all subscriptions to be processed...`);
    await new Promise((resolve) => setTimeout(resolve, 15000));
    logSuccess(`✅ Subscriptions should now be in the database`);
    log("");

    // ============================================
    // Step 9: Get All Subscriptions (Paginated)
    // ============================================
    logHeader("Step 9: Get All Subscriptions");

    // Get first page
    const firstPage = await getSubscriptions(marketContractId, offeringId, {
      page: 1,
      limit: 2,
      orderBy: "createdAt",
      order: "desc",
    });

    // If there are more pages, get second page
    if (firstPage.totalPages > 1) {
      logHeader("Getting Second Page...");
      await getSubscriptions(marketContractId, offeringId, {
        page: 2,
        limit: 2,
        orderBy: "createdAt",
        order: "desc",
      });
    }

    // Get all subscriptions in one page
    logHeader("Getting All Subscriptions (No Pagination)...");
    const allSubscriptions = await getSubscriptions(marketContractId, offeringId, {
      page: 1,
      limit: 100,
      orderBy: "lotUnits",
      order: "asc",
    });

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET SUBSCRIPTIONS COMPLETED!");
    log("=====================================", colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Offering ID: ${offeringId}`, colors.green);
    log(`Total Subscriptions: ${allSubscriptions.total}`, colors.green);
    log(`Subscriptions Created: ${subscriptionLots.join(", ")} lot units`, colors.green);
    log("\n✅ Successfully retrieved all subscriptions!\n", colors.green);
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
  getSubscriptions,
};
