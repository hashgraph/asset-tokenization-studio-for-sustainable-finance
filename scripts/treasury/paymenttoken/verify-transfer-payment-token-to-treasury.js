const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
const { createPaymentToken } = require('./verify-update-treasury-payment-token');
const { deployBondWaitTreasuryAndApplyRoles } = require('../verify-treasury-persistence');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logInfo, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

/**
 * Transfer a payment token to Treasury
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenContractId - The payment token contract ID
 * @param {string} sourceAccountId - The account transferring the payment tokens
 */
async function transferPaymentTokenToTreasury(treasuryContractId, paymentTokenContractId, sourceAccountId) {
  log(`\n💱 Transferring payment token for treasury ${treasuryContractId} (${paymentTokenContractId}) from ${sourceAccountId}...`, colors.yellow);
  log(`   Payment token: ${paymentTokenContractId}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: sourceAccountId.toString(),
    amount: "1"
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/payment-tokens/${paymentTokenContractId}/treasuries/${treasuryContractId}/transfer`,
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
 * Wait for payment token added (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenId - The payment token contract ID
 * @param {string} sourceAccountId - The account transferring the payment tokens
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForPaymentTokenToTreasuryTransferred(treasuryContractId, paymentTokenId, sourceAccountId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for payment token to be transferred...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenId}/transfers`);
      if (response.data && response.data.total > 0) {
        const accountId = response.data.items[0].accountId;
        const amount = response.data.items[0].amount;
        log(`   Payment token transfer ${amount} token found: ${accountId}`, colors.cyan);

        if (accountId === sourceAccountId && amount === 1) {
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

async function verifyTransferPaymentTokenToTreasury(treasuryContractId) {
  logHeader('🧪 Running verification of the execution to transfer payment tokens to the Treasury...');

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

    // Step 3: Transfer payment token to Treasury
    log('\n3️⃣  Transferring the payment token...');
    const sourceAccount = process.env.ACCOUNT_ID;
    log(`   Transferring payment token ${paymentTokenId} from ${sourceAccount}`, colors.bright);

    await transferPaymentTokenToTreasury(contractId, paymentTokenId, sourceAccount);

    // Step 3: Wait and verify payment token token was transferred
    log('\n4️⃣  Verifying payment token transferred...');
    await waitForPaymentTokenToTreasuryTransferred(contractId, paymentTokenId, sourceAccount);

    logSuccess(`Payment token successfully transferred!`);

    logHeader('✅ Treasury Payment Token Transferring Verification PASSED!');

    return [contractId, paymentTokenId];

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTransferPaymentTokenToTreasury();
}

module.exports = {
  verifyTransferPaymentTokenToTreasury,
  transferPaymentTokenToTreasury,
  waitForPaymentTokenToTreasuryTransferred
};
