const { deployBondWaitTreasuryAndApplyRoles } = require("../verify-treasury-persistence");
const { mintBond } = require("../../ats/bond/mint-bond");
const { setBondCoupon, getCouponsForBond } = require("../../ats/bond/coupon/set-bond-coupon");
const { deployHTSToken } = require("../../primary-market/offering/hts-token-service");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
const { Client, PrivateKey, TransferTransaction } = require("@hiero-ledger/sdk");

/**
 * Execute a distribution paginated by transactions
 */
async function executeDistributionPaginated(treasuryId, distributionId, page = 1, limit = 25, maxBatchSize = 10) {
  log(`\n💸 Executing distribution (paginated) ${distributionId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    distributionId: parseInt(distributionId),
    maxBatchSize: maxBatchSize,
    pageOptions: {
      page: page,
      limit: limit,
    },
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/distributions/${distributionId}`,
    requestBody,
  );

  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error(
      "API did not return transactions. The distribution might not be ready or parameters are incorrect.",
    );
  }

  const unsignedTxs = response.data.items;
  logSuccess(`Received ${unsignedTxs.length} transaction(s) to sign and publish`);

  // Sign and publish each transaction
  for (let i = 0; i < unsignedTxs.length; i++) {
    const unsignedTx = unsignedTxs[i];
    log(`   Processing transaction ${i + 1}/${unsignedTxs.length}...`, colors.cyan);

    // Sign
    const signedTx = await signTransaction(unsignedTx);
    log(`   ✓ Signed transaction ${i + 1}`, colors.green);

    // Publish
    await publishSignedTransaction(signedTx);
    log(`   ✓ Published transaction ${i + 1}`, colors.green);
  }

  logSuccess(`All ${unsignedTxs.length} distribution transaction(s) processed!`);
  return response.data;
}

/**
 * Execute a distribution by holder addresses
 */
async function executeDistributionByHolders(treasuryId, distributionId, holderAccountIds, maxBatchSize = 10) {
  log(`\n💸 Executing distribution (by holders) ${distributionId}...`, colors.yellow);
  log(`   Holders: ${JSON.stringify(holderAccountIds)}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    distributionId: parseInt(distributionId),
    maxBatchSize: maxBatchSize,
    holdersAccountIds: holderAccountIds,
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/distributions/${distributionId}/holders`,
    requestBody,
  );

  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error(
      "API did not return transactions. The distribution might not be ready or parameters are incorrect.",
    );
  }

  const unsignedTxs = response.data.items;
  logSuccess(`Received ${unsignedTxs.length} transaction(s) to sign and publish`);

  // Sign and publish each transaction
  for (let i = 0; i < unsignedTxs.length; i++) {
    const unsignedTx = unsignedTxs[i];
    log(`   Processing transaction ${i + 1}/${unsignedTxs.length}...`, colors.cyan);

    // Sign
    const signedTx = await signTransaction(unsignedTx);
    log(`   ✓ Signed transaction ${i + 1}`, colors.green);

    // Publish
    await publishSignedTransaction(signedTx);
    log(`   ✓ Published transaction ${i + 1}`, colors.green);
  }

  logSuccess(`All ${unsignedTxs.length} distribution transaction(s) processed!`);
  return response.data;
}

/**
 * Wait for coupon to be persisted in ATS database
 */
async function waitForCoupon(bondContractId, expectedCount, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for ${expectedCount} coupon(s) to be persisted in ATS...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const coupons = await getCouponsForBond(bondContractId);

      if (coupons && coupons.length >= expectedCount) {
        logSuccess(`Found ${coupons.length} coupon(s)!`);
        coupons.forEach((id, index) => {
          log(`   Coupon ${index + 1}: ${id}`, colors.cyan);
        });
        return coupons;
      } else {
        log(`   Found ${coupons?.length || 0} coupon(s), expecting ${expectedCount}`, colors.yellow);
      }
    } catch (err) {
      logError(`   Error fetching coupons: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Expected ${expectedCount} coupons, but not all were found after ${maxRetries} attempts`);
}

async function verifyTreasuryDistributions() {
  logHeader("🧪 Running Treasury Distributions Verification...");

  if (!validateSigningConfig()) {
    logError("Signing configuration validation failed");
    process.exit(1);
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const holderAccount1 = process.env.HOLDER_ACCOUNT_1 || process.env.ACCOUNT_ID;
  const holderAccount2 = process.env.HOLDER_ACCOUNT_2 || process.env.ACCOUNT_ID;
  const mintAmount = process.env.MINT_AMOUNT || "500000";
  // Coupon dates are computed lazily right before each setBondCoupon call
  // because the contract requires fixingDate / recordDate > block.timestamp,
  // and the steps between here and that call (token deploy, bond deploy,
  // mint, RabbitMQ, consensus) easily eat tens of seconds.
  //
  // For KpiLinkedRate bonds (which is what GBP deploys via FactorySuite), the
  // contract enforces rate == 0, rateDecimals == 0, rateStatus == PENDING(0)
  // — the actual rate is computed on chain from the KPI data at fixingDate.
  // See BondStorageWrapperFixingDateInterestRate._checkCoupon and the
  // InterestRateIsKpiLinked() error.
  const buildCouponConfig = (name, fixingOffsetMs, recordOffsetMs, executionOffsetMs) => {
    const now = Date.now();
    return {
      name,
      recordDate: new Date(now + recordOffsetMs),
      executionDate: new Date(now + executionOffsetMs),
      startDate: new Date(now),
      endDate: new Date(now + 31536000000), // 1 year from now
      fixingDate: new Date(now + fixingOffsetMs),
      rate: "0",
      rateDecimals: "0",
      rateStatus: "0", // 0=PENDING, 1=FIXED
    };
  };
  const FIRST_COUPON_OFFSETS = { fixing: 120_000, record: 180_000, execution: 240_000 }; // 2 / 3 / 4 min
  const SECOND_COUPON_OFFSETS = { fixing: 180_000, record: 240_000, execution: 300_000 }; // 3 / 4 / 5 min

  try {
    // 1. Deploy Custom Payment Token
    log("\n1️⃣  Deploying custom payment token...");
    const { tokenId: paymentTokenId, evmAddress: paymentTokenEvmAddress } = await deployHTSToken(
      "Test Payment Token",
      "TPT",
      6,
      10_000_000_000, // 10,000 tokens with 6 decimals
    );
    logSuccess(`Payment token deployed: ${paymentTokenId}`);
    logSuccess(`Payment token EVM address: ${paymentTokenEvmAddress}`);

    // 2. Deploy Bond and Treasury with Custom Payment Token
    log("\n2️⃣  Deploying bond with custom payment token...");
    const overrides = {
      treasuryData: {
        paymentTokenAddress: paymentTokenEvmAddress,
      },
    };
    const treasury = await deployBondWaitTreasuryAndApplyRoles(paymentTokenId, overrides);
    const bondContractId = treasury.bondContractId;
    const treasuryId = treasury.contractId;

    logSuccess(`Bond deployed: ${bondContractId}`);
    logSuccess(`Treasury deployed: ${treasuryId}`);

    // 3. Fund Treasury with Custom Payment Token
    log("\n3️⃣  Funding treasury with payment tokens...");
    await fundTreasuryWithToken(treasuryId, paymentTokenId, 4_000_000); // 4 tokens with 6 decimals
    logSuccess("Treasury funded with payment tokens");

    // 4. Mint tokens to holders
    log("\n4️⃣  Minting tokens to holders...");
    log(`   Minting ${mintAmount} tokens to ${holderAccount1}...`, colors.cyan);
    const mint1 = await mintBond(bondContractId, holderAccount1, "", mintAmount, format);
    await publishSignedTransaction(await signTransaction(mint1.unsignedTx));
    logSuccess(`Minted to holder 1`);

    if (holderAccount1 !== holderAccount2) {
      log(`   Minting ${mintAmount} tokens to ${holderAccount2}...`, colors.cyan);
      const mint2 = await mintBond(bondContractId, holderAccount2, "", mintAmount, format);
      await publishSignedTransaction(await signTransaction(mint2.unsignedTx));
      logSuccess(`Minted to holder 2`);
    }

    log("⏳ Waiting for minting to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 5. Set first coupon
    log("\n5️⃣  Setting first coupon on bond...");
    const firstCoupon = buildCouponConfig(
      "First Coupon (Paginated)",
      FIRST_COUPON_OFFSETS.fixing,
      FIRST_COUPON_OFFSETS.record,
      FIRST_COUPON_OFFSETS.execution,
    );
    log(`   ${firstCoupon.name}`, colors.cyan);
    const couponTx1 = await setBondCoupon(
      bondContractId,
      firstCoupon.recordDate,
      firstCoupon.executionDate,
      firstCoupon.startDate,
      firstCoupon.endDate,
      firstCoupon.fixingDate,
      firstCoupon.rate,
      firstCoupon.rateDecimals,
      firstCoupon.rateStatus,
      format,
    );
    await publishSignedTransaction(await signTransaction(couponTx1.unsignedTx));
    logSuccess("First coupon transaction published");

    log("⏳ Waiting 5 seconds before creating second coupon...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 6. Set second coupon
    log("\n6️⃣  Setting second coupon on bond...");
    const secondCoupon = buildCouponConfig(
      "Second Coupon (By Holders)",
      SECOND_COUPON_OFFSETS.fixing,
      SECOND_COUPON_OFFSETS.record,
      SECOND_COUPON_OFFSETS.execution,
    );
    log(`   ${secondCoupon.name}`, colors.cyan);
    const couponTx2 = await setBondCoupon(
      bondContractId,
      secondCoupon.recordDate,
      secondCoupon.executionDate,
      secondCoupon.startDate,
      secondCoupon.endDate,
      secondCoupon.fixingDate,
      secondCoupon.rate,
      secondCoupon.rateDecimals,
      secondCoupon.rateStatus,
      format,
    );
    await publishSignedTransaction(await signTransaction(couponTx2.unsignedTx));
    logSuccess("Second coupon transaction published");

    // 7. Wait for both coupons to be persisted in ATS
    log("\n7️⃣  Waiting for both coupons to be persisted in ATS database...");
    const coupons = await waitForCoupon(bondContractId, 2);
    const distributionId1 = coupons[0];
    const distributionId2 = coupons[1];
    logSuccess(`Distribution IDs: ${distributionId1}, ${distributionId2}`);

    // 6. Wait for execution dates to pass
    const waitTime = Math.max(
      firstCoupon.executionDate.getTime() - Date.now(),
      secondCoupon.executionDate.getTime() - Date.now(),
    );
    if (waitTime > 0) {
      log(`\n⏳ Waiting ${Math.ceil(waitTime / 1000)} seconds for execution dates to pass...`, colors.yellow);
      await new Promise((resolve) => setTimeout(resolve, waitTime + 5000)); // Add 5s buffer
    }

    // 8. Execute first distribution (paginated)
    log("\n8️⃣  Executing first distribution (paginated by transactions)...");
    await executeDistributionPaginated(treasuryId, distributionId1);

    log("⏳ Waiting for distribution to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 7.1 Verify first distribution status
    await verifyDistributionStatus(treasuryId, distributionId1);

    // 9. Execute second distribution (by specific holders)
    log("\n9️⃣  Executing second distribution (by holder addresses)...");
    const holderAddresses = [holderAccount1];
    if (holderAccount1 !== holderAccount2) {
      holderAddresses.push(holderAccount2);
    }
    await executeDistributionByHolders(treasuryId, distributionId2, holderAddresses);

    log("⏳ Waiting for distribution to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // 8.1 Verify second distribution status
    await verifyDistributionStatus(treasuryId, distributionId2);

    logHeader("✅ Treasury Distributions Verification PASSED!");
    logInfo("\nSummary:");
    logInfo(`  • Bond: ${bondContractId}`);
    logInfo(`  • Treasury: ${treasuryId}`);
    logInfo(`  • Distribution 1 (Paginated): ${distributionId1} (KPI-derived rate)`);
    logInfo(`  • Distribution 2 (By Holders): ${distributionId2} (KPI-derived rate)`);
    logInfo(`  • Holder 1: ${holderAccount1}`);
    if (holderAccount1 !== holderAccount2) {
      logInfo(`  • Holder 2: ${holderAccount2}`);
    }
    logInfo(`  • Amount minted per holder: ${mintAmount}`);
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    if (error.stack) {
      logError(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryDistributions();
}

module.exports = {
  verifyTreasuryDistributions,
  executeDistributionPaginated,
  executeDistributionByHolders,
};

/**
 * Fund treasury with custom payment token
 */
async function fundTreasuryWithToken(treasuryId, tokenId, amount) {
  log(`\n💰 Funding treasury ${treasuryId} with ${amount} payment tokens...`, colors.yellow);

  const client = Client.forTestnet();
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const privateKeyStr = format === "hedera" ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;

  let operatorKey;
  if (format === "ethereum") {
    const cleanKey = privateKeyStr.startsWith("0x") ? privateKeyStr.slice(2) : privateKeyStr;
    operatorKey = PrivateKey.fromStringECDSA(cleanKey);
  } else {
    try {
      operatorKey = PrivateKey.fromStringED25519(privateKeyStr);
    } catch {
      operatorKey = PrivateKey.fromStringDer(privateKeyStr);
    }
  }

  client.setOperator(process.env.ACCOUNT_ID, operatorKey);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, process.env.ACCOUNT_ID, -amount)
    .addTokenTransfer(tokenId, treasuryId, amount)
    .execute(client);

  const receipt = await transferTx.getReceipt(client);
  client.close();
  logSuccess(`Funded treasury with payment tokens. Status: ${receipt.status.toString()}`);
}

/**
 * Verify distribution status for holders
 */
async function verifyDistributionStatus(treasuryId, distributionId) {
  log(`\n🔍 Verifying distribution ${distributionId} status...`, colors.yellow);

  // Wait a bit for the backend to process the events
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryId}/distributions/${distributionId}`);

  const holders = response.data.items || [];
  let allSuccess = true;

  if (holders.length === 0) {
    log(`   No holders found for distribution`, colors.yellow);
    return;
  }

  for (const holder of holders) {
    log(`   Holder ${holder.accountId}: ${holder.status}`, holder.status === "SUCCESS" ? colors.green : colors.red);
    if (holder.status !== "SUCCESS") {
      allSuccess = false;
    }
  }

  if (!allSuccess) {
    throw new Error(`Some holders have non-SUCCESS status in distribution ${distributionId}`);
  }

  logSuccess(`All holders have SUCCESS status for distribution ${distributionId}`);
}
