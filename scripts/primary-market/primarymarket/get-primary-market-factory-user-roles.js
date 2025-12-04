/**
 * Get Primary Market Factory User Roles Script
 *
 * This script gets all roles assigned to a specific user in a primary market factory.
 * Note: Since the factory is loaded at app startup, it may not have any user roles set,
 * so the result might be empty.
 *
 * Usage: node scripts/primary-market/primarymarket/get-primary-market-factory-user-roles.js
 */

const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { FACTORY_CONTRACT_ID } = require("../shared/test-config");

/**
 * Get all roles for a specific user in a factory (paginated)
 * @param {string} factoryContractId - The factory contract ID
 * @param {string} userAccountId - The user account ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.orderBy - Field to order by (default: 'roleId')
 * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated user roles response
 */
async function getPrimaryMarketFactoryUserRoles(factoryContractId, userAccountId, options = {}) {
  logHeader(`🔍 Getting Factory User Roles...`);

  const { page = 1, limit = 10, orderBy = "roleId", order = "asc" } = options;

  try {
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}/users/${userAccountId}/roles`;
    const response = await gatewayClient.get(endpoint, {
      params: {
        page,
        limit,
        orderBy,
        order,
      },
    });

    logSuccess(`✅ Factory user roles retrieved successfully!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Total Roles: ${response.data.total}`);
    logInfo(`Page: ${response.data.page} of ${response.data.totalPages}`);
    logInfo(`Items per Page: ${response.data.limit}`);
    logInfo(`Roles on this page: ${response.data.items.length}`);
    log("");

    // Display each role
    if (response.data.items.length > 0) {
      response.data.items.forEach((role, index) => {
        log(`Role #${index + 1}:`, colors.cyan);
        logInfo(`  Role ID: ${role.roleId}`);
        log("");
      });
    } else {
      logInfo("No roles found for this user. The user may not have any roles assigned in the factory yet.");
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

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 GET PRIMARY MARKET FACTORY USER ROLES SCRIPT");
    log("=====================================\n", colors.cyan);

    if (!process.env.ACCOUNT_ID) {
      logError("ACCOUNT_ID not found in environment variables");
      logInfo("Please set ACCOUNT_ID in your .env file");
      process.exit(1);
    }

    // Configuration parameters
    const factoryContractId = FACTORY_CONTRACT_ID;
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // ============================================
    // Get Factory User Roles
    // ============================================
    const userRoles = await getPrimaryMarketFactoryUserRoles(factoryContractId, userAccountId, {
      page: 1,
      limit: 10,
      orderBy: "roleId",
      order: "asc",
    });

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET FACTORY USER ROLES COMPLETED!");
    log("=====================================", colors.green);
    log(`Factory Contract ID: ${factoryContractId}`, colors.green);
    log(`User Account ID: ${userAccountId}`, colors.green);
    log(`Total Roles: ${userRoles.total}`, colors.green);
    log("\n✅ Successfully retrieved factory user roles!\n", colors.green);
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
  getPrimaryMarketFactoryUserRoles,
};
