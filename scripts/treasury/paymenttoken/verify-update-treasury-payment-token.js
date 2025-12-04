const { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TransferTransaction } = require('@hashgraph/sdk');
const { deployBondWaitTreasuryAndApplyRoles, getTreasuryByContractId } = require('../verify-treasury-persistence');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

/**
 * Create a payment token
 */
async function createPaymentToken() {
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const tokenTransaction = await new TokenCreateTransaction()
      .setTokenName("Treasury Payment Token")
      .setTokenSymbol("TPT")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(0)
      .setInitialSupply(1)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(10)
      .setAdminKey(operatorKey)
      .setSupplyKey(operatorKey)
      .setWipeKey(operatorKey)
      .setPauseKey(operatorKey)
      .setFreezeKey(operatorKey)
      .setAutoRenewAccountId(operatorId)
      .setAutoRenewPeriod(7776000); // 90 days

  let submit = await tokenTransaction.execute(client);
  let receipt = await submit.getReceipt(client);

  const tokenId = receipt.tokenId;
  log(`✅ Created payment token: ${tokenId.toString()}`);
  const paymentTokenEvmAddress = tokenId.toSolidityAddress();
  log(`🧬 EVM address (ERC-21 compatible): ${paymentTokenEvmAddress}`);

  return [tokenId, paymentTokenEvmAddress];
}

/**
 * Transfer a payment token to the treasury
 * @param {string} paymentTokenId - The payment token contract ID
 * @param {string} treasuryContractId - Treasury contract ID
 */
async function transferPaymentToken(paymentTokenId, treasuryContractId) {
  log(`\n💱 Transferring payment token ${paymentTokenId} to treasury ${treasuryContractId}...`, colors.yellow);
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(paymentTokenId, operatorId, -1)    // sender
    .addTokenTransfer(paymentTokenId, treasuryContractId, 1)     // contract receiver

  const submit = await transferTx.execute(client);
  const receipt = await submit.getReceipt(client);
  console.log(`🎨 Payment tokens transferred to Treasury`);
}

/**
 * Update treasury payment token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} newPaymentTokenContractId - New payment token contract ID
 */
async function updatePaymentToken(treasuryContractId, newPaymentTokenContractId) {
  log(`\n💱 Updating payment token for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   New payment token: ${newPaymentTokenContractId}`, colors.cyan);
  
  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    paymentTokenContractId: newPaymentTokenContractId
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.put(
    `/api/v1/treasuries/${treasuryContractId}/payment-tokens`,
    requestBody
  );

  const unsignedTx = response.data.unsignedTx;
  log(`   Unsigned transaction received`, colors.cyan);
  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Payment token update transaction signed successfully!');
  
  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Payment token update transaction published to message queue');
  
  return response.data;
}

/**
 * Wait for payment token to be updated (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} expectedPaymentTokenId - Expected payment token contract ID
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForPaymentTokenUpdate(treasuryContractId, expectedPaymentTokenId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for payment token to be updated...`, colors.yellow);
  
  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);
    
    try {
      const treasury = await getTreasuryByContractId(treasuryContractId);
      const currentPaymentTokenId = treasury.paymentToken?.contractId || 'None';
      
      log(`   Current payment token: ${currentPaymentTokenId}`, colors.cyan);
      
      if (currentPaymentTokenId === expectedPaymentTokenId) {
        logSuccess('Payment token successfully updated!');
        return treasury;
      } else {
        log(`   Payment token not yet updated (expected: ${expectedPaymentTokenId})`, colors.yellow);
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Payment token was not updated after ${maxRetries} attempts`);
}

async function verifyTreasuryPaymentTokenUpdate(treasuryContractId, withDissociationFailure = false) {
  logHeader('🧪 Running Treasury Payment Token Update Verification...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
    let contractId;
    let paymentTokenId, paymentTokenEvmAddress;
    if (treasuryContractId)  {
      contractId = treasuryContractId;
    } else {
      // Step 1: Create a payment token
      [paymentTokenId, paymentTokenEvmAddress] = await createPaymentToken();

      // Step 2: Deploy bond, wait for treasury, and apply all roles
      log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
      const overridePaymentTokenAddress = {
        treasuryData: {
          paymentTokenAddress: paymentTokenEvmAddress,
        }
      };

      const treasury = await deployBondWaitTreasuryAndApplyRoles(overridePaymentTokenAddress);

      contractId = treasury.contractId;
      logSuccess(`Treasury deployed: ${contractId}`);
    }
    
    // Step 3: Get initial treasury state and current payment token
    log('\n2️⃣  Verifying initial treasury state...');
    let treasuryDetails = await getTreasuryByContractId(contractId);
    const initialPaymentToken = treasuryDetails.paymentToken?.contractId || 'None';
    log(`   Initial payment token: ${initialPaymentToken}`, colors.cyan);

    if (withDissociationFailure) {
      // Step4: Transfer the just minted token to the Treasury
      await transferPaymentToken(paymentTokenId, contractId, 1)
    }

    // Step 5: Update payment token to a new one
    // Using a different payment token ID (example: USDC on Hedera testnet)
    const newPaymentTokenId = "0.0.429274";
    log('\n3️⃣  Updating payment token...');
    log(`   Changing from ${initialPaymentToken} to ${newPaymentTokenId}`, colors.bright);
    
    await updatePaymentToken(contractId, newPaymentTokenId);
    
    // Step 6: Wait and verify payment token was updated
    log('\n4️⃣  Verifying payment token update...');
    treasuryDetails = await waitForPaymentTokenUpdate(contractId, newPaymentTokenId);
    
    logSuccess(`Payment token successfully changed!`);
    log(`   Previous: ${initialPaymentToken}`, colors.cyan);
    log(`   Current: ${treasuryDetails.paymentToken?.contractId || 'None'}`, colors.green);
    
    logHeader('✅ Treasury Payment Token Update Verification PASSED!');

    return [contractId, initialPaymentToken];

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryPaymentTokenUpdate(undefined, true);
}

module.exports = {
  createPaymentToken,
  transferPaymentToken,
  updatePaymentToken,
  waitForPaymentTokenUpdate,
  verifyTreasuryPaymentTokenUpdate
};
