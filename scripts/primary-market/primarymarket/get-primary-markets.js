/**
 * Fully Automated Get Primary Markets Script
 *
 * This script performs the following:
 * 1. Deploys 2 Primary Markets
 * 2. Gets all primary markets (paginated)
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-markets.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { deployPrimaryMarket } = require('./deploy-primary-market');
const { waitForPrimaryMarketDeployment } = require('./get-latest-primary-market');

/**
 * Get all primary markets (paginated)
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'createdAt')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Paginated primary markets response
 */
async function getPrimaryMarkets(options = {}) {
  logHeader(`🔍 Getting Primary Markets...`);
  
  const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc' } = options;
  
  try {
    const endpoint = '/api/v1/primary-markets';
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Primary markets retrieved successfully!`);
    logInfo(`Total Primary Markets: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Markets on this page: ${response.data.items.length}`);
    log('');
    
    // Display each primary market
    if (response.data.items.length > 0) {
      response.data.items.forEach((market, index) => {
        log(`Primary Market #${index + 1}:`, colors.cyan);
        logInfo(`  Contract ID: ${market.contractId}`);
        logInfo(`  Is Paused: ${market.isPaused}`);
        logInfo(`  Created At: ${market.createdAt}`);
        log('');
      });
    } else {
      logInfo('No primary markets found.');
      log('');
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to get primary markets: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET PRIMARY MARKETS SCRIPT');
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

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    log('');

    const deployedMarkets = [];

    // ============================================
    // Step 1: Deploy Primary Markets
    // ============================================
    logHeader('Step 1: Deploy Primary Markets');
    const numberOfMarkets = 2;
    
    for (let i = 0; i < numberOfMarkets; i++) {
      logInfo(`Deploying primary market ${i + 1}/${numberOfMarkets}...`);
      
      const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

      logHeader('🔐 Signing deployment transaction...');
      const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
      logSuccess('Deployment transaction signed successfully!');

      await publishSignedTransaction(signedDeploymentTx, {
        description: `Deploy Primary Market ${i + 1}`,
      });

      const deployedMarket = await waitForPrimaryMarketDeployment();
      deployedMarkets.push(deployedMarket.contractId);

      logSuccess(`✅ Primary Market ${i + 1} deployed: ${deployedMarket.contractId}`);
    }
    log('');

    // ============================================
    // Step 2: Get Primary Markets
    // ============================================
    logHeader('Step 2: Get Primary Markets');
    const allMarkets = await getPrimaryMarkets({
      page: 1,
      limit: 10,
      orderBy: 'createdAt',
      order: 'desc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET PRIMARY MARKETS COMPLETED!');
    log('=====================================', colors.green);
    log(`Deployed Markets: ${deployedMarkets.join(', ')}`, colors.green);
    log(`Total Markets in System: ${allMarkets.total}`, colors.green);
    log('\n✅ Successfully retrieved primary markets!\n', colors.green);
    
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
  getPrimaryMarkets,
};
