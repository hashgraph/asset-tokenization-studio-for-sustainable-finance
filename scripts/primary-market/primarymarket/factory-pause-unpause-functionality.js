const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');
const { signTransaction, validateSigningConfig } = require('../../shared/lib/transaction-signer');
const { publishSignedTransaction } = require('../../shared/lib/infrastructure');
const { config } = require('../../shared/lib/config');
const { FACTORY_CONTRACT_ID } = require('../shared/test-config');

// PAUSER_ROLE constant (same across contracts)
const PAUSER_ROLE = '0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb';

/**
 * Grant a role to a user in a Primary Market Factory
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} factoryContractId - The factory contract ID
 * @param {string} roleId - The role ID (bytes32 hash)
 * @param {string} userAccountId - The user account ID to grant the role to
 * @returns {Promise<Object>} The grant role transaction details
 */
async function grantFactoryRole(format, factoryContractId, roleId, userAccountId) {
  logHeader(`📋 Granting role in ${format.toUpperCase()} Primary Market Factory...`);
  
  const grantRoleRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID
  };
  
  try {
    logInfo('Sending grant role request to gateway...');
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/users/${userAccountId}`;
    const response = await gatewayClient.post(endpoint, grantRoleRequest);
    
    logSuccess(`${format.toUpperCase()} Grant role transaction created!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
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
 * Pause a Primary Market Factory
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} factoryContractId - The factory contract ID to pause
 * @returns {Promise<Object>} The pause transaction details
 */
async function pausePrimaryMarketFactory(format, factoryContractId) {
  logHeader(`📋 Pausing ${format.toUpperCase()} Primary Market Factory...`);
  
  const pauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID
  };
  
  try {
    logInfo('Sending pause request to gateway...');
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}/pause`;
    const response = await gatewayClient.post(endpoint, pauseRequest);
    
    logSuccess(`${format.toUpperCase()} Pause transaction created!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
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
 * Unpause a Primary Market Factory
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} factoryContractId - The factory contract ID to unpause
 * @returns {Promise<Object>} The unpause transaction details
 */
async function unpausePrimaryMarketFactory(format, factoryContractId) {
  logHeader(`📋 Unpausing ${format.toUpperCase()} Primary Market Factory...`);
  
  const unpauseRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID
  };
  
  try {
    logInfo('Sending unpause request to gateway...');
    const endpoint = `/api/v1/primary-markets/factories/${factoryContractId}/unpause`;
    const response = await gatewayClient.post(endpoint, unpauseRequest);
    
    logSuccess(`${format.toUpperCase()} Unpause transaction created!`);
    logInfo(`Factory Contract ID: ${factoryContractId}`);
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
 * Wait for factory pause status to be updated in the database
 * @param {string} factoryContractId - The factory contract ID
 * @param {boolean} expectedPauseStatus - Expected pause status (true for paused, false for unpaused)
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
 * @param {number} intervalMs - Interval between polling attempts in milliseconds (default: 2000)
 * @param {number} initialWaitMs - Initial wait time in milliseconds before starting to poll (default: 15000)
 * @returns {Promise<Object>} The updated factory
 */
async function waitForFactoryPauseStatusUpdate(factoryContractId, expectedPauseStatus, maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`⏳ Now polling database for factory pause status update (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);
  logInfo(`Expected isPaused: ${expectedPauseStatus}`);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await gatewayClient.get(`/api/v1/primary-markets/factories/${factoryContractId}`);
      const factory = response.data;
      
      if (factory && factory.isPaused === expectedPauseStatus) {
        logSuccess(`✅ Factory pause status updated successfully!`);
        logInfo(`Factory Contract ID: ${factory.factoryContractId}`);
        logInfo(`isPaused: ${factory.isPaused}`);
        return factory;
      }
      
      logInfo(`Attempt ${attempts}/${maxAttempts} - Current isPaused: ${factory?.isPaused}, Expected: ${expectedPauseStatus}`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }
    
    // Wait before next check
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(`Factory pause status did not update to ${expectedPauseStatus} after ${maxAttempts} attempts`);
}

/**
 * Wait for factory user role to be updated in the database
 * @param {string} factoryContractId - The factory contract ID
 * @param {string} roleId - The role ID
 * @param {string} userAccountId - The user account ID
 * @param {boolean} shouldHaveRole - Expected role status (true if user should have role, false otherwise)
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
 * @param {number} intervalMs - Interval between polling attempts in milliseconds (default: 2000)
 * @param {number} initialWaitMs - Initial wait time in milliseconds before starting to poll (default: 15000)
 * @returns {Promise<void>}
 */
async function waitForFactoryUserRoleUpdate(factoryContractId, roleId, userAccountId, shouldHaveRole, maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`⏳ Now polling database for factory role update (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);
  logInfo(`Expected role status: ${shouldHaveRole ? 'HAS role' : 'NO role'}`);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await gatewayClient.get(`/api/v1/primary-markets/factories/${factoryContractId}/roles/${roleId}/members`);
      const members = response.data?.items || [];
      const hasRole = members.some(member => member.userAccountId === userAccountId);
      
      if (hasRole === shouldHaveRole) {
        logSuccess(`✅ Factory user role status updated successfully!`);
        logInfo(`Factory Contract ID: ${factoryContractId}`);
        logInfo(`Role ID: ${roleId}`);
        logInfo(`User Account ID: ${userAccountId}`);
        logInfo(`Has Role: ${hasRole}`);
        return;
      }
      
      logInfo(`Attempt ${attempts}/${maxAttempts} - Current hasRole: ${hasRole}, Expected: ${shouldHaveRole}`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }
    
    // Wait before next check
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(`Factory user role did not update to expected status after ${maxAttempts} attempts`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    logHeader('🚀 FACTORY PAUSE & UNPAUSE SCRIPT');
    log('=====================================\n', colors.cyan);
    
    // Validate configuration
    if (!validateSigningConfig()) {
      process.exit(1);
    }
    
    if (!process.env.ACCOUNT_ID) {
      logError('ACCOUNT_ID not found in environment variables');
      logInfo('Please set ACCOUNT_ID in your .env file');
      process.exit(1);
    }
    
    // Get format from environment
    const format = config.BLOCKCHAIN_FORMAT.toLowerCase();
    logInfo(`Using ${format.toUpperCase()} blockchain format`);
    
    // Configuration parameters
    const factoryContractId = '0.0.7364618';
    const userAccountId = process.env.ACCOUNT_ID;
    
    logInfo(`Factory Contract ID: ${factoryContractId}`);
    logInfo(`User Account ID: ${userAccountId}`);
    log('');
    
    // ============ GRANT PAUSER ROLE ============
    logHeader('═══════════════════════════════════');
    logHeader('  STEP 1: GRANT PAUSER ROLE');
    logHeader('═══════════════════════════════════');
    
    logInfo(`Granting PAUSER_ROLE: ${PAUSER_ROLE}`);
    const grantRoleTx = await grantFactoryRole(format, factoryContractId, PAUSER_ROLE, userAccountId);
    
    logHeader('🔐 Signing grant role transaction...');
    const signedGrantTx = await signTransaction(grantRoleTx.unsignedTx);
    logSuccess('Grant role transaction signed successfully!');
    logInfo(`Signed Tx: ${signedGrantTx.substring(0, 50)}...`);
    
    await publishSignedTransaction(signedGrantTx, {
      description: 'Grant Pauser Role to Factory',
      factoryContractId: factoryContractId,
      roleId: PAUSER_ROLE,
      userAccountId: userAccountId
    });
    
    logHeader('🔍 Verifying role assignment in database...');
    await waitForFactoryUserRoleUpdate(factoryContractId, PAUSER_ROLE, userAccountId, true);
    
    logHeader('🔍 Verifying role via GET API...');
    const roleMembers = await gatewayClient.get(`/api/v1/primary-markets/factories/${factoryContractId}/roles/${PAUSER_ROLE}/members`);
    const hasRole = roleMembers.data.items.some(member => member.userAccountId === userAccountId);
    if (hasRole) {
      logSuccess(`✅ API verification: User has PAUSER_ROLE`);
    } else {
      throw new Error('API verification failed: User does not have PAUSER_ROLE');
    }
    
    logHeader('✅ Pauser role granted!');
    log('The PAUSER_ROLE has been successfully granted.', colors.green);
    log(`Factory: ${factoryContractId}`, colors.green);
    log(`Role: ${PAUSER_ROLE}`, colors.green);
    log(`User: ${userAccountId}\n`, colors.green);
    
    // ============ PAUSE ============
    logHeader('═══════════════════════════════════');
    logHeader('  STEP 2: PAUSE FACTORY');
    logHeader('═══════════════════════════════════');
    
    const pauseTx = await pausePrimaryMarketFactory(format, factoryContractId);
    
    logHeader('🔐 Signing pause transaction...');
    const signedPauseTx = await signTransaction(pauseTx.unsignedTx);
    logSuccess('Pause transaction signed successfully!');
    logInfo(`Signed Tx: ${signedPauseTx.substring(0, 50)}...`);
    
    await publishSignedTransaction(signedPauseTx, {
      description: 'Pause Primary Market Factory',
      factoryContractId: factoryContractId
    });
    
    logHeader('🔍 Verifying pause status in database...');
    const pausedFactory = await waitForFactoryPauseStatusUpdate(factoryContractId, true);
    
    logHeader('🔍 Verifying pause status via GET API...');
    const pauseGetResponse = await gatewayClient.get(`/api/v1/primary-markets/factories/${factoryContractId}`);
    if (pauseGetResponse.data.isPaused === true) {
      logSuccess(`✅ API verification: isPaused = ${pauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${pauseGetResponse.data.isPaused}, expected true`);
    }
    
    logHeader('✅ Pause completed!');
    log('The primary market factory has been successfully paused.', colors.green);
    log(`Factory Contract ID: ${pausedFactory.factoryContractId}`, colors.green);
    log(`isPaused: ${pausedFactory.isPaused}\n`, colors.green);
    
    // ============ UNPAUSE ============
    logHeader('═══════════════════════════════════');
    logHeader('  STEP 3: UNPAUSE FACTORY');
    logHeader('═══════════════════════════════════');
    
    const unpauseTx = await unpausePrimaryMarketFactory(format, factoryContractId);
    
    logHeader('🔐 Signing unpause transaction...');
    const signedUnpauseTx = await signTransaction(unpauseTx.unsignedTx);
    logSuccess('Unpause transaction signed successfully!');
    logInfo(`Signed Tx: ${signedUnpauseTx.substring(0, 50)}...`);
    
    await publishSignedTransaction(signedUnpauseTx, {
      description: 'Unpause Primary Market Factory',
      factoryContractId: factoryContractId
    });
    
    logHeader('🔍 Verifying unpause status in database...');
    const unpausedFactory = await waitForFactoryPauseStatusUpdate(factoryContractId, false);
    
    logHeader('🔍 Verifying unpause status via GET API...');
    const unpauseGetResponse = await gatewayClient.get(`/api/v1/primary-markets/factories/${factoryContractId}`);
    if (unpauseGetResponse.data.isPaused === false) {
      logSuccess(`✅ API verification: isPaused = ${unpauseGetResponse.data.isPaused}`);
    } else {
      throw new Error(`API verification failed: isPaused = ${unpauseGetResponse.data.isPaused}, expected false`);
    }
    
    logHeader('✅ Unpause completed!');
    log('The primary market factory has been successfully unpaused.', colors.green);
    log(`Factory Contract ID: ${unpausedFactory.factoryContractId}`, colors.green);
    log(`isPaused: ${unpausedFactory.isPaused}\n`, colors.green);
    
    // ============ FINAL SUMMARY ============
    logHeader('═══════════════════════════════════');
    logHeader('  ✨ FACTORY PAUSE/UNPAUSE COMPLETED!');
    logHeader('═══════════════════════════════════');
    log('Successfully paused and unpaused the primary market factory.', colors.green);
    log(`Factory Contract ID: ${factoryContractId}\n`, colors.green);
    
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
  pausePrimaryMarketFactory,
  unpausePrimaryMarketFactory,
  grantFactoryRole,
  waitForFactoryPauseStatusUpdate,
  waitForFactoryUserRoleUpdate
};
