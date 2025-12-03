/**
 * Fully Automated Get Offerings Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Deploys an HTS payment token
 * 3. Grants OFFERING_CREATOR_ROLE
 * 4. Creates an offering
 * 5. Gets all offerings for the market
 *
 * Usage: node scripts/primary-market/offering/get-offerings.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION } = require('../shared/test-config');
const { setupPrimaryMarketWithToken } = require('../shared/setup-service');
const { createOffering } = require('./offering-service');
const { waitForOfferingCreation } = require('./create-offering');

/**
 * Get all offerings for a primary market (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'id')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated offerings response
 */
async function getOfferings(marketContractId, options = {}) {
  logHeader(`🔍 Getting Offerings...`);
  
  const { page = 1, limit = 10, orderBy = 'id', order = 'asc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/offerings`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order,
      },
    });
    
    logSuccess(`✅ Offerings retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Total Offerings: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    log('');
    
    // Display offerings
    if (response.data.items.length > 0) {
      log('Offerings:', colors.cyan);
      response.data.items.forEach((offering, index) => {
        logInfo(`\n  Offering ${index + 1}:`);
        logInfo(`    ID: ${offering.id}`);
        logInfo(`    Bond Contract ID: ${offering.bondContractId}`);
        logInfo(`    Operator Account ID: ${offering.operatorAccountId}`);
        logInfo(`    Lot Size: ${offering.lotSize}`);
        logInfo(`    Min/Max Lots: ${offering.minLots}/${offering.maxLots}`);
        logInfo(`    Target Lots: ${offering.targetLots}`);
        logInfo(`    Price: ${offering.price}`);
        logInfo(`    Status: ${offering.status}`);
        logInfo(`    Created At: ${offering.createdAt}`);
      });
      log('');
    } else {
      logInfo('No offerings found.');
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to get offerings: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET OFFERINGS SCRIPT');
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
    const bondContractId = '0.0.7319744';
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log('');

    // ============================================
    // Steps 1-3: Setup Primary Market with Token and Role
    // ============================================
    const { marketContractId, tokenId } = await setupPrimaryMarketWithToken(
      format,
      resolverContractId,
      configVersion,
      userAccountId,
      { name: 'Offering Token', symbol: 'OFT', decimals: 6, initialSupply: 1_000_000_000_000 }
    );
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
    // Step 5: Get All Offerings
    // ============================================
    logHeader('Step 5: Get All Offerings');
    const offerings = await getOfferings(marketContractId, { page: 1, limit: 10 });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET OFFERINGS COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Total Offerings: ${offerings.total}`, colors.green);
    log(`Offerings on this page: ${offerings.items.length}`, colors.green);
    log('\n✅ Successfully retrieved all offerings!\n', colors.green);
    
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
  getOfferings,
};
