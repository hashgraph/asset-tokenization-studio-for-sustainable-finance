/**
 * Fully Automated Get Role Members Script
 *
 * This script performs the following:
 * 1. Deploys a Primary Market
 * 2. Grants OFFERING_CREATOR_ROLE to a user
 * 3. Gets all members of the OFFERING_CREATOR_ROLE
 *
 * Usage: node scripts/primary-market/role/get-role-members.js
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { deployPrimaryMarket } = require('../primarymarket/deploy-primary-market');
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require('../primarymarket/get-latest-primary-market');

// Primary Market Roles
const OFFERING_CREATOR_ROLE = '0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a';

/**
 * Grant a role to a user
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID to grant
 * @param {string} userAccountId - The user account ID to grant the role to
 * @returns {Promise<Object>} The grant role transaction details
 */
async function grantRole(format, marketContractId, roleId, userAccountId) {
  logHeader(`🔐 Granting role in ${format.toUpperCase()} Primary Market...`);

  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo('Sending grant role request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    logSuccess(`${format.toUpperCase()} Grant role transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Role ID: ${roleId}`);
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
 * Get all members of a specific role (paginated)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'userAccountId')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated role members response
 */
async function getRoleMembers(marketContractId, roleId, options = {}) {
  logHeader(`🔍 Getting Role Members...`);
  
  const { page = 1, limit = 10, orderBy = 'userAccountId', order = 'asc' } = options;
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/members`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order
      }
    });
    
    logSuccess(`✅ Role members retrieved successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`Total Members: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Members on this page: ${response.data.items.length}`);
    log('');
    
    // Display each member
    response.data.items.forEach((member, index) => {
      log(`Member #${index + 1}:`, colors.cyan);
      logInfo(`  User Account ID: ${member.userAccountId}`);
      log('');
    });
    
    return response.data;
  } catch (error) {
    logError(`Failed to get role members: ${error.message}`);
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
    logHeader('🚀 AUTOMATED GET ROLE MEMBERS SCRIPT');
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
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log('');

    // ============================================
    // Step 1: Deploy Primary Market
    // ============================================
    logHeader('Step 1: Deploy Primary Market');
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
    // Step 2: Grant OFFERING_CREATOR_ROLE
    // ============================================
    logHeader('Step 2: Grant OFFERING_CREATOR_ROLE');
    const grantRoleTx = await grantRole(format, marketContractId, OFFERING_CREATOR_ROLE, userAccountId);

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
    // Step 3: Get Role Members
    // ============================================
    logHeader('Step 3: Get Role Members');
    const roleMembers = await getRoleMembers(marketContractId, OFFERING_CREATOR_ROLE, {
      page: 1,
      limit: 10,
      orderBy: 'userAccountId',
      order: 'asc'
    });

    // ============================================
    // Summary
    // ============================================
    logHeader('✨ GET ROLE MEMBERS COMPLETED!');
    log('=====================================', colors.green);
    log(`Primary Market ID: ${marketContractId}`, colors.green);
    log(`Role ID: ${OFFERING_CREATOR_ROLE}`, colors.green);
    log(`Role Name: OFFERING_CREATOR_ROLE`, colors.green);
    log(`Total Members: ${roleMembers.total}`, colors.green);
    log(`Members:`, colors.green);
    roleMembers.items.forEach((member, idx) => {
      log(`  ${idx + 1}. ${member.userAccountId}`, colors.green);
    });
    log('\n✅ Successfully retrieved role members!\n', colors.green);
    
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
  getRoleMembers,
};
