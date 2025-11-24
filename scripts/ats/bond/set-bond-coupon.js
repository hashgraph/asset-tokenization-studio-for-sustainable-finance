const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { createBond } = require("./bond-service");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { getLatestBond } = require("./set-bond-document");

const COUPON_CONFIG = {
  recordDate: new Date(Date.now() + 86400000), // Tomorrow
  executionDate: new Date(Date.now() + 172800000), // Day after tomorrow
  rate: "500",
  rateDecimals: "2", // 500 basis points = 5.00%
  period: "31536000", // 1 year in seconds (365 days)
};

async function setBondCoupon(bondContractId, recordDate, executionDate, rate, rateDecimals, period, format) {
  log(`\n💰 Setting coupon on bond ${bondContractId}...`, colors.bright);

  const setCouponRequest = {
    recordDate: recordDate,
    executionDate: executionDate,
    rate: rate,
    rateDecimals: rateDecimals,
    period: period,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(`/api/v1/ats/bonds/${bondContractId}/coupons`, setCouponRequest);

    logSuccess("Bond coupon transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Record Date: ${recordDate}`);
    logInfo(`Execution Date: ${executionDate}`);
    logInfo(`Rate: ${rate} basis points (${rate / 100}%)`);
    logInfo(`Rate Decimals: ${rateDecimals}`);
    logInfo(`Period: ${period} seconds (${period / 86400} days)`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...setCouponRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to set bond coupon: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function getCouponsForBond(bondContractId) {
  log(`\n🔍 Fetching coupons for bond ${bondContractId}...`, colors.bright);

  try {
    // Fetch all coupons (with a high limit to get all)
    const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/coupons?limit=20`);

    if (response.data && response.data.couponIds && response.data.couponIds.length > 0) {
      logSuccess(`Found ${response.data.couponIds.length} coupon(s) for bond ${bondContractId}`);
      logInfo(`Coupon IDs: ${response.data.couponIds.join(", ")}`);
      return response.data.couponIds;
    } else {
      logInfo("No coupons found for this bond yet");
      return [];
    }
  } catch (error) {
    logError(`Failed to fetch coupons: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return [];
  }
}

async function verifyCouponInDatabase(bondContractId) {
  log(`\n🔍 Coupon verification:`, colors.bright);
  logSuccess(`Set coupon transaction has been sent successfully`);
  logInfo(`The CouponSetEvent should have been processed by the blockchain listener`);
  logInfo(`✅ To verify the coupon was created, run a database query:`);
  logInfo(`Expected result: BondCoupons table should have a new entry for bond "${bondContractId}"`);
  logInfo(`You should also see a BondCouponSetEvent in the domain events\n`);
}

async function runSetBondCouponSimulator() {
  logHeader("🚀 Running Set Bond Coupon Simulator...");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader("📝 Step 1: Creating Bond...");
  const bond = await createBond(format);

  try {
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    log("\n⏳ Waiting for bond creation to be processed (15 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 15000));

    logHeader("📊 Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      return;
    }

    const bondContractId = latestBond.contractId;

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Bond Symbol: ${latestBond.symbol}`);
    logInfo(`Bond Name: ${latestBond.name}`);

    log("\n⏳ Waiting for blockchain listener to register event filters (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("💰 Step 3: Setting Bond Coupon...");

    logInfo(`Record Date: ${COUPON_CONFIG.recordDate}`);
    logInfo(`Execution Date: ${COUPON_CONFIG.executionDate}`);
    logInfo(`Rate: ${COUPON_CONFIG.rate} basis points (${COUPON_CONFIG.rate / 100}%)`);
    logInfo(`Rate Decimals: ${COUPON_CONFIG.rateDecimals}`);
    logInfo(`Period: ${COUPON_CONFIG.period} seconds (${COUPON_CONFIG.period / 86400} days)`);

    const couponTransaction = await setBondCoupon(
      bondContractId,
      COUPON_CONFIG.recordDate,
      COUPON_CONFIG.executionDate,
      COUPON_CONFIG.rate,
      COUPON_CONFIG.rateDecimals,
      COUPON_CONFIG.period,
      format,
    );

    const signedCouponTx = await signTransaction(couponTransaction.unsignedTx);
    logSuccess("Bond coupon transaction signed successfully!");

    await publishSignedTransaction(signedCouponTx);
    logSuccess("Coupon transaction published to message queue");

    log("\n⏳ Waiting for coupon to be processed and event to be captured (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("✅ Step 4: Verifying Coupon Creation...");
    await verifyCouponInDatabase(bondContractId);

    logHeader("🎉 Set Bond Coupon Simulation Completed!");
    logSuccess(`Created bond with contract ID: ${bondContractId}`);
    logSuccess(`Set coupon with rate ${COUPON_CONFIG.rate / 100}% on the bond`);
    logSuccess("✅ Check the database to verify:");
    logInfo(`   • Bonds table for contract ID: ${bondContractId}`);
    logInfo(`   • BondCoupons table for the new coupon entry`);
    logInfo(`   • Record Date: ${COUPON_CONFIG.recordDate}`);
    logInfo(`   • Execution Date: ${COUPON_CONFIG.executionDate}`);
    logInfo(`   • Rate: ${COUPON_CONFIG.rate} basis points`);
    logInfo(`   • Rate Decimals: ${COUPON_CONFIG.rateDecimals}`);
    logInfo(`   • Period: ${COUPON_CONFIG.period} seconds (${COUPON_CONFIG.period / 86400} days)`);
  } catch (error) {
    logError(`Failed to complete simulation: ${error.message}`);
    logError("Make sure:");
    logError("   • Private key in .env file is valid for the selected blockchain format");
    logError("   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format");
    logError("   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format");
    logError("   • Gateway API is running and accessible");
    logError("   • Database is accessible and properly configured");
    logError("   • Blockchain listener is running to capture CouponSet events");
    logError("   • BondCoupons table exists in the database (migration may be needed)");
  }
}

async function main() {
  try {
    logHeader("🏦 Evercity Set Bond Coupon Simulator");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`📅 Record Date: ${COUPON_CONFIG.recordDate}`, colors.cyan);
    log(`📅 Execution Date: ${COUPON_CONFIG.executionDate}`, colors.cyan);
    log(`💵 Rate: ${COUPON_CONFIG.rate} basis points (${COUPON_CONFIG.rate / 100}%)`, colors.cyan);
    log(`🔢 Rate Decimals: ${COUPON_CONFIG.rateDecimals}`, colors.cyan);
    log(`⏱️  Period: ${COUPON_CONFIG.period} seconds (${COUPON_CONFIG.period / 86400} days)\n`, colors.cyan);

    await runSetBondCouponSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runSetBondCouponSimulator, setBondCoupon, getCouponsForBond, verifyCouponInDatabase };
