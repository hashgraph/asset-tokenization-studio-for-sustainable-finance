const { Client, AccountId, PrivateKey, TokenWipeTransaction } = require("@hiero-ledger/sdk");
const { deployBondWaitTreasuryAndApplyRoles } = require("../verify-treasury-persistence");
const { verifyAddEnvironmentalAssetToken } = require("./verify-add-environmental-asset-token");
const { verifyDeleteEnvironmentalAssetToken } = require("./verify-delete-environmental-asset-token");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");

/**
 * Wipe an environmental asset token from the treasury account
 * @param {string} environmentalAssetTokenId - An environmental asset token contract ID
 * @param {number} serialNumber - An environmental asset token serial number
 * @param {string} treasuryContractId - Treasury contract ID
 */
async function wipeEnvironmentalAssetToken(environmentalAssetTokenId, serialNumber, treasuryContractId) {
  log(
    `\n💱 Wiping environmental asset token ${environmentalAssetTokenId} - ${serialNumber} for treasury ${treasuryContractId}...`,
    colors.yellow,
  );
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const wipeTx = await new TokenWipeTransaction()
    .setTokenId(environmentalAssetTokenId)
    .setAccountId(treasuryContractId)
    .setSerials([serialNumber]);

  const submit = await wipeTx.execute(client);
  const receipt = await submit.getReceipt(client);
  console.log(`🎨 Environmental asset token wiped`);
}

/**
 * Dissociate an environmental asset token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenContractId - An environmental asset token contract ID
 */
async function dissociateEnvironmentalAssetToken(treasuryContractId, environmentalAssetTokenContractId) {
  log(`\n💱 Dissociating environmental asset token for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   Environmental asset token: ${environmentalAssetTokenContractId}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetTokenContractId}/dissociate`,
    requestBody,
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess("Dissociating environmental asset token transaction signed successfully!");

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess("Dissociating environmental asset token transaction published to message queue");

  return response.data;
}

/**
 * Wait for environmental asset token dissociated (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForEnvironmentalAssetTokenDissociated(treasuryContractId, maxRetries = 12, retryInterval = 5000) {
  log(`\n🔍 Waiting for environmental asset token to be dissociated...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/environmental-assets`);
      if (response.data && response.data.items[0].removalDate && !response.data.items[0].dissociationError) {
        return;
      } else {
        logInfo("Treasury still has an environmental asset token");
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Environmental asset token was not dissociated after ${maxRetries} attempts`);
}

async function verifyDissociateEnvironmentalAssetToken(treasuryContractId) {
  logHeader("🧪 Running verification of the execution to dissociate environmental asset tokens to the Treasury...");

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

    // Step1: Delete a previously added environmental asset token with dissociation error
    const [treasuryId, environmentalAssetTokenId, serialNumber] = await verifyDeleteEnvironmentalAssetToken(
      contractId,
      true,
    );

    // Step 2: Wipe environmental asset token from treasury account
    await wipeEnvironmentalAssetToken(environmentalAssetTokenId, serialNumber, contractId);

    // Step 3: Dissociate environmental asset token
    log("\n3️⃣  Dissociating environmental asset token...");
    log(`   Dissociating environmental asset token ${environmentalAssetTokenId}`, colors.bright);

    await dissociateEnvironmentalAssetToken(contractId, environmentalAssetTokenId);

    // Step 4: Wait and verify environmental asset token was dissociated
    log("\n4️⃣  Verifying environmental asset token dissociating...");
    await waitForEnvironmentalAssetTokenDissociated(contractId);

    logSuccess(`Environmental asset token successfully dissociated!`);

    logHeader("✅ Treasury Environmental Asset Token Dissociating Verification PASSED!");
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDissociateEnvironmentalAssetToken();
}

module.exports = {
  dissociateEnvironmentalAssetToken,
  waitForEnvironmentalAssetTokenDissociated,
  verifyDissociateEnvironmentalAssetToken,
};
