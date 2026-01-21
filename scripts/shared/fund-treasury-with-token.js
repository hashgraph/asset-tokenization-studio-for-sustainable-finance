const { Client, PrivateKey, TransferTransaction } = require("@hiero-ledger/sdk");
const { log, logSuccess, logError, logHeader, colors } = require("./lib/logger");
const { config } = require("./lib/config");
const readline = require("readline");

/**
 * Fund treasury with custom payment token
 */
async function fundTreasuryWithToken(treasuryId, tokenId, amount) {
  log(`\n💰 Funding treasury ${treasuryId} with ${amount} payment tokens...`, colors.yellow);

  const client = Client.forTestnet();
  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
  const privateKeyStr = format === "hedera" ? config.HEDERA_PRIVATE_KEY : config.ETHEREUM_PRIVATE_KEY;

  let operatorKey;
  if (format === "ethereum") {
    const cleanKey = privateKeyStr.startsWith("0x") ? privateKeyStr.slice(2) : privateKeyStr;
    operatorKey = PrivateKey.fromStringECDSA(cleanKey);
  } else {
    try {
      operatorKey = PrivateKey.fromStringED25519(privateKeyStr);
    } catch {
      operatorKey = PrivateKey.fromStringDer(privateKeyStr);
    }
  }

  client.setOperator(process.env.ACCOUNT_ID, operatorKey);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, process.env.ACCOUNT_ID, -amount)
    .addTokenTransfer(tokenId, treasuryId, amount)
    .execute(client);

  const receipt = await transferTx.getReceipt(client);
  client.close();
  logSuccess(`Funded treasury with payment tokens. Status: ${receipt.status.toString()}`);
}

/**
 * Prompt user for input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  logHeader("💰 Fund Treasury with Token");

  try {
    // Prompt for treasury ID
    const treasuryId = await prompt("Enter Treasury ID (e.g., 0.0.12345): ");
    if (!treasuryId.trim()) {
      logError("Treasury ID is required");
      process.exit(1);
    }

    // Prompt for payment token ID
    const tokenId = await prompt("Enter Payment Token ID (e.g., 0.0.67890): ");
    if (!tokenId.trim()) {
      logError("Payment Token ID is required");
      process.exit(1);
    }

    // Hardcoded amount
    const amount = 60000000000;

    log(`\n📋 Summary:`, colors.cyan);
    log(`   Treasury ID: ${treasuryId}`, colors.cyan);
    log(`   Token ID: ${tokenId}`, colors.cyan);
    log(`   Amount: ${amount}`, colors.cyan);

    const confirm = await prompt("\nProceed with funding? (yes/no): ");
    if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
      log("Funding cancelled", colors.yellow);
      process.exit(0);
    }

    // Execute funding
    await fundTreasuryWithToken(treasuryId, tokenId, amount);

    logSuccess("\n✅ Treasury funding completed successfully!");
  } catch (error) {
    logError(`Funding failed: ${error.message}`);
    if (error.stack) {
      logError(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fundTreasuryWithToken,
};
