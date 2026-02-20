const { deployBondWaitTreasuryAndApplyRoles } = require("./verify-treasury-persistence");
const { verifyTreasuryPauseUnpause } = require("./verify-treasury-pause-unpause");
const { verifyTreasuryRoles } = require("./verify-treasury-roles");
const { verifyTreasuryPaymentTokenUpdate } = require("./paymenttoken/verify-update-treasury-payment-token");
const { verifyTransferPaymentTokenToTreasury } = require("./paymenttoken/verify-transfer-payment-token-to-treasury");
const {
  verifyTransferPaymentTokenFromTreasury,
} = require("./paymenttoken/verify-transfer-payment-token-from-treasury");
const { verifyDissociatePaymentToken } = require("./paymenttoken/verify-dissociate-payment-token");
const { verifyAddEnvironmentalAssetToken } = require("./environmentalassettoken/verify-add-environmental-asset-token");
const {
  verifyTransferEnvironmentalAssetTokenToTreasury,
} = require("./environmentalassettoken/verify-transfer-environmental-asset-token-to-treasury");
const {
  verifyTransferEnvironmentalAssetTokenFromTreasury,
} = require("./environmentalassettoken/verify-transfer-environmental-asset-token-from-treasury");
const {
  verifyDeleteEnvironmentalAssetToken,
} = require("./environmentalassettoken/verify-delete-environmental-asset-token");
const {
  verifyDissociateEnvironmentalAssetToken,
} = require("./environmentalassettoken/verify-dissociate-environmental-asset-token");
const { verifyFundProceedsRecipient } = require("./proceedsrecipient/verify-fund-proceeds-recipient");
const { verifyTreasuryDistributions } = require("./distribution/verify-treasury-distributions");
const { verifyTreasuryRedemptions } = require("./redemption/verify-treasury-redemption");
const { log, logSuccess, logError, logHeader, colors } = require("../shared/lib/logger");

/**
 * Configuration object to enable/disable specific test suites
 * Set any property to false to skip that test suite
 */
const DEFAULT_CONFIG = {
  deployBondAndTreasury: true,
  pauseUnpause: true,
  roles: true,
  paymentToken: {
    enabled: true,
    updateToken: true,
    transferToTreasury: false, //TODO: Enable  when synthentic events from Hedera could be read
    transferFromTreasury: false, //TODO: Enable  when synthentic events from Hedera could be read
    dissociate: true,
  },
  environmentalAssets: {
    enabled: true,
    addToken: true,
    transferToTreasury: false, //TODO: Enable  when synthentic events from Hedera could be read
    transferFromTreasury: false, //TODO: Enable  when synthentic events from Hedera could be read
    deleteToken: true,
    dissociate: true,
  },
  proceedsRecipient: false, //TODO: Enable  when synthentic events from Hedera could be read
  distribution: true,
  redemption: true,
};

/**
 * Treasury Orchestrator - Executes all treasury scripts in sequence
 * @param {Object} config - Configuration object to enable/disable specific test suites
 * @param {Object} overridesBondCreationRequest - Optional overrides for bond creation
 * @returns {Promise<Object>} Results summary
 */
async function runTreasuryOrchestrator(config = DEFAULT_CONFIG, overridesBondCreationRequest = {}) {
  logHeader("🎭 TREASURY ORCHESTRATOR - Starting Complete Test Suite");

  const results = {
    passed: [],
    failed: [],
    skipped: [],
  };

  let treasury = null;
  let bondContractId = null;

  try {
    // ========================================
    // 1. DEPLOY BOND AND TREASURY
    // ========================================
    if (config.deployBondAndTreasury) {
      logHeader("📦 Step 1: Deploying Bond and Treasury");
      try {
        treasury = await deployBondWaitTreasuryAndApplyRoles(overridesBondCreationRequest);
        bondContractId = treasury.bondContractId;
        logSuccess(`✅ Bond and Treasury deployed successfully!`);
        log(`   Treasury Contract ID: ${treasury.contractId}`, colors.cyan);
        log(`   Bond Contract ID: ${bondContractId}`, colors.cyan);
        results.passed.push("Deploy Bond and Treasury");
      } catch (error) {
        logError(`❌ Failed to deploy bond and treasury: ${error.message}`);
        results.failed.push({ step: "Deploy Bond and Treasury", error: error.message });
        throw error; // Can't continue without a treasury
      }
    } else {
      log("⏭️  Skipping Bond and Treasury deployment", colors.yellow);
      results.skipped.push("Deploy Bond and Treasury");
      throw new Error("Cannot proceed without deploying a treasury. Please enable deployBondAndTreasury.");
    }

    // ========================================
    // 2. PAUSE AND UNPAUSE TREASURY
    // ========================================
    if (config.pauseUnpause) {
      logHeader("⏸️  Step 2: Testing Pause and Unpause");
      try {
        await verifyTreasuryPauseUnpause(treasury.contractId);
        logSuccess("✅ Pause and Unpause tests passed!");
        results.passed.push("Pause and Unpause");
      } catch (error) {
        logError(`❌ Failed pause/unpause tests: ${error.message}`);
        results.failed.push({ step: "Pause and Unpause", error: error.message });
      }
    } else {
      log("⏭️  Skipping Pause and Unpause tests", colors.yellow);
      results.skipped.push("Pause and Unpause");
    }

    // ========================================
    // 3. TREASURY ROLES
    // ========================================
    if (config.roles) {
      logHeader("🔐 Step 3: Testing Treasury Roles");
      try {
        await verifyTreasuryRoles(treasury.contractId);
        logSuccess("✅ Treasury Roles tests passed!");
        results.passed.push("Treasury Roles");
      } catch (error) {
        logError(`❌ Failed treasury roles tests: ${error.message}`);
        results.failed.push({ step: "Treasury Roles", error: error.message });
      }
    } else {
      log("⏭️  Skipping Treasury Roles tests", colors.yellow);
      results.skipped.push("Treasury Roles");
    }

    // ========================================
    // 4. PAYMENT TOKEN TESTS
    // ========================================
    if (config.paymentToken?.enabled) {
      logHeader("💰 Step 4: Testing Payment Token Operations");

      // Note: Payment token transfer/dissociate tests create their own infrastructure
      // because they need specific token setup. Only "update" can work with existing treasury.

      // 4.1 Update Payment Token
      if (config.paymentToken.updateToken) {
        try {
          log("💱 Testing Update Payment Token...", colors.cyan);
          await verifyTreasuryPaymentTokenUpdate(treasury.contractId);
          logSuccess("✅ Update Payment Token passed!");
          results.passed.push("Update Payment Token");
        } catch (error) {
          logError(`❌ Failed update payment token: ${error.message}`);
          results.failed.push({ step: "Update Payment Token", error: error.message });
        }
      } else {
        log("⏭️  Skipping Update Payment Token", colors.yellow);
        results.skipped.push("Update Payment Token");
      }

      // 4.2 Transfer Payment Token TO Treasury
      // Note: This test creates its own treasury and token setup
      if (config.paymentToken.transferToTreasury) {
        try {
          log("➡️  Testing Transfer Payment Token TO Treasury...", colors.cyan);
          log("   (Creating new treasury with custom payment token setup)", colors.cyan);
          await verifyTransferPaymentTokenToTreasury();
          logSuccess("✅ Transfer Payment Token TO Treasury passed!");
          results.passed.push("Transfer Payment Token TO Treasury");
        } catch (error) {
          logError(`❌ Failed transfer payment token to treasury: ${error.message}`);
          results.failed.push({ step: "Transfer Payment Token TO Treasury", error: error.message });
        }
      } else {
        log("⏭️  Skipping Transfer Payment Token TO Treasury", colors.yellow);
        results.skipped.push("Transfer Payment Token TO Treasury");
      }

      // 4.3 Transfer Payment Token FROM Treasury
      // Note: This test creates its own treasury and token setup
      if (config.paymentToken.transferFromTreasury) {
        try {
          log("⬅️  Testing Transfer Payment Token FROM Treasury...", colors.cyan);
          log("   (Creating new treasury with custom payment token setup)", colors.cyan);
          await verifyTransferPaymentTokenFromTreasury();
          logSuccess("✅ Transfer Payment Token FROM Treasury passed!");
          results.passed.push("Transfer Payment Token FROM Treasury");
        } catch (error) {
          logError(`❌ Failed transfer payment token from treasury: ${error.message}`);
          results.failed.push({ step: "Transfer Payment Token FROM Treasury", error: error.message });
        }
      } else {
        log("⏭️  Skipping Transfer Payment Token FROM Treasury", colors.yellow);
        results.skipped.push("Transfer Payment Token FROM Treasury");
      }

      // 4.4 Dissociate Payment Token
      // Note: This test creates its own treasury and token setup
      if (config.paymentToken.dissociate) {
        try {
          log("🔌 Testing Dissociate Payment Token...", colors.cyan);
          log("   (Creating new treasury with custom payment token setup)", colors.cyan);
          await verifyDissociatePaymentToken();
          logSuccess("✅ Dissociate Payment Token passed!");
          results.passed.push("Dissociate Payment Token");
        } catch (error) {
          logError(`❌ Failed dissociate payment token: ${error.message}`);
          results.failed.push({ step: "Dissociate Payment Token", error: error.message });
        }
      } else {
        log("⏭️  Skipping Dissociate Payment Token", colors.yellow);
        results.skipped.push("Dissociate Payment Token");
      }
    } else {
      log("⏭️  Skipping all Payment Token tests", colors.yellow);
      results.skipped.push("Payment Token Tests (all)");
    }

    // ========================================
    // 5. ENVIRONMENTAL ASSET TOKEN TESTS
    // ========================================
    if (config.environmentalAssets?.enabled) {
      logHeader("🌱 Step 5: Testing Environmental Asset Token Operations");

      // Note: Environmental asset tests have dependencies between them and create their own infrastructure

      // 5.1 Add Environmental Asset Token
      if (config.environmentalAssets.addToken) {
        try {
          log("➕ Testing Add Environmental Asset Token...", colors.cyan);
          log("   (Creating new treasury for this test)", colors.cyan);
          await verifyAddEnvironmentalAssetToken();
          logSuccess("✅ Add Environmental Asset Token passed!");
          results.passed.push("Add Environmental Asset Token");
        } catch (error) {
          logError(`❌ Failed add environmental asset token: ${error.message}`);
          results.failed.push({ step: "Add Environmental Asset Token", error: error.message });
        }
      } else {
        log("⏭️  Skipping Add Environmental Asset Token", colors.yellow);
        results.skipped.push("Add Environmental Asset Token");
      }

      // 5.2 Transfer Environmental Asset Token TO Treasury
      // Note: This test internally calls verifyAddEnvironmentalAssetToken
      if (config.environmentalAssets.transferToTreasury) {
        try {
          log("➡️  Testing Transfer Environmental Asset Token TO Treasury...", colors.cyan);
          log("   (Creating new treasury and adding token)", colors.cyan);
          await verifyTransferEnvironmentalAssetTokenToTreasury();
          logSuccess("✅ Transfer Environmental Asset Token TO Treasury passed!");
          results.passed.push("Transfer Environmental Asset Token TO Treasury");
        } catch (error) {
          logError(`❌ Failed transfer environmental asset token to treasury: ${error.message}`);
          results.failed.push({ step: "Transfer Environmental Asset Token TO Treasury", error: error.message });
        }
      } else {
        log("⏭️  Skipping Transfer Environmental Asset Token TO Treasury", colors.yellow);
        results.skipped.push("Transfer Environmental Asset Token TO Treasury");
      }

      // 5.3 Transfer Environmental Asset Token FROM Treasury
      // Note: This test internally calls verifyTransferEnvironmentalAssetTokenToTreasury
      if (config.environmentalAssets.transferFromTreasury) {
        try {
          log("⬅️  Testing Transfer Environmental Asset Token FROM Treasury...", colors.cyan);
          log("   (Creating new treasury and transferring token)", colors.cyan);
          await verifyTransferEnvironmentalAssetTokenFromTreasury();
          logSuccess("✅ Transfer Environmental Asset Token FROM Treasury passed!");
          results.passed.push("Transfer Environmental Asset Token FROM Treasury");
        } catch (error) {
          logError(`❌ Failed transfer environmental asset token from treasury: ${error.message}`);
          results.failed.push({ step: "Transfer Environmental Asset Token FROM Treasury", error: error.message });
        }
      } else {
        log("⏭️  Skipping Transfer Environmental Asset Token FROM Treasury", colors.yellow);
        results.skipped.push("Transfer Environmental Asset Token FROM Treasury");
      }

      // 5.4 Delete Environmental Asset Token
      // Note: This test internally calls verifyAddEnvironmentalAssetToken
      if (config.environmentalAssets.deleteToken) {
        try {
          log("🗑️  Testing Delete Environmental Asset Token...", colors.cyan);
          log("   (Creating new treasury and adding token)", colors.cyan);
          await verifyDeleteEnvironmentalAssetToken();
          logSuccess("✅ Delete Environmental Asset Token passed!");
          results.passed.push("Delete Environmental Asset Token");
        } catch (error) {
          logError(`❌ Failed delete environmental asset token: ${error.message}`);
          results.failed.push({ step: "Delete Environmental Asset Token", error: error.message });
        }
      } else {
        log("⏭️  Skipping Delete Environmental Asset Token", colors.yellow);
        results.skipped.push("Delete Environmental Asset Token");
      }

      // 5.5 Dissociate Environmental Asset Token
      // Note: This test internally calls verifyDeleteEnvironmentalAssetToken
      if (config.environmentalAssets.dissociate) {
        try {
          log("🔌 Testing Dissociate Environmental Asset Token...", colors.cyan);
          log("   (Creating new treasury and deleting token with dissociation)", colors.cyan);
          await verifyDissociateEnvironmentalAssetToken();
          logSuccess("✅ Dissociate Environmental Asset Token passed!");
          results.passed.push("Dissociate Environmental Asset Token");
        } catch (error) {
          logError(`❌ Failed dissociate environmental asset token: ${error.message}`);
          results.failed.push({ step: "Dissociate Environmental Asset Token", error: error.message });
        }
      } else {
        log("⏭️  Skipping Dissociate Environmental Asset Token", colors.yellow);
        results.skipped.push("Dissociate Environmental Asset Token");
      }
    } else {
      log("⏭️  Skipping all Environmental Asset Token tests", colors.yellow);
      results.skipped.push("Environmental Asset Token Tests (all)");
    }

    // ========================================
    // 6. PROCEEDS RECIPIENT FUND TEST
    // ========================================
    if (config.proceedsRecipient) {
      logHeader("💵 Step 6: Testing Proceeds Recipient Fund");
      try {
        log("   (Creating new treasury with custom payment token setup)", colors.cyan);
        await verifyFundProceedsRecipient();
        logSuccess("✅ Proceeds Recipient Fund tests passed!");
        results.passed.push("Proceeds Recipient Fund");
      } catch (error) {
        logError(`❌ Failed proceeds recipient fund tests: ${error.message}`);
        results.failed.push({ step: "Proceeds Recipient Fund", error: error.message });
      }
    } else {
      log("⏭️  Skipping Proceeds Recipient Fund tests", colors.yellow);
      results.skipped.push("Proceeds Recipient Fund");
    }

    // ========================================
    // 7. DISTRIBUTION TESTS
    // ========================================
    if (config.distribution) {
      logHeader("📊 Step 7: Testing Treasury Distributions");
      try {
        await verifyTreasuryDistributions();
        logSuccess("✅ Treasury Distributions tests passed!");
        results.passed.push("Treasury Distributions");
      } catch (error) {
        logError(`❌ Failed distribution tests: ${error.message}`);
        results.failed.push({ step: "Treasury Distributions", error: error.message });
      }
    } else {
      log("⏭️  Skipping Treasury Distributions tests", colors.yellow);
      results.skipped.push("Treasury Distributions");
    }

    // ========================================
    // 8. REDEMPTION TESTS
    // ========================================
    if (config.redemption) {
      logHeader("� Step 8: Testing Treasury Redemption");
      try {
        await verifyTreasuryRedemptions();
        logSuccess("✅ Treasury Redemption tests passed!");
        results.passed.push("Treasury Redemption");
      } catch (error) {
        logError(`❌ Failed redemption tests: ${error.message}`);
        results.failed.push({ step: "Treasury Redemption", error: error.message });
      }
    } else {
      log("⏭️  Skipping Treasury Redemption tests", colors.yellow);
      results.skipped.push("Treasury Redemption");
    }

    // ========================================
    // FINAL SUMMARY
    // ========================================
    logHeader("📋 ORCHESTRATOR TEST SUITE SUMMARY");

    log(`\n✅ Passed: ${results.passed.length}`, colors.green);
    results.passed.forEach((step) => log(`   • ${step}`, colors.green));

    if (results.failed.length > 0) {
      log(`\n❌ Failed: ${results.failed.length}`, colors.red);
      results.failed.forEach(({ step, error }) => {
        log(`   • ${step}`, colors.red);
        log(`     Error: ${error}`, colors.red);
      });
    }

    if (results.skipped.length > 0) {
      log(`\n⏭️  Skipped: ${results.skipped.length}`, colors.yellow);
      results.skipped.forEach((step) => log(`   • ${step}`, colors.yellow));
    }

    if (results.failed.length === 0) {
      logSuccess("\n🎉 ALL TESTS PASSED! Treasury orchestrator completed successfully!");
    } else {
      logError(
        `\n⚠️  SOME TESTS FAILED! ${results.failed.length} out of ${results.passed.length + results.failed.length} tests failed.`,
      );
    }

    return results;
  } catch (error) {
    logError(`\n💥 ORCHESTRATOR FAILED: ${error.message}`);
    logError(error.stack);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // You can customize the configuration here
    // Example: Skip certain tests
    const customConfig = {
      ...DEFAULT_CONFIG,
      // Uncomment to skip specific tests:
      // pauseUnpause: false,
      // roles: false,
      // paymentToken: {
      //   ...DEFAULT_CONFIG.paymentToken,
      //   dissociate: false
      // }
    };

    await runTreasuryOrchestrator(customConfig);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runTreasuryOrchestrator,
  DEFAULT_CONFIG,
};
