const { Client, AccountId, PrivateKey, TokenWipeTransaction } = require("@hiero-ledger/sdk");
const { verifyTreasuryPaymentTokenUpdate } = require("./verify-update-treasury-payment-token");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");

/**
 * Wipe the payment token from the treasury account
 * @param {string} paymentTokenId - The payment token contract ID
 * @param {string} treasuryContractId - Treasury contract ID
 */
async function wipePaymentToken(paymentTokenId, treasuryContractId) {
  log(`\n💱 Wiping payment token ${paymentTokenId} for treasury ${treasuryContractId}...`, colors.yellow);
  const client = Client.forTestnet();
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringDer(process.env.HEDERA_PRIVATE_KEY);
  client.setOperator(operatorId, operatorKey);

  const wipeTx = await new TokenWipeTransaction()
    .setTokenId(paymentTokenId)
    .setAccountId(treasuryContractId)
    .setAmount(1);

  const submit = await wipeTx.execute(client);
  const receipt = await submit.getReceipt(client);
  console.log(`🎨 Environmental asset token wiped`);
}

/**
 * Dissociate the payment token
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenContractId - The payment token contract ID
 */
async function dissociatePaymentToken(treasuryContractId, paymentTokenContractId) {
  log(`\n💱 Dissociating payment token for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   Payment token: ${paymentTokenContractId}`, colors.cyan);

  const requestBody = {
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/payment-tokens/${paymentTokenContractId}/dissociate`,
    requestBody,
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess("Dissociating payment token transaction signed successfully!");

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess("Dissociating payment token transaction published to message queue");

  return response.data;
}

/**
 * Wait for payment token dissociated (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} paymentTokenId - The payment token contract ID
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForPaymentTokenDissociated(
  treasuryContractId,
  paymentTokenId,
  maxRetries = 12,
  retryInterval = 5000,
) {
  log(`\n🔍 Waiting for payment token to be dissociated...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}/payment-tokens`);
      if (response.data && response.data.total > 0) {
        const items = response.data.items;
        for (let j = 0; j < items.length; j++) {
          log(`${items[j].contractId} - ${items[j].removalDate} - ${items[j].dissociationError}`);
          if (items[j].contractId === paymentTokenId && items[j].removalDate && !items[j].dissociationError) {
            return;
          }
        }
      } else {
        logInfo(`Treasury still has the payment token ${paymentTokenId} associated`);
      }
    } catch (err) {
      logError(`   Error fetching treasury: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Payment token was not dissociated after ${maxRetries} attempts`);
}

async function verifyDissociatePaymentToken() {
  logHeader("🧪 Running verification of the execution to dissociate the payment token to the Treasury...");

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError("Signing configuration validation failed");
    process.exit(1);
  }

  try {
    // Step1: Updates the payment token when created the Treasury, but there was an error when dissociating the previous one
    const [treasuryContractId, paymentTokenId] = await verifyTreasuryPaymentTokenUpdate(undefined, true);

    // Step 2: Wipe previous Treasury's payment tokens from treasury account
    await wipePaymentToken(paymentTokenId, treasuryContractId);

    // Step 3: Dissociate the previous Treasury's payment token
    log("\n3️⃣  Dissociating the payment token...");
    log(`   Dissociating the payment token ${paymentTokenId}`, colors.bright);

    await dissociatePaymentToken(treasuryContractId, paymentTokenId);

    // Step 4: Wait and verify the payment token was dissociated
    log("\n4️⃣  Verifying payment token dissociating...");
    await waitForPaymentTokenDissociated(treasuryContractId, paymentTokenId);

    logSuccess(`Payment token successfully dissociated!`);

    logHeader("✅ Treasury Payment Token Dissociating Verification PASSED!");
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyDissociatePaymentToken();
}

module.exports = {
  dissociatePaymentToken,
  waitForPaymentTokenDissociated,
  verifyDissociatePaymentToken,
};
