/**
 * Fully Automated Get Subscription Script
 *
 * This script performs the complete flow and then retrieves a specific subscription:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Approves token allowance for the Primary Market
 * 4. Grants OFFERING_CREATOR_ROLE
 * 5. Creates an offering
 * 6. Waits for offering to be OPEN
 * 7. Submits a subscription
 * 8. Waits for subscription to be created
 * 9. Gets the specific subscription by ID
 *
 * Usage: node scripts/primary-market/subscription/get-subscription.js
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
  logInfo(`⏳ Waiting for offering to reach status: ${expectedStatus}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const offering = await getOffering(marketContractId, offeringId);
    
    if (offering.status === expectedStatus) {
      logSuccess(`✅ Offering status is now: ${expectedStatus}`);
      return offering;
    }
    
    logInfo(`Attempt ${attempt}/${maxAttempts}: Current status is ${offering.status}, waiting for ${expectedStatus}...`);
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
  logHeader(`📋 Submitting subscription in ${format.toUpperCase()} Primary Market...`);
  
  const subscriptionRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    lotUnits: lotUnits.toString()
  };
  
  try {
    logInfo('Sending subscription request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`;
    const response = await gatewayClient.post(endpoint, subscriptionRequest);
    
    logSuccess(`${format.toUpperCase()} Subscription transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Offering ID: ${offeringId}`);
    logInfo(`Lot Units: ${lotUnits}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);
    
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
 * Get the latest subscription for an offering
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @returns {Promise<Object|null>} The latest subscription or null if not found
 */
async function getLatestSubscription(marketContractId, offeringId) {
  try {
    const response = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions`, {
      params: {
        page: 1,
        limit: 1,
        orderBy: 'createdAt',
        order: 'desc'
      }
    });
    
    if (response.data?.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    return null;
  } catch (error) {
    logError(`Failed to fetch subscriptions: ${error.message}`);
    throw error;
  }
}

/**
 * Wait for subscription to be created by polling the database
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {number} initialWaitMs - Initial wait time in milliseconds before querying (default: 15000)
 * @returns {Promise<Object>} The created subscription
 */
async function waitForSubscriptionCreation(marketContractId, offeringId, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for subscription transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`🔍 Fetching latest subscription from database...`);
  const latestSubscription = await getLatestSubscription(marketContractId, offeringId);
  
  if (!latestSubscription) {
    throw new Error('No subscription found in database after creation');
  }
  
  return latestSubscription;
}

/**
 * Get a specific subscription by ID
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {number} subscriptionId - The subscription ID
 * @returns {Promise<Object>} The subscription details
 */
async function getSubscription(marketContractId, offeringId, subscriptionId) {
  logHeader(`🔍 Getting Subscription by ID...`);
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions/${subscriptionId}`;
    const response = await gatewayClient.get(endpoint);
    
    logSuccess(`✅ Subscription retrieved successfully!`);
    logInfo(`Subscription ID: ${response.data.id}`);
    logInfo(`Offering ID: ${response.data.offeringId}`);
    logInfo(`Investor Account ID: ${response.data.investorAccountId}`);
    logInfo(`Lot Units: ${response.data.lotUnits}`);
    logInfo(`Status: ${response.data.status}`);
    logInfo(`Created At: ${response.data.createdAt}`);
    
    return response.data;
  } catch (error) {
    logError(`Failed to get subscription: ${error.message}`);
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
  logHeader(`🔐 Granting OFFERING_CREATOR_ROLE in ${format.toUpperCase()} Primary Market...`);

  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo('Sending grant role request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${OFFERING_CREATOR_ROLE}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    logSuccess(`${format.toUpperCase()} Grant OFFERING_CREATOR_ROLE transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Role ID: ${OFFERING_CREATOR_ROLE}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

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
    logHeader('🚀 AUTOMATED GET SUBSCRIPTION SCRIPT');
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
    logInfo(`User Account ID: ${userAccountId}`);
    log('');

    // ============================================
    // Step 1: Deploy HTS Payment Token
    // ============================================
    logHeader('Step 1: Deploy HTS Payment Token');
    const { tokenId, evmAddress: paymentTokenAddress } = await deployHTSToken(
      'Get Subscription Token',
      'GST',
      6,
      1_000_000_000_000
    );
    const paymentTokenContractId = tokenId;
    logSuccess(`✅ HTS Token deployed: ${tokenId}`);
    logSuccess(`✅ Contract ID: ${paymentTokenContractId}`);
    logSuccess(`✅ EVM Address: ${paymentTokenAddress}`);
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
      resolverContractId: resolverContractId,
      configVersion: configVersion,
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
      marketContractId: marketContractId,
      userAccountId: userAccountId,
      roleId: OFFERING_CREATOR_ROLE,
    });

    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log('');

    // ============================================
    // Step 5: Create Offering
    // ============================================
    logHeader('Step 5: Create Offering');
    const now = Date.now();
    const offeringParams = {
      treasuryContractId: '0.0.7319745',
      paymentTokenContractId: tokenId,
      lotSize: '1000',
      minLots: '1',
      maxLots: '50',
      targetLots: '1000',
      targetQuantityRule: 0,
      startDate: new Date(now + 60000),
      endDate: new Date(now + 120000),
      deadlineRule: 0,
      price: '0',
      priceDecimals: 2,
    };

    logInfo(`Offering will start in 1 minute and end in 2 minutes`);
    logInfo(`Start Date: ${offeringParams.startDate.toISOString()}`);
    logInfo(`End Date: ${offeringParams.endDate.toISOString()}`);

    const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);

    logHeader('🔐 Signing create offering transaction...');
    const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);
    logSuccess('Create offering transaction signed successfully!');

    await publishSignedTransaction(signedCreateOfferingTx, {
      description: 'Create Offering',
      marketContractId: marketContractId,
      bondContractId: bondContractId,
    });

    const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
    const offeringId = createdOffering.id;

    logSuccess(`✅ Offering created: ID ${offeringId}`);
    log('');

    // ============================================
    // Step 6: Wait for offering status to be OPEN
    // ============================================
    logHeader('Step 6: Wait for offering to be OPEN');
    await waitForOfferingStatus(marketContractId, offeringId, 'OPEN');
    logSuccess(`✅ Offering is now OPEN and ready for subscriptions`);
    log('');

    // ============================================
    // Step 7: Submit Subscription
    // ============================================
    logHeader('Step 7: Submit Subscription');
    const lotUnits = '10';
    const submitSubscriptionTx = await submitSubscription(format, marketContractId, offeringId, lotUnits);

    logHeader('🔐 Signing submit subscription transaction...');
    const signedSubmitSubscriptionTx = await signTransaction(submitSubscriptionTx.unsignedTx);
    logSuccess('Submit subscription transaction signed successfully!');

    await publishSignedTransaction(signedSubmitSubscriptionTx, {
      description: 'Submit Subscription',
      marketContractId: marketContractId,
      offeringId: offeringId,
      lotUnits: lotUnits,
    });

    const createdSubscription = await waitForSubscriptionCreation(marketContractId, offeringId);
    const subscriptionId = createdSubscription.id;

    logSuccess(`✅ Subscription created: ID ${subscriptionId}`);
    log('');

    // ============================================
    // Step 8: Get Subscription by ID
    // ============================================
    logHeader('Step 8: Get Subscription by ID');
    const subscription = await getSubscription(marketContractId, offeringId, subscriptionId);
    log('');

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET SUBSCRIPTION COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Offering ID: ${offeringId}`, colors.green);
    log(`Subscription ID: ${subscription.id}`, colors.green);
    log(`Offering ID (from response): ${subscription.offeringId}`, colors.green);
    log(`Investor Account ID: ${subscription.investorAccountId}`, colors.green);
    log(`Lot Units: ${subscription.lotUnits}`, colors.green);
    log(`Status: ${subscription.status}`, colors.green);
    log(`Created At: ${subscription.createdAt}`, colors.green);
    log('\n✅ Successfully retrieved subscription details!\n', colors.green);
    
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
  getSubscription,
};
