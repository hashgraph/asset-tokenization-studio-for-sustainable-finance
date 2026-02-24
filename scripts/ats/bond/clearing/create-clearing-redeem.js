const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
const { createClearingBond } = require("./clearing-bond-service");
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

async function createClearingRedeem(
  bondContractId,
  holderAccountId,
  partition,
  amount,
  expirationTimestamp,
  data,
  format,
) {
  log(`\n🔄 Creating clearing redeem for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  // Convert Hedera ID to EVM address if needed
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using EVM address: ${holderEvmAddress}`);

  const createClearingRedeemRequest = {
    partition: partition || undefined,
    amount: amount,
    expirationTimestamp: expirationTimestamp,
    data: data || "0x",
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/clearings/redeem`,
      createClearingRedeemRequest,
    );

    logSuccess("Clearing redeem transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...createClearingRedeemRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create clearing redeem: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyClearingInDatabase(bondContractId, holderAccountId, amount) {
  log(`\n📊 Clearing redeem verification:`, colors.bright);
  logSuccess(`Create clearing redeem transaction has been sent successfully`);
  logInfo(`The ClearingRedeemCreatedEvent should have been processed`);
  logInfo(`📋 To verify the clearing was created, run:`);
  logInfo(
    `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} node scripts/ats/bond/clearing/get-clearings-redeem.js`,
  );
  logInfo(`Expected result: A new clearing redeem with amount ${amount} should appear in the list\n`);
}

async function main() {
  try {
    logHeader("🔄 Evercity Create Clearing Redeem");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

    logHeader("📝 Step 1: Creating New Bond...");
    const bond = await createClearingBond(format);

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
    const partition = args.PARTITION || process.env.PARTITION || ""; // Optional
    const amount = args.AMOUNT || process.env.AMOUNT || "1000"; // Amount in smallest units
    const data = args.DATA || process.env.DATA || "0x"; // Optional data

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    // Step 3: Mint bonds to the holder
    logHeader("💰 Step 3: Minting Bonds to Holder...");
    const mintAmount = "10000"; // Mint enough bonds to redeem
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

    log(`\n🎯 Clearing Redeem Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Partition: ${partition || "Default"}`);
    logInfo(`  • Amount: ${amount}`);
    logInfo(`  • Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`  • Expiration (in ${expirationMinutes} minutes)`);
    logInfo(`  • Data: ${data}\n`);

    logHeader(`📝 Step 4: Creating Clearing Redeem Transaction...`);
    const clearingTransaction = await createClearingRedeem(
      bondContractId,
      holderAccountId,
      partition,
      amount,
      expirationTimestamp,
      data,
      format,
    );

    logHeader(`✍️  Step 5: Signing Clearing Redeem Transaction...`);
    const signedClearingTx = await signTransaction(clearingTransaction.unsignedTx);
    logSuccess("Clearing redeem transaction signed successfully!");

    logHeader(`📤 Step 6: Publishing Clearing Redeem Transaction...`);
    await publishSignedTransaction(signedClearingTx);
    logSuccess("Clearing redeem transaction published to message queue");

    log("\n⏳ Waiting for clearing redeem creation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader(`✅ Step 7: Verifying Clearing Redeem Creation...`);
    await verifyClearingInDatabase(bondContractId, holderAccountId, amount);

    logHeader("🎉 Create Clearing Redeem Operation Completed!");
    logSuccess(`Clearing redeem created for holder: ${holderAccountId}`);
    logSuccess(`Amount: ${amount}`);
    logSuccess(`Expires: ${expirationTimestamp.toISOString()}`);
    log(`\n⏰ Clearing will expire in ${expirationMinutes} minute(s)`, colors.yellow);
    log(`   After that, you can approve it with:`, colors.cyan);
    logInfo(
      `   npm run ats:approve-clearing BOND_CONTRACT_ID=${bondContractId} CLEARING_ID=<CLEARING_ID> OPERATION_TYPE=REDEEM`,
    );
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID has sufficient balance");
    logError("   • Ensure holder has enough bonds to redeem");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createClearingRedeem, verifyClearingInDatabase };
