const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { createBond } = require("./bond-service");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { getLatestBond } = require("./set-bond-document");
const { addControlListMember } = require("./add-control-list-member");

function getHolderAccountIdFromEnv() {
  const evmAddress = process.env.ACCOUNT_EVM_ADDRESS;
  if (!evmAddress) {
    logError("ACCOUNT_EVM_ADDRESS not found in .env file");
    logError("Please add ACCOUNT_EVM_ADDRESS to your .env file");
    throw new Error("ACCOUNT_EVM_ADDRESS is required");
  }
  return evmAddress;
}

async function removeControlListMember(bondContractId, holderAccountId, format) {
  log(`\n=👥 Removing holder from control list for bond ${bondContractId}...`, colors.bright);

  const removeControlListMemberRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.delete(
      `/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`,
      { data: removeControlListMemberRequest },
    );

    logSuccess("Remove control list member transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...removeControlListMemberRequest, holderAccountId, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to remove control list member: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyControlListMemberRemovalInDatabase(bondContractId, holderAccountId) {
  log(`\n=🔍 Control list member removal verification:`, colors.bright);
  logSuccess(`Remove control list member transaction has been sent successfully`);
  logInfo(`The RemoveControlListMemberEvent should have been processed`);
  logInfo(`=✅ To verify the holder was removed, run a database query`);
  logInfo(
    `Expected result: Bond with contractId "${bondContractId}" should NOT have holder "${holderAccountId}" in the control list registry`,
  );
  logInfo(`You should also see a RemoveControlListMemberEvent in the events table\n`);
}

async function runDeleteControlListMemberSimulator() {
  logHeader("=🚀 Running Remove Control List Member Simulator...");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader("=📝 Step 1: Creating Bond with control list enabled...");
  const bond = await createBond(format);

  try {
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    log("\n=⏳ Waiting for bond creation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=📊 Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      return;
    }

    const bondContractId = latestBond.contractId;

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Bond Symbol: ${latestBond.symbol}`);
    logInfo(`Bond Name: ${latestBond.name}`);

    log("\n=⏳ Waiting for blockchain listener to register event filters (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=👥 Step 3: Adding Holder to Control List...");

    const holderAccountId = getHolderAccountIdFromEnv();
    logInfo(`Holder Account ID to add: ${holderAccountId}`);
    logInfo(`Using EVM address from ACCOUNT_EVM_ADDRESS in .env file`);

    const addControlListTransaction = await addControlListMember(bondContractId, holderAccountId, format);

    const signedAddControlListTx = await signTransaction(addControlListTransaction.unsignedTx);
    logSuccess("Add control list member transaction signed successfully!");

    await publishSignedTransaction(signedAddControlListTx);
    logSuccess("Control list transaction published to message queue");

    log(
      "\n=⏳ Waiting for control list update to be processed and event to be captured (10 seconds)...",
      colors.yellow,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=🗑️  Step 4: Removing Holder from Control List...");

    const deleteControlListTransaction = await removeControlListMember(bondContractId, holderAccountId, format);

    const signedDeleteControlListTx = await signTransaction(deleteControlListTransaction.unsignedTx);
    logSuccess("Remove control list member transaction signed successfully!");

    await publishSignedTransaction(signedDeleteControlListTx);
    logSuccess("Delete control list transaction published to message queue");

    log(
      "\n=⏳ Waiting for control list deletion to be processed and event to be captured (10 seconds)...",
      colors.yellow,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=✅ Step 5: Verifying Control List Removal...");
    await verifyControlListMemberRemovalInDatabase(bondContractId, holderAccountId);

    logHeader("=🎉 Remove Control List Member Simulation Completed!");
    logSuccess(`Created bond with contract ID: ${bondContractId}`);
    logSuccess(`Added holder ${holderAccountId} to control list registry`);
    logSuccess(`Removed holder ${holderAccountId} from control list registry`);
    logSuccess("= Check the database to verify:");
    logInfo(`   = Bond table for contract ID: ${bondContractId}`);
    logInfo(`   = Control list registry should NOT contain holder: ${holderAccountId}`);
    logInfo(`   = RemoveControlListMemberEvent should be in the events table`);
  } catch (error) {
    logError(`Failed to complete simulation: ${error.message}`);
    logError("Make sure:");
    logError("   = Private key in .env file is valid for the selected blockchain format");
    logError("   = For Hedera: HEDERA_PRIVATE_KEY should be in DER format");
    logError("   = For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format");
    logError("   = Gateway API is running and accessible");
    logError("   = Database is accessible and properly configured");
    logError("   = Holder Account ID is valid for the selected blockchain format");
    logError(`   = For Hedera: Should be in format "0.0.xxxxx"`);
    logError(`   = For Ethereum: Should be a valid EVM address (0x...)`);
  }
}

async function main() {
  try {
    logHeader("=🏦 Evercity Remove Control List Member Simulator");
    log("============================================\n", colors.bright);
    log(`=📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`=👤 Holder Account ID: ${config.ACCOUNT_EVM_ADDRESS || "Not set in .env"}`, colors.cyan);
    log(`=📝 This will create a bond, add a holder to control list, then remove it\n`, colors.cyan);

    await runDeleteControlListMemberSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runDeleteControlListMemberSimulator,
  removeControlListMember,
  verifyControlListMemberRemovalInDatabase,
};
