const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { gatewayClient } = require("../../../shared/lib/gateway-client");

// Hardcoded document parameters for automated testing
const DOCUMENT_CONFIG = {
  name: "prospectus",
  uri: "https://example.com/documents/bond-prospectus-2024.pdf",
  hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
};

async function getLatestBond() {
  log(`\n🔍 Fetching latest bond...`, colors.bright);

  try {
    const response = await gatewayClient.get("/api/v1/ats/bonds", {
      params: {
        page: 1,
        limit: 1,
        sort: "createdAt,desc",
      },
    });

    console.log("API Response:", JSON.stringify(response.data, null, 2));

    if (response.data?.items && response.data.items.length > 0) {
      const latestBond = response.data.items[0];
      logSuccess(`Found latest bond: ${latestBond.contractId}`);
      logInfo(`Symbol: ${latestBond.symbol}`);
      logInfo(`Name: ${latestBond.name}`);
      return latestBond;
    } else {
      logError("No bonds found in the system");
      logError(`Response structure: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch bonds: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function setBondDocument(bondContractId, documentId, uri, hash, format) {
  log(`\n📄 Setting document on bond ${bondContractId}...`, colors.bright);

  const setBondDocumentRequest = {
    uri: uri,
    hash: hash,
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    const response = await gatewayClient.post(
      `/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`,
      setBondDocumentRequest,
    );

    logSuccess("Bond document transaction created successfully!");
    logInfo(`Document ID: ${documentId}`);
    logInfo(`URI: ${uri}`);
    logInfo(`Hash: ${hash}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return { ...setBondDocumentRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to set bond document: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function runSetBondDocumentSimulator() {
  logHeader("🚀 Running Set Bond Document Simulator...");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  // Step 1: Create a bond
  logHeader("📝 Step 1: Creating Bond...");
  const bond = await createBond(format);

  try {
    // Sign and publish bond creation transaction
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    // Wait for bond to be processed and persisted in database
    log("\n⏳ Waiting for bond creation to be processed (15 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Step 2: Get the latest bond from the API
    logHeader("📊 Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      return;
    }

    const bondContractId = latestBond.contractId;

    // Step 3: Set bond document with hardcoded values
    logHeader("📄 Step 3: Setting Bond Document...");

    const documentId = "0x" + Buffer.from(DOCUMENT_CONFIG.name).toString("hex").padEnd(64, "0");

    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Document Name: ${DOCUMENT_CONFIG.name}`);
    logInfo(`Document ID (bytes32): ${documentId}`);
    logInfo(`Document URI: ${DOCUMENT_CONFIG.uri}`);
    logInfo(`Document Hash: ${DOCUMENT_CONFIG.hash}`);

    const documentTransaction = await setBondDocument(
      bondContractId,
      documentId,
      DOCUMENT_CONFIG.uri,
      DOCUMENT_CONFIG.hash,
      format,
    );

    // Sign and publish document transaction
    const signedDocTx = await signTransaction(documentTransaction.unsignedTx);
    logSuccess("Bond document transaction signed successfully!");

    await publishSignedTransaction(signedDocTx);
    logSuccess("Document transaction published to message queue");

    // Wait for document to be processed
    log("\n⏳ Waiting for document to be processed (5 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    logHeader("🎉 Set Bond Document Simulation Completed!");
    logSuccess(`Created bond with contract ID: ${bondContractId}`);
    logSuccess(`Set document "${DOCUMENT_CONFIG.name}" on the bond`);
    logSuccess("✅ Check the database to verify:");
    logInfo(`   • Bond table for contract ID: ${bondContractId}`);
    logInfo(`   • BondDocument table for document with name: ${DOCUMENT_CONFIG.name}`);
    logInfo(`   • Document URI: ${DOCUMENT_CONFIG.uri}`);
    logInfo(`   • Document Hash: ${DOCUMENT_CONFIG.hash}`);
  } catch (error) {
    logError(`Failed to complete simulation: ${error.message}`);
    logError("Make sure:");
    logError("   • Private key in .env file is valid for the selected blockchain format");
    logError("   • For Hedera: HEDERA_PRIVATE_KEY should be in DER format");
    logError("   • For Ethereum: ETHEREUM_PRIVATE_KEY should be in hex format");
    logError("   • Gateway API is running and accessible");
    logError("   • Database is accessible and properly configured");
  }
}

async function main() {
  try {
    logHeader("🏦 Evercity Set Bond Document Simulator");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`📄 Document Name: ${DOCUMENT_CONFIG.name}`, colors.cyan);
    log(`🔗 Document URI: ${DOCUMENT_CONFIG.uri}`, colors.cyan);
    log(`#️⃣  Document Hash: ${DOCUMENT_CONFIG.hash}\n`, colors.cyan);

    await runSetBondDocumentSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runSetBondDocumentSimulator, setBondDocument, getLatestBond };
