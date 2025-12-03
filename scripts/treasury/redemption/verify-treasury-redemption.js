const { deployBondWaitTreasuryAndApplyRoles } = require('../verify-treasury-persistence');
const { mintBond } = require('../../ats/bond/mint-bond');
const { deployHTSToken } = require('../../primary-market/offering/hts-token-service');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, logInfo, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { Client, PrivateKey, TransferTransaction } = require('@hashgraph/sdk');

// TODO: TRY THIS TEST WHEN NEW SMART CONTRACTS CHANGES ARE DEPLOYED

/**
 * Execute a redemption paginated by transactions
 * Pattern matches executeDistributionPaginated for consistency
 */
async function executeRedemptionPaginated(treasuryId, page = 1, limit = 25, maxBatchSize = 10) {
  log(`\n💰 Executing redemption (paginated) for treasury ${treasuryId}...`, colors.yellow);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    maxBatchSize: maxBatchSize,
    pageOptions: {
      page: page,
      limit: limit
    }
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transactions
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/redemptions`,
    requestBody
  );
  
  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error('API did not return transactions. The redemption might not be ready or parameters are incorrect.');
  }
  
  const unsignedTxs = response.data.items;
  logSuccess(`Received ${unsignedTxs.length} transaction(s) to sign and publish`);

  // Sign and publish each transaction
  for (let i = 0; i < unsignedTxs.length; i++) {
    const unsignedTx = unsignedTxs[i];
    log(`   Processing transaction ${i + 1}/${unsignedTxs.length}...`, colors.cyan);
    log(`   Unsigned TX preview: ${unsignedTx.substring(0, 100)}...`, colors.blue);
    
    // Sign
    const signedTx = await signTransaction(unsignedTx);
    log(`   ✓ Signed transaction ${i + 1}`, colors.green);
    log(`   Signed TX preview: ${signedTx.substring(0, 100)}...`, colors.blue);

    // Publish to transaction sender
    await publishSignedTransaction(signedTx);
    log(`   ✓ Published transaction ${i + 1} to transaction sender`, colors.green);
  }
  
  logSuccess(`All ${unsignedTxs.length} redemption transaction(s) processed!`);
  return response.data;
}

/**
 * Execute a redemption by holder addresses
 * Pattern matches executeDistributionByHolders for consistency
 */
async function executeRedemptionByHolders(treasuryId, holderAccountIds, maxBatchSize = 10) {
  log(`\n💰 Executing redemption (by holders) for treasury ${treasuryId}...`, colors.yellow);
  log(`   Holders: ${JSON.stringify(holderAccountIds)}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    maxBatchSize: maxBatchSize,
    holdersAccountIds: holderAccountIds
  };

  log(`   Request body: ${JSON.stringify(requestBody, null, 2)}`, colors.cyan);

  // Get unsigned transactions
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryId}/redemptions/holders`,
    requestBody
  );
  
  // Check if response contains items array
  if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
    logError(`Response does not contain items array`);
    logError(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    throw new Error('API did not return transactions. The redemption might not be ready or parameters are incorrect.');
  }
  
  const unsignedTxs = response.data.items;
  logSuccess(`Received ${unsignedTxs.length} transaction(s) to sign and publish`);

  // Sign and publish each transaction
  for (let i = 0; i < unsignedTxs.length; i++) {
    const unsignedTx = unsignedTxs[i];
    log(`   Processing transaction ${i + 1}/${unsignedTxs.length}...`, colors.cyan);
    log(`   Unsigned TX preview: ${unsignedTx.substring(0, 100)}...`, colors.blue);
    
    // Sign
    const signedTx = await signTransaction(unsignedTx);
    log(`   ✓ Signed transaction ${i + 1}`, colors.green);
    log(`   Signed TX preview: ${signedTx.substring(0, 100)}...`, colors.blue);

    // Publish to transaction sender
    await publishSignedTransaction(signedTx);
    log(`   ✓ Published transaction ${i + 1} to transaction sender`, colors.green);
  }
  
  logSuccess(`All ${unsignedTxs.length} redemption transaction(s) processed!`);
  return response.data;
}



/**
 * Verify redemption status
 */
async function verifyRedemptionStatus(treasuryId) {
  log(`\n🔍 Verifying redemption status for treasury ${treasuryId}...`, colors.yellow);

  // Wait a bit for the backend to process the events
  await new Promise(resolve => setTimeout(resolve, 5000));

  const response = await gatewayClient.get(
    `/api/v1/treasuries/${treasuryId}/redemptions`
  );

  const redemptions = response.data.items || [];
  let allSuccess = true;

  if (redemptions.length === 0) {
    throw new Error(`No redemptions found`);
  }

  for (const redemption of redemptions) {
    log(`   Redemption for ${redemption.accountId}: ${redemption.status}`, redemption.status === 'SUCCESS' ? colors.green : colors.red);
    if (redemption.status !== 'SUCCESS') {
      allSuccess = false;
    }
  }

  if (!allSuccess) {
    throw new Error(`Some redemptions have non-SUCCESS status`);
  }
  
  logSuccess(`All redemptions have SUCCESS status`);
}

/**
 * Fund treasury with custom payment token
 */
async function fundTreasuryWithToken(treasuryId, tokenId, amount) {
  log(`\n💰 Funding treasury ${treasuryId} with ${amount} payment tokens...`, colors.yellow);

  const client = Client.forTestnet();
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const privateKeyStr = format === 'hedera' ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;
  
  let operatorKey;
  if (format === 'ethereum') {
    const cleanKey = privateKeyStr.startsWith('0x') ? privateKeyStr.slice(2) : privateKeyStr;
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

async function verifyTreasuryRedemptions() {
  logHeader('🧪 Running Treasury Redemptions Verification...');

  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const holderAccount1 = process.env.HOLDER_ACCOUNT_1 || process.env.ACCOUNT_ID;
  const mintAmount = process.env.MINT_AMOUNT || "50000";

  try {
    // 1. Deploy Custom Payment Token
    log('\n1️⃣  Deploying custom payment token...');
    const { tokenId: paymentTokenId, evmAddress: paymentTokenEvmAddress } = await deployHTSToken(
      'Test Payment Token',
      'TPT',
      6,
      100000000000 // 100,000 tokens with 6 decimals
    );
    logSuccess(`Payment token deployed: ${paymentTokenId}`);
    logSuccess(`Payment token EVM address: ${paymentTokenEvmAddress}`);

    // 2. Deploy Bond and Treasury with Custom Payment Token and Near-Future Maturity
    log('\n2️⃣  Deploying bond with custom payment token and near-future maturity...');
    
    // Set maturity date in the near future so we can wait for it
    // Pass as TIMESTAMPS (milliseconds) not Date objects - mergeDeep expects numbers
    const nowMs = Date.now();
    const startingDateMs = nowMs + 60000; // 1 minute from now
    const maturityDateMs = nowMs + 120000; // 2 minutes from now
    
    logInfo(`Starting Date: ${new Date(startingDateMs).toISOString()}`);
    logInfo(`Maturity Date: ${new Date(maturityDateMs).toISOString()} (in 2 minutes)`);
    
    const overrides = {
      securityTokenToCreate: {
        decimals: 2,
        startingDate: startingDateMs,
        maturityDate: maturityDateMs
      },
      treasuryData: {
        paymentTokenAddress: paymentTokenEvmAddress
      }
    };
    const treasury = await deployBondWaitTreasuryAndApplyRoles(paymentTokenId, overrides);
    const bondContractId = treasury.bondContractId;
    const treasuryId = treasury.contractId;

    logSuccess(`Bond deployed: ${bondContractId}`);
    logSuccess(`Treasury deployed: ${treasuryId}`);

    // 3. Mint tokens to holders
    log('\n3️⃣  Minting bond tokens to holders...');
    log(`   Minting ${mintAmount} tokens to ${holderAccount1}...`, colors.cyan);
    const mint1 = await mintBond(bondContractId, holderAccount1, "", mintAmount, format);
    await publishSignedTransaction(await signTransaction(mint1.unsignedTx));
    logSuccess(`Minted to holder 1`);

    log('⏳ Waiting for minting to be processed (10 seconds)...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Fund Treasury with Custom Payment Token
    log('\n4️⃣  Funding treasury with payment tokens...');
    await fundTreasuryWithToken(treasuryId, paymentTokenId, 60000000000); // 60.000 tokens with 6 decimals
    logSuccess('Treasury funded with payment tokens');

    // 5. Wait for maturity date to pass
    const waitTime = maturityDateMs - Date.now();
    if (waitTime > 0) {
      log(`\n⏳ Waiting ${Math.ceil(waitTime / 1000)} seconds for maturity date to pass...`, colors.yellow);
      await new Promise(resolve => setTimeout(resolve, waitTime + 5000)); // Add 5s buffer
      logSuccess('Maturity date has passed - bond is now ready for redemption');
    } else {
      logInfo('Maturity date has already passed');
    }

    // 6. Execute redemption (paginated)
    log('\n6️⃣  Executing redemption (paginated by transactions)...');
    await executeRedemptionPaginated(treasuryId);
    
    log('⏳ Waiting for redemption to be processed (10 seconds)...', colors.yellow);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 7. Verify redemption status
    await verifyRedemptionStatus(treasuryId);

    logHeader('✅ Treasury Redemptions Verification PASSED!');
    logInfo('\nSummary:');
    logInfo(`  • Bond: ${bondContractId}`);
    logInfo(`  • Treasury: ${treasuryId}`);
    logInfo(`  • Payment Token: ${paymentTokenId}`);
    logInfo(`  • Holder 1: ${holderAccount1}`);
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
  verifyTreasuryRedemptions();
}

module.exports = {
  verifyTreasuryRedemptions,
  executeRedemptionPaginated,
  executeRedemptionByHolders
};
