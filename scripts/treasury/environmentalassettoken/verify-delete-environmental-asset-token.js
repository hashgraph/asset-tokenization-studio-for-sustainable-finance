const { Client, AccountId, PrivateKey, TransferTransaction, NftId } = require("@hiero-ledger/sdk");
const { deployBondWaitTreasuryAndApplyRoles } = require("../verify-treasury-persistence");
const { mintEnvironmentalAssetToken } = require("./verify-transfer-environmental-asset-token-to-treasury");
const { verifyAddEnvironmentalAssetToken } = require("./verify-add-environmental-asset-token");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");

/**
 * Transfer an environmental asset token
 * @param {string} environmentalAssetTokenId - An environmental asset token contract ID
 * @param {number} serialNumber - An environmental asset token serial number
 * @param {string} treasuryContractId - Treasury contract ID
 */
async function transferEnvironmentalAssetToken(environmentalAssetTokenId, serialNumber, treasuryContractId) {
  log(
    `\n💱 Transferring environmental asset token ${environmentalAssetTokenId} - ${serialNumber} to treasury ${treasuryContractId}...`,
    colors.yellow,
  );
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const nftId = new NftId(environmentalAssetTokenId, serialNumber);
  const transferTx = await new TransferTransaction().addNftTransfer(nftId, operatorId, treasuryContractId);

  const submit = await transferTx.execute(client);
  const receipt = await submit.getReceipt(client);
  console.log(`🎨 Environmental asset token transferred to Treasury`);
}

/**
 * Delete an environmental asset token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenContractId - An environmental asset token contract ID
 */
async function deleteEnvironmentalAssetToken(treasuryContractId, environmentalAssetTokenContractId) {
  log(`\n💱 Deleting environmental asset token for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   Environmental asset token: ${environmentalAssetTokenContractId}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.delete(
    `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetTokenContractId}`,
    {
      data: requestBody,
    },
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess("Deleting environmental asset token transaction signed successfully!");

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess("Deleting environmental asset token transaction published to message queue");

  return response.data;
}

/**
 * Wait for environmental asset token deleted (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 *
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForEnvironmentalAssetTokenDeleted(
  treasuryContractId,
  withDissociationFailure = false,
  maxRetries = 12,
  retryInterval = 5000,
) {
  log(`\n🔍 Waiting for environmental asset token to be deleted...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/environmental-assets`);
      if (
        response.data &&
        response.data.total > 0 &&
        response.data.items[0].removalDate &&
        ((withDissociationFailure && response.data.items[0].dissociationError) ||
          (!withDissociationFailure && !response.data.items[0].dissociationError))
      ) {
        logSuccess("Environmental asset token successfully deleted!");
        return;
      } else {
        logInfo("Treasury still has an environmental asset token");
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Environmental asset token was not deleted after ${maxRetries} attempts`);
}

async function verifyDeleteEnvironmentalAssetToken(treasuryContractId, withDissociationFailure = false) {
  logHeader("🧪 Running verification of the execution to delete environmental asset tokens to the Treasury...");
  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError("Signing configuration validation failed");
    process.exit(1);
  }

  try {
    let contractId;
    if (treasuryContractId) {
      contractId = treasuryContractId;
    } else {
      // Step 1: Deploy bond, wait for treasury, and apply all roles
      log("\n1️⃣  Deploying bond, waiting for treasury, and applying roles...");
      const treasury = await deployBondWaitTreasuryAndApplyRoles();

      contractId = treasury.contractId;
      logSuccess(`Treasury deployed: ${contractId}`);
    }

    // Step1: Add environmental asset token
    const environmentalAssetTokenId = await verifyAddEnvironmentalAssetToken(contractId);

    let serialNumber;
    if (withDissociationFailure) {
      // Step2: Mint an environmental asset token
      serialNumber = await mintEnvironmentalAssetToken(environmentalAssetTokenId);

      // Step3: Transfer the just minted token to the Treasury
      await transferEnvironmentalAssetToken(environmentalAssetTokenId, serialNumber, contractId);
    }

    // Step 4: Delete environmental asset token
    log("\n3️⃣  Deleting environmental asset token...");
    log(`   Deleting environmental asset token ${environmentalAssetTokenId}`, colors.bright);

    await deleteEnvironmentalAssetToken(contractId, environmentalAssetTokenId);

    // Step 5: Wait and verify environmental asset token was deleted
    log("\n4️⃣  Verifying environmental asset token deleting...");
    await waitForEnvironmentalAssetTokenDeleted(contractId, withDissociationFailure);

    logHeader("✅ Treasury Environmental Asset Token Deleting Verification PASSED!");

    return [contractId, environmentalAssetTokenId, serialNumber];
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDeleteEnvironmentalAssetToken(undefined, false);
}

module.exports = {
  deleteEnvironmentalAssetToken,
  waitForEnvironmentalAssetTokenDeleted,
  verifyDeleteEnvironmentalAssetToken,
};
