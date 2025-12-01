/**
 * Fully Automated Get Subscriptions By Investor Script
 *
 * This script performs the complete flow and then retrieves all subscriptions for a specific investor:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Approves token allowance for the Primary Market
 * 4. Grants OFFERING_CREATOR_ROLE
 * 5. Creates multiple offerings
 * 6. Waits for offerings to be OPEN
 * 7. Submits subscriptions to different offerings
 * 8. Waits for subscriptions to be created
 * 9. Gets all subscriptions for the investor (paginated)
 *
 * Usage: node scripts/primary-market/subscription/get-subscriptions-by-investor.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { deployPrimaryMarket } = require('../primarymarket/deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');
const { createOffering } = require('../offering/offering-service');
const { waitForOfferingCreation } = require('../offering/create-offering');
const { deployHTSToken, approveTokenAllowance } = require('../offering/hts-token-service');

// Primary Market Roles
const OFFERING_CREATOR_ROLE = '0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a';

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
async function waitForOfferingStatus(marketContractId, offeringId, expectedStatus, maxAttempts = 60, intervalMs = 2000) {
  logInfo(`⏳ Waiting for offering ${offeringId} to reach status: ${expectedStatus}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const offering = await getOffering(marketContractId, offeringId);
    
    if (offering.status === expectedStatus) {
      logSuccess(`✅ Offering ${offeringId} status is now: ${expectedStatus}`);
      return offering;
    }
    
    if (attempt % 10 === 0) {
      logInfo(`Attempt ${attempt}/${maxAttempts}: Current status is ${offering.status}, waiting for ${expectedStatus}...`);
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
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
    lotUnits: lotUnits.toString()
  };
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const response = await gatewayClient.post(endpoint, subscriptionRequest);
    
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
 * Get all subscriptions for a specific investor (paginated)
 * @param {string} investorAccountId - The investor account ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Paginated subscriptions response
 */
async function getSubscriptionsByInvestor(investorAccountId, options = {}) {
  logHeader(`🔍 Getting All Subscriptions for Investor...`);
  
  const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/investors/${investorAccountId}/subscriptions`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Subscriptions retrieved successfully!`);
    logInfo(`Investor Account ID: ${investorAccountId}`);
    logInfo(`Total Items: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Subscriptions on this page: ${response.data.items.length}`);
    log('');
    
    // Display each subscription
    response.data.items.forEach((subscription, index) => {
      log(`Subscription #${index + 1}:`, colors.cyan);
      logInfo(`  ID: ${subscription.id}`);
      logInfo(`  Offering ID: ${subscription.offeringId}`);
      logInfo(`  Investor Account ID: ${subscription.investorAccountId}`);
      logInfo(`  Lot Units: ${subscription.lotUnits}`);
      logInfo(`  Status: ${subscription.status}`);
      logInfo(`  Created At: ${subscription.createdAt}`);
      log('');
    });
    
    return response.data;
  } catch (error) {
    logError(`Failed to get subscriptions by investor: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Grant OFFERING_CREATOR_ROLE to a user
 */
async function grantOfferingCreatorRole(format, marketContractId, userAccountId) {
  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${OFFERING_CREATOR_ROLE}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    return { ...grantRoleRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create grant role transaction: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET SUBSCRIPTIONS BY INVESTOR SCRIPT');
    log('=====================================\n', colors.cyan);
    
    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }
    
    if (!process.env.ACCOUNT_ID) {
      logError('ACCOUNT_ID not found in environment variables');
      logInfo('Please set ACCOUNT_ID in your .env file');
      process.exit(1);
    }
    
    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);
    
    // Configuration parameters
    const resolverContractId = '0.0.7352465';
    const configVersion = 0;
    const bondContractId = '0.0.7319744';
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`User Account ID (Investor): ${userAccountId}`);
    log('');

    // ============================================
    // Step 1: Deploy HTS Payment Token
    // ============================================
    logHeader('Step 1: Deploy HTS Payment Token');
    const { tokenId } = await deployHTSToken(
      'Investor Subscriptions Token',
      'ISTS',
      6,
      1_000_000_000_000
    );
    logSuccess(`✅ HTS Token deployed: ${tokenId}`);
    log('');

    // ============================================
    // Step 2: Deploy Primary Market
    // ============================================
    logHeader('Step 2: Deploy Primary Market');
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

    logHeader('🔐 Signing deployment transaction...');
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess('Deployment transaction signed successfully!');

    await publishSignedTransaction(signedDeploymentTx, {
      description: 'Deploy Primary Market',
    });

    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logSuccess(`✅ Primary Market deployed: ${marketContractId}`);
    log('');

    // ============================================
    // Step 3: Approve Token Allowance
    // ============================================
    logHeader('Step 3: Approve Token Allowance for Primary Market');
    await approveTokenAllowance(tokenId, marketContractId);
    logSuccess(`✅ Primary Market can now spend tokens!`);
    log('');

    // ============================================
    // Step 4: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader('Step 4: Grant OFFERING_CREATOR_ROLE');
    const grantRoleTx = await grantOfferingCreatorRole(format, marketContractId, userAccountId);

    logHeader('🔐 Signing grant role transaction...');
    const signedGrantRoleTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess('Grant role transaction signed successfully!');

    await publishSignedTransaction(signedGrantRoleTx, {
      description: 'Grant OFFERING_CREATOR_ROLE',
    });

    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log('');

    // ============================================
    // Step 5: Create Multiple Offerings
    // ============================================
    logHeader('Step 5: Create Multiple Offerings');
    const now = Date.now();
    const offeringIds = [];
    const numberOfOfferings = 3;
    
    for (let i = 0; i < numberOfOfferings; i++) {
      logInfo(`Creating offering ${i + 1}/${numberOfOfferings}...`);
      
      const offeringParams = {
        treasuryContractId: '0.0.7319745',
        paymentTokenContractId: tokenId,
        lotSize: '1000',
        minLots: '1',
        maxLots: '50',
        targetLots: '1000',
        targetQuantityRule: 0,
        startDate: new Date(now + 60000 + (i * 10000)), // Stagger start times
        endDate: new Date(now + 180000 + (i * 10000)),
        deadlineRule: 0,
        price: '0',
        priceDecimals: 2,
      };

      const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);
      const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);

      await publishSignedTransaction(signedCreateOfferingTx, {
        description: `Create Offering ${i + 1}`,
      });

      const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
      offeringIds.push(createdOffering.id);
      logSuccess(`✅ Offering ${i + 1} created: ID ${createdOffering.id}`);
    }
    log('');

    // ============================================
    // Step 6: Wait for all offerings to be OPEN
    // ============================================
    logHeader('Step 6: Wait for all offerings to be OPEN');
    for (const offeringId of offeringIds) {
      await waitForOfferingStatus(marketContractId, offeringId, 'OPEN');
    }
    logSuccess(`✅ All offerings are now OPEN and ready for subscriptions`);
    log('');

    // ============================================
    // Step 7: Submit Subscriptions to Different Offerings
    // ============================================
    logHeader('Step 7: Submit Subscriptions to Different Offerings');
    const subscriptionDetails = [
      { offeringId: offeringIds[0], lotUnits: 5 },
      { offeringId: offeringIds[0], lotUnits: 10 },
      { offeringId: offeringIds[1], lotUnits: 15 },
      { offeringId: offeringIds[2], lotUnits: 20 },
    ];
    
    for (let i = 0; i < subscriptionDetails.length; i++) {
      const { offeringId, lotUnits } = subscriptionDetails[i];
      logInfo(`Creating subscription ${i + 1}/${subscriptionDetails.length} - Offering ${offeringId}, ${lotUnits} lots...`);
      
      const submitSubscriptionTx = await submitSubscription(format, marketContractId, offeringId, lotUnits);
      const signedSubmitSubscriptionTx = await signTransaction(submitSubscriptionTx.unsignedTx);
      
      await publishSignedTransaction(signedSubmitSubscriptionTx, {
        description: `Submit Subscription ${i + 1}`,
      });
    }
    
    logSuccess(`✅ All ${subscriptionDetails.length} subscriptions submitted!`);
    log('');

    // ============================================
    // Step 8: Wait for subscriptions to be processed
    // ============================================
    logHeader('Step 8: Wait for subscriptions to be processed');
    logInfo(`⏳ Waiting 15 seconds for all subscriptions to be processed...`);
    await new Promise(resolve => setTimeout(resolve, 15000));
    logSuccess(`✅ Subscriptions should now be in the database`);
    log('');

    // ============================================
    // Step 9: Get All Subscriptions By Investor (Paginated)
    // ============================================
    logHeader('Step 9: Get All Subscriptions By Investor');
    
    // Get first page
    const firstPage = await getSubscriptionsByInvestor(userAccountId, {
      page: 1,
      limit: 2,
      orderBy: 'createdAt',
      order: 'desc'
    });

    // If there are more pages, get second page
    if (firstPage.totalPages > 1) {
      logHeader('Getting Second Page...');
      await getSubscriptionsByInvestor(userAccountId, {
        page: 2,
        limit: 2,
        orderBy: 'createdAt',
        order: 'desc'
      });
    }

    // Get all subscriptions in one page
    logHeader('Getting All Subscriptions (No Pagination)...');
    const allSubscriptions = await getSubscriptionsByInvestor(userAccountId, {
      page: 1,
      limit: 100,
      orderBy: 'offeringId',
      order: 'asc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET SUBSCRIPTIONS BY INVESTOR COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Investor Account ID: ${userAccountId}`, colors.green);
    log(`Offerings Created: ${offeringIds.join(', ')}`, colors.green);
    log(`Total Subscriptions: ${allSubscriptions.total}`, colors.green);
    log(`Subscriptions Details:`, colors.green);
    subscriptionDetails.forEach((detail, idx) => {
      log(`  ${idx + 1}. Offering ${detail.offeringId}: ${detail.lotUnits} lots`, colors.green);
    });
    log('\n✅ Successfully retrieved all subscriptions by investor!\n', colors.green);
    
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
  getSubscriptionsByInvestor,
};
