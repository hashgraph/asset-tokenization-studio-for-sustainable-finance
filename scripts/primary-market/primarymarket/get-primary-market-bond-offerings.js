/**
 * Fully Automated Get Primary Market Bond Offerings Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Grants OFFERING_CREATOR_ROLE
 * 4. Creates offerings for a specific bond
 * 5. Gets all offerings for that bond (paginated)
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market-bond-offerings.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { deployPrimaryMarket } = require('./deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('./get-latest-primary-market');
const { createOffering } = require('../offering/offering-service');
const { waitForOfferingCreation } = require('../offering/create-offering');
const { deployHTSToken } = require('../offering/hts-token-service');

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
 * Get all offerings for a specific bond in a primary market (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} bondContractId - The bond contract ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Paginated offerings response
 */
async function getPrimaryMarketBondOfferings(marketContractId, bondContractId, options = {}) {
  logHeader(`🔍 Getting Bond Offerings...`);
  
  const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Bond offerings retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Total Offerings: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Offerings on this page: ${response.data.items.length}`);
    log('');
    
    // Display each offering
    response.data.items.forEach((offering, index) => {
      log(`Offering #${index + 1}:`, colors.cyan);
      logInfo(`  ID: ${offering.id}`);
      logInfo(`  Bond Contract ID: ${offering.bondContractId}`);
      logInfo(`  Operator Account ID: ${offering.operatorAccountId}`);
      logInfo(`  Treasury Contract ID: ${offering.treasuryContractId}`);
      logInfo(`  Payment Token Contract ID: ${offering.paymentTokenContractId}`);
      logInfo(`  Lot Size: ${offering.lotSize}`);
      logInfo(`  Min Lots: ${offering.minLots}`);
      logInfo(`  Max Lots: ${offering.maxLots}`);
      logInfo(`  Target Lots: ${offering.targetLots}`);
      logInfo(`  Target Quantity Rule: ${offering.targetQuantityRule}`);
      logInfo(`  Start Date: ${offering.startDate}`);
      logInfo(`  End Date: ${offering.endDate}`);
      logInfo(`  Deadline Rule: ${offering.deadlineRule}`);
      logInfo(`  Price: ${offering.price}`);
      logInfo(`  Price Decimals: ${offering.priceDecimals}`);
      logInfo(`  Status: ${offering.status}`);
      logInfo(`  Created At: ${offering.createdAt}`);
      log('');
    });
    
    return response.data;
  } catch (error) {
    logError(`Failed to get bond offerings: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET PRIMARY MARKET BOND OFFERINGS SCRIPT');
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
      'Bond Offerings Token',
      'BOT',
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
    // Step 4: Create Offerings for the Bond
    // ============================================
    logHeader('Step 4: Create Offerings for the Bond');
    const now = Date.now();
    const numberOfOfferings = 2;
    
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
        startDate: new Date(now + 60000 + (i * 10000)),
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
      logSuccess(`✅ Offering ${i + 1} created: ID ${createdOffering.id}`);
    }
    log('');

    // ============================================
    // Step 5: Get Bond Offerings
    // ============================================
    logHeader('Step 5: Get Bond Offerings');
    const bondOfferings = await getPrimaryMarketBondOfferings(marketContractId, bondContractId, {
      page: 1,
      limit: 10,
      orderBy: 'createdAt',
      order: 'desc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET PRIMARY MARKET BOND OFFERINGS COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Total Offerings: ${bondOfferings.total}`, colors.green);
    log(`Offerings Created: ${numberOfOfferings}`, colors.green);
    log('\n✅ Successfully retrieved bond offerings!\n', colors.green);
    
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
  getPrimaryMarketBondOfferings,
};
