/**
 * Fully Automated Cancel Offering Script
 *
 * This script performs the complete cancel offering flow without manual steps:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Approves token allowance for the Primary Market
 * 4. Grants OFFERING_CREATOR_ROLE
 * 5. Creates an offering
 * 6. Waits for offering to be OPEN
 * 7. Submits a subscription
 * 8. Waits for offering to be CANCELLABLE_OR_EXECUTABLE
 * 9. Cancels the offering
 * 10. Verifies subscription status changed
 *
 * Usage: node scripts/primary-market/offering/cancel-offering-auto.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION, BOND_CONTRACT_ID, TREASURY_CONTRACT_ID } = require('../shared/test-config');
const { grantOfferingCreatorRole, OFFERING_CREATOR_ROLE } = require('../shared/role-service');
const { createOffering } = require('./offering-service');
const { waitForOfferingCreation } = require('./create-offering');
const { deployHTSToken, approveTokenAllowance } = require('./hts-token-service');
const { deployPrimaryMarket } = require('../primarymarket/deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');

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
 * Get subscription details
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {string} subscriptionId - The subscription ID
 * @returns {Promise<Object>} The subscription details
 */
async function getSubscription(marketContractId, offeringId, subscriptionId) {
  try {
    const response = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    logError(`Failed to fetch subscription: ${error.message}`);
    throw error;
  }
}

/**
 * Wait for subscription status to change after cancellation
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} offeringId - The offering ID
 * @param {string} subscriptionId - The subscription ID
 * @param {number} initialWaitMs - Initial wait time in milliseconds before querying (default: 15000)
 * @returns {Promise<Object>} The updated subscription
 */
async function waitForSubscriptionStatusChange(marketContractId, offeringId, subscriptionId, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for subscription status to update...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`🔍 Fetching subscription status from database...`);
  const subscription = await getSubscription(marketContractId, offeringId, subscriptionId);
  
  // Verify status changed from SUBMITTED
  if (subscription.status === 'SUBMITTED') {
    logError(`⚠️  Subscription status is still SUBMITTED after cancellation`);
    throw new Error('Subscription status did not change from SUBMITTED');
  }
  
  return subscription;
}


/**
 * Cancel an offering
 */
async function cancelOffering(format, marketContractId, offeringId, start = 0, end = 0) {
  logHeader(`📋 Canceling offering in ${format.toUpperCase()} Primary Market...`);

  const cancelRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    start: start.toString(),
    end: end.toString(),
  };

  try {
    logInfo('Sending cancel offering request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings/${offeringId}`;
    const response = await gatewayClient.delete(endpoint, { data: cancelRequest });

    logSuccess(`${format.toUpperCase()} Cancel offering transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Offering ID: ${offeringId}`);
    logInfo(`Batch range: ${start} to ${end}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...cancelRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create cancel offering transaction: ${error.message}`);
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
    logHeader('🚀 AUTOMATED CANCEL OFFERING SCRIPT');
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
    const resolverContractId = RESOLVER_CONTRACT_ID;
    const configVersion = CONFIG_VERSION;
    const bondContractId = BOND_CONTRACT_ID;
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
      'Auto Payment Token',
      'APT',
      6,
      1_000_000_000_000 // 1 million tokens
    );
    const paymentTokenContractId = tokenId; // Use tokenId as contractId
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

    // Wait for deployment and get the contract ID from the database
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

    // Verify role was granted
    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log('');

    // ============================================
    // Step 5: Create Offering
    // ============================================
    logHeader('Step 5: Create Offering');
    const now = Date.now();
    const offeringParams = {
      treasuryContractId: TREASURY_CONTRACT_ID,
      paymentTokenContractId: tokenId, // Use the dynamically deployed token
      lotSize: '1000',
      minLots: '1',
      maxLots: '50',
      targetLots: '1000',
      targetQuantityRule: 0, // 0: AT_LEAST
      startDate: new Date(now + 60000), // 60 seconds from now
      endDate: new Date(now + 120000), // 2 minutes from now
      deadlineRule: 0, // 0: SOFT
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
      lotSize: offeringParams.lotSize,
      targetLots: offeringParams.targetLots,
      price: offeringParams.price,
      priceDecimals: offeringParams.priceDecimals,
    });

    // Wait for offering to be created and get the offering ID
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
    const lotUnits = '1'; // Subscribe to 1 lot unit
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

    // Wait for subscription to be created and get the subscription ID
    const createdSubscription = await waitForSubscriptionCreation(marketContractId, offeringId);
    const subscriptionId = createdSubscription.id;

    logSuccess(`✅ Subscription created: ID ${subscriptionId}`);
    logInfo(`Initial Status: ${createdSubscription.status}`);
    log('');

    // ============================================
    // Step 8: Wait for offering status to be CANCELLABLE_OR_EXECUTABLE
    // ============================================
    logHeader('Step 8: Wait for offering to be CANCELLABLE_OR_EXECUTABLE');
    await waitForOfferingStatus(marketContractId, offeringId, 'CANCELLABLE_OR_EXECUTABLE');
    logSuccess(`✅ Offering is now CANCELLABLE_OR_EXECUTABLE (ready to cancel)`);
    log('');

    // ============================================
    // Step 9: Cancel Offering
    // ============================================
    logHeader('Step 9: Cancel Offering');
    const start = 0;
    const end = 1;
    const cancelOfferingTx = await cancelOffering(format, marketContractId, offeringId, start, end);

    logHeader('🔐 Signing cancel offering transaction...');
    const signedCancelOfferingTx = await signTransaction(cancelOfferingTx.unsignedTx);
    logSuccess('Cancel offering transaction signed successfully!');

    await publishSignedTransaction(signedCancelOfferingTx, {
      description: 'Cancel Offering',
      marketContractId: marketContractId,
      offeringId: offeringId,
      start: start,
      end: end,
    });

    // ============================================
    // Step 10: Verify Subscription Status Changed
    // ============================================
    logHeader('Step 10: Verify Subscription Status Changed');
    const updatedSubscription = await waitForSubscriptionStatusChange(marketContractId, offeringId, subscriptionId);
    logSuccess(`✅ Subscription status updated after cancellation!`);
    logInfo(`Final Status: ${updatedSubscription.status}`);
    log('');

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ AUTOMATED CANCEL OFFERING COMPLETED!');
    log('=====================================', colors.green);
    log(`HTS Token ID: ${tokenId}`, colors.green);
    log(`Payment Token Address: ${paymentTokenAddress}`, colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Offering ID: ${offeringId}`, colors.green);
    log(`Subscription ID: ${subscriptionId}`, colors.green);
    log(`Batch Range: ${start} to ${end}`, colors.green);
    log('\n✅ The complete cancel offering flow executed successfully!\n', colors.green);
    log('🎉 All automated steps completed without manual intervention!\n', colors.green);
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
  main,
};
