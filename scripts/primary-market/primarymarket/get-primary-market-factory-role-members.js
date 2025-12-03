/**
 * Get Primary Market Factory Role Members Script
 *
 * This script gets all members of a specific role in a primary market factory.
 * Note: Since the factory is loaded at app startup, it may not have any role members set,
 * so the result might be empty.
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market-factory-role-members.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { FACTORY_CONTRACT_ID } = require('../shared/test-config');

/**
 * Get all members of a specific role in a factory (paginated)
 * @param {string} factoryContractId - The factory contract ID
 * @param {string} roleId - The role ID in hexadecimal
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'userAccountId')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated role members response
 */
async function getPrimaryMarketFactoryRoleMembers(factoryContractId, roleId, options = {}) {
  logHeader(`🔍 Getting Factory Role Members...`);
  
  const { page = 1, limit = 10, orderBy = 'userAccountId', order = 'asc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/members`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Factory role members retrieved successfully!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`Total Members: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Members on this page: ${response.data.items.length}`);
    log('');
    
    // Display each member
    if (response.data.items.length > 0) {
      response.data.items.forEach((member, index) => {
        log(`Member #${index + 1}:`, colors.cyan);
        logInfo(`  User Account ID: ${member.userAccountId}`);
        log('');
      });
    } else {
      logInfo('No role members found. The factory may not have any users assigned to this role yet.');
      log('');
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to get factory role members: ${error.message}`);
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
    logHeader('🚀 GET PRIMARY MARKET FACTORY ROLE MEMBERS SCRIPT');
    log('=====================================\n', colors.cyan);
    
    // Configuration parameters
    const factoryContractId = FACTORY_CONTRACT_ID;
    // Example role ID - MARKET_CREATOR_ROLE (you may need to adjust this)
    const roleId = '0x2fa449e97717e92b32320917db3073c2407e0bc636bc1367e879e379239e26e5';

    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`Role ID: ${roleId}`);
    log('');

    // ============================================
    // Get Factory Role Members
    // ============================================
    const roleMembers = await getPrimaryMarketFactoryRoleMembers(factoryContractId, roleId, {
      page: 1,
      limit: 10,
      orderBy: 'userAccountId',
      order: 'asc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET FACTORY ROLE MEMBERS COMPLETED!');
    log('=====================================', colors.green);
    log(`Factory Contract ID: ${factoryContractId}`, colors.green);
    log(`Role ID: ${roleId}`, colors.green);
    log(`Total Members: ${roleMembers.total}`, colors.green);
    log('\n✅ Successfully retrieved factory role members!\n', colors.green);
    
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
  getPrimaryMarketFactoryRoleMembers,
};
