const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { deployPrimaryMarket } = require("./deploy-primary-market");
const {
  waitForPrimaryMarketDeployment,
  waitForPauseStatusUpdate,
  waitForUserRoleUpdate,
} = require("./get-latest-primary-market");

// PAUSER_ROLE constant
const PAUSER_ROLE = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb";

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
 * Pause a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID to pause
 * @returns {Promise<Object>} The pause transaction details
 */
async function pausePrimaryMarket(format, marketContractId) {
  logHeader(`📋 Pausing ${format.toUpperCase()} Primary Market...`);

  const pauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending pause request to gateway...");
    const endpoint = `/api/v1/primary-markets/${marketContractId}/pause`;
    const response = await gatewayClient.post(endpoint, pauseRequest);

    logSuccess(`${format.toUpperCase()} Pause transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...pauseRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create pause transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Unpause a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID to unpause
 * @returns {Promise<Object>} The unpause transaction details
 */
async function unpausePrimaryMarket(format, marketContractId) {
  logHeader(`📋 Unpausing ${format.toUpperCase()} Primary Market...`);

  const unpauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending unpause request to gateway...");
    const endpoint = `/api/v1/primary-markets/${marketContractId}/unpause`;
    const response = await gatewayClient.post(endpoint, unpauseRequest);

    logSuccess(`${format.toUpperCase()} Unpause transaction created!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...unpauseRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create unpause transaction: ${error.message}`);
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
    logHeader("🚀 PAUSE & UNPAUSE PRIMARY MARKET SCRIPT");
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
    const resolverContractId = process.env.RESOLVER_CONTRACT_ID || "0.0.7297268";
    const configVersion = parseInt(process.env.CONFIG_VERSION || "0");
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`Resolver Contract ID: ${resolverContractId}`);
    logInfo(`Config Version: ${configVersion}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // Step 1: Deploy Primary Market
    const deploymentTx = await deployPrimaryMarket(format, resolverContractId, configVersion);
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Primary Market deployment transaction signed!");
    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Primary Market for Pause/Unpause",
      resolverContractId: resolverContractId,
      configVersion: configVersion,
    });

    // Wait for deployment and get the contract ID from the database
    const deployedMarket = await waitForPrimaryMarketDeployment();
    const marketContractId = deployedMarket.contractId;

    logInfo(`Market Contract ID: ${marketContractId}`);
    log("");

    // ============ GRANT PAUSER ROLE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 1: GRANT PAUSER ROLE");
    logHeader("═══════════════════════════════════");

    logInfo(`Granting PAUSER_ROLE: ${PAUSER_ROLE}`);
    const grantRoleTx = await grantRole(format, marketContractId, PAUSER_ROLE, userAccountId);

    logHeader("🔐 Signing grant role transaction...");
    const signedGrantTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess("Grant role transaction signed successfully!");
    logInfo(`Signed Tx: ${signedGrantTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedGrantTx, {
      description: "Grant Pauser Role",
      marketContractId: marketContractId,
      roleId: PAUSER_ROLE,
      userAccountId: userAccountId,
    });

    logHeader("🔍 Verifying role assignment in database...");
    await waitForUserRoleUpdate(marketContractId, PAUSER_ROLE, userAccountId, true);

    logHeader("🔍 Verifying role via GET API...");
    const roleMembers = await gatewayClient.get(
      `/api/v1/primary-markets/${marketContractId}/roles/${PAUSER_ROLE}/members`,
    );
    const hasRole = roleMembers.data.items.some((member) => member.userAccountId === userAccountId);
    if (hasRole) {
      logSuccess(`✅ API verification: User has PAUSER_ROLE`);
    } else {
      throw new Error("API verification failed: User does not have PAUSER_ROLE");
    }

    logHeader("✅ Pauser role granted!");
    log("The PAUSER_ROLE has been successfully granted.", colors.green);
    log(`Market: ${marketContractId}`, colors.green);
    log(`Role: ${PAUSER_ROLE}`, colors.green);
    log(`User: ${userAccountId}\n`, colors.green);

    // ============ PAUSE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 2: PAUSE PRIMARY MARKET");
    logHeader("═══════════════════════════════════");

    const pauseTx = await pausePrimaryMarket(format, marketContractId);

    logHeader("🔐 Signing pause transaction...");
    const signedPauseTx = await signTransaction(pauseTx.unsignedTx);
    logSuccess("Pause transaction signed successfully!");
    logInfo(`Signed Tx: ${signedPauseTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedPauseTx, {
      description: "Pause Primary Market",
      marketContractId: marketContractId,
    });

    logHeader("🔍 Verifying pause status in database...");
    const pausedMarket = await waitForPauseStatusUpdate(marketContractId, true);

    logHeader("🔍 Verifying pause status via GET API...");
    const pauseGetResponse = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}`);
    if (pauseGetResponse.data.isPaused === true) {
      logSuccess(`✅ API verification: isPaused = ${pauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${pauseGetResponse.data.isPaused}, expected true`);
    }

    logHeader("✅ Pause completed!");
    log("The primary market has been successfully paused.", colors.green);
    log(`Contract ID: ${pausedMarket.contractId}`, colors.green);
    log(`isPaused: ${pausedMarket.isPaused}\n`, colors.green);

    // ============ UNPAUSE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 3: UNPAUSE PRIMARY MARKET");
    logHeader("═══════════════════════════════════");

    const unpauseTx = await unpausePrimaryMarket(format, marketContractId);

    logHeader("🔐 Signing unpause transaction...");
    const signedUnpauseTx = await signTransaction(unpauseTx.unsignedTx);
    logSuccess("Unpause transaction signed successfully!");
    logInfo(`Signed Tx: ${signedUnpauseTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedUnpauseTx, {
      description: "Unpause Primary Market",
      marketContractId: marketContractId,
    });

    logHeader("🔍 Verifying unpause status in database...");
    const unpausedMarket = await waitForPauseStatusUpdate(marketContractId, false);

    logHeader("🔍 Verifying unpause status via GET API...");
    const unpauseGetResponse = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}`);
    if (unpauseGetResponse.data.isPaused === false) {
      logSuccess(`✅ API verification: isPaused = ${unpauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${unpauseGetResponse.data.isPaused}, expected false`);
    }

    logHeader("✅ Unpause completed!");
    log("The primary market has been successfully unpaused.", colors.green);
    log(`Contract ID: ${unpausedMarket.contractId}`, colors.green);
    log(`isPaused: ${unpausedMarket.isPaused}\n`, colors.green);

    // ============ FINAL SUMMARY ============
    logHeader("═══════════════════════════════════");
    logHeader("  ✨ PAUSE/UNPAUSE COMPLETED!");
    logHeader("═══════════════════════════════════");
    log("Successfully paused and unpaused the primary market.", colors.green);
    log(`Market Contract ID: ${marketContractId}\n`, colors.green);
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
  pausePrimaryMarket,
  unpausePrimaryMarket,
  grantRole,
};
