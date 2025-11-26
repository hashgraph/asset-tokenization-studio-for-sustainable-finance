const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
const { getLatestBond } = require("./document/set-bond-document");

/**
 * Mint bonds to a specific holder
 * @param {string} bondContractId - The bond contract ID
 * @param {string} holderAccountId - The holder account ID
 * @param {string} partition - The partition (optional)
 * @param {string} amount - Amount of bonds to mint
 * @param {string} format - Blockchain format (hedera/ethereum)
 * @returns {Promise<Object>} Transaction response with unsignedTx
 */
async function mintBond(bondContractId, holderAccountId, partition, amount, format) {
  log(`\n💰 Minting ${amount} bonds to holder ${holderAccountId} in bond ${bondContractId}...`, colors.bright);

  // Convert Hedera ID to EVM address if needed
  const holderEvmAddress = holderAccountId.startsWith("0x")
    ? holderAccountId
    : await ConverterUtils.getEvmAddressFromHederaAddress(holderAccountId);

  logInfo(`Using EVM address: ${holderEvmAddress}`);

  const mintBondRequest = {
    partition: partition || undefined,
    amount: amount,
    data: "0x",
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/holders/${holderEvmAddress}/mint`,
      mintBondRequest
    );

    logSuccess("Bond mint transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Partition: ${partition || "Default"}`);
    logInfo(`Amount: ${amount}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...mintBondRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to mint bonds: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function main() {
  try {
    logHeader("💰 Evercity Mint Bond");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`🔧 Gateway URL: ${process.env.GATEWAY_URL || "http://localhost:3000"}`, colors.blue);

    if (!validateSigningConfig()) {
      return;
    }

    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

    // Get bond from database or use provided one
    let bondContractId = process.env.BOND_CONTRACT_ID;

    if (!bondContractId) {
      logHeader("🔍 Step 1: Finding Latest Bond from Database");
      const latestBond = await getLatestBond();

      if (!latestBond || !latestBond.contractId) {
        logError("❌ No bonds found in the system");
        logError("Please create a bond first using: npm run ats:bond");
        process.exit(1);
      }

      bondContractId = latestBond.contractId;
      logSuccess(`Using bond: ${bondContractId}`);
      logInfo(`Symbol: ${latestBond.symbol}`);
      logInfo(`Name: ${latestBond.name}`);
    } else {
      logHeader("🎯 Using Provided Bond Contract ID");
      logInfo(`Bond Contract ID: ${bondContractId}`);
    }

    // Configure holder and mint parameters
    const holderAccountId = process.env.HOLDER_ACCOUNT_ID || process.env.ACCOUNT_ID;
    const partition = process.env.PARTITION || ""; // Optional
    const amount = process.env.AMOUNT || "10000"; // Amount in smallest units

    if (!holderAccountId) {
      logError("HOLDER_ACCOUNT_ID is required. Set it in .env or as environment variable");
      process.exit(1);
    }

    log(`\n🎯 Mint Configuration:`, colors.cyan);
    logInfo(`  • Bond Contract ID: ${bondContractId}`);
    logInfo(`  • Holder Account ID: ${holderAccountId}`);
    logInfo(`  • Partition: ${partition || "Default"}`);
    logInfo(`  • Amount: ${amount}\n`);

    const stepOffset = bondContractId === process.env.BOND_CONTRACT_ID ? 0 : 1;

    logHeader(`📝 Step ${stepOffset + 1}: Creating Mint Transaction...`);
    const mintTransaction = await mintBond(
      bondContractId,
      holderAccountId,
      partition,
      amount,
      format
    );

    logHeader(`✍️  Step ${stepOffset + 2}: Signing Transaction...`);
    const signedMintTx = await signTransaction(mintTransaction.unsignedTx);
    logSuccess("Mint transaction signed successfully!");

    logHeader(`📤 Step ${stepOffset + 3}: Publishing Transaction...`);
    await publishSignedTransaction(signedMintTx);
    logSuccess("Mint transaction published to message queue");

    log("\n⏳ Waiting for mint to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("🎉 Mint Bond Operation Completed!");
    logSuccess(`Minted ${amount} bonds to holder: ${holderAccountId}`);
    logSuccess(`Bond Contract: ${bondContractId}`);
  } catch (error) {
    logError(`\nScript failed: ${error.message}`);
    logError("\nTroubleshooting:");
    logError("   • Ensure Gateway API is running (check .env GATEWAY_URL)");
    logError("   • Verify BOND_CONTRACT_ID exists");
    logError("   • Verify you have ISSUER_ROLE on the bond contract");
    logError("   • Check private key configuration in .env");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { mintBond };
