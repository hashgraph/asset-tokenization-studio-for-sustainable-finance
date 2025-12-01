const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

/**
 * Get the latest deployed primary market from the database
 * @returns {Promise<Object|null>} The latest primary market or null if not found
 */
async function getLatestPrimaryMarket() {
  log(`\n🔍 Fetching latest primary market...`, colors.bright);
  
  try {
    const response = await gatewayClient.get('/api/v1/primary-markets', {
      params: {
        page: 1,
        limit: 1,
        orderBy: 'createdAt',
        order: 'desc'
      }
    });
    
    if (response.data?.items && response.data.items.length > 0) {
      const latestMarket = response.data.items[0];
      logSuccess(`Found latest primary market: ${latestMarket.contractId}`);
      logInfo(`Created at: ${latestMarket.createdAt}`);
      logInfo(`Config Version: ${latestMarket.configVersion}`);
      return latestMarket;
    } else {
      logError('No primary markets found in the system');
      return null;
    }
  } catch (error) {
    logError(`Failed to fetch primary markets: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Wait for the primary market to be deployed by polling the database
 * @param {number} initialWaitMs - Initial wait time in milliseconds before querying (default: 15000)
 * @returns {Promise<Object>} The deployed primary market
 */
async function waitForPrimaryMarketDeployment(initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`🔍 Fetching latest primary market from database...`);
  const latestMarket = await getLatestPrimaryMarket();
  
  if (!latestMarket) {
    throw new Error('No primary market found in database after deployment');
  }
  
  return latestMarket;
}

/**
 * Wait for the primary market pause status to be updated in the database
 * @param {string} contractId - The primary market contract ID
 * @param {boolean} expectedPauseStatus - Expected pause status (true for paused, false for unpaused)
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
 * @param {number} intervalMs - Interval between polling attempts in milliseconds (default: 2000)
 * @param {number} initialWaitMs - Initial wait time in milliseconds before starting to poll (default: 15000)
 * @returns {Promise<Object>} The updated primary market
 */
async function waitForPauseStatusUpdate(contractId, expectedPauseStatus, maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`⏳ Now polling database for pause status update (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);
  logInfo(`Expected isPaused: ${expectedPauseStatus}`);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await gatewayClient.get(`/api/v1/primary-markets/${contractId}`);
      const market = response.data;
      
      if (market && market.isPaused === expectedPauseStatus) {
        logSuccess(`✅ Primary market pause status updated successfully!`);
        logInfo(`Contract ID: ${market.contractId}`);
        logInfo(`isPaused: ${market.isPaused}`);
        return market;
      }
      
      logInfo(`Attempt ${attempts}/${maxAttempts} - Current isPaused: ${market?.isPaused}, Expected: ${expectedPauseStatus}`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Pause status update timeout after ${maxAttempts} attempts`);
}

/**
 * Wait for a role to be granted to a user in the database
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} roleId - The role ID
 * @param {string} userAccountId - The user account ID
 * @param {boolean} shouldExist - Whether the role should exist (true) or not exist (false)
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 30)
 * @param {number} intervalMs - Interval between polling attempts in milliseconds (default: 2000)
 * @param {number} initialWaitMs - Initial wait time in milliseconds before starting to poll (default: 15000)
 * @returns {Promise<Object|null>} The user role record or null if checking for non-existence
 */
async function waitForUserRoleUpdate(marketContractId, roleId, userAccountId, shouldExist = true, maxAttempts = 30, intervalMs = 2000, initialWaitMs = 15000) {
  logInfo(`⏳ Waiting ${initialWaitMs/1000} seconds for transaction to be processed...`);
  
  // Initial wait to allow transaction to be processed
  await new Promise(resolve => setTimeout(resolve, initialWaitMs));
  
  logInfo(`⏳ Now polling database for user role ${shouldExist ? 'assignment' : 'removal'} (max ${maxAttempts} attempts, ${intervalMs}ms interval)...`);
  logInfo(`Market: ${marketContractId}, Role: ${roleId}, User: ${userAccountId}`);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // Get all members of the role
      const response = await gatewayClient.get(`/api/v1/primary-markets/${marketContractId}/roles/${roleId}/members`);
      const members = response.data?.items || [];
      
      // Check if the user is in the members list
      const userHasRole = members.some(member => member.userAccountId === userAccountId);
      
      if (shouldExist && userHasRole) {
        logSuccess(`✅ User role found in database!`);
        logInfo(`User: ${userAccountId}`);
        logInfo(`Role: ${roleId}`);
        return members.find(member => member.userAccountId === userAccountId);
      } else if (!shouldExist && !userHasRole) {
        logSuccess(`✅ User role successfully removed from database!`);
        return null;
      }
      
      logInfo(`Attempt ${attempts}/${maxAttempts} - User has role: ${userHasRole}, Expected: ${shouldExist}`);
    } catch (error) {
      logError(`Error during attempt ${attempts}: ${error.message}`);
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`User role ${shouldExist ? 'assignment' : 'removal'} timeout after ${maxAttempts} attempts`);
}

module.exports = {
  getLatestPrimaryMarket,
  waitForPrimaryMarketDeployment,
  waitForPauseStatusUpdate,
  waitForUserRoleUpdate
};
