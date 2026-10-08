const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} = require("@hiero-ledger/sdk");
const { deployBondWaitTreasuryAndApplyRoles } = require("../verify-treasury-persistence");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");

/**
 * Create an environmental asset token
 */
async function createEnvironmentalAssetToken() {
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const tokenTransaction = await new TokenCreateTransaction()
    .setTokenName("Hybrid NFT")
    .setTokenSymbol("HNFT")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
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
  log(`✅ Created token: ${tokenId.toString()}`);
  const evmAddress = tokenId.toSolidityAddress();
  log(`🧬 EVM address (ERC-721 compatible): ${evmAddress}`);

  return tokenId;
}

/**
 * Add an environmental asset token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} environmentalAssetTokenContractId - An environmental asset token contract ID
 */
async function addEnvironmentalAssetToken(treasuryContractId, environmentalAssetTokenContractId) {
  log(`\n💱 Adding environmental asset token for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   Environmental asset token: ${environmentalAssetTokenContractId}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/environmental-assets/${environmentalAssetTokenContractId}`,
    requestBody,
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess("Adding environmental asset token transaction signed successfully!");

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess("Adding environmental asset token transaction published to message queue");

  return response.data;
}

/**
 * Wait for environmental asset token added (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} expectedEnvironmentalAssetTokenId - Expected environmental asset token contract ID
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForEnvironmentalAssetTokenAdded(
  treasuryContractId,
  expectedEnvironmentalAssetTokenId,
  maxRetries = 12,
  retryInterval = 5000,
) {
  log(`\n🔍 Waiting for environmental asset token ${expectedEnvironmentalAssetTokenId} to be added...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/environmental-assets`);
      if (response.data && response.data.total > 0) {
        const existingEnvironmentalAssetTokenId = response.data.items[0].contractId;
        log(`   Environmental asset token found: ${existingEnvironmentalAssetTokenId}`, colors.cyan);

        if (existingEnvironmentalAssetTokenId.toString() === expectedEnvironmentalAssetTokenId.toString()) {
          logSuccess("Environmental asset token successfully added!");
          return existingEnvironmentalAssetTokenId;
        } else {
          log(
            `   Environmental asset token not yet added (expected: ${expectedEnvironmentalAssetTokenId})`,
            colors.yellow,
          );
        }
      } else {
        logInfo("No environmental asset tokens found for this Treasury");
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Environmental asset token was not added after ${maxRetries} attempts`);
}

async function verifyAddEnvironmentalAssetToken(treasuryContractId) {
  logHeader("🧪 Running verification of the execution to add environmental asset tokens to the Treasury...");

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

    // Step 2: Create an environmental asset token
    const environmentalAssetTokenId = await createEnvironmentalAssetToken();

    // Step 3: Add environmental asset token
    //const environmentalAssetTokenId = '0.0.7201095';
    log("\n3️⃣  Adding environmental asset token...");
    log(`   Adding environmental asset token ${environmentalAssetTokenId}`, colors.bright);

    await addEnvironmentalAssetToken(contractId, environmentalAssetTokenId);

    // Step 4: Wait and verify environmental asset token was added
    log("\n4️⃣  Verifying environmental asset token adding...");
    const existingEnvironmentalAssetTokenId = await waitForEnvironmentalAssetTokenAdded(
      contractId,
      environmentalAssetTokenId,
    );
    log(`   Existing environmental asset token: ${existingEnvironmentalAssetTokenId}`, colors.green);

    logHeader("✅ Treasury Environmental Asset Token Adding Verification PASSED!");

    return environmentalAssetTokenId;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAddEnvironmentalAssetToken();
}

module.exports = {
  createEnvironmentalAssetToken,
  addEnvironmentalAssetToken,
  waitForEnvironmentalAssetTokenAdded,
  verifyAddEnvironmentalAssetToken,
};
