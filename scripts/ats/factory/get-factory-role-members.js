/**
 * Get Factory Role Members Script
 *
 * This script gets all members of a specific role in a factory.
 *
 * Usage:
 *   FACTORY_CONTRACT_ID=0.0.123456 ROLE_ID=0x123... node scripts/ats/factory/get-factory-role-members.js
 */

const { log, logHeader, logError, logInfo, colors } = require("../../shared/lib/logger");
const { getFactoryRoleMembers } = require("./factory-service");

// Common role IDs (reference)
const FACTORY_ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  PAUSER_ROLE: "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a",
  // Add other factory roles here as needed
};

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 GET FACTORY ROLE MEMBERS SCRIPT");
    log("=====================================\n", colors.cyan);

    // Get parameters from environment
    const factoryContractId = process.env.FACTORY_CONTRACT_ID;
    const roleId = process.env.ROLE_ID;

    if (!factoryContractId) {
      logError("FACTORY_CONTRACT_ID is required. Set it in .env or as environment variable");
      logError("\nExample:");
      logError(
        "  FACTORY_CONTRACT_ID=0.0.123456 ROLE_ID=0x0000000000000000000000000000000000000000000000000000000000000000 node scripts/ats/factory/get-factory-role-members.js",
      );
      process.exit(1);
    }

    if (!roleId) {
      logError("ROLE_ID is required. Set it in .env or as environment variable");
      logError("\nCommon role IDs:");
      Object.entries(FACTORY_ROLES).forEach(([name, id]) => {
        logError(`  ${name}: ${id}`);
      });
      logError("\nExample:");
      logError(
        `  FACTORY_CONTRACT_ID=0.0.123456 ROLE_ID=${FACTORY_ROLES.DEFAULT_ADMIN_ROLE} node scripts/ats/factory/get-factory-role-members.js`,
      );
      process.exit(1);
    }

    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`Role ID: ${roleId}`);
    log("");

    // ============================================
    // Get Factory Role Members
    // ============================================
    const roleMembers = await getFactoryRoleMembers(factoryContractId, roleId, {
      page: 1,
      limit: 100,
      orderBy: "userAccountId",
      order: "asc",
    });

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET FACTORY ROLE MEMBERS COMPLETED!");
    log("=====================================", colors.green);
    log(`Factory Contract ID: ${factoryContractId}`, colors.green);
    log(`Role ID: ${roleId}`, colors.green);
    log(`Total Members: ${roleMembers.total}`, colors.green);
    log("\n✅ Successfully retrieved factory role members!\n", colors.green);
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
  FACTORY_ROLES,
};
