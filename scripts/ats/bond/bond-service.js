const { gatewayClient } = require('../../shared/lib/gateway-client');
const { logSuccess, logError, logInfo, log, colors } = require('../../shared/lib/logger');

async function createBond(format) {
  log(`\n📋 Creating ${format.toUpperCase()} bond...`, colors.bright);
  
  const createBondTransactionRequest = {
  securityTokenToCreate: {
    name: "test",
    symbol: "test",
    isin: "US0378331005",
    decimals: 6,
    isWhiteList: false,
    erc20VotesActivated: false,
    isControllable: true,
    arePartitionsProtected: false,
    isMultiPartition: false,
    clearingActive: false,
    internalKycActivated: false,
    externalPausesAddresses: [],
    externalControlListsAddresses: [],
    externalKycListsAddresses: [],
    diamondOwnerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    currency: "0x858368",
    numberOfUnits: "1000000",
    nominalValue: "100",
    startingDate: "1880997600",
    maturityDate: "1980997600",
    configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
    configVersion: 0,
    resolverAddress: "0x9c6cf2b0c034bdb9cda67d49f69223df54d35f76",
    proceedRecipientAddresses: [],
    proceedRecipientsData: []
  },
  factoryRegulationData: {
    regulationType: 1,
    regulationSubType: 0,
    isCountryControlListWhiteList: false,
    countries: "CU,KP,IR,SY",
    info: "test"
  },
  treasuryData: {
    resolverAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    configId: "0x0000000000000000000000000000000000000000000000000000000000000002",
    configVersion: 0,
    paymentTokenAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    erc721Addresses: []
  },
  kpiData: {
    adminAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7",
    ownerAccountAddress: "0x48ca774f6942166bf37e178ccc1e861947ead8c7"
  },
  format: format,
  accountId: process.env.ACCOUNT_ID
};
  
  try {
    const response = await gatewayClient.post('/api/v1/ats/bonds/factories/0.0.7048503/bond-transactions', createBondTransactionRequest);
    console.log('Response data:', response.data);
    
    logSuccess(`${format.toUpperCase()} bond created successfully!`);
    logInfo(`Symbol: ${createBondTransactionRequest.securityTokenToCreate.symbol}`);
    logInfo(`Unsigned Tx: ${response.data.unsignedTx}`);
    
    return { ...createBondTransactionRequest, unsignedTx: response.data.unsignedTx };
  } catch (error) {
    logError(`Failed to create bond: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createBond
};