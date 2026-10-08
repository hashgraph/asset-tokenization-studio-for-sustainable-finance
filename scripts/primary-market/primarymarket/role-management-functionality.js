const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { deployPrimaryMarket } = require("./deploy-primary-market");
const { waitForPrimaryMarketDeployment, waitForUserRoleUpdate } = require("./get-latest-primary-market");
const { RESOLVER_CONTRACT_ID } = require("../shared/test-config");

/**
 * Grant a role to a user in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID (bytes32 hash)
 * @param {string} userAccountId - The user account ID to grant the role to
 * @returns {Promise<Object>} The grant role transaction details
 */
async function grantRole(format, marketContractId, roleId, userAccountId) {
  logHeader(`📋 Granting role in ${format.toUpperCase()} Primary Market...`);

  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending grant role request to gateway...");
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    logSuccess(`${format.toUpperCase()} Grant role transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...grantRoleRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create grant role transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Renounce a role in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID (bytes32 hash) to renounce
 * @returns {Promise<Object>} The renounce role transaction details
 */
async function renounceRole(format, marketContractId, roleId) {
  logHeader(`📋 Renouncing role in ${format.toUpperCase()} Primary Market...`);

  const renounceRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending renounce role request to gateway...");
    const endpoint = `/api/v1/primary-markets/${marketContractId}/roles/${roleId}`;
    const response = await gatewayClient.delete(endpoint, { data: renounceRoleRequest });

    logSuccess(`${format.toUpperCase()} Renounce role transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...renounceRoleRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create renounce role transaction: ${error.message}`);
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
    logHeader("🚀 ROLE MANAGEMENT SCRIPT (GRANT & RENOUNCE)");
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
    const resolverContractId = (await RESOLVER_CONTRACT_ID) || "0.0.7297268";
    const configVersion = parseInt(process.env.CONFIG_VERSION || "0");
    const roleId = process.env.ROLE_ID || "0x92944c9c92092ce6378722a2bd46389bb09cbb7a1846066b62303daf04262f7a"; // OFFERING_CREATOR_ROLE
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // Step 1: Deploy Primary Market
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Primary Market deployment transaction signed!");
    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Primary Market for Role Management",
      resolverContractId: resolverContractId,
      configVersion: configVersion,
    });

    // Wait for deployment and get the contract ID from the database
    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logInfo(`Market Contract ID: ${marketContractId}`);
    log("");

    // ============ GRANT ROLE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 1: GRANT ROLE");
    logHeader("═══════════════════════════════════");

    const grantRoleTx = await grantRole(format, marketContractId, roleId, userAccountId);

    logHeader("🔐 Signing grant role transaction...");
    const signedGrantTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess("Grant role transaction signed successfully!");
    logInfo(`Signed Tx: ${signedGrantTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedGrantTx, {
      description: "Grant Role to User",
      marketContractId: marketContractId,
      roleId: roleId,
      userAccountId: userAccountId,
    });

    logHeader("🔍 Verifying role assignment in database...");
    await waitForUserRoleUpdate(marketContractId, roleId, userAccountId, true);

    logHeader("🔍 Verifying role via GET API...");
    const grantRoleMembers = await gatewayClient.get(
      `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/members`,
    );
    const hasRoleAfterGrant = grantRoleMembers.data.items.some((member) => member.userAccountId === userAccountId);
    if (hasRoleAfterGrant) {
      logSuccess(`✅ API verification: User has role ${roleId}`);
    } else {
      throw new Error(`API verification failed: User does not have role ${roleId}`);
    }

    logHeader("✅ Grant role completed!");
    log("The role has been successfully granted to the user.", colors.green);
    log(`Market: ${marketContractId}`, colors.green);
    log(`Role: ${roleId}`, colors.green);
    log(`User: ${userAccountId}\n`, colors.green);

    // ============ RENOUNCE ROLE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 2: RENOUNCE ROLE");
    logHeader("═══════════════════════════════════");

    const renounceRoleTx = await renounceRole(format, marketContractId, roleId);

    logHeader("🔐 Signing renounce role transaction...");
    const signedRenounceTx = await signTransaction(renounceRoleTx.unsignedTx);
    logSuccess("Renounce role transaction signed successfully!");
    logInfo(`Signed Tx: ${signedRenounceTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedRenounceTx, {
      description: "Renounce Role",
      marketContractId: marketContractId,
      roleId: roleId,
    });

    logHeader("🔍 Verifying role removal in database...");
    await waitForUserRoleUpdate(marketContractId, roleId, userAccountId, false);

    logHeader("🔍 Verifying role removal via GET API...");
    const renounceRoleMembers = await gatewayClient.get(
      `/api/v1/primary-markets/${marketContractId}/roles/${roleId}/members`,
    );
    const hasRoleAfterRenounce = renounceRoleMembers.data.items.some(
      (member) => member.userAccountId === userAccountId,
    );
    if (!hasRoleAfterRenounce) {
      logSuccess(`✅ API verification: User no longer has role ${roleId}`);
    } else {
      throw new Error(`API verification failed: User still has role ${roleId}`);
    }

    logHeader("✅ Renounce role completed!");
    log("The role has been successfully renounced.", colors.green);
    log(`Market: ${marketContractId}`, colors.green);
    log(`Role: ${roleId}`, colors.green);
    log(`User: ${userAccountId}\n`, colors.green);

    // ============ FINAL SUMMARY ============
    logHeader("═══════════════════════════════════");
    logHeader("  ✨ ROLE MANAGEMENT COMPLETED!");
    logHeader("═══════════════════════════════════");
    log("Successfully granted and renounced the role.", colors.green);
    log(`Market Contract ID: ${marketContractId}`, colors.green);
    log(`Role ID: ${roleId}`, colors.green);
    log(`User Account ID: ${userAccountId}\n`, colors.green);
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
  grantRole,
  renounceRole,
};
