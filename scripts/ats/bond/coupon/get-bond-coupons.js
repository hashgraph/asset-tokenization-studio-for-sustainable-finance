const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { setBondCoupon } = require("./set-bond-coupon");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { getLatestBond } = require("../document/set-bond-document");

const COUPON_CONFIGS = [
  {
    name: "First Coupon",
    recordDate: new Date(Date.now() + 86400000), // Tomorrow
    executionDate: new Date(Date.now() + 172800000), // 2 days
    rate: "500",
    rateDecimals: "2", // 500 basis points = 5.00%
    period: "31536000", // 1 year in seconds (365 days)
  },
  {
    name: "Second Coupon",
    recordDate: new Date(Date.now() + 259200000), // 3 days
    executionDate: new Date(Date.now() + 345600000), // 4 days
    rate: "750",
    rateDecimals: "2", // 750 basis points = 7.50%
    period: "31536000", // 1 year in seconds (365 days)
  },
  {
    name: "Third Coupon",
    recordDate: new Date(Date.now() + 432000000), // 5 days
    executionDate: new Date(Date.now() + 518400000), // 6 days
    rate: "600",
    rateDecimals: "2", // 600 basis points = 6.00%
    period: "31536000", // 1 year in seconds (365 days)
  },
];

async function getBondCoupons(bondContractId) {
  log(`\n📋 Fetching all coupons for bond ${bondContractId}...`, colors.bright);

  try {
    // Fetch with high limit to get all coupons
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/coupons?limit=20`);

    if (response.data && response.data.couponIds && response.data.couponIds.length > 0) {
      logSuccess(`Found ${response.data.couponIds.length} coupon(s)`);
      logInfo(`Coupon IDs: ${response.data.couponIds.join(", ")}`);
      return response.data.couponIds;
    } else {
      logInfo("No coupons found for this bond");
      return [];
    }
  } catch (error) {
    logError(`Failed to fetch bond coupons: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function getBondCoupon(bondContractId, couponId) {
  log(`\n🎫 Fetching coupon ${couponId} for bond ${bondContractId}...`, colors.bright);

  try {
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/coupons/${couponId}`);

    if (response.data) {
      logSuccess("Coupon details retrieved successfully!");
      logInfo(`\nCoupon Information:`);
      logInfo(`  • Coupon ID: ${response.data.id}`);
      logInfo(`  • Contract ID: ${response.data.bondContractId}`);
      logInfo(`  • Corporate Action ID: ${response.data.corporateActionId}`);
      logInfo(`  • Record Date: ${new Date(response.data.recordDate).toISOString()}`);
      logInfo(`  • Execution Date: ${new Date(response.data.executionDate).toISOString()}`);
      logInfo(`  • Rate: ${response.data.rate} basis points (${response.data.rate / 100}%)`);
      logInfo(`  • Operator: ${response.data.operator}`);
      return response.data;
    } else {
      logError("Coupon not found");
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch coupon: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function createCoupon(bondContractId, couponConfig, format) {
  log(`\n💰 Creating ${couponConfig.name}...`, colors.bright);
  logInfo(`Record Date: ${couponConfig.recordDate.toISOString()}`);
  logInfo(`Execution Date: ${couponConfig.executionDate.toISOString()}`);
  logInfo(`Rate: ${couponConfig.rate} basis points (${couponConfig.rate / 100}%)`);

  try {
    const couponTransaction = await setBondCoupon(
      bondContractId,
      couponConfig.recordDate,
      couponConfig.executionDate,
      couponConfig.rate,
      couponConfig.rateDecimals,
      couponConfig.period,
      format,
    );

    const signedCouponTx = await signTransaction(couponTransaction.unsignedTx);
    logSuccess("Coupon transaction signed successfully!");

    await publishSignedTransaction(signedCouponTx);
    logSuccess("Coupon transaction published to message queue");

    return true;
  } catch (error) {
    logError(`Failed to create coupon: ${error.message}`);
    throw error;
  }
}

async function runAutomaticTest() {
  logHeader("🤖 Automatic Bond Coupon Test Suite");
  logInfo("This script will automatically:");
  logInfo("  1. Find or verify an existing bond");
  logInfo("  2. Check for existing coupons");
  logInfo("  3. Create multiple coupons if needed");
  logInfo("  4. Test both GET endpoints");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  try {
    logHeader("🔍 Step 1: Finding Latest Bond");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("❌ No bonds found in the system");
      logError("Please create a bond first using bond-simulator.js");
      process.exit(1);
    }

    const bondContractId = latestBond.contractId;
    logSuccess(`Found bond: ${bondContractId}`);
    logInfo(`Symbol: ${latestBond.symbol}`);
    logInfo(`Name: ${latestBond.name}`);

    logHeader("📋 Step 2: Checking Existing Coupons");
    let couponIds = await getBondCoupons(bondContractId);

    if (couponIds.length <= 2) {
      logHeader("💰 Step 3: Creating Test Coupons");
      log(`No coupons found. Creating ${COUPON_CONFIGS.length} test coupons...`, colors.yellow);

      for (let i = 0; i < COUPON_CONFIGS.length; i++) {
        const couponConfig = COUPON_CONFIGS[i];
        log(`\n[${i + 1}/${COUPON_CONFIGS.length}] Creating ${couponConfig.name}...`, colors.cyan);

        await createCoupon(bondContractId, couponConfig, format);

        if (i < COUPON_CONFIGS.length - 1) {
          log("⏳ Waiting 5 seconds before next coupon...", colors.yellow);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      log("\n⏳ Waiting for all coupons to be processed (15 seconds)...", colors.yellow);
      await new Promise((resolve) => setTimeout(resolve, 15000));

      logSuccess(`Created ${COUPON_CONFIGS.length} test coupons!`);
    } else {
      logSuccess(`Bond already has ${couponIds.length} coupon(s)`);
      log("Skipping coupon creation...", colors.cyan);
    }

    logHeader("🧪 Step 4: Testing GET All Coupons Endpoint");
    couponIds = await getBondCoupons(bondContractId);

    if (couponIds.length === 0) {
      logError("❌ No coupons found after creation. Check blockchain listener and database.");
      process.exit(1);
    }

    logHeader("🎫 Step 5: Testing GET Specific Coupon Endpoint");
    log(`Testing retrieval of ${couponIds.length} individual coupon(s)...\n`, colors.cyan);

    const retrievedCoupons = [];
    for (let i = 0; i < 2; i++) {
      const couponId = couponIds[i];
      log(`[${i + 1}/${couponIds.length}] Fetching coupon ${couponId}...`, colors.bright);

      const coupon = await getBondCoupon(bondContractId, couponId);
      if (coupon) {
        retrievedCoupons.push(coupon);
      }

      if (i < couponIds.length - 1) {
        log("");
      }
    }

    logHeader("🎉 Test Suite Complete!");

    log("\n📊 Coupon Summary:", colors.bright);
    retrievedCoupons.forEach((coupon, index) => {
      log(`\n  Coupon ${index + 1}:`, colors.cyan);
      logInfo(`    • ID: ${coupon.id}`);
      logInfo(`    • Rate: ${coupon.rate / 100}%`);
      logInfo(`    • Record Date: ${new Date(coupon.recordDate).toISOString()}`);
      logInfo(`    • Execution Date: ${new Date(coupon.executionDate).toISOString()}`);
    });

    log("\n" + "=".repeat(60), colors.green);
    logSuccess("All tests passed successfully! 🚀");
    log("=".repeat(60) + "\n", colors.green);
  } catch (error) {
    logError(`Automatic test failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env PORT)");
    logError("   • Ensure Database is accessible");
    logError("   • Ensure Blockchain listener is running");
    logError("   • Check private key configuration in .env");
    logError("   • Verify ACCOUNT_ID in .env is correct");
    process.exit(1);
  }
}

async function main() {
  try {
    logHeader("🏦 Evercity Bond Coupon GET Endpoints Tester");
    log("=".repeat(60), colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);
    log("=".repeat(60) + "\n", colors.bright);

    await runAutomaticTest();
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getBondCoupons, getBondCoupon, createCoupon, runAutomaticTest };
