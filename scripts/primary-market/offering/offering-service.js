const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

async function createOffering(format, marketContractId, bondContractId) {
  log(`\n📋 Creating ${format.toUpperCase()} offering...`, colors.bright);
  
  const createOfferingTransactionRequest = {
    format: format,
    accountId: process.env.ACCOUNT_ID,
    treasuryAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    lotSize: 100,
    minQuantity: 1000,
    maxQuantity: 10000,
    targetQuantity: 5000,
    targetQuantityRule: 1,
    startDate: "1730000000",
    endDate: "1830000000",
    deadlineRule: 1
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
