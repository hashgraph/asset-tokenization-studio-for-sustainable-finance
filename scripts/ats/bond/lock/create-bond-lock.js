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

async function createBondLock(bondContractId, holderAccountId, partition, amount, expirationTimestamp, format) {
  log(`\n🔒 Creating lock for holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  // Convert Hedera ID to EVM address if needed
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using EVM address: ${holderEvmAddress}`);

  const createBondLockRequest = {
    partition: partition || undefined,
    amount: amount,
    expirationTimestamp: expirationTimestamp,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/locks`,
      createBondLockRequest,
    );

    logSuccess("Bond lock transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...createBondLockRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond lock: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyLockInDatabase(bondContractId, holderAccountId, amount) {
  log(`\n📊 Bond lock verification:`, colors.bright);
  logSuccess(`Create bond lock transaction has been sent successfully`);
  logInfo(`The CreatedBondLockEvent should have been processed`);
  logInfo(`📋 To verify the lock was created, run:`);
  logInfo(
    `   BOND_CONTRACT_ID=${bondContractId} HOLDER_ACCOUNT_ID=${holderAccountId} node scripts/ats/bond/lock/get-bond-locks.js`,
  );
  logInfo(`Expected result: A new lock with amount ${amount} should appear in the list\n`);
}

async function main() {
  try {
    logHeader("🔒 Evercity Create Bond Lock");
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

    // Configure holder and lock parameters (prioritize command line args, then env vars)
    const holderAccountId = args.HOLDER_ACCOUNT_ID || process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const partition = args.PARTITION || process.env.PARTITION || ""; // Optional
    const amount = args.AMOUNT || process.env.AMOUNT || "1000"; // Amount in smallest units

    // Expiration timestamp - default to 2 minutes from now (short for testing)
    const expirationMinutes = parseInt(args.EXPIRATION_MINUTES || process.env.EXPIRATION_MINUTES) || 1;
    const expirationTimestamp = new Date(Date.now() + expirationMinutes * 60 * 1000);

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    // Step 3: Mint bonds to the holder
    logHeader("💰 Step 3: Minting Bonds to Holder...");
    const mintAmount = "10000"; // Mint enough bonds to lock
    const mintTransaction = await mintBond(bondContractId, holderAccountId, partition, mintAmount, format);

    // Sign and publish mint transaction
    const signedMintTx = await signTransaction(mintTransaction.unsignedTx);
    logSuccess("Mint transaction signed successfully!");

    await publishSignedTransaction(signedMintTx);
    logSuccess("Mint transaction published to message queue");

    // Wait for mint to be processed
    log("\n⏳ Waiting for mint to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    log(`\n🎯 Lock Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Partition: ${partition || "Default"}`);
    logInfo(`  • Amount: ${amount}`);
    logInfo(`  • Expiration: ${expirationTimestamp.toISOString()}`);
    logInfo(`  • Expiration (in ${expirationMinutes} minutes)\n`);

    logHeader(`📝 Step 4: Creating Lock Transaction...`);
    const lockTransaction = await createBondLock(
      bondContractId,
      holderAccountId,
      partition,
      amount,
      expirationTimestamp,
      format,
    );

    logHeader(`✍️  Step 5: Signing Lock Transaction...`);
    const signedLockTx = await signTransaction(lockTransaction.unsignedTx);
    logSuccess("Lock transaction signed successfully!");

    logHeader(`📤 Step 6: Publishing Lock Transaction...`);
    await publishSignedTransaction(signedLockTx);
    logSuccess("Lock transaction published to message queue");

    log("\n⏳ Waiting for lock creation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader(`✅ Step 7: Verifying Lock Creation...`);
    await verifyLockInDatabase(bondContractId, holderAccountId, amount);

    logHeader("🎉 Create Bond Lock Operation Completed!");
    logSuccess(`Lock created for holder: ${holderAccountId}`);
    logSuccess(`Amount locked: ${amount}`);
    logSuccess(`Expires: ${expirationTimestamp.toISOString()}`);
    log(`\n⏰ Lock will expire in ${expirationMinutes} minute(s)`, colors.yellow);
    log(`   After expiration, you can release it with:`, colors.cyan);
    logInfo(`   npm run ats:release-bond-lock BOND_CONTRACT_ID=${bondContractId} LOCK_ID=<LOCK_ID>`);
    log(`\n💡 Tip: Wait at least ${expirationMinutes + 1} minute(s) before trying to release`, colors.yellow);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify HOLDER_ACCOUNT_ID has sufficient balance");
    logError("   • Ensure holder has enough unlocked bonds to lock");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createBondLock, verifyLockInDatabase };
