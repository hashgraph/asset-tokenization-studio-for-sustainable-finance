/**
 * Get Primary Market Factory Script
 *
 * This script gets the primary market factory details.
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market-factory.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');

/**
 * Get primary market factory by contract ID
 * @param {string} factoryContractId - The factory contract ID
 * @returns {Promise<Object>} Factory response
 */
async function getPrimaryMarketFactory(factoryContractId) {
  logHeader(`🔍 Getting Primary Market Factory...`);
  
  try {
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}`;
    const response = await gatewayClient.get(endpoint);
    
    logSuccess(`✅ Primary market factory retrieved successfully!`);
    log('');
    
    // Display factory details
    log('Factory Details:', colors.cyan);
    logInfo(`  Factory Contract ID: ${response.data.factoryContractId}`);
    logInfo(`  Is Paused: ${response.data.isPaused}`);
    logInfo(`  Created At: ${response.data.createdAt}`);
    log('');
    
    return response.data;
  } catch (error) {
    logError(`Failed to get primary market factory: ${error.message}`);
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
    logHeader('🚀 GET PRIMARY MARKET FACTORY SCRIPT');
    log('=====================================\n', colors.cyan);
    
    // Factory contract ID - this should be a known factory contract ID
    const factoryContractId = '0.0.7352542';

    logInfo(`Factory Contract ID: ${factoryContractId}`);
    log('');

    // ============================================
    // Get Primary Market Factory
    // ============================================
    const factory = await getPrimaryMarketFactory(factoryContractId);

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET PRIMARY MARKET FACTORY COMPLETED!');
    log('=====================================', colors.green);
    log(`Factory Contract ID: ${factory.factoryContractId}`, colors.green);
    log(`Is Paused: ${factory.isPaused}`, colors.green);
    log('\n✅ Successfully retrieved primary market factory!\n', colors.green);
    
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
  getPrimaryMarketFactory,
};
