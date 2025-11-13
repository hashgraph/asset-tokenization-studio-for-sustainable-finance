const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

/**
 * Creates an offering with specified parameters
 * @param {string} format - Blockchain format (hedera/ethereum)
 * @param {string} marketContractId - Market contract ID
 * @param {string} bondContractId - Bond contract ID
 * @param {Object} offeringParams - Offering parameters
 * @returns {Promise<Object>} Created offering with unsignedTx
 */
async function createOffering(format, marketContractId, bondContractId, offeringParams = {}) {
  log(`\n📋 Creating ${format.toUpperCase()} offering...`, colors.bright);

  // Use provided parameters or defaults
  const createOfferingTransactionRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    treasuryAddress: offeringParams.treasuryAddress || process.env.TREASURY_ADDRESS || "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    paymentTokenAddress: offeringParams.paymentTokenAddress || process.env.PAYMENT_TOKEN_ADDRESS || "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    lotSize: offeringParams.lotSize || 100,
    minQuantity: offeringParams.minQuantity || 1000,
    maxQuantity: offeringParams.maxQuantity || 10000,
    targetQuantity: offeringParams.targetQuantity || 5000,
    targetQuantityRule: offeringParams.targetQuantityRule || 1,
    startDate: offeringParams.startDate || Math.floor(Date.now() / 1000).toString(),
    endDate: offeringParams.endDate || Math.floor((Date.now() / 1000) + (30 * 24 * 60 * 60)).toString(), // 30 days from now
    deadlineRule: offeringParams.deadlineRule || 1
  };
  
  try {
    const endpoint = `/api/v1/primary-markets/${marketContractId}/bonds/${bondContractId}`;
    const response = await gatewayClient.post(endpoint, createOfferingTransactionRequest);
    console.log('Response data:', response.data);
    
    logSuccess(`${format.toUpperCase()} offering created successfully!`);
    logInfo(`Market Contract ID: ${marketContractId}`);
    logInfo(`Bond Contract ID: ${bondContractId}`);
    logInfo(`Lot Size: ${createOfferingTransactionRequest.lotSize}`);
    logInfo(`Target Quantity: ${createOfferingTransactionRequest.targetQuantity}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);
    
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
