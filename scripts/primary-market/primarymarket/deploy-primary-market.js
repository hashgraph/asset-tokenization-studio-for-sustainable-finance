const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { RESOLVER_CONTRACT_ID, CONFIG_VERSION } = require("../shared/test-config");
const { waitForPrimaryMarketDeployment } = require("./get-latest-primary-market");

/**
 * Deploy a Primary Market contract
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} resolverContractId - The resolver contract ID
 * @param {number} configVersion - The configuration version
 * @returns {Promise<Object>} The deployment transaction details
 */
async function deployPrimaryMarket(format, resolverContractId, configVersion = 1) {
  logHeader(`📋 Deploying ${format.toUpperCase()} Primary Market...`);

  const deployRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    resolverContractId: resolverContractId,
    configVersion: configVersion,
  };

  try {
    logInfo("Sending deployment request to gateway...");
    const response = await gatewayClient.post("/api/v1/primary-markets", deployRequest);

    logSuccess(`${format.toUpperCase()} Primary Market deployment transaction created!`);
    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...deployRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create Primary Market deployment transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader("🚀 PRIMARY MARKET DEPLOYMENT SCRIPT");
    log("=====================================\n", colors.cyan);

    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }

    if (!process.env.ACCOUNT_ID) {
      logError("ACCOUNT_ID not found in environment variables");
      logInfo("Please set ACCOUNT_ID in your .env file");
      process.exit(1);
    }

    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);

    // Configuration parameters
    // TODO: Replace these with actual values or command line arguments
    const resolverContractId = await RESOLVER_CONTRACT_ID;
    const configVersion = CONFIG_VERSION;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    log("");

    // Step 1: Deploy Primary Market
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);

    // Step 2: Sign the transaction
    logHeader("🔐 Signing transaction...");
    const signedTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Transaction signed successfully!");
    logInfo(`Signed Tx: ${signedTx.substring(0, 50)}...`);

    // Step 3: Publish to RabbitMQ
    await publishSignedTransaction(signedTx, {
      description: "Deploy Primary Market",
      resolverContractId: resolverContractId,
      configVersion: configVersion,
    });

    // Step 4: Wait for deployment and verify in database
    logHeader("🔍 Waiting for deployment to be processed...");
    const deployedMarket = await waitForPrimaryMarketDeployment();

    logHeader("✨ Primary Market deployment completed!");
    log("The Primary Market has been successfully deployed.", colors.green);
    log(`Contract ID: ${deployedMarket.contractId}`, colors.green);
    log(`Config Version: ${deployedMarket.configVersion}`, colors.green);
    log(`Created at: ${deployedMarket.createdAt}\n`, colors.green);
  } catch (error) {
    logError(`Script execution failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  deployPrimaryMarket,
};
