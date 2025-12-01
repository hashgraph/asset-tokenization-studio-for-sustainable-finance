const { Client, AccountId, PrivateKey, TokenMintTransaction } = require('@hashgraph/sdk');
const { verifyAddEnvironmentalAssetToken } = require('./verify-add-environmental-asset-token')
const { deployBondWaitTreasuryAndApplyRoles, getTreasuryByContractId } = require('../verify-treasury-persistence');
const { gatewayClient } = require('../../shared/lib/gateway-client');
const { log, logSuccess, logError, logHeader, colors } = require('../../shared/lib/logger');
const { config } = require('../../shared/lib/config');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');

async function mintEnvironmentalAssetToken(environmentalAssetTokenId) {
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const mintTx = await new TokenMintTransaction()
      .setTokenId(environmentalAssetTokenId)
      .setMetadata([Buffer.from("test metadata")])

  const submit = await mintTx.execute(client);
  const receipt = await submit.getReceipt(client);
  const environmentalAssetTokenSerial = receipt.serials[0].toString();
  console.log(`🎨 Minted environmental asset token. Serial: ${environmentalAssetTokenSerial}`);
  return environmentalAssetTokenSerial;
}

/**
 * Transfer an environmental asset token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenContractId - An environmental asset token contract ID
 * @param {string} environmentalAssetTokenSerial - An environmental asset token serial number
 */
async function transferEnvironmentalAssetTokenToTreasury(treasuryContractId, environmentalAssetTokenContractId, environmentalAssetTokenSerial, sourceAccountId) {
  log(`\n💱 Transferring environmental asset token for treasury ${treasuryContractId} (${environmentalAssetTokenContractId} - ${environmentalAssetTokenSerial}) from ${sourceAccountId}...`, colors.yellow);
  log(`   Environmental asset token: ${environmentalAssetTokenContractId}`, colors.cyan);
  log(`   Environmental asset token serial number: ${environmentalAssetTokenSerial}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: sourceAccountId,
    tokenId: Number(environmentalAssetTokenSerial)
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/environmental-assets/${environmentalAssetTokenContractId}/treasuries/${treasuryContractId}/transfer`,
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
 * Wait for environmental asset token added (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} expectedEnvironmentalAssetTokenId - Expected environmental asset token contract ID
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForEnvironmentalAssetTokenToTreasuryTransferred(treasuryContractId, environmentalAssetTokenId, environmentalAssetTokenSerial, sourceAccountId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for environmental asset token to be transferred...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/environmental-assets/${environmentalAssetTokenId}/treasuries/${treasuryContractId}/transfers`);
      if (response.data && response.data.total > 0) {
        const accountId = response.data.items[0].accountId;
        const tokenId = response.data.items[0].tokenId;
        log(`   Environmental asset token transfer found: ${accountId} - ${tokenId}`, colors.cyan);

        if (accountId === sourceAccountId && tokenId === environmentalAssetTokenSerial) {
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

async function verifyTransferEnvironmentalAssetTokenToTreasury(treasuryContractId) {
  logHeader('🧪 Running verification of the execution to transfer environmental asset tokens to the Treasury...');

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

    // Step2: Add environmental asset token
    const environmentalAssetTokenId = await verifyAddEnvironmentalAssetToken(contractId);

    // Step3: Mint environmental asset token
    const environmentalAssetTokenSerial = await mintEnvironmentalAssetToken(environmentalAssetTokenId);

    // Step 3: Transfer environmental asset token serial
    log('\n3️⃣  Transferring environmental asset token...');
    const sourceAccount = process.env.ACCOUNT_ID;
    log(`   Transferring environmental asset token ${environmentalAssetTokenId} - ${environmentalAssetTokenSerial} from ${sourceAccount}`, colors.bright);

    await transferEnvironmentalAssetTokenToTreasury(contractId, environmentalAssetTokenId, environmentalAssetTokenSerial, sourceAccount);

    // Step 3: Wait and verify environmental asset token was transferred
    log('\n4️⃣  Verifying environmental asset token transferred...');
    await waitForEnvironmentalAssetTokenToTreasuryTransferred(contractId, environmentalAssetTokenId, environmentalAssetTokenSerial, sourceAccount);

    logSuccess(`Environmental asset token successfully transferred!`);

    logHeader('✅ Treasury Environmental Asset Token Transferring Verification PASSED!');

    return [environmentalAssetTokenId, environmentalAssetTokenSerial];

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyTransferEnvironmentalAssetTokenToTreasury("0.0.7346278");
}

module.exports = {
  mintEnvironmentalAssetToken,
  verifyTransferEnvironmentalAssetTokenToTreasury,
  transferEnvironmentalAssetTokenToTreasury,
  waitForEnvironmentalAssetTokenToTreasuryTransferred
};
