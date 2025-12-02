const { deployBondWaitTreasuryAndApplyRoles } = require('./verify-treasury-persistence');
const { mintBond } = require('../ats/bond/mint-bond');
const { setBondCoupon, getCouponsForBond } = require('../ats/bond/coupon/set-bond-coupon');
const { updatePaymentToken, waitForPaymentTokenUpdate } = require('./paymenttoken/verify-update-treasury-payment-token');
const { gatewayClient } = require('../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, logInfo, colors } = require('../shared/lib/logger');
const { config } = require('../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../shared/lib/infrastructure');
const { ConverterUtils } = require('@hashgraph/green-bonds-shared-core');
const { Client, PrivateKey, TransferTransaction } = require('@hashgraph/sdk');

// USDC contract ID on Hedera testnet
const USDC_TOKEN_ID = '0.0.429274';
// Amount to mint to treasury for distributions (in USDC units, assuming 6 decimals)

// Coupon Configurations - Two coupons for testing both endpoints
const COUPON_CONFIGS = [
  {
    name: "First Coupon (Paginated)",
    recordDate: new Date(Date.now() + 60000), // 1 minute from now
    executionDate: new Date(Date.now() + 90000), // 1.5 minutes from now
    rate: "250", // 2.50%
    rateDecimals: "2",
    period: "31536000" // 1 year
  },
  {
    name: "Second Coupon (By Holders)",
    recordDate: new Date(Date.now() + 120000), // 2 minutes from now
    executionDate: new Date(Date.now() + 150000), // 2.5 minutes from now
    rate: "375", // 3.75%
    rateDecimals: "2",
    period: "31536000" // 1 year
  }
];

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
      limit: limit
    }
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/distributions/${distributionId}`,
    requestBody
  );
  
  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error('API did not return transactions. The distribution might not be ready or parameters are incorrect.');
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
    holdersAccountIds: holderAccountIds
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transaction
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/distributions/${distributionId}/holders`,
    requestBody
  );
  
  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error('API did not return transactions. The distribution might not be ready or parameters are incorrect.');
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

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Expected ${expectedCount} coupons, but not all were found after ${maxRetries} attempts`);
}

async function verifyTreasuryDistributions() {
  logHeader('🧪 Running Treasury Distributions Verification...');

  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const holderAccount1 = process.env.HOLDER_ACCOUNT_1 || process.env.ACCOUNT_ID;
  const holderAccount2 = process.env.HOLDER_ACCOUNT_2 || process.env.ACCOUNT_ID;
  const mintAmount = process.env.MINT_AMOUNT || "500000";

  try {
    // 1. Deploy Bond and Treasury with all roles
    log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
    const treasury = await deployBondWaitTreasuryAndApplyRoles();
    const bondContractId = treasury.bondContractId;
    const treasuryId = treasury.contractId;

    logSuccess(`Bond deployed: ${bondContractId}`);
    logSuccess(`Treasury deployed: ${treasuryId}`);

    // 1.1 Update Payment Token to USDC
    log('\n1️⃣.1️⃣  Updating payment token to USDC...');
    await updatePaymentToken(treasuryId, USDC_TOKEN_ID);
    await waitForPaymentTokenUpdate(treasuryId, USDC_TOKEN_ID, 24);
    logSuccess(`Payment token updated to USDC (${USDC_TOKEN_ID})`);

    // 1.2 Fund Treasury with USDC
    log('\n1️⃣.2️⃣  Funding treasury with USDC...');
    await fundTreasuryWithUSDC(treasuryId, 4000000);

    // 2. Mint tokens to holders
    log('\n2️⃣  Minting tokens to holders...');
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

    log('⏳ Waiting for minting to be processed (10 seconds)...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 3. Set first coupon
    log('\n3️⃣  Setting first coupon on bond...');
    log(`   ${COUPON_CONFIGS[0].name}`, colors.cyan);
    const couponTx1 = await setBondCoupon(
      bondContractId,
      COUPON_CONFIGS[0].recordDate,
      COUPON_CONFIGS[0].executionDate,
      COUPON_CONFIGS[0].rate,
      COUPON_CONFIGS[0].rateDecimals,
      COUPON_CONFIGS[0].period,
      format
    );
    await publishSignedTransaction(await signTransaction(couponTx1.unsignedTx));
    logSuccess('First coupon transaction published');

    log('⏳ Waiting 5 seconds before creating second coupon...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Set second coupon
    log('\n4️⃣  Setting second coupon on bond...');
    log(`   ${COUPON_CONFIGS[1].name}`, colors.cyan);
    const couponTx2 = await setBondCoupon(
      bondContractId,
      COUPON_CONFIGS[1].recordDate,
      COUPON_CONFIGS[1].executionDate,
      COUPON_CONFIGS[1].rate,
      COUPON_CONFIGS[1].rateDecimals,
      COUPON_CONFIGS[1].period,
      format
    );
    await publishSignedTransaction(await signTransaction(couponTx2.unsignedTx));
    logSuccess('Second coupon transaction published');

    // 5. Wait for both coupons to be persisted in ATS
    log('\n5️⃣  Waiting for both coupons to be persisted in ATS database...');
    const coupons = await waitForCoupon(bondContractId, 2);
    const distributionId1 = coupons[0];
    const distributionId2 = coupons[1];
    logSuccess(`Distribution IDs: ${distributionId1}, ${distributionId2}`);

    // 6. Wait for execution dates to pass
    const waitTime = Math.max(
      COUPON_CONFIGS[0].executionDate.getTime() - Date.now(),
      COUPON_CONFIGS[1].executionDate.getTime() - Date.now()
    );
    if (waitTime > 0) {
      log(`\n⏳ Waiting ${Math.ceil(waitTime / 1000)} seconds for execution dates to pass...`, colors.yellow);
      await new Promise(resolve => setTimeout(resolve, waitTime + 5000)); // Add 5s buffer
    }

    // 7. Execute first distribution (paginated)
    log('\n6️⃣  Executing first distribution (paginated by transactions)...');
    await executeDistributionPaginated(treasuryId, distributionId1);
    
    log('⏳ Waiting for distribution to be processed (10 seconds)...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 7.1 Verify first distribution status
    await verifyDistributionStatus(treasuryId, distributionId1);

    // 8. Execute second distribution (by specific holders)
    log('\n7️⃣  Executing second distribution (by holder addresses)...');
    const holderAddresses = [holderAccount1];
    if (holderAccount1 !== holderAccount2) {
      holderAddresses.push(holderAccount2);
    }
    await executeDistributionByHolders(treasuryId, distributionId2, holderAddresses);

    log('⏳ Waiting for distribution to be processed (10 seconds)...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 8.1 Verify second distribution status
    await verifyDistributionStatus(treasuryId, distributionId2);

    logHeader('✅ Treasury Distributions Verification PASSED!');
    logInfo('\nSummary:');
    logInfo(`  • Bond: ${bondContractId}`);
    logInfo(`  • Treasury: ${treasuryId}`);
    logInfo(`  • Distribution 1 (Paginated): ${distributionId1} - Rate: ${COUPON_CONFIGS[0].rate / 100}%`);
    logInfo(`  • Distribution 2 (By Holders): ${distributionId2} - Rate: ${COUPON_CONFIGS[1].rate / 100}%`);
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
  executeDistributionByHolders
};

/**
 * Fund treasury with USDC
 */
async function fundTreasuryWithUSDC(treasuryId, amount = 1000000) { // 1 USDC (6 decimals)
  log(`\n💰 Funding treasury ${treasuryId} with ${amount} USDC...`, colors.yellow);

  const client = Client.forTestnet();
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(process.env.ACCOUNT_ID, operatorKey);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(USDC_TOKEN_ID, process.env.ACCOUNT_ID, -amount)
    .addTokenTransfer(USDC_TOKEN_ID, treasuryId, amount)
    .execute(client);

  const receipt = await transferTx.getReceipt(client);
  logSuccess(`Funded treasury with USDC. Status: ${receipt.status.toString()}`);
}

/**
 * Verify distribution status for holders
 */
async function verifyDistributionStatus(treasuryId, distributionId) {
  log(`\n🔍 Verifying distribution ${distributionId} status...`, colors.yellow);

  // Wait a bit for the backend to process the events
  await new Promise(resolve => setTimeout(resolve, 5000));

  const response = await gatewayClient.get(
    `/api/v1/treasuries/${treasuryId}/distributions/${distributionId}`
  );

  const holders = response.data.items || [];
  let allSuccess = true;

  if (holders.length === 0) {
    log(`   No holders found for distribution`, colors.yellow);
    return;
  }

  for (const holder of holders) {
    log(`   Holder ${holder.accountId}: ${holder.status}`, holder.status === 'SUCCESS' ? colors.green : colors.red);
    if (holder.status !== 'SUCCESS') {
      allSuccess = false;
    }
  }

  if (!allSuccess) {
    throw new Error(`Some holders have non-SUCCESS status in distribution ${distributionId}`);
  }
  
  logSuccess(`All holders have SUCCESS status for distribution ${distributionId}`);
}
