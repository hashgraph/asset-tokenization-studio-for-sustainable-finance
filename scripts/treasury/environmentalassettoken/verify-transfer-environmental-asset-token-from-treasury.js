const { Client, AccountId, PrivateKey, TokenMintTransaction } = require('@hashgraph/sdk');
const { mintEnvironmentalAssetToken, verifyTransferEnvironmentalAssetTokenToTreasury } = require('./verify-transfer-environmental-asset-token-to-treasury')
const { deployBondWaitTreasuryAndApplyRoles, getTreasuryByContractId } = require('../verify-treasury-persistence');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logInfo, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

/**
 * Transfer an environmental asset token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenContractId - An environmental asset token contract ID
 * @param {string} environmentalAssetTokenSerial - An environmental asset token serial number
 */
async function transferEnvironmentalAssetTokenFromTreasury(treasuryContractId, environmentalAssetTokenContractId, environmentalAssetTokenSerial, destinationAccount) {
  log(`\n💱 Transferring environmental asset token for treasury ${treasuryContractId} - ${environmentalAssetTokenSerial} to {destinationAccount}...`, colors.yellow);
  log(`   Environmental asset token: ${environmentalAssetTokenContractId}`, colors.cyan);
  log(`   Environmental asset token serial number: ${environmentalAssetTokenSerial}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
    tokenId: Number(environmentalAssetTokenSerial),
    toAccountId: destinationAccount
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetTokenContractId}/transfer`,
    requestBody
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess('Transferring environmental asset token transaction signed successfully!');

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess('Transferring environmental asset token transaction published to message queue');

  return response.data;
}

/**
 * Wait for environmental asset token transferred (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenId - Expected environmental asset token contract ID
 *
 * @param {string} destinationAccountId - The account receiving the payment tokens
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForEnvironmentalAssetTokenFromTreasuryTransferred(treasuryContractId, environmentalAssetTokenId, environmentalAssetTokenSerial, destinationAccountId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for environmental asset token to be transferred...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetTokenId}/transfers`);
      if (response.data && response.data.total > 0) {
        const accountId = response.data.items[0].accountId;
        const tokenId = response.data.items[0].tokenId;
        log(`   Environmental asset token transfer found: ${accountId} - ${tokenId}`, colors.cyan);

        if (accountId === destinationAccountId && tokenId === environmentalAssetTokenSerial) {
          logSuccess('Environmental asset token successfully transferred!');
          return;
        } else {
          log(`   Environmental asset token not yet transferred`, colors.yellow);
        }
      } else {
        logInfo("No environmental asset token transfers found for this Treasury");
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Environmental asset token was not transferred after ${maxRetries} attempts`);
}

async function verifyTransferEnvironmentalAssetTokenFromTreasury(treasuryContractId) {
  logHeader('🧪 Running verification of the execution to transfer environmental asset tokens from the Treasury...');

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError('Signing configuration validation failed');
    process.exit(1);
  }

  try {
   let contractId;
    if (treasuryContractId)  {
      contractId = treasuryContractId;
    } else {
      // Step 1: Deploy bond, wait for treasury, and apply all roles
      log('\n1️⃣  Deploying bond, waiting for treasury, and applying roles...');
      const treasury = await deployBondWaitTreasuryAndApplyRoles();

      contractId = treasury.contractId;
      logSuccess(`Treasury deployed: ${contractId}`);
    }

    // Step2: Transfer environmental asset token to treasury
    const [environmentalAssetTokenId, environmentalAssetTokenSerial] = await verifyTransferEnvironmentalAssetTokenToTreasury(contractId)

    // Step 3: Transfer environmental asset token serial
    log('\n3️⃣  Transferring environmental asset token...');
    const destinationAccount = process.env.ACCOUNT_ID;
    log(`   Transferring environmental asset token ${environmentalAssetTokenId} - ${environmentalAssetTokenSerial} to ${destinationAccount}`, colors.bright);

    await transferEnvironmentalAssetTokenFromTreasury(contractId, environmentalAssetTokenId, environmentalAssetTokenSerial, destinationAccount);

    // Step 3: Wait and verify environmental asset token was transferred
    log('\n4️⃣  Verifying environmental asset token transferred...');
    await waitForEnvironmentalAssetTokenFromTreasuryTransferred(contractId, environmentalAssetTokenId, environmentalAssetTokenSerial, destinationAccount);

    logSuccess(`Environmental asset token successfully transferred!`);

    logHeader('✅ Treasury Environmental Asset Token Transferring Verification PASSED!');

    return environmentalAssetTokenId;

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTransferEnvironmentalAssetTokenFromTreasury();
}

module.exports = {
  verifyTransferEnvironmentalAssetTokenFromTreasury,
  transferEnvironmentalAssetTokenFromTreasury,
  waitForEnvironmentalAssetTokenFromTreasuryTransferred
};
