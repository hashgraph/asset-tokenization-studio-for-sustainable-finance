/**
 * Shared Role Management Service for Primary Market Scripts
 * 
 * This module provides reusable functions for role management operations
 * to avoid code duplication across multiple scripts.
 */

const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, logHeader } = require('../../shared/lib/logger');

// Primary Market Roles
const OFFERING_CREATOR_ROLE = '0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a';

/**
 * Grant OFFERING_CREATOR_ROLE to a user in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} userAccountId - The user account ID to grant the role to
 * @returns {Promise<Object>} The grant role transaction details
 */
async function grantOfferingCreatorRole(format, marketContractId, userAccountId) {
  return await grantRole(format, marketContractId, OFFERING_CREATOR_ROLE, userAccountId, 'OFFERING_CREATOR_ROLE');
}

/**
 * Grant a role to a user in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID to grant
 * @param {string} userAccountId - The user account ID to grant the role to
 * @param {string} roleName - Optional human-readable role name for logging
 * @returns {Promise<Object>} The grant role transaction details
 */
async function grantRole(format, marketContractId, roleId, userAccountId, roleName = null) {
  const displayName = roleName || roleId;
  logHeader(`🔐 Granting ${displayName} in ${format.toUpperCase()} Primary Market...`);

  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo('Sending grant role request to gateway...');
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    logSuccess(`${format.toUpperCase()} Grant ${displayName} transaction created!`);
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

module.exports = {
  grantOfferingCreatorRole,
  grantRole,
  OFFERING_CREATOR_ROLE,
};
