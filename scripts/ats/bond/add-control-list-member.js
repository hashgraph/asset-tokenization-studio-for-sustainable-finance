const { config } = require("../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { createBond } = require("./bond-service");
const { gatewayClient } = require("../../shared/lib/gateway-client");
const { getLatestBond } = require("./set-bond-document");

function getHolderAccountIdFromEnv() {
  const evmAddress = process.env.ACCOUNT_EVM_ADDRESS;
  if (!evmAddress) {
    logError("ACCOUNT_EVM_ADDRESS not found in .env file");
    logError("Please add ACCOUNT_EVM_ADDRESS to your .env file");
    throw new Error("ACCOUNT_EVM_ADDRESS is required");
  }
  return evmAddress;
}

async function addControlListMember(bondContractId, holderAccountId, format) {
  log(`\n=👥 Adding holder to control list for bond ${bondContractId}...`, colors.bright);

  const addControlListMemberRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/control-list/${holderAccountId}`,
      addControlListMemberRequest,
    );

    logSuccess("Add control list member transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Holder Account ID: ${holderAccountId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 100)}...`);

    return { ...addControlListMemberRequest, holderAccountId, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to add control list member: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyControlListMemberInDatabase(bondContractId, holderAccountId) {
  log(`\n=🔍 Control list member verification:`, colors.bright);
  logSuccess(`Add control list member transaction has been sent successfully`);
  logInfo(`The AddControlListMemberEvent should have been processed`);
  logInfo(`=✅ To verify the holder was added, run a database query`);
  logInfo(
    `Expected result: Bond with contractId "${bondContractId}" should have holder "${holderAccountId}" in the control list registry`,
  );
  logInfo(`You should also see an AddControlListMemberEvent in the events table\n`);
}

async function runAddControlListMemberSimulator() {
  logHeader("=🚀 Running Add Control List Member Simulator...");

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

    const controlListTransaction = await addControlListMember(bondContractId, holderAccountId, format);

    const signedControlListTx = await signTransaction(controlListTransaction.unsignedTx);
    logSuccess("Add control list member transaction signed successfully!");

    await publishSignedTransaction(signedControlListTx);
    logSuccess("Control list transaction published to message queue");

    log(
      "\n=⏳ Waiting for control list update to be processed and event to be captured (10 seconds)...",
      colors.yellow,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=✅ Step 4: Verifying Control List Update...");
    await verifyControlListMemberInDatabase(bondContractId, holderAccountId);

    logHeader("=🎉 Add Control List Member Simulation Completed!");
    logSuccess(`Created bond with contract ID: ${bondContractId}`);
    logSuccess(`Added holder ${holderAccountId} to control list registry`);
    logSuccess("= Check the database to verify:");
    logInfo(`   = Bond table for contract ID: ${bondContractId}`);
    logInfo(`   = Control list registry should contain holder: ${holderAccountId}`);
    logInfo(`   = AddControlListMemberEvent should be in the events table`);
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
    logHeader("=🏦 Evercity Add Control List Member Simulator");
    log("==========================================\n", colors.bright);
    log(`=📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`=👤 Holder Account ID: ${config.ACCOUNT_EVM_ADDRESS || "Not set in .env"}`, colors.cyan);
    log(`=📝 This will create a new bond and add a holder to its control list\n`, colors.cyan);

    await runAddControlListMemberSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runAddControlListMemberSimulator, addControlListMember, verifyControlListMemberInDatabase };
