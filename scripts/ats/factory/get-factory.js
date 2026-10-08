/**
 * Get Factory Script
 *
 * This script gets the factory details.
 *
 * Usage:
 *   FACTORY_CONTRACT_ID=0.0.123456 node scripts/ats/factory/get-factory.js
 */

const { log, logHeader, logError, colors } = require("../../shared/lib/logger");
const { getFactory } = require("./factory-service");

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 GET FACTORY SCRIPT");
    log("=====================================\n", colors.cyan);

    // Get factory contract ID from environment
    const factoryContractId = process.env.FACTORY_CONTRACT_ID;

    if (!factoryContractId) {
      logError("FACTORY_CONTRACT_ID is required. Set it in .env or as environment variable");
      logError("\nExample:");
      logError("  FACTORY_CONTRACT_ID=0.0.123456 node scripts/ats/factory/get-factory.js");
      process.exit(1);
    }

    // ============================================
    // Get Factory
    // ============================================
    const factory = await getFactory(factoryContractId);

    // ============================================
    // Summary
    // ============================================
    logHeader("✨ GET FACTORY COMPLETED!");
    log("=====================================", colors.green);
    log(`Factory Contract ID: ${factory.factoryContractId}`, colors.green);
    log(`Is Paused: ${factory.isPaused}`, colors.green);
    log("\n✅ Successfully retrieved factory!\n", colors.green);
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
