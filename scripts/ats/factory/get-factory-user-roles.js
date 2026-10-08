/**
 * Get Factory User Roles Script
 *
 * This script gets all roles for a specific user in a factory.
 *
 * Usage:
 *   FACTORY_CONTRACT_ID=0.0.123456 USER_ACCOUNT_ID=0.0.789 node scripts/ats/factory/get-factory-user-roles.js
 */

const { log, logHeader, logError, logInfo, colors } = require("../../shared/lib/logger");
const { getFactoryUserRoles } = require("./factory-service");

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 GET FACTORY USER ROLES SCRIPT");
    log("=====================================\n", colors.cyan);

    // Get parameters from environment
    const factoryContractId = process.env.FACTORY_CONTRACT_ID;
    const userAccountId = process.env.USER_ACCOUNT_ID || process.env.ACCOUNT_ID;

    if (!factoryContractId) {
      logError("FACTORY_CONTRACT_ID is required. Set it in .env or as environment variable");
      logError("\nExample:");
      logError(
        "  FACTORY_CONTRACT_ID=0.0.123456 USER_ACCOUNT_ID=0.0.789 node scripts/ats/factory/get-factory-user-roles.js",
      );
      process.exit(1);
    }

    if (!userAccountId) {
      logError("USER_ACCOUNT_ID or ACCOUNT_ID is required. Set it in .env or as environment variable");
      logError("\nExample:");
      logError(
        "  FACTORY_CONTRACT_ID=0.0.123456 USER_ACCOUNT_ID=0.0.789 node scripts/ats/factory/get-factory-user-roles.js",
      );
      process.exit(1);
    }

    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // ============================================
    // Get Factory User Roles
    // ============================================
    const userRoles = await getFactoryUserRoles(factoryContractId, userAccountId);

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET FACTORY USER ROLES COMPLETED!");
    log("=====================================", colors.green);
    log(`Factory Contract ID: ${factoryContractId}`, colors.green);
    log(`User Account ID: ${userAccountId}`, colors.green);
    log(`Total Roles: ${userRoles.items.length}`, colors.green);
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
  main,
};
