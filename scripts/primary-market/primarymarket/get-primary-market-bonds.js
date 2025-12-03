/**
 * Fully Automated Get Primary Market Bonds Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Creates bond offerings (which register bonds)
 * 3. Gets all bonds for that primary market (paginated)
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market-bonds.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION, BOND_CONTRACT_ID, TREASURY_CONTRACT_ID } = require('../shared/test-config');
const { setupPrimaryMarketWithToken } = require('../shared/setup-service');
const { createOffering } = require('../offering/offering-service');
const { waitForOfferingCreation } = require('../offering/create-offering');

/**
 * Get all bonds in a primary market (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'bondContractId')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated bonds response
 */
async function getPrimaryMarketBonds(marketContractId, options = {}) {
  logHeader(`🔍 Getting Primary Market Bonds...`);
  
  const { page = 1, limit = 10, orderBy = 'bondContractId', order = 'asc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/bonds`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Primary market bonds retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Total Bonds: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Bonds on this page: ${response.data.items.length}`);
    log('');
    
    // Display each bond
    if (response.data.items.length > 0) {
      response.data.items.forEach((bond, index) => {
        log(`Bond #${index + 1}:`, colors.cyan);
        logInfo(`  Bond Contract ID: ${bond.bondContractId}`);
        log('');
      });
    } else {
      logInfo('No bonds found.');
      log('');
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to get primary market bonds: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET PRIMARY MARKET BONDS SCRIPT');
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
    // Steps 1-3: Setup Primary Market with Token and Role
    // ============================================
    const { marketContractId, tokenId } = await setupPrimaryMarketWithToken(
      format,
      resolverContractId,
      configVersion,
      userAccountId,
      { name: 'Market Bonds Token', symbol: 'MBT', decimals: 6, initialSupply: 1_000_000_000_000 }
    );
    log('');

    // ============================================
    // Step 4: Create Offering
    // ============================================
    logHeader('Step 4: Create Offering');
    const now = Date.now();
    
    const offeringParams = {
      treasuryContractId: TREASURY_CONTRACT_ID,
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
    // Step 5: Get Primary Market Bonds
    // ============================================
    logHeader('Step 5: Get Primary Market Bonds');
    const marketBonds = await getPrimaryMarketBonds(marketContractId, {
      page: 1,
      limit: 10,
      orderBy: 'bondContractId',
      order: 'asc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET PRIMARY MARKET BONDS COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Bond Contract ID: ${bondContractId}`, colors.green);
    log(`Total Bonds in Market: ${marketBonds.total}`, colors.green);
    log('\n✅ Successfully retrieved primary market bonds!\n', colors.green);
    
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
  getPrimaryMarketBonds,
};
