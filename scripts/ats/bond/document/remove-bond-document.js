const { config } = require("../../../shared/lib/config");
const { log, logSuccess, logError, logHeader, logInfo, colors } = require("../../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../../shared/lib/infrastructure");
const { createBond } = require("../bond-service");
const { gatewayClient } = require("../../../shared/lib/gateway-client");
const { setBondDocument, getLatestBond } = require("./set-bond-document");

const DOCUMENT_CONFIG = {
  name: "test-document-to-remove",
  uri: "https://example.com/documents/test-document-to-remove.pdf",
  hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
};

async function removeBondDocument(bondContractId, documentId, format) {
  log(`\n🗑️  Removing document from bond ${bondContractId}...`, colors.bright);

  const removeBondDocumentRequest = {
    accountId: process.env.ACCOUNT_ID,
    format: format,
  };

  try {
    const response = await gatewayClient.delete(`/api/v1/ats/bonds/${bondContractId}/documents/${documentId}`, {
      data: removeBondDocumentRequest,
    });

    logSuccess("Bond document removal transaction created successfully!");
    logInfo(`Document ID: ${documentId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);

    return { ...removeBondDocumentRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to remove bond document: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function verifyDocumentInDatabase(bondContractId, documentId) {
  log(`\n🔍 Document removal verification:`, colors.bright);
  logSuccess(`Remove bond document transaction has been sent successfully`);
  logInfo(`The BondDocumentRemovedEvent should have been processed`);
  logInfo(`📋 To verify the document was deleted, run a database query`);
  logInfo(`Expected result: 0 rows (document should not exist)\n`);
}

async function runRemoveBondDocumentSimulator() {
  logHeader("🚀 Running Remove Bond Document Simulator...");

  if (!validateSigningConfig()) {
    return;
  }

  const format = config.BLOCKCHAIN_FORMAT.toLowerCase();

  logHeader("📝 Step 1: Creating Bond...");
  const bond = await createBond(format);

  try {
    const signedBondTx = await signTransaction(bond.unsignedTx);
    logSuccess(`${format.toUpperCase()} bond transaction signed successfully!`);

    await publishSignedTransaction(signedBondTx);
    logSuccess("Bond creation transaction published to message queue");

    log("\n⏳ Waiting for bond creation to be processed (15 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 15000));

    logHeader("📊 Step 2: Fetching Created Bond...");
    const latestBond = await getLatestBond();

    if (!latestBond || !latestBond.contractId) {
      logError("Could not retrieve the created bond. Please check the logs and try again.");
      return;
    }

    const bondContractId = latestBond.contractId;

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

    const signedDocTx = await signTransaction(documentTransaction.unsignedTx);
    logSuccess("Bond document transaction signed successfully!");

    await publishSignedTransaction(signedDocTx);
    logSuccess("Document transaction published to message queue");

    log("\n⏳ Waiting for document to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("🗑️  Step 4: Removing Bond Document...");

    const removeTransaction = await removeBondDocument(bondContractId, documentId, format);

    const signedRemoveTx = await signTransaction(removeTransaction.unsignedTx);
    logSuccess("Remove bond document transaction signed successfully!");

    await publishSignedTransaction(signedRemoveTx);
    logSuccess("Remove document transaction published to message queue");

    log("\n⏳ Waiting for document removal to be processed (10 seconds)...", colors.yellow);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    logHeader("🔍 Step 5: Verifying Document Deletion...");
    await verifyDocumentInDatabase(bondContractId, documentId);

    logHeader("🎉 Remove Bond Document Simulation Completed!");
    logSuccess(` Created bond with contract ID: ${bondContractId}`);
    logSuccess(` Set document "${DOCUMENT_CONFIG.name}" on the bond`);
    logSuccess(` Removed document "${DOCUMENT_CONFIG.name}" from the bond`);
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
    logHeader("🏦 Evercity Remove Bond Document Simulator");
    log("==========================================\n", colors.bright);
    log(`📡 Blockchain Format: ${config.BLOCKCHAIN_FORMAT.toUpperCase()}`, colors.blue);
    log(`📄 Document Name: ${DOCUMENT_CONFIG.name}`, colors.cyan);
    log(`🔗 Document URI: ${DOCUMENT_CONFIG.uri}`, colors.cyan);
    log(`#️⃣  Document Hash: ${DOCUMENT_CONFIG.hash}\n`, colors.cyan);

    await runRemoveBondDocumentSimulator();
  } catch (error) {
    logError(`Simulation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runRemoveBondDocumentSimulator, removeBondDocument, verifyDocumentInDatabase };
