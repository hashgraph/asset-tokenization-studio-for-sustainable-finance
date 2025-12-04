/**
 * Factory Service
 *
 * Helper functions for factory operations.
 * Only includes READ operations (GET endpoints) to avoid breaking the factory.
 */

const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");

/**
 * Get factory details
 * @param {string} factoryContractId - The factory contract ID
 * @returns {Promise<Object>} Factory details
 */
async function getFactory(factoryContractId) {
  logHeader(`🔍 Getting Factory Details...`);

  try {
    const endpoint = `/api/v1/ats/factory/${factoryContractId}`;
    const response = await gatewayClient.get(endpoint);

    logSuccess(`✅ Factory retrieved successfully!`);
    log("");

    // Display factory details
    log("Factory Details:", colors.cyan);
    logInfo(`  Factory Contract ID: ${response.data.factoryContractId}`);
    logInfo(`  Is Paused: ${response.data.isPaused}`);
    logInfo(`  Created At: ${response.data.createdAt}`);
    log("");

    return response.data;
  } catch (error) {
    logError(`Failed to get factory: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

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
async function getFactoryRoleMembers(factoryContractId, roleId, options = {}) {
  logHeader(`🔍 Getting Factory Role Members...`);

  const { page = 1, limit = 10, orderBy = "userAccountId", order = "asc" } = options;

  try {
    const endpoint = `/api/v1/ats/factories/${factoryContractId}/roles/${roleId}/members`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order,
      },
    });

    logSuccess(`✅ Factory role members retrieved successfully!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`Total Members: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Members on this page: ${response.data.items.length}`);
    log("");

    // Display each member
    if (response.data.items.length > 0) {
      response.data.items.forEach((member, index) => {
        log(`Member #${index + 1}:`, colors.cyan);
        logInfo(`  User Account ID: ${member.userAccountId}`);
        log("");
      });
    } else {
      logInfo("No role members found.");
      log("");
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
 * Get all roles for a specific user in a factory
 * @param {string} factoryContractId - The factory contract ID
 * @param {string} userAccountId - The user account ID
 * @returns {Promise<Object>} User roles response
 */
async function getFactoryUserRoles(factoryContractId, userAccountId) {
  logHeader(`🔍 Getting Factory User Roles...`);

  try {
    const endpoint = `/api/v1/ats/factories/${factoryContractId}/users/${userAccountId}/roles`;
    const response = await gatewayClient.get(endpoint);

    logSuccess(`✅ Factory user roles retrieved successfully!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Total Roles: ${response.data.items.length}`);
    log("");

    // Display each role
    if (response.data.items.length > 0) {
      response.data.items.forEach((role, index) => {
        log(`Role #${index + 1}:`, colors.cyan);
        logInfo(`  Role ID: ${role.roleId}`);
        log("");
      });
    } else {
      logInfo("No roles found for this user.");
      log("");
    }

    return response.data;
  } catch (error) {
    logError(`Failed to get factory user roles: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

module.exports = {
  getFactory,
  getFactoryRoleMembers,
  getFactoryUserRoles,
};
