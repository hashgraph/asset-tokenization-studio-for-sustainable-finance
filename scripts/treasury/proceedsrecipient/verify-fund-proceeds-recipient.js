const { Client, AccountId, PrivateKey } = require("@hiero-ledger/sdk");
const { deployBondWaitTreasuryAndApplyRoles } = require("../verify-treasury-persistence");
const { createPaymentToken, transferPaymentToken } = require("../paymenttoken/verify-update-treasury-payment-token");
const { verifyAddProceedsRecipient } = require("./verify-add-proceeds-recipient");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { log, logSuccess, logError, logInfo, logHeader, colors } = require("../../shared/lib/logger");
const { config } = require("../../shared/lib/config");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");

/**
 * Get the Bond associated to a Treasury
 * @param {string} treasuryContractId - Treasury contract ID
 */
async function getTreasuryBond(treasuryContractId) {
  const response = await gatewayClient.get(`/api/v1/treasuries/${treasuryContractId}`);
  if (response.data) {
    const bondContractId = response.data.bondContractId;
    logSuccess(`Getting the Bond of the Treasury successfully!: ${bondContractId}`);
    return bondContractId;
  } else {
    logError(`   Error fetching the Bond associated to the Treasury ${treasuryContractId}`);
  }
}

/**
 * Fund a proceeds recipient
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} proceedsRecipient - The proceeds recipient to be funded
 */
async function fundProceedsRecipient(treasuryContractId, proceedsRecipient) {
  log(`\n💱 Funding proceeds recipient {proceedsRecipient} for treasury ${treasuryContractId}...`, colors.yellow);
  log(`   Proceeds recipient: ${proceedsRecipient}`, colors.cyan);

  const requestBody = {
    amount: "1",
    format: config.BLOCKCHAIN_FORMAT,
    accountId: process.env.ACCOUNT_ID,
  };

  // Step 1: Get unsigned transaction from API
  const response = await gatewayClient.post(
    `/api/v1/treasuries/${treasuryContractId}/proceeds-recipients/${proceedsRecipient}/transfer`,
    requestBody,
  );
  const unsignedTx = response.data.unsignedTx;

  log(`   Unsigned transaction received`, colors.cyan);

  // Step 2: Sign the transaction
  const signedTx = await signTransaction(unsignedTx);
  logSuccess("Funding proceeds recipient transaction signed successfully!");

  // Step 3: Publish to transaction sender
  await publishSignedTransaction(signedTx);
  logSuccess("Funding proceeds recipient transaction published to message queue");

  return response.data;
}

/**
 * Wait for proceeds recipient funded (with retries)
 * @param {string} treasuryContractId - Treasury contract ID
 * @param {string} proceedsRecipient - The proceeds recipient to be funded
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryInterval - Interval between retries in milliseconds
 */
async function waitForProceedsRecipientFunded(
  treasuryContractId,
  proceedsRecipient,
  maxRetries = 12,
  retryInterval = 5000,
) {
  log(`\n🔍 Waiting for the proceeds recipient to be funded...`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    log(`   Attempt ${i + 1}/${maxRetries}...`);

    try {
      const response = await gatewayClient.get(
        `/api/v1/treasuries/${treasuryContractId}/proceeds-recipients/${proceedsRecipient}/allocations`,
      );
      if (response.data && response.data.total == 1) {
        return;
      } else {
        logInfo("Proceeds recipient not funded yet for this Treasury");
      }
    } catch (err) {
      logError(`   Error fetching the proceeds recipient allocations: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Timeout: Proceeds recipient was not funded after ${maxRetries} attempts`);
}

async function verifyFundProceedsRecipient(treasuryContractId) {
  logHeader("🧪 Running verification of the execution to fund a proceeds recipient...");

  // Validate signing configuration before starting
  if (!validateSigningConfig()) {
    logError("Signing configuration validation failed");
    process.exit(1);
  }

  try {
    let contractId;
    let paymentTokenId, paymentTokenEvmAddress;
    if (treasuryContractId) {
      contractId = treasuryContractId;
    } else {
      // Step 1: Create a payment token
      [paymentTokenId, paymentTokenEvmAddress] = await createPaymentToken();

      // Step 2: Deploy bond, wait for treasury, and apply all roles
      log("\n1️⃣  Deploying bond, waiting for treasury, and applying roles...");
      const overridePaymentTokenAddress = {
        treasuryData: {
          paymentTokenAddress: paymentTokenEvmAddress,
        },
      };

      const treasury = await deployBondWaitTreasuryAndApplyRoles(overridePaymentTokenAddress);

      contractId = treasury.contractId;
      logSuccess(`Treasury deployed: ${contractId}`);
    }

    // Step3: Transfer the just minted token to the Treasury
    await transferPaymentToken(paymentTokenId, contractId, 1);

    // Step 4: Gets the treasury Bond
    log("\n3️⃣  Getting the Treasury Bond...");
    const bondContractId = await getTreasuryBond(contractId);

    // Step 5: Creates a proceeds recipient
    log("\n3️⃣  Creating the proceeds recipient...");
    const proceedsRecipient = await verifyAddProceedsRecipient(bondContractId);

    // Step 6: Funds the proceeds recipient
    log("\n3️⃣  Funding the proceeds recipient...");
    log(`   Funding the proceeds recipient ${proceedsRecipient}`, colors.bright);

    await fundProceedsRecipient(contractId, proceedsRecipient);

    // Step 7: Wait and verify payment token was transferred
    log("\n4️⃣  Verifying proceeds recipient funded...");
    await waitForProceedsRecipientFunded(contractId, proceedsRecipient);

    logSuccess(`Proceeds recipient successfully funded!`);

    logHeader("✅ Proceeds Recipient Funding Verification PASSED!");

    return proceedsRecipient;
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyFundProceedsRecipient();
}

module.exports = {
  verifyFundProceedsRecipient,
  fundProceedsRecipient,
  waitForProceedsRecipientFunded,
};
