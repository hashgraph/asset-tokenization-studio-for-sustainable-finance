const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors, logHeader } = require('../../shared/lib/logger');

/**
 * Check if a primary market exists in the database by contract ID
 * @param {string} contractId - The primary market contract ID
 * @returns {Promise<Object|null>} The primary market or null if not found
 */
async function getPrimaryMarketByContractId(contractId) {
  try {
    const response = await gatewayClient.get(`/api/v1/primary-markets/${contractId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Ensure a primary market exists in the database
 * If it doesn't exist, it will be created directly in the database
 * @param {string} contractId - The primary market contract ID (EVM address or Hedera ID)
 * @param {Object} options - Optional configuration
 * @param {boolean} options.isPaused - Whether the market should be paused (default: false)
 * @returns {Promise<Object>} The primary market (existing or newly created)
 */
async function ensurePrimaryMarketExists(contractId, options = {}) {
  logHeader(`🔍 Checking if Primary Market exists: ${contractId}`);

  try {
    // Check if the primary market already exists
    const existingMarket = await getPrimaryMarketByContractId(contractId);

    if (existingMarket) {
      logSuccess(`✅ Primary Market already exists in database!`);
      logInfo(`Contract ID: ${existingMarket.contractId}`);
      logInfo(`Is Paused: ${existingMarket.isPaused}`);
      logInfo(`Created At: ${existingMarket.createdAt}`);
      return existingMarket;
    }

    // If it doesn't exist, we need to insert it manually
    logInfo(`📝 Primary Market not found in database. Creating entry...`);

    // Note: Since there's no direct API endpoint to manually create a primary market,
    // we'll need to use a workaround by calling the internal database
    // This is typically done through the event listener when a deployment happens on-chain

    logError(`❌ Cannot automatically create Primary Market entry in database.`);
    logInfo(`\nOptions to resolve this:`);
    logInfo(`1. Deploy the Primary Market using the deploy-primary-market.js script`);
    logInfo(`2. Ensure the blockchain listener is running to detect the deployment event`);
    logInfo(`3. Wait for the listener to insert the Primary Market into the database`);
    logInfo(`\nIf the Primary Market was already deployed on-chain but not in the DB:`);
    logInfo(`- Check if the blockchain listener service is running`);
    logInfo(`- Check the listener logs for any errors processing the PrimaryMarketDeployed event`);
    logInfo(`- You may need to manually trigger event replay or restart the listener`);

    throw new Error(`Primary Market ${contractId} does not exist in database`);

  } catch (error) {
    if (error.message.includes('does not exist in database')) {
      throw error;
    }
    logError(`Failed to check/create primary market: ${error.message}`);
    if (error.response?.data) {
      logError(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Get a primary market from the database, or use a fallback to find the latest one
 * @param {string|null} contractId - The primary market contract ID (optional)
 * @returns {Promise<Object>} The primary market
 */
async function getPrimaryMarketOrLatest(contractId = null) {
  if (contractId) {
    logInfo(`Looking for specific Primary Market: ${contractId}`);
    return await ensurePrimaryMarketExists(contractId);
  }

  // If no contract ID provided, get the latest one
  logInfo(`No Primary Market specified, fetching latest...`);
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
      return latestMarket;
    } else {
      throw new Error('No primary markets found in the system');
    }
  } catch (error) {
    logError(`Failed to fetch primary markets: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getPrimaryMarketByContractId,
  ensurePrimaryMarketExists,
  getPrimaryMarketOrLatest
};
