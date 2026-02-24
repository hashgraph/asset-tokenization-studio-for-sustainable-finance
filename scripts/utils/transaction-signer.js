const { config } = require("../shared/lib/config");
const { log, logSuccess, logError, logWarning, logHeader, colors } = require("../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../shared/lib/transaction-signer");
const { getUserInput } = require("../shared/lib/input");

async function signTransactionOnly() {
  logHeader("🔐 Transaction Signing Service...");

  if (!validateSigningConfig()) {
    return;
  }
  const transactionString = await getUserInput("Enter the transaction string: ");

  if (!transactionString || transactionString.trim() === "") {
    logError("Transaction string is required");
    return;
  }

  try {
    const signedTx = await signTransaction(transactionString.trim());

    logSuccess(`${config.BLOCKCHAIN_FORMAT.toUpperCase()} transaction signed successfully!`);

    logHeader("📄 Signed Transaction:");
    log(`${signedTx}`, colors.cyan);

    logWarning("You can copy the signed transaction above to use it in your application.");

    return signedTx;
  } catch (error) {
    logError(`Failed to sign transaction: ${error.message}`);
    logWarning("Make sure:");
    logWarning("   • Transaction string is valid hex");
    logWarning("   • Private key in .env file is valid for the selected blockchain format");
    logWarning("   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format");
    logWarning("   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format");
  }
}

async function main() {
  try {
    logHeader("🔐 Evercity Transaction Signer");
    log("===============================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);

    await signTransactionOnly();
  } catch (error) {
    logError(`Transaction signing failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { signTransactionOnly };
