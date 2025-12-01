/**
 * Fully Automated Get Primary Market User Roles Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Grants OFFERING_CREATOR_ROLE to a user
 * 3. Gets all roles for the user in the primary market
 *
 * Usage: node scripts/primary-market/role/get-primary-market-user-roles.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION } = require('../shared/test-config');
const { deployAndWaitForPrimaryMarket } = require('../shared/setup-service');
const { grantOfferingCreatorRole, OFFERING_CREATOR_ROLE } = require('../shared/role-service');
const { waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');

/**
 * Get all roles for a specific user in a primary market (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} userAccountId - The user account ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'roleId')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated user roles response
 */
async function getPrimaryMarketUserRoles(marketContractId, userAccountId, options = {}) {
  logHeader(`🔍 Getting User Roles...`);
  
  const { page = 1, limit = 10, orderBy = 'roleId', order = 'asc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order,
      },
    });
    
    logSuccess(`✅ User roles retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Total Roles: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    log('');
    
    // Display roles
    if (response.data.items.length > 0) {
      log('User Roles:', colors.cyan);
      response.data.items.forEach((role, index) => {
        logInfo(`  ${index + 1}. Role ID: ${role.roleId}`);
      });
      log('');
    } else {
      logInfo('No roles found for this user.');
    }
    
    return response.data;
  } catch (error) {
    logError(`Failed to get user roles: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET PRIMARY MARKET USER ROLES SCRIPT');
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
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log('');

    // ============================================
    // Step 1: Deploy Primary Market
    // ============================================
    const marketContractId = await deployAndWaitForPrimaryMarket(
      format,
      resolverContractId,
      configVersion
    );
    log('');

    // ============================================
    // Step 2: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader('Step 2: Grant OFFERING_CREATOR_ROLE');
    const grantRoleTx = await grantOfferingCreatorRole(format, marketContractId, userAccountId);
    const signedGrantRoleTx = await signTransaction(grantRoleTx.unsignedTx);

    await publishSignedTransaction(signedGrantRoleTx, {
      description: 'Grant OFFERING_CREATOR_ROLE',
    });

    await waitForUserRoleUpdate(marketContractId, OFFERING_CREATOR_ROLE, userAccountId, true);
    logSuccess(`✅ OFFERING_CREATOR_ROLE granted to ${userAccountId}`);
    log('');

    // ============================================
    // Step 3: Get User Roles
    // ============================================
    logHeader('Step 3: Get User Roles');
    const userRoles = await getPrimaryMarketUserRoles(marketContractId, userAccountId, {
      page: 1,
      limit: 10,
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET PRIMARY MARKET USER ROLES COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`User Account ID: ${userAccountId}`, colors.green);
    log(`Total Roles: ${userRoles.total}`, colors.green);
    log(`Roles on this page: ${userRoles.items.length}`, colors.green);
    
    if (userRoles.items.length > 0) {
      log('\nUser has the following roles:', colors.green);
      userRoles.items.forEach((role) => {
        log(`  - ${role.roleId}`, colors.green);
      });
    }
    
    log('\n✅ Successfully retrieved user roles!\n', colors.green);
    
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
  getPrimaryMarketUserRoles,
};
