const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { getLatestBond } = require("../document/set-bond-document");
const { Interface } = require("ethers");

const CAP_CONFIG = {
  newMaxSupply: "2000000",
};

// This is the _CAP_ROLE from the contracts
const CAP_ROLE = "0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571";

async function grantCapRole(bondContractId, accountAddress, format) {
  log(`\n=🔑 Granting CAP_ROLE to account ${accountAddress}...`, colors.bright);

  try {
    const iface = new Interface(["function grantRole(bytes32 role, address account)"]);

    const functionData = iface.encodeFunctionData("grantRole", [CAP_ROLE, accountAddress]);

    logInfo(`Encoded function data: ${functionData}`);
    logInfo(`Contract ID: ${bondContractId}`);
    logInfo(`Role: ${CAP_ROLE}`);
    logInfo(`Account: ${accountAddress}`);

    const { ContractExecuteTransaction, AccountId, TransactionId, Timestamp } = require("@hiero-ledger/sdk");
    const { getHederaClient } = require("@hashgraph/green-bonds-shared-core/dist/transaction/Environment");

    const encoded = new Uint8Array(Buffer.from(functionData.slice(2), "hex"));

    const tx = new ContractExecuteTransaction()
      .setContractId(bondContractId)
      .setGas(15_000_000)
      .setFunctionParameters(encoded);

    const accountId = AccountId.fromString(process.env.ACCOUNT_ID);
    const txId = TransactionId.withValidStart(accountId, Timestamp.fromDate(new Date()));

    tx.setTransactionId(txId).setTransactionValidDuration(180);

    const environment = process.env.HEDERA_NETWORK || "testnet";
    const client = getHederaClient(environment);
    const unsignedTx = Buffer.from(tx.freezeWith(client).toBytes()).toString("hex");

    logSuccess("Grant role transaction created successfully!");
    logInfo(`Unsigned Tx: ${unsignedTx.substring(0, 100)}...`);

    return { unsignedTx };
  } catch (error) {
    logError(`Failed to grant CAP_ROLE: ${error.message}`);
    throw error;
  }
}

async function setBondCap(bondContractId, newMaxSupply, format) {
  log(`\n=📊 Setting new cap for bond ${bondContractId}...`, colors.bright);

  const setBondCapRequest = {
    newMaxSupply: newMaxSupply,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(`/api/v1/ats/bonds/${bondContractId}/cap`, setBondCapRequest);

    logSuccess("Bond cap transaction created successfully!");
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`New Max Supply: ${newMaxSupply}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return { ...setBondCapRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to set bond cap: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyCapInDatabase(bondContractId, newMaxSupply) {
  log(
    `\n=
 Bond cap verification:`,
    colors.bright,
  );
  logSuccess(`Set bond cap transaction has been sent successfully`);
  logInfo(`The BondCapSetEvent should have been processed`);
  logInfo(`=� To verify the cap was updated, run a database query`);
  logInfo(`Expected result: Bond with contractId "${bondContractId}" should have maxSupply = ${newMaxSupply}\n`);
}

async function runSetBondCapSimulator() {
  logHeader("=� Running Set Bond Cap Simulator...");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader("=� Step 1: Creating Bond...");
  const bond = await createBond(format);

  try {
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    log("\n� Waiting for bond creation to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=� Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      return;
    }

    const bondContractId = latestBond.contractId;
    const currentMaxSupply = latestBond.maxSupply || bond.securityTokenToCreate.numberOfUnits;

    logInfo(`Current Max Supply: ${currentMaxSupply}`);
    logInfo(`New Max Supply: ${CAP_CONFIG.newMaxSupply}`);

    log("\n⏳ Waiting for blockchain listener to register event filters (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=🔑 Step 3: Granting CAP_ROLE to account...");

    const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");
    const accountEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(process.env.ACCOUNT_ID);

    logInfo(`Account Hedera ID: ${process.env.ACCOUNT_ID}`);
    logInfo(`Account EVM Address: ${accountEvmAddress}`);

    const grantRoleTransaction = await grantCapRole(bondContractId, accountEvmAddress, format);

    const signedGrantRoleTx = await signTransaction(grantRoleTransaction.unsignedTx);
    logSuccess("Grant role transaction signed successfully!");

    await publishSignedTransaction(signedGrantRoleTx);
    logSuccess("Grant role transaction published to message queue");

    log("\n⏳ Waiting for grant role transaction to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=📋 Step 4: Setting New Bond Cap...");

    const capTransaction = await setBondCap(bondContractId, CAP_CONFIG.newMaxSupply, format);

    const signedCapTx = await signTransaction(capTransaction.unsignedTx);
    logSuccess("Bond cap transaction signed successfully!");

    await publishSignedTransaction(signedCapTx);
    logSuccess("Cap transaction published to message queue");

    log("\n⏳ Waiting for cap change to be processed and event to be captured (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("=✅ Step 5: Verifying Cap Change...");
    await verifyCapInDatabase(bondContractId, CAP_CONFIG.newMaxSupply);

    logHeader("<� Set Bond Cap Simulation Completed!");
    logSuccess(`Created bond with contract ID: ${bondContractId}`);
    logSuccess(`Updated max supply from ${currentMaxSupply} to ${CAP_CONFIG.newMaxSupply}`);
    logSuccess(" Check the database to verify:");
    logInfo(`   " Bond table for contract ID: ${bondContractId}`);
    logInfo(`   " maxSupply field should be: ${CAP_CONFIG.newMaxSupply}`);
    logInfo(`   " BondCapSetEvent should be in the events table`);
  } catch (error) {
    logError(`Failed to complete simulation: ${error.message}`);
    logError("Make sure:");
    logError('   " Private key in .env file is valid for the selected blockchain format');
    logError('   " For Hedera: HEDERA_PRIVATE_KEY should be in DER format');
    logError('   " For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format');
    logError('   " Gateway API is running and accessible');
    logError('   " Database is accessible and properly configured');
  }
}

async function main() {
  try {
    logHeader("<� Evercity Set Bond Cap Simulator");
    log("==========================================\n", colors.bright);
    log(`=� Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`=� New Max Supply: ${CAP_CONFIG.newMaxSupply}`, colors.cyan);
    log(`=� This will create a new bond and update its cap\n`, colors.cyan);

    await runSetBondCapSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runSetBondCapSimulator, setBondCap, verifyCapInDatabase };
