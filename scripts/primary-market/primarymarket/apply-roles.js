const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { RESOLVER_CONTRACT_ID } = require("../shared/test-config");
const { deployPrimaryMarket } = require("./deploy-primary-market");
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require("./get-latest-primary-market");

/**
 * Apply roles (grant and/or revoke) to a user in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} userAccountId - The user account ID
 * @param {string[]} rolesToGrant - Array of role IDs to grant
 * @param {string[]} rolesToRevoke - Array of role IDs to revoke
 * @returns {Promise<Object>} The apply roles transaction details
 */
async function applyRoles(format, marketContractId, userAccountId, rolesToGrant = [], rolesToRevoke = []) {
  logHeader(`📋 Applying roles in ${format.toUpperCase()} Primary Market...`);

  const applyRolesRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    rolesToGrant: rolesToGrant,
    rolesToRevoke: rolesToRevoke,
  };

  try {
    logInfo("Sending apply roles request to gateway...");
    const endpoint = `/api/v1/primary-markets/${marketContractId}/users/${userAccountId}/roles`;
    const response = await gatewayClient.post(endpoint, applyRolesRequest);

    logSuccess(`${format.toUpperCase()} Apply roles transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Roles to Grant: ${rolesToGrant.length > 0 ? rolesToGrant.join(", ") : "None"}`);
    logInfo(`Roles to Revoke: ${rolesToRevoke.length > 0 ? rolesToRevoke.join(", ") : "None"}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...applyRolesRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create apply roles transaction: ${error.message}`);
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
    logHeader("🚀 APPLY ROLES SCRIPT");
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
    const resolverContractId = (await RESOLVER_CONTRACT_ID) || "0.0.7352465";
    const configVersion = parseInt(process.env.CONFIG_VERSION || "0");
    const userAccountId = process.env.ACCOUNT_ID;
    const rolesToGrant = process.env.ROLES_TO_GRANT
      ? process.env.ROLES_TO_GRANT.split(",")
      : ["0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a"];
    const rolesToRevoke = process.env.ROLES_TO_REVOKE ? process.env.ROLES_TO_REVOKE.split(",") : [];

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // Step 1: Deploy Primary Market
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Primary Market deployment transaction signed!");
    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Primary Market for Apply Roles",
      resolverContractId: resolverContractId,
      configVersion: configVersion,
    });

    // Wait for deployment and get the contract ID from the database
    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logInfo(`Market Contract ID: ${marketContractId}`);
    log("");

    // Step 2: Apply Roles
    const applyRolesTx = await applyRoles(format, marketContractId, userAccountId, rolesToGrant, rolesToRevoke);

    // Step 3: Sign the transaction
    logHeader("🔐 Signing transaction...");
    const signedTx = await signTransaction(applyRolesTx.unsignedTx);
    logSuccess("Transaction signed successfully!");
    logInfo(`Signed Tx: ${signedTx.substring(0, 50)}...`);

    // Step 4: Publish to RabbitMQ
    await publishSignedTransaction(signedTx, {
      description: "Apply Roles to User",
      marketContractId: marketContractId,
      userAccountId: userAccountId,
      rolesToGrant: rolesToGrant,
      rolesToRevoke: rolesToRevoke,
    });

    // Step 5: Verify role changes in database
    logHeader("🔍 Verifying role changes in database...");

    // Verify granted roles
    if (rolesToGrant.length > 0) {
      logInfo("Checking granted roles...");
      for (const roleId of rolesToGrant) {
        await waitForUserRoleUpdate(marketContractId, roleId, userAccountId, true);
      }
    }

    // Verify revoked roles
    if (rolesToRevoke.length > 0) {
      logInfo("Checking revoked roles...");
      for (const roleId of rolesToRevoke) {
        await waitForUserRoleUpdate(marketContractId, roleId, userAccountId, false);
      }
    }

    logHeader("✨ Apply roles completed!");
    log("All roles have been successfully applied.", colors.green);
    log(`Market: ${marketContractId}`, colors.green);
    log(`User: ${userAccountId}`, colors.green);
    log(`Roles Granted: ${rolesToGrant.length}`, colors.green);
    log(`Roles Revoked: ${rolesToRevoke.length}\n`, colors.green);
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
  applyRoles,
};
