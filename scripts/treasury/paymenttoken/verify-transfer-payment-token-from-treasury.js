const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
const { deployBondWaitTreasuryAndApplyRoles } = require('../verify-treasury-persistence');
const { verifyTransferPaymentTokenToTreasury } = require('./verify-transfer-payment-token-to-treasury');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logInfo, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

/**
 * Transfer a payment token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenId - The payment token contract ID
 * @param {string} destinationAccount - The account receiving the payment tokens
 */
async function transferPaymentTokenFromTreasury(treasuryContractId, paymentTokenId, destinationAccount) {
  log(`\n💱 Transferring payment token for treasury ${treasuryContractId} - ${paymentTokenId} to {destinationAccount}...`, colors.yellow);
  log(`   Payment token: ${paymentTokenId}`, colors.cyan);

  const requestBody = {
    toAccountId: destinationAccount,
    amount: 1,
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/payment-tokens/transfer`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Transferring payment token transaction signed successfully!');

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Transferring payment token transaction published to message queue');

  return response.data;
}

/**
 * Wait for payment token transferred (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenId - Payment token contract ID
 * @param {string} destinationAccountId - The account receiving the payment tokens
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForPaymentTokenFromTreasuryTransferred(treasuryContractId, paymentTokenId, destinationAccountId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for payment token to be transferred...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenId}/transfers`);
      if (response.data && response.data.total > 0) {
        const accountId = response.data.items[0].accountId;
        const tokenId = response.data.items[0].tokenId;
        const amount = response.data.items[0].amount;
        log(`   Payment token transfer found: ${accountId} - ${tokenId}`, colors.cyan);

        if (accountId === destinationAccountId && amount === 1) {
          logSuccess('Payment token successfully transferred!');
          return;
        } else {
          log(`   Payment token not yet transferred`, colors.yellow);
        }
      } else {
        logInfo("No payment token transfers found for this Treasury");
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Payment token was not transferred after ${maxRetries} attempts`);
}

async function verifyTransferPaymentTokenFromTreasury() {
  logHeader('🧪 Running verification of the execution to transfer payment tokens from the Treasury...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
    // Step 1: Creates a bond and transfer a payment token to the Treasury
    const [contractId, paymentTokenId] = await verifyTransferPaymentTokenToTreasury();

    // Step 2: Transfer payment token
    log('\n3️⃣  Transferring payment token...');
    const destinationAccount = process.env.ACCOUNT_ID;
    log(`   Transferring payment token ${paymentTokenId} to ${destinationAccount}`, colors.bright);

    await transferPaymentTokenFromTreasury(contractId, paymentTokenId, destinationAccount);

    // Step 3: Wait and verify payment token was transferred
    log('\n4️⃣  Verifying payment token transferred...');
    await waitForPaymentTokenFromTreasuryTransferred(contractId, paymentTokenId, destinationAccount);

    logSuccess(`Payment token successfully transferred!`);

    logHeader('✅ Treasury Payment Token Transferring Verification PASSED!');

    return paymentTokenId;

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTransferPaymentTokenFromTreasury();
}

module.exports = {
  verifyTransferPaymentTokenFromTreasury,
  transferPaymentTokenFromTreasury,
  waitForPaymentTokenFromTreasuryTransferred
};
