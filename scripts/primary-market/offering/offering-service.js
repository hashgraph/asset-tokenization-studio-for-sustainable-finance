const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

/**
 * Create an offering in a Primary Market
 * @param {string} format - The blockchain format (hedera or ethereum)
 * @param {string} marketContractId - The primary market contract ID
 * @param {string} bondContractId - The bond contract ID
 * @param {Object} params - Optional offering parameters
 * @returns {Promise<Object>} The create offering transaction details
 */
async function createOffering(format, marketContractId, bondContractId, params = {}) {
  log(`\n📋 Creating ${format.toUpperCase()} offering...`, colors.bright);

  const createOfferingTransactionRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    treasuryContractId: params.treasuryContractId || "0.0.12345",
    paymentTokenContractId: params.paymentTokenContractId || "0.0.67890",
    lotSize: params.lotSize || "1000",
    minLots: params.minLots || "1",
    maxLots: params.maxLots || "10000",
    targetLots: params.targetLots || "5000",
    targetQuantityRule: params.targetQuantityRule !== undefined ? params.targetQuantityRule : 0, // 0: AT_LEAST, 1: AT_MOST, 2: BETWEEN
    startDate: params.startDate || new Date(Date.now() + 60000), // 1 minute from now
    endDate: params.endDate || new Date(Date.now() + 86400000 * 30), // 30 days from now
    deadlineRule: params.deadlineRule !== undefined ? params.deadlineRule : 0, // 0: SOFT, 1: HARD
    price: params.price || "100",
    priceDecimals: params.priceDecimals !== undefined ? params.priceDecimals : 2
  };

  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}/offerings`;
    const response = await gatewayClient.post(endpoint, createOfferingTransactionRequest);

    logSuccess(`${format.toUpperCase()} offering transaction created successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Lot Size: ${createOfferingTransactionRequest.lotSize}`);
    logInfo(`Min Lots: ${createOfferingTransactionRequest.minLots}`);
    logInfo(`Max Lots: ${createOfferingTransactionRequest.maxLots}`);
    logInfo(`Target Lots: ${createOfferingTransactionRequest.targetLots}`);
    logInfo(`Price: ${createOfferingTransactionRequest.price} (${createOfferingTransactionRequest.priceDecimals} decimals)`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx.substring(0, 50)}...`);

    return { ...createOfferingTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create offering: ${error.message}`);
    if (error.response?.data) {
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

module.exports = {
  createOffering
};
