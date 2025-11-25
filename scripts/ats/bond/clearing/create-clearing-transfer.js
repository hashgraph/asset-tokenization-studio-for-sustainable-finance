const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
const { createBond } = require("../bond-service");
const { getLatestBond } = require("../document/set-bond-document");
const { mintBond } = require("../mint-bond");

// Parse command line arguments (format: key=value)
const args = {};
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value) {
    args[key] = value;
  }
});

async function createClearingTransfer(bondContractId, holderAccountId, partition, amount, toAccountId, expirationTimestamp, data, format) {
  log(`\n🔄 Creating clearing transfer for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  // Convert Hedera ID to EVM address if needed
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using holder EVM address: ${holderEvmAddress}`);
  logInfo(`Transfer to account: ${toAccountId}`);

  const createClearingTransferRequest = {
    partition: partition || undefined,
    amount: amount,
    toAccountId: toAccountId,
    expirationTimestamp: expirationTimestamp,
    data: data || "0x",
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/clearings/transfer`,
      createClearingTransferRequest,
    );

    logSuccess("Clearing transfer transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`To Account ID: ${toAccountId}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...createClearingTransferRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create clearing transfer: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyClearingInDatabase(bondContractId, holderAccountId, amount, toAccountId) {
  log(`\n📊 Clearing transfer verification:`, colors.bright);
  logSuccess(`Create clearing transfer transaction has been sent successfully`);
  logInfo(`The ClearingTransferCreatedEvent should have been processed`);
  logInfo(`📋 To verify the clearing was created, run:`);
  logInfo(
    `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} node scripts/ats/bond/clearing/get-clearings-transfer.js`,
  );
  logInfo(`Expected result: A new clearing transfer with amount ${amount} to ${toAccountId} should appear in the list\n`);
}

async function main() {
  try {
    logHeader("🔄 Evercity Create Clearing Transfer");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

    logHeader("📝 Step 1: Creating New Bond...");
    const bond = await createBond(format);

    // Sign and publish bond creation transaction
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    // Wait for bond to be processed and persisted in database
    log("\n⏳ Waiting for bond creation to be processed (15 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 15000));

    logHeader("📊 Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      process.exit(1);
    }

    bondContractId = latestBond.contractId;
    logSuccess(`Using bond: ${bondContractId}`);
    logInfo(`Symbol: ${latestBond.symbol}`);
    logInfo(`Name: ${latestBond.name}`);

    // Configure holder and clearing parameters (prioritize command line args, then env vars)
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const toAccountId = args.TO_ACCOUNT_ID || process.env.TO_ACCOUNT_ID;
    const partition = args.PARTITION || process.env.PARTITION || ""; // Optional
    const amount = args.AMOUNT || process.env.AMOUNT || "1000"; // Amount in smallest units
    const data = args.DATA || process.env.DATA || "0x"; // Optional data

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    if (!toAccountId) {
      logError("TO_ACCOUNT_ID is required. Set it as environment variable or argument");
      logError("Example: TO_ACCOUNT_ID=0.0.xxxxx node scripts/ats/bond/clearing/create-clearing-transfer.js");
      process.exit(1);
    }

    // Step 3: Mint bonds to the holder
    logHeader("💰 Step 3: Minting Bonds to Holder...");
    const mintAmount = "10000"; // Mint enough bonds to transfer
    const mintTransaction = await mintBond(bondContractId, holderAccountId, partition, mintAmount, format);

    // Sign and publish mint transaction
    const signedMintTx = await signTransaction(mintTransaction.unsignedTx);
    logSuccess("Mint transaction signed successfully!");

    await publishSignedTransaction(signedMintTx);
    logSuccess("Mint transaction published to message queue");

    // Wait for mint to be processed
    log("\n⏳ Waiting for mint to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Expiration timestamp - default to 2 minutes from now (short for testing)
    const expirationMinutes = parseInt(args.EXPIRATION_MINUTES || process.env.EXPIRATION_MINUTES) || 2;
    const expirationTimestamp = new Date(Date.now() + expirationMinutes * 60 * 1000);

    log(`\n🎯 Clearing Transfer Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • To Account ID: ${toAccountId}`);
    logInfo(`  • Partition: ${partition || "Default"}`);
    logInfo(`  • Amount: ${amount}`);
    logInfo(`  • Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`  • Expiration (in ${expirationMinutes} minutes)`);
    logInfo(`  • Data: ${data}\n`);

    logHeader(`📝 Step 4: Creating Clearing Transfer Transaction...`);
    const clearingTransaction = await createClearingTransfer(
      bondContractId,
      holderAccountId,
      partition,
      amount,
      toAccountId,
      expirationTimestamp,
      data,
      format,
    );

    logHeader(`✍️  Step 5: Signing Clearing Transfer Transaction...`);
    const signedClearingTx = await signTransaction(clearingTransaction.unsignedTx);
    logSuccess("Clearing transfer transaction signed successfully!");

    logHeader(`📤 Step 6: Publishing Clearing Transfer Transaction...`);
    await publishSignedTransaction(signedClearingTx);
    logSuccess("Clearing transfer transaction published to message queue");

    log("\n⏳ Waiting for clearing transfer creation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader(`✅ Step 7: Verifying Clearing Transfer Creation...`);
    await verifyClearingInDatabase(bondContractId, holderAccountId, amount, toAccountId);

    logHeader("🎉 Create Clearing Transfer Operation Completed!");
    logSuccess(`Clearing transfer created for holder: ${holderAccountId}`);
    logSuccess(`Amount: ${amount}`);
    logSuccess(`To: ${toAccountId}`);
    logSuccess(`Expires: ${expirationTimestamp.toISOString()}`);
    log(`\n⏰ Clearing will expire in ${expirationMinutes} minute(s)`, colors.yellow);
    log(`   After that, you can approve it with:`, colors.cyan);
    logInfo(`   npm run ats:approve-clearing BOND_CONTRACT_ID=${bondContractId} CLEARING_ID=<CLEARING_ID> OPERATION_TYPE=TRANSFER`);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID has sufficient balance");
    logError("   • Ensure holder has enough bonds to transfer");
    logError("   • Verify TO_ACCOUNT_ID is valid");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createClearingTransfer, verifyClearingInDatabase };
