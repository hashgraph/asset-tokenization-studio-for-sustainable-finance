const { deployBondWaitTreasuryAndApplyRoles, getTreasuryByContractId } = require('../verify-treasury-persistence');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

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

async function verifyTreasuryPaymentTokenUpdate() {
  logHeader('🧪 Running Treasury Payment Token Update Verification...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
    // Step 1: Deploy bond, wait for treasury, and apply all roles
    log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
    const treasury = await deployBondWaitTreasuryAndApplyRoles();
    
    const treasuryContractId = treasury.contractId;
    logSuccess(`Treasury deployed: ${treasuryContractId}`);
    
    // Step 2: Get initial treasury state and current payment token
    log('\n2️⃣  Verifying initial treasury state...');
    let treasuryDetails = await getTreasuryByContractId(treasuryContractId);
    const initialPaymentToken = treasuryDetails.paymentToken?.contractId || 'None';
    log(`   Initial payment token: ${initialPaymentToken}`, colors.cyan);
    
    // Step 3: Update payment token to a new one
    // Using a different payment token ID (example: USDC on Hedera testnet)
    const newPaymentTokenId = '0.0.429274';
    log('\n3️⃣  Updating payment token...');
    log(`   Changing from ${initialPaymentToken} to ${newPaymentTokenId}`, colors.bright);
    
    await updatePaymentToken(treasuryContractId, newPaymentTokenId);
    
    // Step 4: Wait and verify payment token was updated
    log('\n4️⃣  Verifying payment token update...');
    treasuryDetails = await waitForPaymentTokenUpdate(treasuryContractId, newPaymentTokenId);
    
    logSuccess(`Payment token successfully changed!`);
    log(`   Previous: ${initialPaymentToken}`, colors.cyan);
    log(`   Current: ${treasuryDetails.paymentToken?.contractId || 'None'}`, colors.green);
    
    logHeader('✅ Treasury Payment Token Update Verification PASSED!');
    
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTreasuryPaymentTokenUpdate();
}

module.exports = {
  updatePaymentToken,
  waitForPaymentTokenUpdate,
  verifyTreasuryPaymentTokenUpdate
};
