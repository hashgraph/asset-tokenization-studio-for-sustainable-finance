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

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { deployPrimaryMarket } = require('../primarymarket/deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');
const { createOffering } = require('./offering-service');
const { waitForOfferingCreation } = require('./create-offering');
const { deployHTSToken } = require('./hts-token-service');

// Primary Market Roles
const OFFERING_CREATOR_ROLE = '0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a';

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
    throw error;
  }
}

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
    log('');
    
    // Display offering details
    log('Offering Details:', colors.cyan);
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
    log('');
    
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
    logHeader('🚀 AUTOMATED GET OFFERING SCRIPT');
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
    const { tokenId } = await deployHTSToken(
      'Offering Token',
      'OFT',
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
    // Step 3: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader('Step 3: Grant OFFERING_CREATOR_ROLE');
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
    // Step 4: Create Offering
    // ============================================
    logHeader('Step 4: Create Offering');
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
      endDate: new Date(now + 180000),
      deadlineRule: 0,
      price: '0',
      priceDecimals: 2,
    };

    const createOfferingTx = await createOffering(format, marketContractId, bondContractId, offeringParams);
    const signedCreateOfferingTx = await signTransaction(createOfferingTx.unsignedTx);

    await publishSignedTransaction(signedCreateOfferingTx, {
      description: 'Create Offering',
    });

    const createdOffering = await waitForOfferingCreation(marketContractId, bondContractId);
    logSuccess(`✅ Offering created: ID ${createdOffering.id}`);
    log('');

    // ============================================
    // Step 5: Get Offering
    // ============================================
    logHeader('Step 5: Get Offering');
    const offering = await getOffering(marketContractId, createdOffering.id);

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET OFFERING COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Offering ID: ${offering.id}`, colors.green);
    log(`Offering Status: ${offering.status}`, colors.green);
    log('\n✅ Successfully retrieved offering!\n', colors.green);
    
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
