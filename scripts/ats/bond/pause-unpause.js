const { gatewayClient } = require("../../shared/lib/gateway-client");
const { logSuccess, logError, logInfo, log, colors, logHeader } = require("../../shared/lib/logger");
const { signTransaction, validateSigningConfig } = require("../../shared/lib/transaction-signer");
const { publishSignedTransaction } = require("../../shared/lib/infrastructure");
const { config } = require("../../shared/lib/config");
const { createBond } = require("./bond-service");
const { ConverterUtils } = require("@hashgraph/green-bonds-shared-core");

// PAUSER_ROLE constant
const PAUSER_ROLE = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb";

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

    if (response.data?.items && response.data.items.length > 0) {
      const latestBond = response.data.items[0];
      logSuccess(`Found latest bond: ${latestBond.contractId}`);
      logInfo(`Created at: ${latestBond.createdAt}`);
      logInfo(`Symbol: ${latestBond.symbol}`);
      return latestBond;
    } else {
      logError("No bonds found in the system");
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

async function waitForBondDeployment(maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs / 1000} seconds for transaction to be processed...`);

  // Initial wait to allow transaction to be processed
  await new Promise((resolve) => setTimeout(resolve, initialWaitMs));

  logInfo(`⏳ Now polling database for bond deployment (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);

  let attempts = 0;
  let previousBondId = null;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const latestBond = await getLatestBond();

      if (latestBond && latestBond.id !== previousBondId) {
        logSuccess(`✅ Bond found in database!`);
        logInfo(`Contract ID: ${latestBond.contractId}`);
        logInfo(`Symbol: ${latestBond.symbol}`);

        // Wait additional time to ensure event filters are registered
        logInfo(`⏳ Waiting additional 5 seconds for event filters to be registered...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        return latestBond;
      }

      logInfo(`Attempt ${attempts}/${maxAttempts} - Bond not yet found in database`);
      previousBondId = latestBond?.id;
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Bond deployment timeout after ${maxAttempts} attempts`);
}

async function waitForPauseStatusUpdate(
  contractId,
  expectedPauseStatus,
  maxAttempts = 30,
  intervalMs = 2000,
  initialWaitMs = 15000,
) {
  logInfo(`⏳ Waiting ${initialWaitMs / 1000} seconds for transaction to be processed...`);

  // Initial wait to allow transaction to be processed
  await new Promise((resolve) => setTimeout(resolve, initialWaitMs));

  logInfo(`⏳ Now polling database for pause status update (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);
  logInfo(`Expected isPaused: ${expectedPauseStatus}`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await gatewayClient.get(`/api/v1/ats/bonds/${contractId}`);
      const bond = response.data;

      if (bond && bond.isPaused === expectedPauseStatus) {
        logSuccess(`✅ Bond pause status updated successfully!`);
        logInfo(`Contract ID: ${bond.contractId}`);
        logInfo(`isPaused: ${bond.isPaused}`);
        return bond;
      }

      logInfo(
        `Attempt ${attempts}/${maxAttempts} - Current isPaused: ${bond?.isPaused}, Expected: ${expectedPauseStatus}`,
      );
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Pause status update timeout after ${maxAttempts} attempts`);
}

async function waitForUserRoleUpdate(
  bondContractId,
  roleId,
  userAccountId,
  shouldExist = true,
  maxAttempts = 60,
  intervalMs = 3000,
  initialWaitMs = 30000,
) {
  logInfo(
    `⏳ Waiting ${initialWaitMs / 1000} seconds for transaction to be processed and blockchain listener to catch up...`,
  );

  // Initial wait to allow transaction to be processed
  await new Promise((resolve) => setTimeout(resolve, initialWaitMs));

  logInfo(
    `⏳ Now polling database for user role ${shouldExist ? "assignment" : "removal"} (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`,
  );
  logInfo(`Bond: ${bondContractId}, Role: ${roleId}, User: ${userAccountId}`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      // Get all members of the role
      const response = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}/roles/${roleId}/members`);
      const members = response.data?.items || [];

      // Check if the user is in the members list
      const userHasRole = members.some((member) => member.userAccountId === userAccountId);

      if (shouldExist && userHasRole) {
        logSuccess(`✅ User role found in database!`);
        logInfo(`User: ${userAccountId}`);
        logInfo(`Role: ${roleId}`);
        return members.find((member) => member.userAccountId === userAccountId);
      } else if (!shouldExist && !userHasRole) {
        logSuccess(`✅ User role successfully removed from database!`);
        return null;
      }

      logInfo(`Attempt ${attempts}/${maxAttempts} - User has role: ${userHasRole}, Expected: ${shouldExist}`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`User role ${shouldExist ? "assignment" : "removal"} timeout after ${maxAttempts} attempts`);
}

async function grantRole(format, bondContractId, roleId, userAccountId) {
  logHeader(`📋 Granting role in ${format.toUpperCase()} Bond...`);

  // Convert to EVM address if needed
  const userEvmAddress = await ConverterUtils.getEvmAddressFromHederaAddress(userAccountId);
  logInfo(`Using EVM address: ${userEvmAddress}`);

  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending grant role request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/roles/${roleId}/users/${userEvmAddress}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);

    logSuccess(`${format.toUpperCase()} Grant role transaction created!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Role ID: ${roleId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    logInfo(`User EVM Address: ${userEvmAddress}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...grantRoleRequest, unsignedTx: response.data.unsignedTx, userEvmAddress };
  } catch (error) {
    logError(`Failed to create grant role transaction: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

async function pauseBond(format, bondContractId) {
  logHeader(`📋 Pausing ${format.toUpperCase()} Bond...`);

  const pauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending pause request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/pause`;
    const response = await gatewayClient.post(endpoint, pauseRequest);

    logSuccess(`${format.toUpperCase()} Pause transaction created!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
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

async function unpauseBond(format, bondContractId) {
  logHeader(`📋 Unpausing ${format.toUpperCase()} Bond...`);

  const unpauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
  };

  try {
    logInfo("Sending unpause request to gateway...");
    const endpoint = `/api/v1/ats/bonds/${bondContractId}/unpause`;
    const response = await gatewayClient.post(endpoint, unpauseRequest);

    logSuccess(`${format.toUpperCase()} Unpause transaction created!`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
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

async function main() {
  try {
    logHeader("🚀 PAUSE & UNPAUSE BOND SCRIPT");
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
    const userAccountId = process.env.ACCOUNT_ID;

    logInfo(`User Account ID: ${userAccountId}`);
    log("");

    // Step 1: Deploy Bond
    const deploymentTx = await createBond(format);
    const signedDeploymentTx = await signTransaction(deploymentTx.unsignedTx);
    logSuccess("Bond deployment transaction signed!");
    await publishSignedTransaction(signedDeploymentTx, {
      description: "Deploy Bond for Pause/Unpause",
      userAccountId: userAccountId,
    });

    // Wait for deployment and get the contract ID from the database
    const deployedBond = await waitForBondDeployment();
    const bondContractId = deployedBond.contractId;

    logInfo(`Bond Contract ID: ${bondContractId}`);
    log("");

    // ============ GRANT PAUSER ROLE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 1: GRANT PAUSER_ROLE");
    logHeader("═══════════════════════════════════");

    // Grant PAUSER_ROLE to the user
    const grantTx = await grantRole(format, bondContractId, PAUSER_ROLE, userAccountId);

    logHeader("🔐 Signing grant role transaction...");
    const signedGrantTx = await signTransaction(grantTx.unsignedTx);
    logSuccess("Grant role transaction signed successfully!");

    await publishSignedTransaction(signedGrantTx, {
      description: "Grant PAUSER_ROLE",
      bondContractId: bondContractId,
    });

    logHeader("🔍 Waiting for role grant to be processed...");
    await waitForUserRoleUpdate(bondContractId, PAUSER_ROLE, userAccountId, true);

    logSuccess(`✅ PAUSER_ROLE granted to ${userAccountId}!`);
    log("");

    // ============ PAUSE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 1: PAUSE BOND");
    logHeader("═══════════════════════════════════");

    const pauseTx = await pauseBond(format, bondContractId);

    logHeader("🔐 Signing pause transaction...");
    const signedPauseTx = await signTransaction(pauseTx.unsignedTx);
    logSuccess("Pause transaction signed successfully!");
    logInfo(`Signed Tx: ${signedPauseTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedPauseTx, {
      description: "Pause Bond",
      bondContractId: bondContractId,
    });

    logHeader("🔍 Verifying pause status in database...");
    const pausedBond = await waitForPauseStatusUpdate(bondContractId, true);

    logHeader("🔍 Verifying pause status via GET API...");
    const pauseGetResponse = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}`);
    if (pauseGetResponse.data.isPaused === true) {
      logSuccess(`✅ API verification: isPaused = ${pauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${pauseGetResponse.data.isPaused}, expected true`);
    }

    logHeader("✅ Pause completed!");
    log("The bond has been successfully paused.", colors.green);
    log(`Contract ID: ${pausedBond.contractId}`, colors.green);
    log(`isPaused: ${pausedBond.isPaused}\n`, colors.green);

    // ============ UNPAUSE ============
    logHeader("═══════════════════════════════════");
    logHeader("  STEP 2: UNPAUSE BOND");
    logHeader("═══════════════════════════════════");

    const unpauseTx = await unpauseBond(format, bondContractId);

    logHeader("🔐 Signing unpause transaction...");
    const signedUnpauseTx = await signTransaction(unpauseTx.unsignedTx);
    logSuccess("Unpause transaction signed successfully!");
    logInfo(`Signed Tx: ${signedUnpauseTx.substring(0, 50)}...`);

    await publishSignedTransaction(signedUnpauseTx, {
      description: "Unpause Bond",
      bondContractId: bondContractId,
    });

    logHeader("🔍 Verifying unpause status in database...");
    const unpausedBond = await waitForPauseStatusUpdate(bondContractId, false);

    logHeader("🔍 Verifying unpause status via GET API...");
    const unpauseGetResponse = await gatewayClient.get(`/api/v1/ats/bonds/${bondContractId}`);
    if (unpauseGetResponse.data.isPaused === false) {
      logSuccess(`✅ API verification: isPaused = ${unpauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${unpauseGetResponse.data.isPaused}, expected false`);
    }

    logHeader("✅ Unpause completed!");
    log("The bond has been successfully unpaused.", colors.green);
    log(`Contract ID: ${unpausedBond.contractId}`, colors.green);
    log(`isPaused: ${unpausedBond.isPaused}\n`, colors.green);

    // ============ FINAL SUMMARY ============
    logHeader("═══════════════════════════════════");
    logHeader("  ✨ PAUSE/UNPAUSE COMPLETED!");
    logHeader("═══════════════════════════════════");
    log("Successfully paused and unpaused the bond.", colors.green);
    log(`Bond Contract ID: ${bondContractId}\n`, colors.green);
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
  getLatestBond,
};
